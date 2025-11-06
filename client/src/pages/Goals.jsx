import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchGoals, createGoal, updateGoal, deleteGoal, setShowForm, setEditingGoal, resetForm } from '../store/slices/goalSlice';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

const Goals = () => {
  const dispatch = useAppDispatch();
  const { goals, loading, error, showForm, editingGoal } = useAppSelector((state) => state.goals);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    targetDate: '',
    category: 'General',
  });

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  useEffect(() => {
    if (editingGoal) {
      setFormData({
        title: editingGoal.title || '',
        description: editingGoal.description || '',
        targetAmount: editingGoal.targetAmount || '',
        targetDate: editingGoal.targetDate ? new Date(editingGoal.targetDate).toISOString().split('T')[0] : '',
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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      await dispatch(deleteGoal(id));
    }
  };

  const progress = (goal) => {
    return Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64 mt-16 p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
              {!showForm && (
                <button
                  onClick={() => dispatch(setShowForm(true))}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  + Add Goal
                </button>
              )}
            </div>
          </div>

          {showForm && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">{editingGoal ? 'Edit Goal' : 'Add New Goal'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                    <input
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
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
                    {editingGoal ? 'Update Goal' : 'Add Goal'}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8">Loading...</div>
            ) : goals.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">No goals found. Add your first goal!</div>
            ) : (
              goals.map((goal) => (
                <div key={goal._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => dispatch(setEditingGoal(goal))}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(goal._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{goal.description}</p>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold">{progress(goal).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${progress(goal)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Saved:</span>
                      <span className="font-semibold">₹{goal.savedAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target:</span>
                      <span className="font-semibold">₹{goal.targetAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Goals;

