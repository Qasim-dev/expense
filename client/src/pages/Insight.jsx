import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchExpenses } from '../store/slices/expenseSlice';
import PageShell from '../components/layout/PageShell';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Insight = () => {
  const dispatch = useAppDispatch();
  const { expenses } = useAppSelector((state) => state.expenses);
  const { format, formatWhole } = useCurrencyFormatter();
  const [range, setRange] = useState('12m');

  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch]);

  const monthlyTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const monthlyTotals = new Array(12).fill(0);

    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      if (date.getFullYear() === currentYear) {
        monthlyTotals[date.getMonth()] += expense.amount;
      }
    });

    return { labels: months, data: monthlyTotals };
  }, [expenses]);

  const filteredTrend = useMemo(() => {
    if (range === '12m') return monthlyTrend;
    const months = range === '6m' ? 6 : 3;
    return {
      labels: monthlyTrend.labels.slice(-months),
      data: monthlyTrend.data.slice(-months),
    };
  }, [monthlyTrend, range]);

  const chartData = {
    labels: filteredTrend.labels,
    datasets: [
      {
        label: 'Monthly Expenses',
        data: filteredTrend.data,
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => format(value),
          },
        },
      },
    }),
    [format]
  );

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const averageTicket = expenses.length ? totalSpent / expenses.length : 0;

  const currentMonth = new Date().getMonth();
  const currentMonthSpend = expenses
    .filter((exp) => new Date(exp.date).getMonth() === currentMonth)
    .reduce((sum, exp) => sum + exp.amount, 0);
  const previousMonthSpend = expenses
    .filter((exp) => new Date(exp.date).getMonth() === currentMonth - 1)
    .reduce((sum, exp) => sum + exp.amount, 0);
  const monthChange =
    previousMonthSpend === 0 ? 0 : (((currentMonthSpend - previousMonthSpend) / previousMonthSpend) * 100).toFixed(1);

  const topCategories = Object.entries(
    expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {})
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const summaryCards = [
    {
      label: 'This month',
      value: formatWhole(currentMonthSpend),
      helper: `${monthChange >= 0 ? '+' : ''}${monthChange}% vs last month`,
    },
    {
      label: 'Average ticket',
      value: formatWhole(averageTicket),
      helper: `${expenses.length} expenses`,
    },
    {
      label: 'All time spend',
      value: formatWhole(totalSpent),
      helper: 'Across all categories',
    },
  ];

  return (
    <PageShell
      title="Insights"
      badge="Analysis"
      description="Visualize your spending over time and discover which categories dominate your cashflow."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</p>
            <p className="text-2xl font-semibold text-slate-900 mt-2">{card.value}</p>
            <p className="text-xs text-slate-500 mt-1">{card.helper}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Expense trends</p>
            <h2 className="text-xl font-semibold text-slate-900">Time series</h2>
          </div>
          <div className="flex gap-2 text-xs">
            {['3m', '6m', '12m'].map((key) => (
              <button
                key={key}
                onClick={() => setRange(key)}
                className={`px-3 py-1.5 rounded-full border ${
                  range === key ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-500'
                }`}
              >
                {key === '3m' ? '3M' : key === '6m' ? '6M' : '12M'}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top categories</h3>
          <div className="space-y-3">
            {topCategories.map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-slate-600">{category}</span>
                <span className="text-sm font-semibold text-slate-900">
                  {format(amount)}
                </span>
              </div>
            ))}
            {topCategories.length === 0 && <p className="text-xs text-slate-400">No data yet.</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Spending summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Total expenses</span>
              <span className="font-semibold text-slate-900">
                {format(totalSpent)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Average per expense</span>
              <span className="font-semibold text-slate-900">
                {format(averageTicket)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Total transactions</span>
              <span className="font-semibold text-slate-900">{expenses.length}</span>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default Insight;
