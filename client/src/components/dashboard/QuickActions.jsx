import React from 'react';

const QuickActions = ({
  onLogExpense = () => {},
  onLogIncome = () => {},
  onAddGoal = () => {},
  onSplitBill = () => {},
}) => {
  const actions = [
    {
      title: 'Log expense',
      description: 'Capture a new spend right away',
      accent: 'from-indigo-500 to-violet-500',
      onClick: onLogExpense,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      title: 'Log income',
      description: 'Record salary, payouts, or refunds',
      accent: 'from-emerald-500 to-teal-500',
      onClick: onLogIncome,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2v8h6v-8c0-1.105-1.343-2-3-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10h14M8 21h8" />
        </svg>
      ),
    },
    {
      title: 'Add goal',
      description: 'Save up for something meaningful',
      accent: 'from-amber-400 to-orange-500',
      onClick: onAddGoal,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2v6h6v-6c0-1.105-1.343-2-3-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10h14M8 21h8" />
        </svg>
      ),
    },
    {
      title: 'Split bill',
      description: 'Share expenses with friends',
      accent: 'from-emerald-400 to-teal-500',
      onClick: onSplitBill,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4-4 4 4m0-8l-4 4-4-4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {actions.map((action) => (
        <button
          key={action.title}
          onClick={action.onClick}
          className="group rounded-2xl p-4 border border-slate-200 bg-white dark:bg-slate-800 flex items-start gap-4 text-left hover:-translate-y-0.5 hover:shadow-lg transition-all"
        >
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.accent} text-white flex items-center justify-center shadow-md`}>
            {action.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{action.title}</p>
            <p className="text-xs text-slate-500 mt-1">{action.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
