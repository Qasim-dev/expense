import React, { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setCurrency } from '../../store/slices/currencySlice';

const CurrencySelector = () => {
  const dispatch = useAppDispatch();
  const { selected, options } = useAppSelector((state) => state.currency);
  const [open, setOpen] = useState(false);

  const activeOption = useMemo(
    () => options.find((option) => option.code === selected) || options[0],
    [options, selected]
  );

  const handleSelect = (code) => {
    dispatch(setCurrency(code));
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-200 text-xs font-semibold hover:text-indigo-600 hover:border-indigo-200 dark:hover:border-indigo-400 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{activeOption?.symbol || 'Rs'}</span>
        <span className="uppercase">{selected}</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50">
          <ul className="py-1 text-sm text-slate-600 dark:text-slate-200" role="listbox">
            {options.map((option) => (
              <li key={option.code}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.code)}
                  className={`flex w-full items-center justify-between px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    option.code === selected ? 'text-indigo-600 dark:text-indigo-300 font-semibold' : ''
                  }`}
                  role="option"
                  aria-selected={option.code === selected}
                >
                  <span>
                    {option.symbol} {option.label}
                  </span>
                  {option.code === selected && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
