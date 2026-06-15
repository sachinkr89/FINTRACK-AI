import { Router } from 'express';
import auth from '../middleware/auth.js';
import prisma from '../lib/prisma.js';
import { callOpenRouter } from '../lib/openrouter.js';

const router = Router();

// Require authentication for all chat routes
router.use(auth);

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // 1. Fetch user's current month spending and budget data
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Fetch monthly budget
    const budget = await prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId: req.userId,
          month: currentMonth,
          year: currentYear,
        },
      },
    });

    // Fetch expenses for the current month
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 1);

    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.userId,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: { category: true },
    });

    // Aggregate spending by category
    const categorySpending = {};
    let totalSpend = 0;
    for (const exp of expenses) {
      const catName = exp.category.name;
      if (!categorySpending[catName]) {
        categorySpending[catName] = 0;
      }
      categorySpending[catName] += exp.amount;
      totalSpend += exp.amount;
    }

    const budgetAmount = budget ? budget.amount : null;

    // 2. Construct system context
    const financialContext = {
      currentMonth: now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      totalSpent: `₹${totalSpend}`,
      monthlyBudget: budgetAmount ? `₹${budgetAmount}` : 'Not set',
      remainingBudget: budgetAmount ? `₹${budgetAmount - totalSpend}` : 'N/A',
      spendingByCategory: categorySpending,
    };

    const systemPrompt = `You are FinTrack AI Assistant, an empathetic, smart, and highly actionable personal financial advisor. 
You help the user manage their money, track their expenses, and meet their financial saving goals.

Here is the user's live financial data for the current month (${financialContext.currentMonth}):
- Total Spend: ${financialContext.totalSpent}
- Monthly Budget: ${financialContext.monthlyBudget}
- Remaining Budget: ${financialContext.remainingBudget}
- Category Breakdown: ${JSON.stringify(financialContext.spendingByCategory)}

Guidelines:
1. Address the user directly and friendly.
2. Use their specific financial data to answer questions (e.g. mention if they spent too much on a specific category).
3. Keep your answers concise, structured, and easy to read (use bullet points or bold text where appropriate).
4. Do not offer complex investment calculations; focus on everyday budgeting, saving, and expense reduction.
5. If the user asks general questions unrelated to finance, politely steer them back to their money management.
6. Respond in the EXACT same language and dialect as the user's message. If they write in English, reply in English. If they write in Hindi, reply in Hindi. If they write in Hinglish (Hindi written using the English alphabet, e.g., "bhai mera budget check karo"), reply in Hinglish. Do not translate their terms unnecessarily; match their language natural flow.`;

    // 3. Prepare messages payload for LLM
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    ];

    // 4. Call OpenRouter API
    let text = null;

    if (process.env.OPENROUTER_API_KEY) {
      const chatModels = [
        'openai/gpt-oss-20b:free',
        'liquid/lfm-2.5-1.2b-instruct:free',
        'google/gemma-4-31b-it:free',
        'openrouter/free'
      ];
      text = await callOpenRouter(formattedMessages, chatModels);
    } else {
      return res.status(400).json({ error: 'AI services are not configured. Please contact the administrator.' });
    }

    if (!text) {
      throw new Error('Received empty response from AI model.');
    }

    return res.status(200).json({ message: text });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return res.status(500).json({ error: 'Failed to generate chat response. Please try again later.' });
  }
});

export default router;
