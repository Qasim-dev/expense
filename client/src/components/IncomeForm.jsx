import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createIncome, updateIncome, clearIncomeError } from '../store/slices/incomeSlice';

const sources = ['Salary', 'Business', 'Investments', 'Freelance', 'Rental', 'Refunds', 'Other'];

const IncomeForm = ({ onSave, onCancel }) => {
  const dispatch = useAppDispatch();
  const { editingIncome, loading, error } = useAppSelector((state) => state.income);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    source: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    if (editingIncome) {
      setFormData({
        title: editingIncome.title || '',
        amount: editingIncome.amount || '',
        source: editingIncome.source || '',
        date: editingIncome.date
          ? new Date(editingIncome.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        notes: editingIncome.notes || '',
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        source: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [editingIncome]);

  useEffect(() => {
    dispatch(clearIncomeError());
  }, [dispatch]);

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(clearIncomeError());

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    let result;
    if (editingIncome) {
      result = await dispatch(updateIncome({ id: editingIncome._id, incomeData: payload }));
    } else {
      result = await dispatch(createIncome(payload));
    }

    if (result.type.endsWith('/fulfilled')) {
      onSave?.();
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl mb-4">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Title *</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="mt-2 block w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Amount *</label>
            <input
              type="number"
              name="amount"
              required
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              className="mt-2 block w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Source *</label>
            <select
              name="source"
              required
              value={formData.source}
              onChange={handleChange}
              className="mt-2 block w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-sm bg-white"
            >
              <option value="">Select source</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Date *</label>
            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="mt-2 block w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Notes</label>
          <textarea
            name="notes"
            rows="3"
            value={formData.notes}
            onChange={handleChange}
            className="mt-2 block w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-sm"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-2xl font-semibold text-sm hover:bg-emerald-700 focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : editingIncome ? 'Update Income' : 'Add Income'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 text-slate-700 px-4 py-3 rounded-2xl font-semibold text-sm border border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default IncomeForm;
