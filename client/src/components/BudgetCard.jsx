import { useNavigate } from 'react-router-dom';

const BudgetCard = ({ totalSpend = 0, budget = null }) => {
  const navigate = useNavigate();

  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  if (!budget || !budget.amount) {
    return (
      <div className="glass-card p-6 animate-slideUp">
        <h3 className="font-display text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-accent-amber" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          Budget
        </h3>
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-accent-amber/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent-amber" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <p className="text-text-secondary text-sm mb-4">No budget set for this month</p>
          <button
            onClick={() => navigate('/settings')}
            className="btn-primary text-sm py-2.5 px-5"
          >
            Set Budget
          </button>
        </div>
      </div>
    );
  }

  const budgetAmount = budget.amount;
  const remaining = budgetAmount - totalSpend;
  const percentage = budgetAmount > 0 ? Math.min((totalSpend / budgetAmount) * 100, 100) : 0;
  const isWarning = percentage > 80;
  const isOverBudget = totalSpend > budgetAmount;

  const getBarColor = () => {
    if (percentage > 80) return '#f43f5e';
    if (percentage > 50) return '#f59e0b';
    return '#10b981';
  };

  const getBarBg = () => {
    if (percentage > 80) return 'rgba(244, 63, 94, 0.12)';
    if (percentage > 50) return 'rgba(245, 158, 11, 0.12)';
    return 'rgba(16, 185, 129, 0.12)';
  };

  return (
    <div className={`glass-card p-6 animate-slideUp ${isWarning ? 'border-accent-rose/20' : ''}`}>
      <h3 className="font-display text-lg font-bold text-text-primary mb-5 flex items-center gap-2">
        <svg className="w-5 h-5 text-accent-amber" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        Monthly Budget
      </h3>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5">
        <div>
          <p className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-medium mb-1">Budget</p>
          <p className="text-sm sm:text-base font-bold text-text-primary font-display">{formatAmount(budgetAmount)}</p>
        </div>
        <div>
          <p className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-medium mb-1">Spent</p>
          <p className="text-sm sm:text-base font-bold text-accent-rose-light font-display">{formatAmount(totalSpend)}</p>
        </div>
        <div>
          <p className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-medium mb-1">Remaining</p>
          <p className={`text-sm sm:text-base font-bold font-display ${remaining >= 0 ? 'text-accent-emerald-light' : 'text-accent-rose-light'}`}>
            {remaining >= 0 ? formatAmount(remaining) : `-${formatAmount(Math.abs(remaining))}`}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-text-muted font-medium">{percentage.toFixed(0)}% used</span>
          <span className="text-xs font-medium" style={{ color: getBarColor() }}>
            {isOverBudget ? 'Over budget!' : `${formatAmount(remaining)} left`}
          </span>
        </div>
        <div
          className="w-full h-3 rounded-full overflow-hidden"
          style={{ backgroundColor: getBarBg() }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out progress-bar-fill"
            style={{
              '--progress-width': `${percentage}%`,
              width: `${percentage}%`,
              background: `linear-gradient(90deg, ${getBarColor()}cc, ${getBarColor()})`,
              boxShadow: `0 0 10px ${getBarColor()}40`,
            }}
          />
        </div>
      </div>

      {/* Warning Banner */}
      {isWarning && (
        <div className={`p-3 rounded-xl flex items-center gap-2.5 ${isOverBudget ? 'bg-accent-rose/10 border border-accent-rose/15' : 'bg-accent-amber/10 border border-accent-amber/15'} animate-shake`}>
          <svg className={`w-5 h-5 flex-shrink-0 ${isOverBudget ? 'text-accent-rose' : 'text-accent-amber'}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <p className={`text-sm font-medium ${isOverBudget ? 'text-accent-rose-light' : 'text-accent-amber-light'}`}>
            {isOverBudget
              ? `You've exceeded your budget by ${formatAmount(Math.abs(remaining))}!`
              : `Caution! You've used ${percentage.toFixed(0)}% of your budget.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default BudgetCard;
