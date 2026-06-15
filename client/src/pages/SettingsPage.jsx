import { useState, useEffect } from 'react';
import API from '../api/axios';

const SettingsPage = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [amount, setAmount] = useState('');
  const [currentBudget, setCurrentBudget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const years = [];
  for (let y = now.getFullYear() + 1; y >= now.getFullYear() - 3; y--) {
    years.push(y);
  }

  useEffect(() => {
    const fetchBudget = async () => {
      setFetching(true);
      try {
        const res = await API.get(`/budgets?month=${month}&year=${year}`);
        const budgetData = res.data;
        if (budgetData && budgetData.amount) {
          setCurrentBudget(budgetData);
          setAmount(budgetData.amount.toString());
        } else {
          setCurrentBudget(null);
          setAmount('');
        }
      } catch {
        setCurrentBudget(null);
        setAmount('');
      } finally {
        setFetching(false);
      }
    };
    fetchBudget();
  }, [month, year]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid budget amount.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await API.post('/budgets', {
        month,
        year,
        amount: parseFloat(amount),
      });
      setCurrentBudget(res.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget.');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(val);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-muted text-sm mt-1">Manage your monthly budget and preferences</p>
      </div>

      {/* Budget Card */}
      <div className="glass-card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent-emerald/12 flex items-center justify-center">
            <svg className="w-5 h-5 text-accent-emerald" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-text-primary">Monthly Budget</h2>
            <p className="text-text-muted text-sm">Set a spending limit for each month</p>
          </div>
        </div>

        {/* Current Budget Display */}
        {fetching ? (
          <div className="mb-6 p-4 rounded-xl bg-bg-tertiary/10 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="skeleton w-8 h-8 rounded-lg" />
              <div className="space-y-2 flex-1">
                <div className="skeleton h-4 w-1/3 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            </div>
          </div>
        ) : currentBudget ? (
          <div className="mb-6 p-4 rounded-xl bg-accent-emerald/8 border border-accent-emerald/15 animate-slideDown">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-emerald/15 flex items-center justify-center">
                <svg className="w-4 h-4 text-accent-emerald" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-accent-emerald-light">
                  Current budget: {formatAmount(currentBudget.amount)}
                </p>
                <p className="text-xs text-text-muted">
                  {months[month - 1]} {year}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Success Message */}
        {success && (
          <div className="mb-5 p-3.5 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald-light text-sm animate-slideDown flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Budget saved successfully!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose-light text-sm animate-shake flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="glass-input appearance-none cursor-pointer"
              >
                {months.map((m, idx) => (
                  <option key={idx} value={idx + 1} className="bg-bg-secondary text-text-primary">{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="glass-input appearance-none cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-bg-secondary text-text-primary">{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Budget Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm font-medium">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(''); }}
                placeholder="e.g. 50000"
                min="0"
                step="100"
                className="glass-input pl-8 text-lg font-display font-semibold"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full sm:w-auto"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {currentBudget ? 'Update Budget' : 'Set Budget'}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Info Card */}
      <div className="glass-card-static p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-blue/12 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-accent-blue" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-1">How budgets work</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Set a monthly spending limit to track your expenses against. When you exceed 80% of your budget,
              you'll see warnings on your dashboard. The AI advisor will also factor your budget into its recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
