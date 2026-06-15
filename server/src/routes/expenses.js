import { Router } from 'express';
import prisma from '../lib/prisma.js';
import auth from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(auth);

// POST /api/expenses — create a new expense
router.post('/', async (req, res) => {
  try {
    const { amount, description, date, categoryId } = req.body;

    if (!amount || !description || !date || !categoryId) {
      return res.status(400).json({ error: 'Amount, description, date, and categoryId are required.' });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    const expense = await prisma.expense.create({
      data: {
        amount,
        description,
        date: new Date(date),
        categoryId,
        userId: req.userId,
      },
      include: { category: true },
    });

    return res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/expenses — list expenses for the authenticated user
router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;

    const where = { userId: req.userId };

    if (month && year) {
      const m = parseInt(month);
      const y = parseInt(year);
      const startDate = new Date(y, m - 1, 1);
      const endDate = new Date(y, m, 1);

      where.date = {
        gte: startDate,
        lt: endDate,
      };
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'desc' },
    });

    return res.status(200).json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/expenses/:id — delete an expense owned by the user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const expense = await prisma.expense.findUnique({ where: { id } });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    if (expense.userId !== req.userId) {
      return res.status(403).json({ error: 'You are not authorized to delete this expense.' });
    }

    await prisma.expense.delete({ where: { id } });

    return res.status(200).json({ message: 'Expense deleted successfully.' });
  } catch (error) {
    console.error('Delete expense error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
