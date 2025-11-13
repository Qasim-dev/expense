import React, { useMemo } from 'react';
import { useAppSelector } from '../../store/hooks';
import { useCurrencyFormatter } from '../../hooks/useCurrencyFormatter';

const UpcomingBills = () => {
  const bills = useAppSelector((state) => state.bills?.bills || []);
  const { formatWhole } = useCurrencyFormatter();

  const upcoming = useMemo(() => {
    return [...bills]
      .filter((bill) => bill.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 4);
  }, [bills]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Bill & Subscription</p>
          <h3 className="text-lg font-semibold text-slate-900">Upcoming payments</h3>
        </div>
        <span className="text-xs text-slate-400">{bills.length} total</span>
      </div>
      {upcoming.length === 0 ? (
        <p className="text-sm text-slate-500">No upcoming bills. Add one to stay reminded.</p>
      ) : (
        <div className="space-y-3">
          {upcoming.map((bill) => (
            <div
              key={bill._id}
              className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-surface-card/80"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{bill.name || bill.title || 'Subscription'}</p>
                <p className="text-xs text-slate-500">
                  Due {new Date(bill.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{formatWhole(bill.amount || 0)}</p>
                <p className="text-[11px] text-indigo-500">{bill.mode || 'Auto-pay'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingBills;
