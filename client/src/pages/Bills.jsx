import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchBills,
  createBill,
  updateBill,
  deleteBill,
  setShowForm,
  setEditingBill,
  resetForm,
} from '../store/slices/billSlice';
import PageShell from '../components/layout/PageShell';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Select from '../components/ui/Select';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';

const statusFilters = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'dueSoon', label: 'Due soon' },
  { id: 'overdue', label: 'Overdue' },
];

const Bills = () => {
  const dispatch = useAppDispatch();
  const { bills, loading, error, showForm, editingBill } = useAppSelector((state) => state.bills);
  const { format, formatWhole } = useCurrencyFormatter();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Subscription',
    amount: '',
    dueDate: '',
    frequency: 'Monthly',
    description: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [autopayPreferences, setAutopayPreferences] = useState({});
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchBills());
  }, [dispatch]);

  useEffect(() => {
    if (editingBill) {
      setFormData({
        name: editingBill.name || '',
        category: editingBill.category || 'Subscription',
        amount: editingBill.amount || '',
        dueDate: editingBill.dueDate ? new Date(editingBill.dueDate).toISOString().split('T')[0] : '',
        frequency: editingBill.frequency || 'Monthly',
        description: editingBill.description || '',
      });
    } else {
      setFormData({
        name: '',
        category: 'Subscription',
        amount: '',
        dueDate: '',
        frequency: 'Monthly',
        description: '',
      });
    }
  }, [editingBill]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingBill) {
      await dispatch(updateBill({ id: editingBill._id, billData: formData }));
    } else {
      await dispatch(createBill(formData));
    }
    dispatch(resetForm());
  };

  const handleDelete = (bill) => {
    setPendingDelete(bill);
  };

  const determineStatus = (bill) => {
    if (!bill.dueDate) return 'upcoming';
    const dueDate = new Date(bill.dueDate);
    const now = new Date();
    const diff = dueDate - now;
    if (diff < 0) return 'overdue';
    if (diff <= 7 * 24 * 60 * 60 * 1000) return 'dueSoon';
    return 'upcoming';
  };

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const matchesSearch =
        bill.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const status = determineStatus(bill);
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bills, searchTerm, statusFilter]);

  const summary = useMemo(() => {
    const totalDue = bills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    const dueSoon = bills.filter((bill) => determineStatus(bill) === 'dueSoon').length;
    const recurring = bills.filter((bill) => bill.frequency && bill.frequency !== 'One-time').length;
    return { totalDue, dueSoon, recurring };
  }, [bills]);

  const nextBill = useMemo(() => {
    return [...bills]
      .filter((bill) => bill.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
  }, [bills]);

  const handleAutopayToggle = (billId) => {
    setAutopayPreferences((prev) => ({
      ...prev,
      [billId]: !prev[billId],
    }));
  };

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
            placeholder="Search bills or categories"
            className="input-field pl-10 pr-4 bg-white/90 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setStatusFilter(filter.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              statusFilter === filter.id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'border-slate-200 text-slate-600 dark:text-slate-300 hover:border-indigo-200 dark:border-slate-700'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );

  const summaryCards = [
    {
      label: 'Total scheduled',
      value: format(summary.totalDue),
      helper: 'All upcoming dues',
    },
    {
      label: 'Due this week',
      value: summary.dueSoon,
      helper: 'Need attention',
    },
    {
      label: 'Recurring autopays',
      value: summary.recurring,
      helper: 'Monthly & yearly',
    },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'Flexible';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <PageShell
      title="Bills & Subscriptions"
      badge="Cashflow"
      description="Keep an eye on utilities, media, insurance, and every subscription. Autopay smarter and never miss a due date."
      actions={
        !showForm && (
          <button
            onClick={() => dispatch(setShowForm(true))}
            className="px-5 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-2xl shadow-sm hover:bg-indigo-700 transition-colors"
          >
            + Add Bill
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
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/30 text-rose-600 dark:text-rose-100 px-4 py-3 rounded-2xl">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Active bills</p>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Payment queue</h2>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500">{filteredBills.length} items</span>
            </div>

            <div className="space-y-4">
              {filteredBills.map((bill) => (
                    <div
                      key={bill._id}
                      className="flex flex-wrap items-center justify-between gap-4 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 bg-slate-50/60 dark:bg-slate-900/50"
                    >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{bill.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {bill.category} | {bill.frequency}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {formatWhole(bill.amount || 0)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Due {formatDate(bill.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => dispatch(setEditingBill(bill))}
                      className="px-3 py-1 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:border-indigo-200 dark:hover:border-indigo-500/40"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(bill)}
                      className="px-3 py-1 rounded-full text-xs font-medium border border-transparent text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {filteredBills.length === 0 && (
              <div className="text-center py-12 text-slate-500">No bills match your filters right now.</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-slate-500">Next charge</p>
            {nextBill ? (
              <>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{nextBill.name}</h3>
                <p className="text-sm text-slate-500">
                  {formatDate(nextBill.dueDate)} • {nextBill.frequency}
                </p>
                <p className="text-3xl font-semibold text-slate-900 dark:text-white mt-4">
                  {formatWhole(nextBill.amount || 0)}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500">No scheduled payments yet.</p>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-4">Autopay controls</p>
            <div className="space-y-3">
              {bills.slice(0, 5).map((bill) => {
                const enabled =
                  autopayPreferences[bill._id] ?? (bill.frequency && bill.frequency !== 'One-time');
                return (
                  <div
                    key={bill._id}
                    className="flex items-center justify-between border border-slate-100 dark:border-slate-700 rounded-2xl px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{bill.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{bill.frequency}</p>
                    </div>
                    <button
                      onClick={() => handleAutopayToggle(bill._id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        enabled
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/30'
                          : 'border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {enabled ? 'Autopay ON' : 'Enable'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={showForm}
        onClose={() => dispatch(resetForm())}
        title={editingBill ? 'Edit bill' : 'Add bill'}
        subtitle="Manage your recurring payments effortlessly."
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
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Category *</label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Subscription">Subscription</option>
                <option value="Utility">Utility</option>
                <option value="Insurance">Insurance</option>
                <option value="Loan">Loan</option>
                <option value="Other">Other</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Amount *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input-field mt-2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Due date *</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="input-field mt-2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Frequency</label>
              <Select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
                <option value="One-time">One-time</option>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="input-field mt-2 resize-none"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <button type="submit" className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-2xl font-semibold text-sm hover:bg-indigo-700 transition-colors">
              {editingBill ? 'Update Bill' : 'Add Bill'}
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
            await dispatch(deleteBill(pendingDelete._id));
            setPendingDelete(null);
          }
        }}
        loading={loading}
        title="Delete bill?"
        message={`This will remove "${pendingDelete?.name}".`}
        confirmLabel="Delete"
      />
    </PageShell>
  );
};

export default Bills;
