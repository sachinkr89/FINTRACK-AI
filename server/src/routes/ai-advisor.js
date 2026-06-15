import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../lib/prisma.js';
import auth from '../middleware/auth.js';
import { callOpenRouter } from '../lib/openrouter.js';

const router = Router();

// All routes require authentication
router.use(auth);

const DEFAULT_TIPS = [
  {
    title: 'Track Daily Expenses',
    description: 'Log every purchase to identify spending patterns and cut waste.',
  },
  {
    title: 'Set Category Budgets',
    description: 'Allocate fixed amounts per category to prevent overspending.',
  },
  {
    title: 'Review Weekly Spending',
    description: 'Check your expenses each week to stay on track with your budget.',
  },
];

// POST /api/ai-advisor — get AI-powered financial tips
router.post('/', async (req, res) => {
  try {
    // Fetch expenses from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.userId,
        date: { gte: thirtyDaysAgo },
      },
      include: { category: true },
    });

    if (expenses.length === 0) {
      return res.status(200).json({
        tips: DEFAULT_TIPS,
        message: 'No expenses found in the last 30 days. Here are general tips.',
      });
    }

    // Aggregate spending by category
    const categorySpending = {};
    let totalSpend = 0;
    for (const expense of expenses) {
      const catName = expense.category.name;
      if (!categorySpending[catName]) {
        categorySpending[catName] = 0;
      }
      categorySpending[catName] += expense.amount;
      totalSpend += expense.amount;
    }

    // Fetch the current month's budget
    const now = new Date();
    const budget = await prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId: req.userId,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
      },
    });

    const budgetAmount = budget ? budget.amount : 'not set';

    // Build the prompt
    const prompt = `Act as a financial advisor. Here is the user's spending data for this month in INR: ${JSON.stringify(categorySpending)}. Total spent: ₹${totalSpend}. The user's monthly budget is ${typeof budgetAmount === 'number' ? '₹' + budgetAmount : budgetAmount} INR. Give exactly 3 short, actionable tips to reduce expenses next month. Format your response as a JSON array of 3 objects, each with 'title' (max 6 words) and 'description' (max 25 words) fields. Return ONLY the JSON array, no other text.`;

    // Call AI API
    if (!process.env.OPENROUTER_API_KEY && !process.env.GEMINI_API_KEY) {
      console.warn('Neither OPENROUTER_API_KEY nor GEMINI_API_KEY set, returning default tips.');
      return res.status(200).json({ tips: DEFAULT_TIPS });
    }

    let text = null;

    if (process.env.OPENROUTER_API_KEY) {
      const advisorModels = [
        'openai/gpt-oss-20b:free',
        'google/gemma-4-31b-it:free',
        'openrouter/free'
      ];
      text = await callOpenRouter([{ role: 'user', content: prompt }], advisorModels);
    } else {
      console.log('Using Google Gemini SDK...');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt);
        text = result.response.text();
      } catch (apiError) {
        console.warn('Gemini 2.0 Flash failed or hit rate limit, trying gemini-1.5-flash as fallback...', apiError.message || apiError);
        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const result = await model.generateContent(prompt);
          text = result.response.text();
        } catch (fallbackError) {
          console.error('Gemini 1.5 Flash fallback also failed:', fallbackError.message || fallbackError);
          throw fallbackError;
        }
      }
    }

    // Parse the JSON response — handle possible markdown code fences
    let tips;
    try {
      if (!text || typeof text !== 'string') {
        throw new Error('Received empty or invalid response from AI model.');
      }
      const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      tips = JSON.parse(cleaned);

      // Validate structure
      if (!Array.isArray(tips) || tips.length !== 3) {
        throw new Error('Invalid tips format: not an array of 3 items');
      }

      for (const tip of tips) {
        if (!tip.title || !tip.description) {
          throw new Error('Missing title or description in parsed tips');
        }
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      tips = DEFAULT_TIPS;
    }

    return res.status(200).json({ tips });
  } catch (error) {
    console.error('AI Advisor error:', error);
    return res.status(200).json({
      tips: DEFAULT_TIPS,
      message: 'AI service temporarily unavailable. Here are general tips.',
    });
  }
});

export default router;
