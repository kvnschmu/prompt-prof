import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

const router = Router();

// ── Upload Setup ────────────────────────────────────────────────
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

// Nur Bildformate erlaubt
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Dateityp "${file.mimetype}" nicht erlaubt. Erlaubt: JPEG, PNG, GIF, WebP, AVIF`));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } });

const BASE_URL = process.env.BASE_URL || '';

function resolveImageUri(filename: string): string {
  return `${BASE_URL}/uploads/${filename}`;
}

// ── Helper ──────────────────────────────────────────────────────
function parsePrompt(p: any) {
  return {
    ...p,
    tags: JSON.parse(p.tags || '[]'),
    metadata: JSON.parse(p.metadata || '{}'),
  };
}

// ── GET /api/prompts ────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, category, type, favorite } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { content: { contains: String(search) } },
        { tags: { contains: String(search) } },
      ];
    }
    if (category && category !== 'all') where.category = String(category);
    if (type && type !== 'all') where.type = String(type);
    if (favorite === 'true') where.isFavorite = true;

    const prompts = await prisma.prompt.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(prompts.map(parsePrompt));
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch prompts', message: error.message });
  }
});

// ── GET /api/prompts/:id ────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const prompt = await prisma.prompt.findUnique({ where: { id: String(req.params.id) } });
    if (!prompt) return res.status(404).json({ error: 'Prompt not found' });
    res.json(parsePrompt(prompt));
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch prompt', message: error.message });
  }
});

// ── POST /api/prompts ───────────────────────────────────────────
router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { title, content, tags, category, type, isFavorite, metadata } = req.body;

    let imageUri: string | null = null;
    if (req.file) {
      imageUri = resolveImageUri(req.file.filename);
    }

    const prompt = await prisma.prompt.create({
      data: {
        title: title || 'Untitled Prompt',
        content: content || '',
        tags: JSON.stringify(tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : []),
        category: category || 'general',
        type: type || 'image',
        isFavorite: isFavorite === 'true' || isFavorite === true || false,
        imageUri,
        metadata: JSON.stringify(metadata ? (typeof metadata === 'string' ? JSON.parse(metadata) : metadata) : {}),
      },
    });

    res.status(201).json(parsePrompt(prompt));
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create prompt', message: error.message });
  }
});

// ── POST /api/prompts/:id/image  (standalone image replace) ────
router.post('/:id/image', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });

    // Altes Bild löschen falls vorhanden
    const existing = await prisma.prompt.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) return res.status(404).json({ error: 'Prompt not found' });

    if (existing.imageUri) {
      const oldFilename = existing.imageUri.split('/uploads/').pop();
      if (oldFilename) {
        const oldPath = path.join(uploadDir, oldFilename);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const imageUri = resolveImageUri(req.file.filename);
    const updated = await prisma.prompt.update({
      where: { id: String(req.params.id) },
      data: { imageUri },
    });

    res.json(parsePrompt(updated));
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to upload image', message: error.message });
  }
});

// ── PUT /api/prompts/:id ────────────────────────────────────────
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { title, content, tags, category, type, isFavorite, imageUri, metadata } = req.body;

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;
    if (tags !== undefined) data.tags = JSON.stringify(tags);
    if (category !== undefined) data.category = category;
    if (type !== undefined) data.type = type;
    if (isFavorite !== undefined) data.isFavorite = isFavorite;
    if (imageUri !== undefined) data.imageUri = imageUri;
    if (metadata !== undefined) data.metadata = JSON.stringify(metadata);

    const prompt = await prisma.prompt.update({ where: { id: String(req.params.id) }, data });
    res.json(parsePrompt(prompt));
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Prompt not found' });
    res.status(500).json({ error: 'Failed to update prompt', message: error.message });
  }
});

// ── DELETE /api/prompts/:id ─────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const prompt = await prisma.prompt.findUnique({ where: { id: String(req.params.id) } });
    if (prompt?.imageUri) {
      const filename = prompt.imageUri.split('/uploads/').pop();
      if (filename) {
        const filepath = path.join(uploadDir, filename);
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      }
    }
    await prisma.prompt.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Prompt not found' });
    res.status(500).json({ error: 'Failed to delete prompt', message: error.message });
  }
});

export default router;
