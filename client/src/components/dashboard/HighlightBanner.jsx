import React, { useMemo } from 'react';
import { useAppSelector } from '../../store/hooks';
import { useCurrencyFormatter } from '../../hooks/useCurrencyFormatter';

const HighlightBanner = ({ onAddExpense = () => {} }) => {
  const { expenses } = useAppSelector((state) => state.expenses);
  const goals = useAppSelector((state) => state.goals?.goals || []);
  const investments = useAppSelector((state) => state.investments?.investments || []);
  const { formatWhole } = useCurrencyFormatter();

  const monthlyTotal = useMemo(() => {
    const now = new Date();
    return expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const topCategory = useMemo(() => {
    const map = expenses.reduce((acc, expense) => {
      const key = expense.category || 'Other';
      acc[key] = (acc[key] || 0) + expense.amount;
      return acc;
    }, {});
    const sorted = Object.entries(map).sort(([, a], [, b]) => b - a);
    if (!sorted.length) return null;
    return { name: sorted[0][0], value: sorted[0][1] };
  }, [expenses]);

  const activeGoal = useMemo(() => {
    return goals.find((goal) => goal.status === 'active') || goals[0];
  }, [goals]);

  const goalProgress = activeGoal
    ? Math.min(Math.round(((activeGoal.savedAmount || 0) / activeGoal.targetAmount) * 100), 100)
    : 0;

  const investedAmount = useMemo(() => {
    return investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  }, [investments]);

  return (
    <div className="bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500 text-white rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden">
      {/* <div className="absolute inset-y-0 -right-16 w-64 bg-white dark:bg-slate-800/10 rotate-12 blur-3xl" /> */}
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/70 mb-1">Monthly snapshot</p>
            <h2 className="text-3xl font-display font-semibold">
              You&apos;ve tracked {formatWhole(monthlyTotal)} this month
            </h2>
            {topCategory && (
              <p className="text-sm text-white/80 mt-1">
                Biggest category | {topCategory.name} ({formatWhole(topCategory.value)})
              </p>
            )}
          </div>
          <button
            onClick={onAddExpense}
            className="px-5 py-3 bg-white dark:bg-slate-800 text-indigo-700 rounded-2xl font-semibold shadow-lg shadow-black/20 hover:-translate-y-0.5 transition-transform"
          >
            + Log new expense
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className=" dark:bg-slate-800/15 rounded-2xl p-4 border border-white/20">
            <p className="text-white/80">Invested</p>
            <p className="text-2xl font-semibold mt-1">{formatWhole(investedAmount)}</p>
            <p className="text-xs text-white/70 mt-1">Autopilot returns active</p>
          </div>
          <div className=" dark:bg-slate-800/15 rounded-2xl p-4 border border-white/20">
            <p className="text-white/80">Goal progress</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-2xl font-semibold">{goalProgress}%</p>
              <span className="text-xs dark:bg-slate-800/20 px-2 py-1 rounded-full">
                {activeGoal ? activeGoal.title : 'No goal yet'}
              </span>
            </div>
            <div className="mt-3 w-full bg-white dark:bg-slate-800/20 rounded-full h-2">
              <div className=" dark:bg-slate-800 h-2 rounded-full" style={{ width: `${goalProgress}%` }} />
            </div>
          </div>
          <div className=" dark:bg-slate-800/15 rounded-2xl p-4 border border-white/20">
            <p className="text-white/80">Streak</p>
            <p className="text-2xl font-semibold mt-1">12 days</p>
            <p className="text-xs text-white/70 mt-1">Consistent tracking streak</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HighlightBanner;
