import { useState, useEffect } from 'react';
import API from '../api/axios';
import CategoryPieChart from '../components/PieChart';
import DailyBarChart from '../components/BarChart';
import BudgetCard from '../components/BudgetCard';
import SmartInsights from '../components/SmartInsights';

const StatCard = ({ title, value, icon, color, colorBg, delay = 0 }) => (
  <div
    className="glass-card p-5 animate-slideUp"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-2">{title}</p>
        <p className="text-2xl font-bold font-display text-text-primary truncate">{value}</p>
      </div>
      <div className={`w-11 h-11 rounded-xl ${colorBg} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="glass-card-static p-5">
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-3">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-7 w-32 rounded" />
      </div>
      <div className="skeleton w-11 h-11 rounded-xl" />
    </div>
  </div>
);

const DashboardPage = () => {
  const now = new Date();
  const [analytics, setAnalytics] = useState(null);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      try {
        const [analyticsRes, budgetRes] = await Promise.allSettled([
          API.get(`/analytics?month=${month}&year=${year}`),
          API.get(`/budgets?month=${month}&year=${year}`),
        ]);

        if (analyticsRes.status === 'fulfilled') {
          setAnalytics(analyticsRes.value.data);
          // Use budget from analytics as fallback
          if (analyticsRes.value.data?.budget) {
            setBudget(analyticsRes.value.data.budget);
          }
        }

        if (budgetRes.status === 'fulfilled' && budgetRes.value.data) {
          setBudget(budgetRes.value.data);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const totalSpend = analytics?.totalSpend || 0;
  const categoryData = analytics?.categoryBreakdown || [];
  const dailyData = analytics?.dailySpend || [];
  const totalTransactions = dailyData.length;

  const topCategory = categoryData.length > 0
    ? categoryData.reduce((max, cat) => (cat.total > max.total ? cat : max), categoryData[0])
    : null;

  const budgetRemaining = budget?.amount ? budget.amount - totalSpend : null;

  const monthName = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">Overview for {monthName}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted bg-bg-tertiary/20 px-3 py-1.5 rounded-full border border-white/5 w-fit">
          <div className="w-2 h-2 bg-accent-emerald rounded-full animate-pulse" />
          Live
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Spend"
            value={formatAmount(totalSpend)}
            colorBg="bg-accent-rose/10"
            delay={0}
            icon={
              <svg className="w-5 h-5 text-accent-rose" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
              </svg>
            }
          />
          <StatCard
            title="Budget Remaining"
            value={budgetRemaining !== null ? formatAmount(budgetRemaining) : 'Not Set'}
            colorBg="bg-accent-emerald/10"
            delay={100}
            icon={
              <svg className="w-5 h-5 text-accent-emerald" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            }
          />
          <StatCard
            title="Top Category"
            value={topCategory ? `${topCategory.icon || '📦'} ${topCategory.name || topCategory.id || '—'}` : '—'}
            colorBg="bg-accent-purple/10"
            delay={200}
            icon={
              <svg className="w-5 h-5 text-accent-purple" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.996.044-1.983.15-2.96.314a.5.5 0 0 0-.399.546l.355 4.981a.5.5 0 0 0 .658.443l1.647-.563M18.75 4.236c.996.044 1.983.15 2.96.314a.5.5 0 0 1 .399.546l-.355 4.981a.5.5 0 0 1-.658.443l-1.647-.563M5.25 4.236V2.721a.5.5 0 0 1 .41-.492 45.292 45.292 0 0 1 12.68 0 .5.5 0 0 1 .41.492V4.236" />
              </svg>
            }
          />
          <StatCard
            title="Transactions"
            value={totalTransactions}
            colorBg="bg-accent-blue/10"
            delay={300}
            icon={
              <svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            }
          />
        </div>
      )}

      {/* Charts Row */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card-static p-6">
            <div className="skeleton h-5 w-40 mb-6 rounded" />
            <div className="skeleton h-64 w-full rounded-xl" />
          </div>
          <div className="glass-card-static p-6">
            <div className="skeleton h-5 w-40 mb-6 rounded" />
            <div className="skeleton h-64 w-full rounded-xl" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryPieChart data={categoryData} />
          <DailyBarChart data={dailyData} />
        </div>
      )}

      {/* Budget + AI Row */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card-static p-6">
            <div className="skeleton h-5 w-32 mb-4 rounded" />
            <div className="space-y-3">
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-8 w-full rounded-full" />
              <div className="skeleton h-4 w-2/3 rounded" />
            </div>
          </div>
          <div className="glass-card-static p-6">
            <div className="skeleton h-5 w-32 mb-4 rounded" />
            <div className="skeleton h-32 w-full rounded-xl" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BudgetCard totalSpend={totalSpend} budget={budget} />
          <SmartInsights />
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
