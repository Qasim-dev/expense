import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchExpenses } from '../store/slices/expenseSlice';
import PageShell from '../components/layout/PageShell';
import { Bar, Pie } from 'react-chartjs-2';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Analytics = () => {
  const dispatch = useAppDispatch();
  const { expenses } = useAppSelector((state) => state.expenses);
  const { format } = useCurrencyFormatter();
  const [sliceCount, setSliceCount] = useState(5);

  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch]);

  const categoryData = useMemo(() => {
    const categoryTotals = {};
    expenses.forEach((expense) => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    const sorted = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);
    const limited = sliceCount === 'all' ? sorted : sorted.slice(0, sliceCount);
    return {
      labels: limited.map(([cat]) => cat),
      data: limited.map(([, amount]) => amount),
      totalCategories: sorted.length,
      highestCategory: sorted[0]?.[0] || 'N/A',
      highestValue: sorted[0]?.[1] || 0,
      averagePerCategory: sorted.length
        ? sorted.reduce((sum, [, amount]) => sum + amount, 0) / sorted.length
        : 0,
    };
  }, [expenses, sliceCount]);

  const handleSliceChange = (value) => {
    setSliceCount(value === 'all' ? 'all' : Number(value));
  };

  const barData = {
    labels: categoryData.labels,
    datasets: [
      {
        label: 'Expenses by category',
        data: categoryData.data,
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: categoryData.labels,
    datasets: [
      {
        data: categoryData.data,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(20, 184, 166, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
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

  const stats = [
    {
      label: 'Highest category',
      value: categoryData.labels[0] || 'N/A',
      helper: format(categoryData.highestValue || 0),
    },
    {
      label: 'Total categories',
      value: categoryData.totalCategories,
      helper: 'active this period',
    },
    {
      label: 'Average per category',
      value: format(categoryData.averagePerCategory),
      helper: 'balanced mix',
    },
  ];

  return (
    <PageShell
      title="Analytics"
      badge="Deep Dive"
      description="Compare how each category contributes to your overall spend and spot outliers instantly."
    >
      <div className="flex flex-wrap justify-end gap-2 text-xs">
        {['5', '10', 'all'].map((option) => (
          <button
            key={option}
            onClick={() => handleSliceChange(option)}
            className={`px-3 py-1.5 rounded-full border transition ${
              String(sliceCount) === option
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'border-slate-200 text-slate-500 dark:text-slate-300 hover:border-indigo-200 dark:border-slate-700'
            }`}
          >
            {option === 'all' ? 'All categories' : `Top ${option}`}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm backdrop-blur">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Category breakdown</h2>
          <div className="h-64">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm backdrop-blur">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Distribution</h2>
          <div className="h-64">
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm backdrop-blur">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Detailed statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((item) => (
            <div key={item.label} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-2">{item.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.helper}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

export default Analytics;
