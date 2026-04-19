import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/history - List history entries
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const entries = await prisma.history.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(String(limit)) : 50,
    });
    res.json(entries);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch history', message: error.message });
  }
});

// DELETE /api/history - Clear all history
router.delete('/', async (_req: Request, res: Response) => {
  try {
    await prisma.history.deleteMany();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to clear history', message: error.message });
  }
});

// DELETE /api/history/:id - Delete single entry
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.history.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'History entry not found' });
    res.status(500).json({ error: 'Failed to delete history entry', message: error.message });
  }
});

export default router;
