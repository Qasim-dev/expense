import React, { forwardRef } from 'react';

const Select = forwardRef(({ className = '', children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        ref={ref}
        {...props}
        className={`appearance-none w-full pr-10 pl-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/70 text-sm text-slate-700 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-200/60 dark:focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-400 transition ${className}`}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400 dark:text-slate-500">
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
