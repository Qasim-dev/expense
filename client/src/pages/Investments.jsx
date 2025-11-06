import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchInvestments, createInvestment, updateInvestment, deleteInvestment, setShowForm, setEditingInvestment, resetForm } from '../store/slices/investmentSlice';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

const Investments = () => {
  const dispatch = useAppDispatch();
  const { investments, loading, error, showForm, editingInvestment } = useAppSelector((state) => state.investments);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Stocks',
    amount: '',
    currentValue: '',
    purchaseDate: '',
    description: '',
  });

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
        purchaseDate: editingInvestment.purchaseDate ? new Date(editingInvestment.purchaseDate).toISOString().split('T')[0] : '',
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
    const data = {
      ...formData,
      amount: parseFloat(formData.amount),
      currentValue: parseFloat(formData.currentValue || formData.amount),
    };
    if (editingInvestment) {
      await dispatch(updateInvestment({ id: editingInvestment._id, investmentData: data }));
    } else {
      await dispatch(createInvestment(data));
    }
    dispatch(resetForm());
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      await dispatch(deleteInvestment(id));
    }
  };

  const totalValue = investments.reduce((sum, inv) => sum + (inv.currentValue || inv.amount), 0);
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const profit = totalValue - totalInvested;
  const profitPercentage = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64 mt-16 p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Investments</h1>
              {!showForm && (
                <button
                  onClick={() => dispatch(setShowForm(true))}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  + Add Investment
                </button>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Invested</h3>
              <p className="text-2xl font-bold text-gray-900">
                ₹{totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Current Value</h3>
              <p className="text-2xl font-bold text-gray-900">
                ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Profit/Loss</h3>
              <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profit >= 0 ? '+' : ''}₹{profit.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({profitPercentage.toFixed(2)}%)
              </p>
            </div>
          </div>

          {showForm && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">{editingInvestment ? 'Edit Investment' : 'Add New Investment'}</h2>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Stocks">Stocks</option>
                      <option value="Mutual Funds">Mutual Funds</option>
                      <option value="Fixed Deposit">Fixed Deposit</option>
                      <option value="Gold">Gold</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Crypto">Crypto</option>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.currentValue}
                      onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
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
                    {editingInvestment ? 'Update Investment' : 'Add Investment'}
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
            <h2 className="text-lg font-semibold mb-4">My Investments</h2>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : investments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No investments found. Add your first investment!</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invested</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit/Loss</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {investments.map((inv) => {
                      const profit = (inv.currentValue || inv.amount) - inv.amount;
                      const profitPercent = (profit / inv.amount) * 100;
                      return (
                        <tr key={inv._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{inv.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">{inv.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">₹{inv.amount.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">₹{(inv.currentValue || inv.amount).toLocaleString('en-IN')}</td>
                          <td className={`px-6 py-4 whitespace-nowrap ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {profit >= 0 ? '+' : ''}₹{profit.toLocaleString('en-IN')} ({profitPercent.toFixed(2)}%)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => dispatch(setEditingInvestment(inv))}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(inv._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Investments;

