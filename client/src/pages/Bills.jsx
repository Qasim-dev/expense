import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchBills, createBill, updateBill, deleteBill, setShowForm, setEditingBill, resetForm } from '../store/slices/billSlice';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

const Bills = () => {
  const dispatch = useAppDispatch();
  const { bills, loading, error, showForm, editingBill } = useAppSelector((state) => state.bills);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Subscription',
    amount: '',
    dueDate: '',
    frequency: 'Monthly',
    description: '',
    icon: '',
  });

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
        icon: editingBill.icon || '',
      });
    } else {
      setFormData({
        name: '',
        category: 'Subscription',
        amount: '',
        dueDate: '',
        frequency: 'Monthly',
        description: '',
        icon: '',
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
    setFormData({
      name: '',
      category: 'Subscription',
      amount: '',
      dueDate: '',
      frequency: 'Monthly',
      description: '',
      icon: '',
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      await dispatch(deleteBill(id));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getBillIcon = (name) => {
    const icons = {
      Netflix: '🔴',
      Spotify: '🟢',
      Figma: '🟣',
      WIFI: '📶',
      Electricity: '⚡',
    };
    return icons[name] || '📄';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64 mt-16 p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Bills & Subscriptions</h1>
              {!showForm && (
                <button
                  onClick={() => dispatch(setShowForm(true))}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  + Add Bill
                </button>
              )}
            </div>
          </div>

          {showForm && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">{editingBill ? 'Edit Bill' : 'Add New Bill'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Subscription">Subscription</option>
                      <option value="Utility">Utility</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Loan">Loan</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                      <option value="One-time">One-time</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    {editingBill ? 'Update Bill' : 'Add Bill'}
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch(resetForm())}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">Upcoming Bills</h2>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : bills.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No bills found. Add your first bill!</div>
            ) : (
              <div className="space-y-4">
                {bills.map((bill) => (
                  <div
                    key={bill._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{getBillIcon(bill.name)}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{bill.name}</h3>
                        <p className="text-sm text-gray-500">{formatDate(bill.dueDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-semibold text-gray-900">
                        ₹{bill.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <button
                        onClick={() => dispatch(setEditingBill(bill))}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(bill._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Bills;

