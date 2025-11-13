import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchInvestments,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  setShowForm,
  setEditingInvestment,
  resetForm,
} from '../store/slices/investmentSlice';
import PageShell from '../components/layout/PageShell';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Select from '../components/ui/Select';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';

const typeFilters = ['all', 'Stocks', 'Mutual Funds', 'Fixed Deposit', 'Gold', 'Real Estate', 'Crypto', 'Other'];

const Investments = () => {
  const dispatch = useAppDispatch();
  const { investments, loading, error, showForm, editingInvestment } = useAppSelector((state) => state.investments);
  const { format, formatWhole } = useCurrencyFormatter();

  const [formData, setFormData] = useState({
    name: '',
    type: 'Stocks',
    amount: '',
    currentValue: '',
    purchaseDate: '',
    description: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchInvestments());
  }, [dispatch]);

  useEffect(() => {
    if (editingInvestment) {
      setFormData({
        name: editingInvestment.name || '',
        type: editingInvestment.type || 'Stocks',
        amount: editingInvestment.amount || '',
        currentValue: editingInvestment.currentValue || editingInvestment.amount || '',
        purchaseDate: editingInvestment.purchaseDate
          ? new Date(editingInvestment.purchaseDate).toISOString().split('T')[0]
          : '',
        description: editingInvestment.description || '',
      });
    } else {
      setFormData({
        name: '',
        type: 'Stocks',
        amount: '',
        currentValue: '',
        purchaseDate: '',
        description: '',
      });
    }
  }, [editingInvestment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      amount: Number(formData.amount),
      currentValue: Number(formData.currentValue || formData.amount),
    };
    if (editingInvestment) {
      await dispatch(updateInvestment({ id: editingInvestment._id, investmentData: payload }));
    } else {
      await dispatch(createInvestment(payload));
    }
    dispatch(resetForm());
  };

  const handleDelete = (investment) => {
    setPendingDelete(investment);
  };

  const filteredInvestments = useMemo(() => {
    return investments.filter((inv) => {
      const matchesSearch =
        inv.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.type?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || inv.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [investments, searchTerm, typeFilter]);

  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const totalValue = investments.reduce((sum, inv) => sum + Number(inv.currentValue || inv.amount || 0), 0);
  const profit = totalValue - totalInvested;
  const profitPercentage = totalInvested ? (profit / totalInvested) * 100 : 0;

  const allocation = useMemo(() => {
    const map = filteredInvestments.reduce((acc, inv) => {
      acc[inv.type] = (acc[inv.type] || 0) + Number(inv.currentValue || inv.amount || 0);
      return acc;
    }, {});
    const total = Object.values(map).reduce((sum, val) => sum + val, 0);
    return Object.entries(map).map(([type, value]) => ({
      type,
      value,
      pct: total ? Math.round((value / total) * 100) : 0,
    }));
  }, [filteredInvestments]);

  const bestPerformer = useMemo(() => {
    if (!investments.length) return null;
    return [...investments].sort((a, b) => {
      const profitA = Number(a.currentValue || a.amount) - Number(a.amount || 0);
      const profitB = Number(b.currentValue || b.amount) - Number(b.amount || 0);
      return profitB - profitA;
    })[0];
  }, [investments]);

  const toolbar = (
    <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 backdrop-blur shadow-sm space-y-3 p-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M9 17a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search holdings or instruments"
            className="input-field pl-10 pr-4 bg-white/90 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {typeFilters.map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              typeFilter === type
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'border-slate-200 text-slate-600 dark:text-slate-300 hover:border-indigo-200 dark:border-slate-700'
            }`}
          >
            {type === 'all' ? 'All types' : type}
          </button>
        ))}
      </div>
    </div>
  );

  const summaryCards = [
    {
      label: 'Total invested',
      value: format(totalInvested),
      helper: `${investments.length} holdings`,
    },
    {
      label: 'Current value',
      value: format(totalValue),
      helper: profit >= 0 ? '+ gain' : '- loss',
    },
    {
      label: 'Net P&L',
      value: `${profit >= 0 ? '+' : '-'}${format(Math.abs(profit))}`,
      helper: `${profitPercentage.toFixed(2)}%`,
    },
  ];

  return (
    <PageShell
      title="Investments"
      badge="Wealth"
      description="Track every holding, measure returns, and keep your allocation in check."
      actions={
        !showForm && (
          <button
            onClick={() => dispatch(setShowForm(true))}
            className="px-5 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-2xl shadow-sm hover:bg-indigo-700 transition-colors"
          >
            + Add Investment
          </button>
        )
      }
      toolbar={toolbar}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm backdrop-blur"
          >
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-2">{card.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{card.helper}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Holdings</p>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Portfolio list</h2>
              </div>
              <span className="text-xs text-slate-400">{filteredInvestments.length} items</span>
            </div>
            <div className="space-y-4">
              {filteredInvestments.map((inv) => {
                const current = Number(inv.currentValue || inv.amount || 0);
                const invested = Number(inv.amount || 0);
                const pnl = current - invested;
                const pnlPct = invested ? (pnl / invested) * 100 : 0;
                return (
                    <div
                      key={inv._id}
                      className="flex flex-wrap items-center justify-between gap-4 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 bg-slate-50/60 dark:bg-slate-900/50"
                    >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{inv.name}</p>
                      <p className="text-xs text-slate-500">
                        {inv.type} | Bought {inv.purchaseDate ? new Date(inv.purchaseDate).toLocaleDateString('en-IN') : '—'}
                      </p>
                    </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {formatWhole(current)}
                    </p>
                    <p className={`text-xs font-semibold ${pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {pnl >= 0 ? '+' : '-'}
                      {formatWhole(Math.abs(pnl))} ({pnlPct.toFixed(2)}%)
                    </p>
                  </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => dispatch(setEditingInvestment(inv))}
                        className="px-3 py-1 rounded-full text-xs font-medium border border-slate-200 text-slate-600 hover:border-indigo-200"
                      >
                        Edit
                      </button>
                    <button
                      onClick={() => handleDelete(inv)}
                      className="px-3 py-1 rounded-full text-xs font-medium border border-transparent text-rose-600 hover:bg-rose-50"
                    >
                      Delete
                    </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredInvestments.length === 0 && (
              <div className="text-center py-12 text-slate-500">No holdings match your filters right now.</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Best performer</p>
            {bestPerformer ? (
              <>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{bestPerformer.name}</h3>
                <p className="text-sm text-slate-500">{bestPerformer.type}</p>
                <p className="text-3xl font-semibold text-slate-900 dark:text-white mt-4">
                  {formatWhole(Number(bestPerformer.currentValue || bestPerformer.amount || 0))}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500">No investments yet.</p>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-4">Allocation</p>
            <div className="space-y-3">
              {allocation.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span className="text-sm text-slate-600">{item.type}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.pct}%</span>
                </div>
              ))}
              {allocation.length === 0 && <p className="text-xs text-slate-400">No allocation data yet.</p>}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={showForm}
        onClose={() => dispatch(resetForm())}
        title={editingInvestment ? 'Edit Holding' : 'Add Investment'}
        subtitle="Track new positions or update existing ones."
        footer={null}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field mt-2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Type *</label>
              <Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                {typeFilters
                  .filter((type) => type !== 'all')
                  .map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Amount *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input-field mt-2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Current Value</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.currentValue}
                onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                className="input-field mt-2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Purchase Date</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="input-field mt-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field mt-2 resize-none"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <button type="submit" className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-2xl font-semibold text-sm hover:bg-indigo-700 transition-colors">
              {editingInvestment ? 'Update Investment' : 'Add Investment'}
            </button>
            <button
              type="button"
              onClick={() => dispatch(resetForm())}
              className="flex-1 bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-100 px-4 py-3 rounded-2xl font-semibold text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (pendingDelete) {
            await dispatch(deleteInvestment(pendingDelete._id));
            setPendingDelete(null);
          }
        }}
        loading={loading}
        title="Delete investment?"
        message={`This will remove "${pendingDelete?.name}".`}
        confirmLabel="Delete"
      />
    </PageShell>
  );
};

export default Investments;
