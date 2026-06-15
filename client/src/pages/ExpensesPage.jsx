import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';

const ExpensesPage = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`/expenses?month=${month}&year=${year}`);
      setExpenses(res.data);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleDelete = async (id) => {
    await API.delete(`/expenses/${id}`);
    fetchExpenses();
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const years = [];
  for (let y = now.getFullYear(); y >= now.getFullYear() - 5; y--) {
    years.push(y);
  }

  const totalSpend = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-text-primary">Expenses</h1>
          <p className="text-text-muted text-sm mt-1">Track and manage your spending</p>
        </div>

        {/* Month/Year Selector */}
        <div className="flex items-center gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="glass-input py-2.5 px-4 text-sm w-auto appearance-none cursor-pointer"
          >
            {months.map((m, idx) => (
              <option key={idx} value={idx + 1} className="bg-bg-secondary text-text-primary">{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="glass-input py-2.5 px-4 text-sm w-auto appearance-none cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={y} className="bg-bg-secondary text-text-primary">{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-rose/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-accent-rose" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Total for {months[month - 1]} {year}</p>
            <p className="text-xl font-bold text-text-primary font-display">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(totalSpend)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-muted">{expenses.length} transactions</p>
        </div>
      </div>

      {/* Add Expense Form */}
      <ExpenseForm onExpenseAdded={fetchExpenses} />

      {/* Expense List */}
      {loading ? (
        <div className="glass-card p-8">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-1/3 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
                <div className="skeleton h-5 w-20 rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <ExpenseList expenses={expenses} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default ExpensesPage;
