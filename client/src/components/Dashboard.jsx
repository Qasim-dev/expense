import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchExpenses, setShowForm, setEditingExpense, resetForm, setOnlineStatus, syncOfflineChanges } from '../store/slices/expenseSlice';
import { fetchGoals } from '../store/slices/goalSlice';
import { fetchInvestments } from '../store/slices/investmentSlice';
import { onOnline, onOffline, isOnline } from '../utils/indexedDB';
import Header from './layout/Header';
import Sidebar from './layout/Sidebar';
import SummaryCards from './dashboard/SummaryCards';
import ExpenseCharts from './dashboard/ExpenseCharts';
import ExpenseList from './ExpenseList';
import ExpenseForm from './ExpenseForm';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { expenses, loading, error, showForm } = useAppSelector((state) => state.expenses);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  useEffect(() => {
    dispatch(fetchExpenses());
    dispatch(fetchGoals());
    dispatch(fetchInvestments());
    
    // Monitor online/offline status
    dispatch(setOnlineStatus(isOnline()));
    
    const handleOnline = () => {
      dispatch(setOnlineStatus(true));
      dispatch(syncOfflineChanges());
      dispatch(fetchExpenses());
      dispatch(fetchGoals());
      dispatch(fetchInvestments());
    };
    
    const handleOffline = () => {
      dispatch(setOnlineStatus(false));
    };
    
    onOnline(handleOnline);
    onOffline(handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  const handleAddExpense = () => {
    dispatch(setEditingExpense(null));
    dispatch(setShowForm(true));
  };

  const handleSaveExpense = () => {
    dispatch(resetForm());
    dispatch(fetchExpenses());
  };

  const handleCancelForm = () => {
    dispatch(resetForm());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64 mt-16 p-4 sm:p-6 lg:p-8">
          {loading && expenses.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-xl text-gray-500">Loading expenses...</div>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <SummaryCards />

              {/* Charts */}
              <ExpenseCharts />

              {/* Recent Expenses */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleAddExpense}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      + Add Expense
                    </button>
                    <select className="text-xs border border-gray-200 rounded px-2 py-1">
                      <option>Recent</option>
                    </select>
                  </div>
                </div>
                {showForm ? (
                  <ExpenseForm onSave={handleSaveExpense} onCancel={handleCancelForm} />
                ) : (
                  <ExpenseList />
                )}
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
