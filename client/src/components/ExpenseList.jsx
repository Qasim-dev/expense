import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { deleteExpense, setEditingExpense } from '../store/slices/expenseSlice';
import ConfirmDialog from './ui/ConfirmDialog';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';

const categoryStyles = {
  Food: 'bg-amber-50 text-amber-600',
  Transport: 'bg-sky-50 text-sky-600',
  Shopping: 'bg-fuchsia-50 text-fuchsia-600',
  Bills: 'bg-rose-50 text-rose-600',
  Entertainment: 'bg-emerald-50 text-emerald-600',
  Healthcare: 'bg-pink-50 text-pink-600',
  Education: 'bg-indigo-50 text-indigo-600',
  Other: 'bg-slate-50 text-slate-600',
};

const ExpenseList = ({ data, emptyMessage }) => {
  const dispatch = useAppDispatch();
  const { expenses, loading } = useAppSelector((state) => state.expenses);
  const [pendingDelete, setPendingDelete] = useState(null);
  const { formatWhole } = useCurrencyFormatter();

  const handleEdit = (expense) => {
    dispatch(setEditingExpense(expense));
  };

  const handleDelete = (expense) => {
    setPendingDelete(expense);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const list = data ?? expenses;
  const message =
    emptyMessage ||
    (data
      ? 'No expenses match your filters yet.'
      : 'No expenses found. Add your first expense to get started!');

  if (list.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-4 text-sm">{message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {list.map((expense) => {
        const categoryClass = categoryStyles[expense.category] || categoryStyles.Other;
        return (
          <div
            key={expense._id}
            className="flex flex-wrap items-center justify-between gap-4 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-semibold ${categoryClass}`}>
                {expense.title?.charAt(0)?.toUpperCase() || 'R'}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{expense.title}</p>
                <p className="text-xs text-slate-500">
                  {expense.category} | {formatDate(expense.date)}
                </p>
                <p className="text-xs text-slate-400 max-w-xs">{expense.description || 'No description provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <div className="text-right">
                <p className="text-lg font-semibold text-slate-900">{formatWhole(expense.amount)}</p>
                {expense.mode && <p className="text-xs text-slate-400">{expense.mode}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(expense)}
                  className="px-3 py-1 rounded-full text-xs font-medium border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(expense)}
                  disabled={loading}
                  className="px-3 py-1 rounded-full text-xs font-medium border border-transparent text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (pendingDelete) {
            await dispatch(deleteExpense(pendingDelete._id));
            setPendingDelete(null);
          }
        }}
        loading={loading}
        title="Delete expense?"
        message={`This will permanently remove "${pendingDelete?.title}".`}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default ExpenseList;
