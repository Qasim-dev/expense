import React, { useState } from 'react';
import PageShell from '../components/layout/PageShell';

const Support = () => {
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Support request submitted! We will get back to you soon.');
    setFormData({ email: '', subject: '', message: '' });
  };

  return (
    <PageShell
      title="Support"
      badge="We're here"
      description="Open a ticket and the team will respond within one business day."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm backdrop-blur">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Reach out</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field mt-2"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Subject *</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="input-field mt-2"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Message *</label>
              <textarea
                rows="6"
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="input-field mt-2 resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white px-4 py-3 rounded-2xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
            >
              Send message
            </button>
          </form>
        </div>
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm backdrop-blur">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Status</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-2">Average response: 3h</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Live chat in beta</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default Support;
