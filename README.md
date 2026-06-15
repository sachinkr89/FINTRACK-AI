# 💰 FinTrack AI — AI-Powered Personal Finance Tracker

A full-stack expense tracking application with AI-driven financial insights, interactive charts, and budget alerts. Built with React, Node.js, PostgreSQL, and Google Gemini AI.

![Tech Stack](https://img.shields.io/badge/React-19-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![Prisma](https://img.shields.io/badge/Prisma-7-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-v4-cyan) ![Gemini](https://img.shields.io/badge/Gemini-AI-orange)

## ✨ Features

- **📊 Interactive Dashboard** — Pie charts for category breakdown, bar charts for daily spending
- **💳 Expense Tracking** — Full CRUD operations with categories, date filtering
- **💰 Budget Management** — Set monthly budgets with visual progress bars & alerts
- **🤖 AI Financial Advisor** — Get personalized tips from Google Gemini AI
- **🔐 JWT Authentication** — Secure email/password login & registration
- **🎨 Premium Dark UI** — Glassmorphism design with micro-animations
- **📱 Responsive** — Works on desktop and mobile

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, Recharts |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| AI | Google Gemini 2.0 Flash |
| Auth | JWT (jsonwebtoken + bcryptjs) |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (free: [Neon](https://neon.tech) or [Supabase](https://supabase.com))
- Google Gemini API key (free: [Google AI Studio](https://aistudio.google.com/apikey))

### 1. Clone & Install

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment

```bash
# Backend — create server/.env
cp server/.env.example server/.env
```

Edit `server/.env` with your credentials:
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-super-secret-jwt-key
GEMINI_API_KEY=your-gemini-api-key
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### 3. Setup Database

```bash
cd server

# Push schema to database
npx prisma db push

# Seed default categories
npm run seed
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd server
npm run dev

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Project Structure

```
├── server/                     # Backend
│   ├── prisma/
│   │   ├── schema.prisma       # 4 models: User, Category, Expense, Budget
│   │   └── seed.js             # Seeds 9 categories
│   ├── src/
│   │   ├── index.js            # Express entry point
│   │   ├── middleware/auth.js   # JWT verification
│   │   ├── lib/prisma.js       # Prisma client singleton
│   │   └── routes/
│   │       ├── auth.js         # Register & Login
│   │       ├── expenses.js     # Expense CRUD
│   │       ├── categories.js   # Category listing
│   │       ├── budgets.js      # Budget management
│   │       ├── analytics.js    # Spending analytics
│   │       └── ai-advisor.js   # Gemini AI tips
│   └── .env.example
│
├── client/                     # Frontend
│   ├── src/
│   │   ├── api/axios.js        # API client with JWT
│   │   ├── context/AuthContext.jsx
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Dashboard, Expenses, Settings, Login
│   │   └── index.css           # Design system
│   └── .env.example
│
└── README.md
```

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login user |
| GET | `/api/categories` | ❌ | List all categories |
| POST | `/api/expenses` | ✅ | Create expense |
| GET | `/api/expenses?month=6&year=2026` | ✅ | List expenses |
| DELETE | `/api/expenses/:id` | ✅ | Delete expense |
| POST | `/api/budgets` | ✅ | Set monthly budget |
| GET | `/api/budgets?month=6&year=2026` | ✅ | Get budget |
| GET | `/api/analytics?month=6&year=2026` | ✅ | Spending analytics |
| POST | `/api/ai-advisor` | ✅ | AI financial tips |

## 🎨 Design

- **Theme**: Premium dark mode with deep navy gradients
- **Cards**: Glassmorphism with `backdrop-blur` and subtle borders
- **Colors**: Emerald (positive), Rose (alerts), Amber (warnings)
- **Typography**: Inter (body) + Outfit (headings) from Google Fonts
- **Animations**: Fade-in, slide-up, scale, shimmer loading states

## 📦 Deployment

- **Database**: Already on cloud if using Neon/Supabase
- **Backend**: Deploy to [Render](https://render.com) or [Railway](https://railway.app)
- **Frontend**: Deploy to [Vercel](https://vercel.com) or [Netlify](https://netlify.com)

Remember to set environment variables on your hosting platform!

## 📝 License

MIT
