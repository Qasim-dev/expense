import React, { useState } from 'react';
import { useAppSelector } from '../store/hooks';
import PageShell from '../components/layout/PageShell';

const Settings = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <PageShell
      title="Settings"
      badge="Workspace"
      description="Update your profile, tweak notifications, and keep your account secure."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm backdrop-blur">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Name</label>
              <input
                type="text"
                value={user?.name || ''}
                readOnly
                className="input-field mt-2 bg-slate-50 dark:bg-slate-950/40 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="input-field mt-2 bg-slate-50 dark:bg-slate-950/40 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm backdrop-blur">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between border border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-3 rounded-2xl">
              <div>
                <p className="text-sm font-semibold text-slate-900">Email alerts</p>
                <p className="text-xs text-slate-500">Get monthly summaries and reminders</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-5 h-5 accent-indigo-600"
              />
            </div>
            <div className="flex items-center justify-between border border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-3 rounded-2xl">
              <div>
                <p className="text-sm font-semibold text-slate-900">Push notifications</p>
                <p className="text-xs text-slate-500">Due bills and goal milestones</p>
              </div>
              <input
                type="checkbox"
                checked={pushAlerts}
                onChange={(e) => setPushAlerts(e.target.checked)}
                className="w-5 h-5 accent-indigo-600"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm backdrop-blur">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Security</h2>
        <div className="flex items-center justify-between border border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-3 rounded-2xl">
          <div>
            <p className="text-sm font-semibold text-slate-900">Two-factor authentication</p>
            <p className="text-xs text-slate-500">Add an extra layer using OTP</p>
          </div>
          <input
            type="checkbox"
            checked={twoFactor}
            onChange={(e) => setTwoFactor(e.target.checked)}
            className="w-5 h-5 accent-indigo-600"
          />
        </div>
      </div>
    </PageShell>
  );
};

export default Settings;
