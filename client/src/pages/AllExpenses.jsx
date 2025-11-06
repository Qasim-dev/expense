import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchExpenses, setShowForm, setEditingExpense, resetForm } from '../store/slices/expenseSlice';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import ExpenseList from '../components/ExpenseList';
import ExpenseForm from '../components/ExpenseForm';

const AllExpenses = () => {
  const dispatch = useAppDispatch();
  const { expenses, loading, error, showForm } = useAppSelector((state) => state.expenses);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  useEffect(() => {
    dispatch(fetchExpenses());
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
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">All Expenses</h1>
              {!showForm && (
                <button
                  onClick={handleAddExpense}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  + Add Expense
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading && expenses.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-xl text-gray-500">Loading expenses...</div>
            </div>
          ) : showForm ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <ExpenseForm onSave={handleSaveExpense} onCancel={handleCancelForm} />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <ExpenseList />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AllExpenses;

