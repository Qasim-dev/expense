import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchExpenses, setShowForm, setEditingExpense, resetForm } from '../store/slices/expenseSlice';
import ExpenseList from '../components/ExpenseList';
import ExpenseForm from '../components/ExpenseForm';
import PageShell from '../components/layout/PageShell';
import Modal from '../components/ui/Modal';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';

const rangePresets = [
  { id: 'all', label: 'All time' },
  { id: '7', label: 'Last 7 days' },
  { id: '30', label: '30 days' },
  { id: '90', label: 'Quarter' },
];

const AllExpenses = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { expenses, loading, error, showForm } = useAppSelector((state) => state.expenses);
  const { format, formatWhole } = useCurrencyFormatter();

  const initialSearch = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rangeFilter, setRangeFilter] = useState('30');

  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch]);

  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  const uniqueCategories = useMemo(() => {
    const categories = Array.from(new Set(expenses.map((exp) => exp.category))).filter(Boolean);
    return ['all', ...categories];
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter((expense) => {
      const matchesSearch =
        expense.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;

      const matchesRange =
        rangeFilter === 'all' ||
        (expense.date &&
          now - new Date(expense.date) <= Number(rangeFilter) * 24 * 60 * 60 * 1000);

      return matchesSearch && matchesCategory && matchesRange;
    });
  }, [expenses, searchTerm, categoryFilter, rangeFilter]);

  const totalSpent = useMemo(
    () => filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [filteredExpenses]
  );

  const averageTicket = filteredExpenses.length ? totalSpent / filteredExpenses.length : 0;

  const topCategory = useMemo(() => {
    const map = filteredExpenses.reduce((acc, expense) => {
      if (!expense.category) return acc;
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});
    return Object.entries(map).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
  }, [filteredExpenses]);

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

  const handleSearchUpdate = (value) => {
    setSearchTerm(value);
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    setSearchParams(params, { replace: true });
  };

  const toolbar = (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-4 shadow-sm space-y-3">
      <div className="flex flex-wrap gap-3 items-center">
        <label className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2 flex-1 min-w-[200px] max-w-xl">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M9 17a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchUpdate(e.target.value)}
            placeholder="Search title, notes, merchant"
            className="ml-3 flex-1 bg-transparent text-sm text-slate-600 dark:text-slate-200 outline-none"
          />
        </label>
        <div className="flex gap-2">
          {rangePresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setRangeFilter(preset.id)}
              className={`px-3 py-2 rounded-2xl text-xs font-medium border ${
                rangeFilter === preset.id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-slate-200 text-slate-500 hover:border-indigo-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {uniqueCategories.map((category) => (
          <button
            key={category}
            onClick={() => setCategoryFilter(category)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
              categoryFilter === category
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                : 'border-slate-200 text-slate-500 hover:border-emerald-200'
            }`}
          >
            {category === 'all' ? 'All categories' : category}
          </button>
        ))}
      </div>
    </div>
  );

  const stats = [
    {
      label: 'Total spent',
      value: format(totalSpent),
      helper: rangeFilter === 'all' ? 'Lifetime' : `Last ${rangeFilter} days`,
    },
    {
      label: 'Average ticket',
      value: formatWhole(averageTicket),
      helper: `${filteredExpenses.length} expenses`,
    },
    {
      label: 'Top category',
      value: topCategory,
      helper: 'Based on filtered view',
    },
  ];

  return (
    <PageShell
      title="All Expenses"
      badge="Ledger"
      description="Drill into every transaction, filter by time or category, and keep your spending organized."
      actions={
        !showForm && (
          <button
            onClick={handleAddExpense}
            className="px-5 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-2xl shadow-sm hover:bg-indigo-700 transition-colors"
          >
            + Add Expense
          </button>
        )
      }
      toolbar={toolbar}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-semibold text-slate-900 mt-2">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.helper}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
        {loading && expenses.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-slate-400">Loading expenses...</div>
          </div>
        ) : (
          <ExpenseList
            data={filteredExpenses}
            emptyMessage={
              expenses.length > 0
                ? 'No expenses match your filters yet.'
                : 'No expenses found. Add your first expense to get started!'
            }
          />
        )}
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
    </PageShell>
  );
};

export default AllExpenses;
