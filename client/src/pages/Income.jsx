import React, { useEffect, useMemo } from 'react';
import PageShell from '../components/layout/PageShell';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchIncome, resetIncomeForm, setIncomeFormVisible } from '../store/slices/incomeSlice';
import IncomeForm from '../components/IncomeForm';
import IncomeList from '../components/IncomeList';
import Modal from '../components/ui/Modal';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';

const Income = () => {
  const dispatch = useAppDispatch();
  const { records, showForm, loading } = useAppSelector((state) => state.income);
  const { formatWhole } = useCurrencyFormatter();

  useEffect(() => {
    dispatch(fetchIncome());
  }, [dispatch]);

  const totals = useMemo(() => {
    const total = records.reduce((sum, record) => sum + (record.amount || 0), 0);
    const thisMonth = records.reduce((sum, record) => {
      if (!record.date) return sum;
      const date = new Date(record.date);
      const now = new Date();
      if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
        return sum + (record.amount || 0);
      }
      return sum;
    }, 0);
    return { total, thisMonth };
  }, [records]);

  const handleClose = () => {
    dispatch(resetIncomeForm());
  };

  return (
    <PageShell
      title="Income"
      description="Log your earnings to track net cash flow alongside expenses."
      badge="New"
      actions={
        <button
          onClick={() => dispatch(setIncomeFormVisible(true))}
          className="px-4 py-2 rounded-2xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
        >
          + Log income
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/60">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total income</p>
          <p className="text-3xl font-semibold mt-2">{formatWhole(totals.total)}</p>
          <p className="text-xs text-slate-500 mt-1">{records.length} entries recorded</p>
        </div>
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/60">
          <p className="text-xs uppercase tracking-wide text-slate-500">This month</p>
          <p className="text-3xl font-semibold mt-2">{formatWhole(totals.thisMonth)}</p>
          <p className="text-xs text-slate-500 mt-1">Refreshed automatically</p>
        </div>
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/60">
          <p className="text-xs uppercase tracking-wide text-slate-500">Average ticket</p>
          <p className="text-3xl font-semibold mt-2">
            {formatWhole(records.length ? totals.total / records.length : 0)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Per payout</p>
        </div>
      </div>

      <section className="mt-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Ledger</p>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">All income</h3>
          </div>
          <button
            onClick={() => dispatch(setIncomeFormVisible(true))}
            className="text-xs font-semibold px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700"
          >
            Add entry
          </button>
        </div>
        <IncomeList />
      </section>

      <Modal
        open={showForm}
        onClose={handleClose}
        title={showForm ? 'Log income' : ''}
        subtitle="Track all inflows to understand savings capacity."
        footer={null}
      >
        <IncomeForm
          onSave={() => {
            handleClose();
            dispatch(fetchIncome());
          }}
          onCancel={handleClose}
        />
      </Modal>

      {loading && (
        <div className="fixed bottom-6 right-6 px-4 py-2 rounded-full bg-white shadow-lg border border-slate-100 text-xs">
          Syncing income...
        </div>
      )}
    </PageShell>
  );
};

export default Income;
