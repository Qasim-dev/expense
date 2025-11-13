import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { deleteIncome, setEditingIncome } from '../store/slices/incomeSlice';
import ConfirmDialog from './ui/ConfirmDialog';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';

const IncomeList = () => {
  const dispatch = useAppDispatch();
  const { records, loading } = useAppSelector((state) => state.income);
  const { formatWhole } = useCurrencyFormatter();
  const [pendingDelete, setPendingDelete] = useState(null);

  console.log(records)
  const handleDelete = (income) => {
    setPendingDelete(income);
  };

  if (!records.length) {
    return (
      <div className="text-center py-12 text-slate-500">
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2v8h6v-8c0-1.105-1.343-2-3-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10h14M8 21h8" />
        </svg>
        <p className="mt-4 text-sm">No income entries yet. Log your first earning to track inflows.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((income) => (
        <div
          key={income._id}
          className="flex flex-wrap items-center justify-between gap-4 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4 bg-white dark:bg-slate-800/80 hover:shadow-md transition-shadow"
        >
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{income.title}</p>
            <p className="text-xs text-slate-500">
              {income.source || 'General'} | {income.date ? new Date(income.date).toLocaleDateString() : 'Today'}
            </p>
            {income.notes && <p className="text-xs text-slate-400 max-w-md">{income.notes}</p>}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-lg font-semibold text-emerald-600">{formatWhole(income.amount || 0)}</p>
              {income.mode && <p className="text-xs text-slate-400">{income.mode}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(setEditingIncome(income))}
                className="px-3 py-1 rounded-full text-xs font-medium border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(income)}
                className="px-3 py-1 rounded-full text-xs font-medium border border-transparent text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                disabled={loading}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (pendingDelete) {
            await dispatch(deleteIncome(pendingDelete._id));
            setPendingDelete(null);
          }
        }}
        loading={loading}
        title="Delete income entry?"
        message={`This will remove "${pendingDelete?.title}" from your history.`}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default IncomeList;
