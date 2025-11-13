import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const PageShell = ({
  title,
  description,
  badge,
  actions,
  toolbar,
  children,
  background = 'bg-white dark:bg-slate-900/60',
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64 mt-5 px-4 sm:px-6 lg:px-8 pb-8">
          <div className="space-y-6 max-w-6xl mx-auto text-slate-900 dark:text-slate-100">
            <section className={`${background} rounded-3xl border border-slate-100 dark:border-slate-800 backdrop-blur flex flex-col md:flex-row md:items-start md:justify-between gap-4 p-6 shadow-sm`}>
              <div>
                {badge && (
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-500 border border-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-200 dark:border-indigo-500/30">
                    {badge}
                  </span>
                )}
                <h1 className="text-3xl font-display text-slate-900 dark:text-white mt-1">{title}</h1>
                {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-3xl">{description}</p>}
              </div>
              {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
            </section>
            {toolbar}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageShell;
