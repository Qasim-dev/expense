import React, { useMemo } from 'react';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ExpenseCharts = () => {
  const { expenses } = useAppSelector((state) => state.expenses);

  // Calculate monthly expenses
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const monthlyTotals = new Array(12).fill(0);

    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      if (date.getFullYear() === currentYear) {
        monthlyTotals[date.getMonth()] += expense.amount;
      }
    });

    // Get last 6 months
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    const last6MonthsData = [];

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      last6Months.push(months[monthIndex]);
      last6MonthsData.push(monthlyTotals[monthIndex]);
    }

    return { labels: last6Months, data: last6MonthsData };
  }, [expenses]);

  // Calculate category expenses
  const categoryData = useMemo(() => {
    const categoryTotals = {};
    expenses.forEach((expense) => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const sortedCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);

    return {
      labels: sortedCategories.map(([category]) => category),
      data: sortedCategories.map(([, amount]) => amount),
    };
  }, [expenses]);

  const barChartData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Expenses',
        data: monthlyData.data,
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
      },
    ],
  };

  const doughnutChartData = {
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
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(20, 184, 166, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
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
          callback: function (value) {
            return '₹' + value.toLocaleString('en-IN');
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 15,
          usePointStyle: true,
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Monthly Expenses Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Expenses</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-green-600 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              6% more than last month
            </span>
            <select className="text-xs border border-gray-200 rounded px-2 py-1">
              <option>Recent</option>
            </select>
          </div>
        </div>
        <div className="h-64">
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </div>

      {/* Top Category Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top Category</h3>
          <select className="text-xs border border-gray-200 rounded px-2 py-1">
            <option>Recent</option>
          </select>
        </div>
        <div className="h-64">
          <Doughnut data={doughnutChartData} options={doughnutOptions} />
        </div>
        <div className="mt-4 space-y-2">
          {categoryData.labels.map((label, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: doughnutChartData.datasets[0].backgroundColor[index],
                  }}
                ></div>
                <span className="text-gray-600">{label}</span>
              </div>
              <span className="font-semibold text-gray-900">
                ₹{categoryData.data[index].toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpenseCharts;

