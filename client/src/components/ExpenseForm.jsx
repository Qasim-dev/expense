import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createExpense, updateExpense, clearError } from '../store/slices/expenseSlice';
import Select from './ui/Select';

const ExpenseForm = ({ onSave, onCancel }) => {
  const dispatch = useAppDispatch();
  const { editingExpense, loading, error } = useAppSelector((state) => state.expenses);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const categories = [
    'Food',
    'Transport',
    'Shopping',
    'Bills',
    'Entertainment',
    'Healthcare',
    'Education',
    'Other',
  ];

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        title: editingExpense.title || '',
        amount: editingExpense.amount || '',
        category: editingExpense.category || '',
        date: editingExpense.date ? new Date(editingExpense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: editingExpense.description || '',
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
    }
  }, [editingExpense]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    const data = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    let result;
    if (editingExpense) {
      result = await dispatch(updateExpense({ id: editingExpense._id, expenseData: data }));
    } else {
      result = await dispatch(createExpense(data));
    }

    // Only call onSave if the action was successful (not rejected)
    if (result.type.endsWith('/fulfilled')) {
      onSave();
    }
  };

  return (
    <>
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="mt-2 block w-full px-4 py-3 border border-slate-200 rounded-2xl  focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-sm"
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Amount *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              required
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              className="mt-2 block w-full px-4 py-3 border border-slate-200 rounded-2xl  focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Category *
            </label>
            <Select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="date" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="mt-2 block w-full px-4 py-3 border border-slate-200 rounded-2xl  focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            className="mt-2 block w-full px-4 py-3 border border-slate-200 rounded-2xl  focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-sm"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-2xl font-semibold text-sm hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : editingExpense ? 'Update Expense' : 'Add Expense'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1  text-slate-700 px-4 py-3 rounded-2xl font-semibold text-sm border border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </>
  );
};

export default ExpenseForm;

