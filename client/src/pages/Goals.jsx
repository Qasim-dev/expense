import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  setShowForm,
  setEditingGoal,
  resetForm,
} from '../store/slices/goalSlice';
import PageShell from '../components/layout/PageShell';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Select from '../components/ui/Select';
import { useCurrencyFormatter } from '../hooks/useCurrencyFormatter';

const statusFilters = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
];

const Goals = () => {
  const dispatch = useAppDispatch();
  const { goals, loading, error, showForm, editingGoal } = useAppSelector((state) => state.goals);
  const { format, formatWhole } = useCurrencyFormatter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    targetDate: '',
    category: 'General',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  useEffect(() => {
    if (editingGoal) {
      setFormData({
        title: editingGoal.title || '',
        description: editingGoal.description || '',
        targetAmount: editingGoal.targetAmount || '',
        targetDate: editingGoal.targetDate
          ? new Date(editingGoal.targetDate).toISOString().split('T')[0]
          : '',
        category: editingGoal.category || 'General',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        targetAmount: '',
        targetDate: '',
        category: 'General',
      });
    }
  }, [editingGoal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingGoal) {
      await dispatch(updateGoal({ id: editingGoal._id, goalData: formData }));
    } else {
      await dispatch(createGoal(formData));
    }
    dispatch(resetForm());
  };

  const handleDelete = (goal) => {
    setPendingDelete(goal);
  };

  const progress = (goal) => {
    const saved = goal.savedAmount || 0;
    const target = goal.targetAmount || 0;
    if (!target) return 0;
    return Math.min(Math.round((saved / target) * 100), 100);
  };

  const deriveStatus = (goal) => {
    if (goal.status) return goal.status;
    return progress(goal) >= 100 ? 'completed' : 'active';
  };

  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      const matchesSearch =
        goal.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || deriveStatus(goal) === statusFilter;
      const matchesCategory = categoryFilter === 'all' || goal.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [goals, searchTerm, statusFilter, categoryFilter]);

  const summary = useMemo(() => {
    const active = goals.filter((goal) => deriveStatus(goal) === 'active');
    const completed = goals.filter((goal) => deriveStatus(goal) === 'completed');
    const saved = goals.reduce((sum, goal) => sum + Number(goal.savedAmount || 0), 0);
    const target = goals.reduce((sum, goal) => sum + Number(goal.targetAmount || 0), 0);
    return { active: active.length, completed: completed.length, saved, target };
  }, [goals]);

  const uniqueCategories = useMemo(() => {
    const categories = Array.from(new Set(goals.map((goal) => goal.category))).filter(Boolean);
    return ['all', ...categories];
  }, [goals]);

  const toolbar = (
    <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 backdrop-blur p-4 shadow-sm space-y-3">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M9 17a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search goals, notes, or categories"
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
      <div className="flex flex-wrap gap-2">
        {uniqueCategories.map((category) => (
          <button
            key={category}
            onClick={() => setCategoryFilter(category)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              categoryFilter === category
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/30'
                : 'border-slate-200 text-slate-600 dark:text-slate-300 hover:border-emerald-200 dark:border-slate-700'
            }`}
          >
            {category === 'all' ? 'All categories' : category}
          </button>
        ))}
      </div>
    </div>
  );

  const summaryCards = [
    {
      label: 'Active goals',
      value: summary.active,
      helper: `${summary.completed} completed`,
    },
    {
      label: 'Saved so far',
      value: format(summary.saved),
      helper: 'Across all goals',
    },
    {
      label: 'Total target',
      value: format(summary.target),
      helper: 'Planned corpus',
    },
  ];

  return (
    <PageShell
      title="Goals"
      badge="Planning"
      description="Map every saving mission—from vacations to emergency funds—and keep progress visible."
      actions={
        !showForm && (
          <button
            onClick={() => dispatch(setShowForm(true))}
            className="px-5 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-2xl shadow-sm hover:bg-indigo-700 transition-colors"
          >
            + Add Goal
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
                <p className="text-xs uppercase tracking-wide text-slate-500">Goal board</p>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Progress tracker</h2>
              </div>
              <span className="text-xs text-slate-400">{filteredGoals.length} goals</span>
            </div>
            <div className="grid gap-4">
              {filteredGoals.map((goal) => (
                <div key={goal._id} className="border border-slate-100 dark:border-slate-700 rounded-2xl p-4 bg-slate-50/60 dark:bg-slate-900/40">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{goal.title}</p>
                      <p className="text-xs text-slate-500">
                        {goal.category} | Target {formatWhole(goal.targetAmount || 0)}
                      </p>
                    </div>
                    <div className="text-xs px-3 py-1 rounded-full border border-slate-200 text-slate-500">
                      {deriveStatus(goal)}
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>{formatWhole(goal.savedAmount || 0)} saved</span>
                      <span>{progress(goal)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full"
                        style={{ width: `${progress(goal)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <button
                      onClick={() => dispatch(setEditingGoal(goal))}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(goal)}
                      className="text-rose-600 hover:text-rose-800 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {filteredGoals.length === 0 && (
              <div className="text-center py-12 text-slate-500">No goals match your filters right now.</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-slate-500">Momentum</p>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Focus tip</h3>
            <p className="text-sm text-slate-500 mt-2">
              Pin two priority goals and contribute weekly to stay on track.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              {goals.slice(0, 2).map((goal) => (
                <div key={goal._id} className="flex items-center justify-between border border-slate-100 rounded-2xl px-3 py-2">
                  <span className="text-slate-600">{goal.title}</span>
                  <span className="text-slate-900 dark:text-slate-100 font-semibold">{progress(goal)}%</span>
                </div>
              ))}
              {goals.length === 0 && <p className="text-xs text-slate-400">No goals yet.</p>}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={showForm}
        onClose={() => dispatch(resetForm())}
        title={editingGoal ? 'Edit Goal' : 'Add Goal'}
        subtitle="Define what you’re saving for and track progress."
        footer={null}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field mt-2"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Target amount *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                className="input-field mt-2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Target date</label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="input-field mt-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Category</label>
            <Select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
              <option value="General">General</option>
              <option value="Travel">Travel</option>
              <option value="Emergency">Emergency</option>
              <option value="Education">Education</option>
              <option value="Lifestyle">Lifestyle</option>
            </Select>
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
              {editingGoal ? 'Update Goal' : 'Create Goal'}
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
            await dispatch(deleteGoal(pendingDelete._id));
            setPendingDelete(null);
          }
        }}
        loading={loading}
        title="Delete goal?"
        message={`This will remove "${pendingDelete?.title}".`}
        confirmLabel="Delete"
      />
    </PageShell>
  );
};

export default Goals;
