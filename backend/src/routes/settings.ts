import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// Erlaubte Keys — verhindert beliebige Datenspeicherung
const ALLOWED_KEYS = new Set([
  'apiProvider',
  'geminiKey',
  'geminiModel',
  'openrouterKey',
  'openrouterModel',
]);

// GET /api/settings/:key
router.get('/:key', async (req: Request, res: Response) => {
  const key = String(req.params.key);

  if (!ALLOWED_KEYS.has(key)) {
    return res.status(400).json({ error: 'Invalid settings key' });
  }

  try {
    const setting = await prisma.appSettings.findUnique({ where: { key } });
    if (!setting) {
      return res.json({ key, value: null });
    }
    res.json({ key, value: setting.value });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load setting', message: error.message });
  }
});

// GET /api/settings (alle auf einmal laden)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.appSettings.findMany({
      where: { key: { in: Array.from(ALLOWED_KEYS) } },
    });
    const result: Record<string, string> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load settings', message: error.message });
  }
});

// PUT /api/settings/:key
router.put('/:key', async (req: Request, res: Response) => {
  const key = String(req.params.key);
  const { value } = req.body;

  if (!ALLOWED_KEYS.has(key)) {
    return res.status(400).json({ error: 'Invalid settings key' });
  }

  if (value === undefined || value === null) {
    return res.status(400).json({ error: 'Value is required' });
  }

  try {
    const setting = await prisma.appSettings.upsert({
      where: { key },
      create: { key, value: String(value) },
      update: { value: String(value) },
    });
    res.json({ key: setting.key, value: setting.value });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save setting', message: error.message });
  }
});

// PUT /api/settings (Bulk-Upsert)
router.put('/', async (req: Request, res: Response) => {
  const updates = req.body as Record<string, string>;

  const invalidKeys = Object.keys(updates).filter((k) => !ALLOWED_KEYS.has(k));
  if (invalidKeys.length > 0) {
    return res.status(400).json({ error: `Invalid keys: ${invalidKeys.join(', ')}` });
  }

  try {
    const ops = Object.entries(updates).map(([key, value]) =>
      prisma.appSettings.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      })
    );
    await Promise.all(ops);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save settings', message: error.message });
  }
});

export default router;
