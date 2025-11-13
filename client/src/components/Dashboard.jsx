import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchExpenses,
  setShowForm,
  setEditingExpense,
  resetForm,
} from '../store/slices/expenseSlice';
import { fetchGoals } from '../store/slices/goalSlice';
import { fetchInvestments } from '../store/slices/investmentSlice';
import { fetchBills } from '../store/slices/billSlice';
import { fetchIncome } from '../store/slices/incomeSlice';
import Header from './layout/Header';
import Sidebar from './layout/Sidebar';
import SummaryCards from './dashboard/SummaryCards';
import ExpenseCharts from './dashboard/ExpenseCharts';
import ExpenseList from './ExpenseList';
import ExpenseForm from './ExpenseForm';
import HighlightBanner from './dashboard/HighlightBanner';
import QuickActions from './dashboard/QuickActions';
import FinancialPulse from './dashboard/FinancialPulse';
import SmartFeed from './dashboard/SmartFeed';
import UpcomingBills from './dashboard/UpcomingBills';
import Modal from './ui/Modal';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { expenses, loading, error, showForm } = useAppSelector((state) => state.expenses);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  useEffect(() => {
    dispatch(fetchExpenses());
    dispatch(fetchGoals());
    dispatch(fetchInvestments());
    dispatch(fetchBills());
    dispatch(fetchIncome());
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

  const handleGoToGoals = () => navigate('/goals');
  const handleGoToBills = () => navigate('/bills');
  const handleLogIncome = () => navigate('/income');

  return (
    <div className="min-h-screen ">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64 mt-5 px-4 sm:px-6 lg:px-8 pb-8">
          {loading && expenses.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-xl text-gray-500">Loading expenses...</div>
            </div>
          ) : (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="space-y-6">
                <HighlightBanner onAddExpense={handleAddExpense} />

                <QuickActions
                  onLogExpense={handleAddExpense}
                  onLogIncome={handleLogIncome}
                  onAddGoal={handleGoToGoals}
                  onSplitBill={handleGoToBills}
                />

                {/* Summary Cards */}
                <SummaryCards />

                <FinancialPulse />

                {/* Charts */}
                <ExpenseCharts />
              </div>

              {/* Recent Expenses + Side rail */}
              <div className="grid gap-6 lg:grid-cols-3 mt-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Recent expenses</p>
                        <h3 className="text-xl font-semibold text-slate-900">Ledger & activity</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-2 rounded-full text-xs font-medium border border-slate-200 text-slate-500">
                          Filter
                        </button>
                        <button className="px-3 py-2 rounded-full text-xs font-medium border border-slate-200 text-slate-500">
                          Export
                        </button>
                        <button
                          onClick={handleAddExpense}
                          className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-full shadow-sm hover:bg-indigo-700 transition-colors"
                        >
                          + Add Expense
                        </button>
                      </div>
                    </div>
                <ExpenseList />
              </div>
            </div>
            <div className="space-y-6">
              <UpcomingBills />
              <SmartFeed />
            </div>
          </div>

          <Modal
            open={showForm}
            onClose={handleCancelForm}
            title={showForm ? 'Add / Edit Expense' : ''}
            subtitle="Log transactions and keep your ledger up to date."
            footer={null}
          >
            <ExpenseForm onSave={handleSaveExpense} onCancel={handleCancelForm} />
          </Modal>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
