import { Router } from 'express';
import prisma from '../lib/prisma.js';
import auth from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(auth);

// POST /api/budgets — upsert budget for a given month/year
router.post('/', async (req, res) => {
  try {
    const { amount, month, year } = req.body;

    if (amount == null || !month || !year) {
      return res.status(400).json({ error: 'Amount, month, and year are required.' });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    if (month < 1 || month > 12) {
      return res.status(400).json({ error: 'Month must be between 1 and 12.' });
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_month_year: {
          userId: req.userId,
          month: parseInt(month),
          year: parseInt(year),
        },
      },
      update: { amount },
      create: {
        amount,
        month: parseInt(month),
        year: parseInt(year),
        userId: req.userId,
      },
    });

    return res.status(200).json(budget);
  } catch (error) {
    console.error('Upsert budget error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/budgets — get budget for a given month/year
router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year query parameters are required.' });
    }

    const budget = await prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId: req.userId,
          month: parseInt(month),
          year: parseInt(year),
        },
      },
    });

    return res.status(200).json(budget);
  } catch (error) {
    console.error('Get budget error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
