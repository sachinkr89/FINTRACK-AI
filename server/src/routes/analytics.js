import { Router } from 'express';
import prisma from '../lib/prisma.js';
import auth from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(auth);

// GET /api/analytics — spending analytics for a given month/year
router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year query parameters are required.' });
    }

    const m = parseInt(month);
    const y = parseInt(year);
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 1);

    // Fetch all expenses for the month with category info
    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.userId,
        date: { gte: startDate, lt: endDate },
      },
      include: { category: true },
      orderBy: { date: 'asc' },
    });

    // Category breakdown: group by category and sum amounts
    const categoryMap = {};
    for (const expense of expenses) {
      const cat = expense.category;
      if (!categoryMap[cat.id]) {
        categoryMap[cat.id] = {
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          total: 0,
        };
      }
      categoryMap[cat.id].total += expense.amount;
    }
    const categoryBreakdown = Object.values(categoryMap);

    // Daily spend: group by date string and sum
    const dailyMap = {};
    for (const expense of expenses) {
      const dateKey = expense.date.toISOString().split('T')[0];
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { date: dateKey, total: 0 };
      }
      dailyMap[dateKey].total += expense.amount;
    }
    const dailySpend = Object.values(dailyMap);

    // Total spend
    const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Budget for the month
    const budget = await prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId: req.userId,
          month: m,
          year: y,
        },
      },
    });

    return res.status(200).json({
      categoryBreakdown,
      dailySpend,
      totalSpend,
      budget: budget || null,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
