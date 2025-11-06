import React, { useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Insight = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { expenses } = useAppSelector((state) => state.expenses);

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

    return {
      labels: months,
      data: monthlyTotals,
    };
  }, [expenses]);

  const chartData = {
    labels: monthlyTrend.labels,
    datasets: [
      {
        label: 'Monthly Expenses',
        data: monthlyTrend.data,
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64 mt-16 p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Insights</h1>
            <p className="text-gray-600 mt-2">Analyze your spending patterns and trends</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Expense Trends</h2>
            <div className="h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold mb-4">Top Spending Categories</h3>
              <div className="space-y-3">
                {Object.entries(
                  expenses.reduce((acc, exp) => {
                    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
                    return acc;
                  }, {})
                )
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-gray-700">{category}</span>
                      <span className="font-semibold text-gray-900">
                        ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold mb-4">Spending Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Total Expenses</span>
                  <span className="font-semibold text-gray-900">
                    ₹{expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Average per Expense</span>
                  <span className="font-semibold text-gray-900">
                    ₹{expenses.length > 0 ? (expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Total Transactions</span>
                  <span className="font-semibold text-gray-900">{expenses.length}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Insight;

