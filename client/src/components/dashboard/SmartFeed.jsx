import React, { useMemo } from 'react';
import { useAppSelector } from '../../store/hooks';
import { useCurrencyFormatter } from '../../hooks/useCurrencyFormatter';

const formatRelativeDate = (dateString) => {
  if (!dateString) return 'just now';
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes || 1}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const SmartFeed = () => {
  const { expenses } = useAppSelector((state) => state.expenses);
  const goals = useAppSelector((state) => state.goals?.goals || []);
  const bills = useAppSelector((state) => state.bills?.bills || []);
  const { formatWhole } = useCurrencyFormatter();

  const upcomingBill = useMemo(() => {
    return [...bills]
      .filter((bill) => bill.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
  }, [bills]);

  const activeGoal = useMemo(() => goals.find((goal) => goal.status === 'active') || goals[0], [goals]);
  const latestExpense = expenses[0];

  const feedItems = [
    latestExpense && {
      title: `New expense | ${latestExpense.category || 'General'}`,
      description: latestExpense.title,
      meta: formatWhole(latestExpense.amount || 0),
      time: formatRelativeDate(latestExpense.date),
      accent: 'bg-indigo-50 text-indigo-600',
    },
    upcomingBill && {
      title: 'Upcoming bill',
      description: upcomingBill.name || upcomingBill.title || 'Bill reminder',
      meta: new Date(upcomingBill.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      time: 'Due soon',
      accent: 'bg-amber-50 text-amber-600',
    },
    activeGoal && {
      title: 'Goal tracking',
      description: activeGoal.title,
      meta: `${Math.min(Math.round(((activeGoal.savedAmount || 0) / activeGoal.targetAmount) * 100), 100)}% complete`,
      time: 'Goal desk',
      accent: 'bg-emerald-50 text-emerald-600',
    },
  ].filter(Boolean);

  if (!feedItems.length) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 p-5">
        <p className="text-sm text-slate-500">Smart feed will populate as you add expenses, bills, or goals.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Smart feed</p>
          <h3 className="text-lg font-semibold text-slate-900">What needs your attention</h3>
        </div>
        <button className="text-xs text-indigo-600 font-medium">View all</button>
      </div>
      <div className="space-y-3">
        {feedItems.map((item) => (
          <div key={item.title} className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-100 bg-surface-card/50">
            <div>
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="text-xs text-slate-500">{item.description}</p>
              <span className={`inline-flex mt-2 px-2 py-1 rounded-full text-xs font-medium ${item.accent}`}>
                {item.meta}
              </span>
            </div>
            <span className="text-xs text-slate-400">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartFeed;
