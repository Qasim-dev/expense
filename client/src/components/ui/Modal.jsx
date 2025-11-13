import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ open, onClose, title, subtitle, children, footer }) => {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 shadow-2xl">
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            {title && <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2>}
            {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
