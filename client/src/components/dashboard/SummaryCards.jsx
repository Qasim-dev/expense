import React, { useMemo } from 'react';
import { useAppSelector } from '../../store/hooks';
import { useCurrencyFormatter } from '../../hooks/useCurrencyFormatter';

const SummaryCards = () => {
  const { expenses } = useAppSelector((state) => state.expenses);
  const incomeRecords = useAppSelector((state) => state.income?.records || []);
  const goals = useAppSelector((state) => state.goals?.goals || []);
  const investments = useAppSelector((state) => state.investments?.investments || []);
  const { format, formatWhole } = useCurrencyFormatter();

  const monthlyExpenses = useMemo(() => {
    const now = new Date();
    return expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const monthlyIncome = useMemo(() => {
    const now = new Date();
    return incomeRecords
      .filter((record) => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, record) => sum + (record.amount || 0), 0);
  }, [incomeRecords]);

  const lastMonthExpenses = useMemo(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === lastMonth.getMonth() && expenseDate.getFullYear() === lastMonth.getFullYear();
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const monthlyChange = useMemo(() => {
    if (lastMonthExpenses === 0) return 0;
    return ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
  }, [monthlyExpenses, lastMonthExpenses]);

  const totalExpenses = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amount, 0), [expenses]);

  const totalIncome = useMemo(
    () => incomeRecords.reduce((sum, record) => sum + (record.amount || 0), 0),
    [incomeRecords]
  );

  const totalInvestment = useMemo(
    () => investments.reduce((sum, inv) => sum + (inv.amount || 0), 0),
    [investments]
  );

  const activeGoal = useMemo(
    () => goals.find((goal) => goal.status === 'active') || goals[0],
    [goals]
  );

  const accountBalance = useMemo(() => {
    return totalIncome - totalExpenses + totalInvestment;
  }, [totalIncome, totalExpenses, totalInvestment]);

  const goalProgress = activeGoal
    ? Math.min(((activeGoal.savedAmount || 0) / activeGoal.targetAmount) * 100, 100)
    : 0;

  const cards = [
    {
      title: 'Account Balance',
      value: formatWhole(accountBalance),
      trend: `${monthlyChange >= 0 ? '+' : ''}${monthlyChange.toFixed(1)}% vs last month`,
      positive: monthlyChange >= 0,
      accent: 'from-indigo-500 to-violet-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2v8h6v-8c0-1.105-1.343-2-3-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10h14M8 21h8" />
        </svg>
      ),
    },
    {
      title: 'Monthly Burn',
      value: formatWhole(monthlyExpenses),
      trend: `Income coverage ${monthlyIncome ? Math.round((monthlyExpenses / monthlyIncome) * 100) : 0}%`,
      positive: monthlyChange < 0,
      accent: 'from-rose-500 to-orange-400',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2V9m3 8v-4M5 21h14" />
        </svg>
      ),
    },
    {
      title: 'Monthly Income',
      value: formatWhole(monthlyIncome),
      trend: `Total ${formatWhole(totalIncome)}`,
      positive: true,
      accent: 'from-emerald-500 to-teal-400',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2v8h6v-8c0-1.105-1.343-2-3-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10h14M8 21h8" />
        </svg>
      ),
    },
    {
      title: 'Total Investment',
      value: formatWhole(totalInvestment),
      trend: investments.length > 0 ? `${investments.length} instruments` : 'Add an investment',
      positive: true,
      accent: 'from-emerald-500 to-teal-400',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2v8h6v-8c0-1.105-1.343-2-3-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10h14M8 21h8" />
        </svg>
      ),
    },
    {
      title: activeGoal ? activeGoal.title : 'Goal progress',
      value: activeGoal ? formatWhole(activeGoal.savedAmount || 0) : 'Set a goal',
      trend: activeGoal ? `Target ${formatWhole(activeGoal.targetAmount)}` : 'No goal yet',
      progress: goalProgress,
      positive: goalProgress >= 50,
      accent: 'from-amber-400 to-yellow-400',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2v8h6v-8c0-1.105-1.343-2-3-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10h14M8 21h8" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`rounded-3xl border border-slate-100 p-5 bg-white dark:bg-slate-800 shadow-sm ${
            card.progress !== undefined ? 'relative overflow-hidden' : ''
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.accent} text-white flex items-center justify-center mb-4`}>
            {card.icon}
          </div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{card.title}</p>
          <p className="text-3xl font-semibold text-slate-900 mt-2">{card.value}</p>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span
              className={`px-2 py-1 rounded-full ${
                card.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              {card.positive ? 'Positive' : 'Caution'}
            </span>
            <span className="text-slate-500">{card.trend}</span>
          </div>
          {card.progress !== undefined && (
            <div className="mt-4">
              <div className="w-full bg-slate-100 h-2 rounded-full">
                <div
                  className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full"
                  style={{ width: `${card.progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">{card.progress}% complete</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
