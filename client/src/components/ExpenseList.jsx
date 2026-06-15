import { useState } from 'react';

const ExpenseList = ({ expenses = [], onDelete }) => {
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (confirmId !== id) {
      setConfirmId(id);
      setTimeout(() => setConfirmId(null), 3000);
      return;
    }
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (expenses.length === 0) {
    return (
      <div className="glass-card p-10 text-center animate-fadeIn">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-bg-tertiary/30 flex items-center justify-center">
          <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
          </svg>
        </div>
        <h3 className="font-display text-lg font-semibold text-text-secondary mb-1">No Expenses Yet</h3>
        <p className="text-text-muted text-sm">Start tracking your spending by adding your first expense above.</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden animate-slideUp">
      <div className="px-6 py-4 border-b border-white/5">
        <h3 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
          <svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          Transactions
          <span className="ml-auto text-xs font-medium text-text-muted bg-bg-tertiary/40 px-2.5 py-1 rounded-full">
            {expenses.length} {expenses.length === 1 ? 'item' : 'items'}
          </span>
        </h3>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Date</th>
              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Category</th>
              <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Description</th>
              <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Amount</th>
              <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense, idx) => (
              <tr
                key={expense.id}
                className="border-b border-white/3 hover:bg-white/3 transition-colors duration-150"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <td className="px-6 py-4 text-sm text-text-secondary whitespace-nowrap">{formatDate(expense.date)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: expense.category?.color || '#64748b' }}
                    />
                    <span className="text-sm text-text-primary font-medium">
                      {expense.category?.icon || '📦'} {expense.category?.name || 'Uncategorized'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary max-w-xs truncate">
                  {expense.description || '—'}
                </td>
                <td className="px-6 py-4 text-sm text-accent-rose-light font-semibold text-right whitespace-nowrap">
                  {formatAmount(expense.amount)}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(expense.id)}
                    disabled={deletingId === expense.id}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
                      confirmId === expense.id
                        ? 'bg-accent-rose/15 text-accent-rose-light border border-accent-rose/25'
                        : 'text-text-muted hover:text-accent-rose-light hover:bg-accent-rose/10'
                    }`}
                  >
                    {deletingId === expense.id ? (
                      <div className="w-4 h-4 border-2 border-accent-rose/30 border-t-accent-rose rounded-full animate-spin" />
                    ) : confirmId === expense.id ? (
                      'Confirm?'
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-white/5">
        {expenses.map((expense, idx) => (
          <div
            key={expense.id}
            className="p-4 flex items-center gap-3 hover:bg-white/3 transition-colors"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: (expense.category?.color || '#64748b') + '20' }}
            >
              {expense.category?.icon || '📦'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {expense.description || expense.category?.name || 'Expense'}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                {expense.category?.name || 'Uncategorized'} · {formatDate(expense.date)}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-semibold text-accent-rose-light">{formatAmount(expense.amount)}</p>
              <button
                onClick={() => handleDelete(expense.id)}
                disabled={deletingId === expense.id}
                className="text-xs text-text-muted hover:text-accent-rose-light mt-1 transition-colors"
              >
                {confirmId === expense.id ? 'Tap to confirm' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;
