import React, { useMemo } from 'react';
import { useAppSelector } from '../../store/hooks';

const SummaryCards = () => {
  const { expenses } = useAppSelector((state) => state.expenses);
  const goals = useAppSelector((state) => state.goals?.goals || []);
  const investments = useAppSelector((state) => state.investments?.investments || []);

  // Calculate monthly expenses
  const monthlyExpenses = useMemo(() => {
    const now = new Date();
    return expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  // Calculate last month expenses for comparison
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

  // Calculate monthly change percentage
  const monthlyChange = useMemo(() => {
    if (lastMonthExpenses === 0) return 0;
    return ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
  }, [monthlyExpenses, lastMonthExpenses]);

  // Calculate total expenses (for account balance estimation)
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  // Calculate total investment
  const totalInvestment = useMemo(() => {
    return investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  }, [investments]);

  // Get active goal
  const activeGoal = useMemo(() => {
    return goals.find((goal) => goal.status === 'active') || goals[0];
  }, [goals]);

  // Calculate account balance (estimated: start with a base, subtract expenses, add investments)
  // This is a simplified calculation - in real app, this would come from account data
  const accountBalance = useMemo(() => {
    const baseBalance = 1000000; // Starting balance
    return baseBalance - totalExpenses + totalInvestment;
  }, [totalExpenses, totalInvestment]);

  const cards = [
    {
      title: 'Account Balance',
      value: `₹${accountBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${monthlyChange >= 0 ? '+' : ''}${monthlyChange.toFixed(1)}% ${monthlyChange >= 0 ? 'more' : 'less'} than last month`,
      changeType: monthlyChange >= 0 ? 'positive' : 'negative',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Monthly Expenses',
      value: `₹${monthlyExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${Math.abs(monthlyChange).toFixed(1)}% ${monthlyChange >= 0 ? 'more' : 'less'} than last month`,
      changeType: monthlyChange >= 0 ? 'negative' : 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Total Investment',
      value: `₹${totalInvestment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: investments.length > 0 ? `${investments.length} active investment${investments.length > 1 ? 's' : ''}` : 'No investments yet',
      changeType: 'info',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Goal',
      value: activeGoal ? `₹${(activeGoal.savedAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₹0',
      subtitle: activeGoal ? activeGoal.title : 'No active goal',
      change: activeGoal ? `Required: ₹${activeGoal.targetAmount.toLocaleString('en-IN')}` : 'Set a goal to get started',
      changeType: 'goal',
      progress: activeGoal ? Math.min((activeGoal.savedAmount / activeGoal.targetAmount) * 100, 100) : 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`${card.bgColor} ${card.color} p-3 rounded-lg`}>
              {card.icon}
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>

          <h3 className="text-sm font-medium text-gray-500 mb-2">{card.title}</h3>
          <p className="text-2xl font-bold text-gray-900 mb-2">{card.value}</p>

          {card.subtitle && (
            <p className="text-sm text-gray-600 mb-2">{card.subtitle}</p>
          )}

          {card.progress !== undefined && (
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${card.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-1">
            {card.changeType === 'positive' && (
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            )}
            {card.changeType === 'negative' && (
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            <span
              className={`text-xs ${
                card.changeType === 'positive'
                  ? 'text-green-600'
                  : card.changeType === 'negative'
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
            >
              {card.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
