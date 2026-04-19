import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { generatePrompt, optimizePrompt, imageToPrompt, expandTextPrompt, AiContext } from '../services/ai';

const router = Router();

// Temporäre Uploads für image-to-prompt — gleicher Pfad wie prompts.ts
// Dateien werden nach Verarbeitung sofort gelöscht (kein persistenter Speicher nötig)
const tempUploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
fs.mkdirSync(tempUploadDir, { recursive: true });

// Nur Bildformate für KI-Analyse erlaubt
const imageFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Dateityp "${file.mimetype}" nicht erlaubt. Erlaubt: JPEG, PNG, GIF, WebP, AVIF`));
  }
};

const upload = multer({
  dest: tempUploadDir,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

function getAiContext(req: Request): AiContext {
  return {
    provider: (req.headers['x-ai-provider'] as string) || undefined,
    apiKey: (req.headers['x-ai-api-key'] as string) || undefined,
    model: (req.headers['x-ai-model'] as string) || undefined,
  };
}

// POST /api/generate - Generate a prompt
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const result = await generatePrompt(req.body, getAiContext(req));

    await prisma.history.create({
      data: {
        action: 'generate',
        input: JSON.stringify(req.body),
        output: result.optimizedPrompt,
        provider: result.provider,
      },
    });

    res.json(result);
  } catch (error: any) {
    console.error('Generate error:', error);
    res.status(500).json({ error: 'Failed to generate prompt', message: error.message });
  }
});

// POST /api/optimize - Optimize an existing prompt
router.post('/optimize', async (req: Request, res: Response) => {
  try {
    const { prompt, style } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await optimizePrompt({ prompt, style: style || 'cinematic' }, getAiContext(req));

    await prisma.history.create({
      data: {
        action: 'optimize',
        input: JSON.stringify({ prompt, style }),
        output: result.optimizedPrompt,
        provider: result.provider,
      },
    });

    res.json(result);
  } catch (error: any) {
    console.error('Optimize error:', error);
    res.status(500).json({ error: 'Failed to optimize prompt', message: error.message });
  }
});

// POST /api/expand-prompt - Expand modular text into a full prompt
router.post('/expand-prompt', async (req: Request, res: Response) => {
  try {
    const { draft } = req.body;

    if (!draft) {
      return res.status(400).json({ error: 'Draft is required' });
    }

    const result = await expandTextPrompt({ draft }, getAiContext(req));

    await prisma.history.create({
      data: {
        action: 'expand-text-prompt',
        input: JSON.stringify({ draft }),
        output: result.prompt,
        provider: result.provider,
      },
    });

    res.json(result);
  } catch (error: any) {
    console.error('Expand error:', error);
    res.status(500).json({ error: 'Failed to expand prompt', message: error.message });
  }
});

// POST /api/image-to-prompt - Convert image to prompt
router.post('/image-to-prompt', upload.single('image'), async (req: Request, res: Response) => {
  try {
    let imageBase64: string;

    if (req.file) {
      imageBase64 = fs.readFileSync(req.file.path, { encoding: 'base64' });
      // Temporäre Datei sofort nach dem Lesen löschen
      fs.unlinkSync(req.file.path);
    } else if (req.body.image) {
      // Base64 direkt akzeptieren
      imageBase64 = req.body.image.replace(/^data:image\/\w+;base64,/, '');
    } else {
      return res.status(400).json({ error: 'Image is required (file upload or base64)' });
    }

    const instructions = req.body.instructions as string | undefined;
    const result = await imageToPrompt({ imageBase64, instructions }, getAiContext(req));

    await prisma.history.create({
      data: {
        action: 'image-to-prompt',
        input: '[image]',
        output: result.optimizedPrompt,
        provider: result.provider,
      },
    });

    res.json(result);
  } catch (error: any) {
    console.error('Image-to-prompt error:', error);
    res.status(500).json({ error: 'Failed to analyze image', message: error.message });
  }
});

// GET /api/models - Fetch available free models from Gemini or OpenRouter
router.get('/models', async (req: Request, res: Response) => {
  const { provider } = req.query as { provider: string };
  // API-Key aus Authorization-Header statt Query-Parameter (verhindert Logging des Keys)
  const key = req.headers['x-ai-api-key'] as string || req.query.key as string;

  if (!provider || !key) {
    return res.status(400).json({ error: 'provider and API key are required' });
  }

  try {
    if (provider === 'gemini') {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
      );
      if (!response.ok) {
        const err: any = await response.json();
        return res.status(400).json({ error: err?.error?.message || 'Invalid Gemini API key' });
      }
      const data: any = await response.json();
      const models = (data.models || [])
        .filter((m: any) =>
          (m.supportedGenerationMethods || []).includes('generateContent')
        )
        .map((m: any) => ({
          id: m.name.replace('models/', ''),
          name: m.displayName,
          isFree: true,
          description: m.description || '',
        }));
      return res.json(models);
    }

    if (provider === 'openrouter') {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!response.ok) {
        const err: any = await response.json();
        return res.status(400).json({ error: err?.error?.message || 'Invalid OpenRouter API key' });
      }
      const data: any = await response.json();
      const models = (data.data || [])
        .filter((m: any) => {
          const promptPrice = parseFloat(m.pricing?.prompt || '1');
          return promptPrice === 0;
        })
        .map((m: any) => ({
          id: m.id,
          name: m.name || m.id,
          isFree: true,
          description: m.description || '',
          contextLength: m.context_length,
        }));
      return res.json(models);
    }

    return res.status(400).json({ error: 'Unknown provider' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch models', message: error.message });
  }
});

// GET /api/usage - Get API usage/quota info
router.get('/usage', async (req: Request, res: Response) => {
  const { provider, model } = req.query as { provider: string; model?: string };
  // API-Key aus x-ai-api-key Header (sicherer als Query-Parameter)
  const key = req.headers['x-ai-api-key'] as string || req.query.key as string;

  if (!provider || !key) {
    return res.status(400).json({ error: 'provider and API key are required' });
  }

  try {
    if (provider === 'gemini') {
      const isPro = model?.toLowerCase().includes('pro');
      const rpm = isPro ? '2' : '15';
      const tpm = isPro ? '32.000' : '1.000.000';
      const rpd = isPro ? '50' : '1.500';

      return res.json({
        provider: 'gemini',
        isFreeTier: true,
        limits: [
          { label: 'Requests per Minute (RPM)', value: rpm, unit: 'RPM' },
          { label: 'Tokens per Minute (TPM)', value: tpm, unit: 'TPM' },
          { label: 'Requests per Day (RPD)', value: rpd, unit: 'RPD' },
        ],
        note: `Zeigt Free-Tier Limits für ${model || 'Gemini Modelle'}. Tatsächliche Nutzung kann nicht abgerufen werden.`,
        docsUrl: 'https://ai.google.dev/pricing',
      });
    }

    if (provider === 'openrouter') {
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!response.ok) {
        const err: any = await response.json();
        return res.status(400).json({ error: err?.error?.message || 'Invalid OpenRouter API key' });
      }
      const data: any = await response.json();
      const info = data.data || data;
      return res.json({
        provider: 'openrouter',
        isFreeTier: info.is_free_tier,
        label: info.label || 'OpenRouter Key',
        creditLimit: info.limit,
        creditUsed: info.usage,
        creditRemaining: info.limit != null ? (info.limit - (info.usage || 0)).toFixed(4) : null,
        rateLimit: info.rate_limit,
      });
    }

    return res.status(400).json({ error: 'Unknown provider' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch usage', message: error.message });
  }
});

export default router;
