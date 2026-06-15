import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /api/categories — return all categories (no auth required)
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return res.status(200).json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
