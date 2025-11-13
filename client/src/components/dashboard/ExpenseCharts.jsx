import React, { useMemo, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
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
import { useAppSelector } from '../../store/hooks';
import { useCurrencyFormatter } from '../../hooks/useCurrencyFormatter';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const ranges = [
  { id: '3m', label: '3M' },
  { id: '6m', label: '6M' },
  { id: '12m', label: '12M' },
];

const ExpenseCharts = () => {
  const { expenses } = useAppSelector((state) => state.expenses);
  const [activeRange, setActiveRange] = useState('6m');
  const { format, formatWhole } = useCurrencyFormatter();

  const monthlyDataset = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const totals = new Array(12).fill(0);

    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      if (date.getFullYear() === currentYear) {
        totals[date.getMonth()] += expense.amount;
      }
    });

    return { labels: months, data: totals };
  }, [expenses]);

  const filteredMonthly = useMemo(() => {
    const count = activeRange === '12m' ? 12 : activeRange === '6m' ? 6 : 3;
    return {
      labels: monthlyDataset.labels.slice(-count),
      data: monthlyDataset.data.slice(-count),
    };
  }, [monthlyDataset, activeRange]);

  const categoryData = useMemo(() => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      const key = expense.category || 'Other';
      acc[key] = (acc[key] || 0) + expense.amount;
      return acc;
    }, {});

    const sorted = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      labels: sorted.map(([category]) => category),
      data: sorted.map(([, amount]) => amount),
    };
  }, [expenses]);

  const totalCategory = categoryData.data.reduce((sum, value) => sum + value, 0);

  const gradientBackground = (context) => {
    const chart = context.chart;
    const { ctx, chartArea } = chart;
    if (!chartArea) {
      return 'rgba(99, 102, 241, 0.5)';
    }
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, 'rgba(129, 140, 248, 0.1)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.8)');
    return gradient;
  };

  const barChartData = {
    labels: filteredMonthly.labels,
    datasets: [
      {
        label: 'Expenses',
        data: filteredMonthly.data,
        backgroundColor: gradientBackground,
        borderRadius: 18,
        barThickness: 26,
      },
    ],
  };

  const doughnutChartData = {
    labels: categoryData.labels,
    datasets: [
      {
        data: categoryData.data,
        backgroundColor: ['#818CF8', '#F472B6', '#FBBF24', '#34D399', '#FB7185'],
        borderWidth: 6,
        borderColor: '#FFFFFF',
      },
    ],
  };

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => format(context.parsed.y || 0),
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { size: 11 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(148, 163, 184, 0.2)' },
          ticks: {
            callback: (value) => format(value),
            color: '#94a3b8',
            font: { size: 11 },
          },
        },
      },
    }),
    [format]
  );

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    cutout: '70%',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Monthly expenses</p>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Trend overview</h3>
          </div>
          <div className="flex items-center gap-2">
            {ranges.map((range) => (
              <button
                key={range.id}
                onClick={() => setActiveRange(range.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  activeRange === range.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'border border-slate-200 text-slate-500 dark:text-slate-300 dark:border-slate-700'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64">
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </div>

      <div className="lg:col-span-2 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Top categories</p>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Spending mix</h3>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">{categoryData.labels.length} categories</span>
        </div>
        <div className="relative h-64 flex items-center justify-center">
          <div className="w-48 h-48">
            <Doughnut data={doughnutChartData} options={doughnutOptions} />
          </div>
          <div className="absolute text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">Tracked</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{formatWhole(totalCategory)}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">last period</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {categoryData.labels.map((label, index) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: doughnutChartData.datasets[0].backgroundColor[index],
                  }}
                />
                <span className="text-slate-600 dark:text-slate-300">{label}</span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {formatWhole(categoryData.data[index] || 0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpenseCharts;
