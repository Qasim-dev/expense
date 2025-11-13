import React, { useMemo } from 'react';
import { useAppSelector } from '../../store/hooks';
import { formatRelativeTime } from '../../utils/time';
import { useCurrencyFormatter } from '../../hooks/useCurrencyFormatter';

const FinancialPulse = () => {
  const { expenses, isOnline, pendingSyncCount, lastSyncedAt } = useAppSelector((state) => state.expenses);
  const incomeRecords = useAppSelector((state) => state.income?.records || []);
  const goals = useAppSelector((state) => state.goals?.goals || []);
  const investments = useAppSelector((state) => state.investments?.investments || []);
  const { formatWhole } = useCurrencyFormatter();
  const relativeSyncTime = formatRelativeTime(lastSyncedAt);

  const monthlyExpenses = useMemo(() => {
    const now = new Date();
    return expenses
      .filter((expense) => {
        const date = new Date(expense.date);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const monthlyIncome = useMemo(() => {
    const now = new Date();
    return incomeRecords
      .filter((income) => {
        const date = new Date(income.date);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, income) => sum + (income.amount || 0), 0);
  }, [incomeRecords]);

  const investedAmount = useMemo(
    () => investments.reduce((sum, inv) => sum + (inv.amount || 0), 0),
    [investments]
  );

  const cashFlow = monthlyIncome - monthlyExpenses;

  const savingsRate =
    monthlyIncome <= 0 ? 0 : Math.max(Math.min(Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100), 100), -100);

  const avgGoalProgress = useMemo(() => {
    if (!goals.length) return 0;
    const total = goals.reduce((sum, goal) => {
      if (!goal.targetAmount) return sum;
      return sum + Math.min(((goal.savedAmount || 0) / goal.targetAmount) * 100, 100);
    }, 0);
    return Math.round(total / goals.length);
  }, [goals]);

  const metrics = [
    {
      label: 'Cash flow',
      value: formatWhole(cashFlow),
      sublabel: `${formatWhole(monthlyIncome)} in · ${formatWhole(monthlyExpenses)} out`,
      accent: cashFlow >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600',
      badge: cashFlow >= 0 ? 'Surplus' : 'Deficit',
    },
    {
      label: 'Savings rate',
      value: `${savingsRate}%`,
      sublabel: savingsRate >= 40 ? 'Strong buffer' : 'Revisit spending',
      accent: 'bg-indigo-50 text-indigo-600',
      badge: 'Insight',
    },
    {
      label: 'Goal progress',
      value: `${avgGoalProgress}%`,
      sublabel: goals.length ? `${goals.length} active goals` : 'No goals yet',
      accent: 'bg-amber-50 text-amber-600',
      badge: 'Goals',
    },
    {
      label: 'Sync status',
      value: isOnline
        ? pendingSyncCount > 0
          ? `${pendingSyncCount} syncing`
          : 'Realtime'
        : pendingSyncCount > 0
          ? `${pendingSyncCount} queued`
          : 'Offline',
      sublabel: relativeSyncTime
        ? `Last sync ${relativeSyncTime}`
        : isOnline
          ? 'Waiting for first sync'
          : 'We will sync when back online',
      accent: isOnline
        ? pendingSyncCount > 0
          ? 'bg-amber-50 text-amber-600'
          : 'bg-emerald-50 text-emerald-600'
        : 'bg-rose-50 text-rose-600',
      badge: isOnline
        ? pendingSyncCount > 0
          ? 'Syncing'
          : 'Synced'
        : 'Queueing',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <div key={metric.label} className=" rounded-2xl border border-slate-100 p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{metric.label}</p>
          <p className="text-3xl font-semibold text-slate-900 mt-2">{metric.value}</p>
          <p className="text-xs text-slate-500 mt-1">{metric.sublabel}</p>
          <span className={`inline-flex mt-3 px-3 py-1 rounded-full text-xs font-medium ${metric.accent}`}>
            {metric.badge}
          </span>
        </div>
      ))}
    </div>
  );
};

export default FinancialPulse;
