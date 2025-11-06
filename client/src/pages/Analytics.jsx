import React, { useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { Bar, Pie } from 'react-chartjs-2';
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
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { expenses } = useAppSelector((state) => state.expenses);

  const categoryData = useMemo(() => {
    const categoryTotals = {};
    expenses.forEach((expense) => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const sorted = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);
    return {
      labels: sorted.map(([cat]) => cat),
      data: sorted.map(([, amount]) => amount),
    };
  }, [expenses]);

  const barData = {
    labels: categoryData.labels,
    datasets: [
      {
        label: 'Expenses by Category',
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

  const chartOptions = {
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
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-2">Detailed analysis of your expenses</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4">Category Breakdown (Bar)</h2>
              <div className="h-64">
                <Bar data={barData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4">Category Distribution (Pie)</h2>
              <div className="h-64">
                <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">Detailed Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Highest Category</p>
                <p className="text-xl font-bold text-gray-900">
                  {categoryData.labels[0] || 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  ₹{categoryData.data[0]?.toLocaleString('en-IN') || '0'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Categories</p>
                <p className="text-xl font-bold text-gray-900">{categoryData.labels.length}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Average per Category</p>
                <p className="text-xl font-bold text-gray-900">
                  ₹{categoryData.data.length > 0 ? (categoryData.data.reduce((a, b) => a + b, 0) / categoryData.data.length).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;

