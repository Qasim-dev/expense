import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleTheme } from '../../store/slices/themeSlice';
import { fetchBills } from '../../store/slices/billSlice';
import { fetchGoals } from '../../store/slices/goalSlice';
import { fetchInvestments } from '../../store/slices/investmentSlice';
import { formatRelativeTime } from '../../utils/time';
import { useCurrencyFormatter } from '../../hooks/useCurrencyFormatter';
import CurrencySelector from '../ui/CurrencySelector';

const contextualFilters = ['Expenses', 'Cards', 'Subscriptions'];

const Header = ({ onMenuClick }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const { isOnline, expenses, pendingSyncCount, lastSyncedAt } = useAppSelector((state) => state.expenses);
  const bills = useAppSelector((state) => state.bills?.bills || []);
  const goals = useAppSelector((state) => state.goals?.goals || []);
  const investments = useAppSelector((state) => state.investments?.investments || []);
  const themeMode = useAppSelector((state) => state.theme.mode);
  const { formatWhole } = useCurrencyFormatter();

  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false);
  const notificationsRef = useRef(null);
  const searchInputRef = useRef(null);

  const currentDate = new Date();
  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const userInitial = user?.name?.charAt(0).toUpperCase() || 'U';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
  }, [themeMode]);

  useEffect(() => {
    if (!bills.length) dispatch(fetchBills());
    if (!goals.length) dispatch(fetchGoals());
    if (!investments.length) dispatch(fetchInvestments());
  }, [dispatch, bills.length, goals.length, investments.length]);

  useEffect(() => {
    if (location.pathname === '/expenses') {
      const params = new URLSearchParams(location.search);
      setSearchValue(params.get('q') || '');
    }
  }, [location]);

  useEffect(() => {
    const handler = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const notifications = useMemo(() => {
    const upcomingBills = bills
      .filter((bill) => bill.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 2)
      .map((bill) => ({
        id: `bill-${bill._id}`,
        title: bill.name || 'Upcoming bill',
        description: `Due ${new Date(bill.dueDate).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
        })}`,
      }));

    const recentExpenses = expenses.slice(0, 3).map((expense) => ({
      id: `expense-${expense._id}`,
      title: expense.title || 'New expense',
      description: `${formatWhole(expense.amount)} • ${expense.category || 'General'}`,
    }));

    const goalAlerts = goals
      .filter((goal) => goal.targetAmount && (goal.savedAmount / goal.targetAmount) >= 0.8)
      .slice(0, 2)
      .map((goal) => ({
        id: `goal-${goal._id}`,
        title: goal.title,
        description: `${Math.round((goal.savedAmount / goal.targetAmount) * 100)}% complete`,
      }));

    return [...upcomingBills, ...recentExpenses, ...goalAlerts].slice(0, 5);
  }, [bills, expenses, goals]);

  const notificationCount = notifications.length;
  const handleResultNavigate = (route) => {
    setSearchFocused(false);
    setSearchValue('');
    navigate(route);
  };

  const smartInsightStatus = useMemo(() => {
    const relative = formatRelativeTime(lastSyncedAt);
    if (relative) {
      return `Smart insights refreshed ${relative}`;
    }
    return isOnline ? 'Smart insights warming up' : 'Smart insights paused offline';
  }, [isOnline, lastSyncedAt]);

  const secureSyncStatus = useMemo(() => {
    const changeLabel = pendingSyncCount === 1 ? 'change' : 'changes';
    if (isOnline) {
      return pendingSyncCount > 0
        ? `Secure sync • ${pendingSyncCount} ${changeLabel} syncing`
        : 'Secure sync • live';
    }
    return pendingSyncCount > 0
      ? `Secure sync • ${pendingSyncCount} ${changeLabel} queued`
      : 'Secure sync • waiting for connection';
  }, [isOnline, pendingSyncCount]);
   console.log("isOnline" , isOnline)
  const searchResults = useMemo(() => {
    const term = searchValue.trim().toLowerCase();
    if (term.length < 2) return [];
    const results = [];

    expenses.forEach((expense) => {
      if (
        expense.title?.toLowerCase().includes(term) ||
        expense.description?.toLowerCase().includes(term)
      ) {
        results.push({
          id: `expense-${expense._id}`,
          title: expense.title || 'Expense',
          badge: 'Expense',
        description: `${formatWhole(expense.amount)} · ${expense.category || 'General'}`,
          route: `/expenses?q=${encodeURIComponent(expense.title || '')}`,
        });
      }
    });

    bills.forEach((bill) => {
      if (
        bill.name?.toLowerCase().includes(term) ||
        bill.category?.toLowerCase().includes(term)
      ) {
        results.push({
          id: `bill-${bill._id}`,
          title: bill.name || 'Bill',
          badge: 'Bill',
          description: `Due ${bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-IN') : 'Flexible'}`,
          route: '/bills',
        });
      }
    });

    goals.forEach((goal) => {
      if (
        goal.title?.toLowerCase().includes(term) ||
        goal.description?.toLowerCase().includes(term)
      ) {
        results.push({
          id: `goal-${goal._id}`,
          title: goal.title || 'Goal',
          badge: 'Goal',
          description: `${Math.round(((goal.savedAmount || 0) / (goal.targetAmount || 1)) * 100)}% complete`,
          route: '/goals',
        });
      }
    });

    investments.forEach((inv) => {
      if (
        inv.name?.toLowerCase().includes(term) ||
        inv.type?.toLowerCase().includes(term)
      ) {
        results.push({
          id: `investment-${inv._id}`,
          title: inv.name || 'Investment',
          badge: 'Investment',
          description: `${formatWhole(inv.currentValue || inv.amount || 0)} · ${inv.type}`,
          route: '/investment',
        });
      }
    });

    const quickDestinations = [
      {
        id: 'nav-dashboard',
        title: 'Dashboard',
        badge: 'Page',
        description: 'Overview & highlights',
        route: '/dashboard',
        keywords: ['dashboard', 'home', 'overview'],
      },
      {
        id: 'nav-expenses',
        title: 'All Expenses',
        badge: 'Page',
        description: 'Browse and filter transactions',
        route: '/expenses',
        keywords: ['expense', 'expenses', 'transactions'],
      },
      {
        id: 'nav-bills',
        title: 'Bills & Subscriptions',
        badge: 'Page',
        description: 'Recurring payments & reminders',
        route: '/bills',
        keywords: ['bills', 'bill', 'subscriptions'],
      },
      {
        id: 'nav-investment',
        title: 'Investments',
        badge: 'Page',
        description: 'Track holdings & returns',
        route: '/investment',
        keywords: ['invest', 'wealth', 'portfolio'],
      },
      {
        id: 'nav-goals',
        title: 'Goals',
        badge: 'Page',
        description: 'Savings milestones',
        route: '/goals',
        keywords: ['goal', 'saving', 'target'],
      },
      {
        id: 'nav-insight',
        title: 'Insights',
        badge: 'Page',
        description: 'Personalised recommendations',
        route: '/insight',
        keywords: ['insight', 'insights', 'pulse'],
      },
      {
        id: 'nav-analytics',
        title: 'Analytics',
        badge: 'Page',
        description: 'Deep dive on spend',
        route: '/analytics',
        keywords: ['analytics', 'analysis', 'reports'],
      },
      {
        id: 'nav-cards',
        title: 'Cards',
        badge: 'Page',
        description: 'Manage virtual cards',
        route: '/cards',
        keywords: ['card', 'cards'],
      },
      {
        id: 'nav-support',
        title: 'Support',
        badge: 'Support',
        description: 'Raise a ticket',
        route: '/support',
        keywords: ['support', 'help', 'ticket'],
      },
      {
        id: 'nav-settings',
        title: 'Settings',
        badge: 'Workspace',
        description: 'Profile & preferences',
        route: '/settings',
        keywords: ['settings', 'profile', 'preference'],
      },
    ];

    quickDestinations.forEach((destination) => {
      const matchesTitle = destination.title.toLowerCase().includes(term);
      const matchesKeyword = destination.keywords?.some(
        (keyword) => keyword.includes(term) || term.includes(keyword)
      );

      if (matchesTitle || matchesKeyword) {
        results.push({ ...destination });
      }
    });

    return results.slice(0, 8);
  }, [searchValue, expenses, bills, goals, investments]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = searchValue.trim();
    if (!trimmed) {
      navigate('/expenses');
      return;
    }

    if (searchResults.length > 0) {
      handleResultNavigate(searchResults[0].route);
      return;
    }

    navigate(`/expenses?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative overflow-visible rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-white via-indigo-50/70 to-white dark:from-slate-950 dark:via-slate-900/80 dark:to-slate-950 border border-slate-100 dark:border-slate-800 shadow-[0_20px_45px_rgba(15,23,42,0.08)] dark:shadow-black/40 ring-1 ring-black/5 dark:ring-white/5">
          <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-60 pointer-events-none bg-indigo-200/40 dark:bg-indigo-500/10" />
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-3">
                <button
                  onClick={onMenuClick}
                  className="p-2 rounded-xl text-indigo-600 dark:text-slate-200 bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-semibold flex items-center justify-center text-lg shadow-lg">
                    {userInitial}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Welcome back</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      Hi, {user?.name || 'Explorer'}
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileDetailsOpen((prev) => !prev)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-200 hover:text-indigo-600 hover:border-indigo-200 dark:hover:border-indigo-400 transition-colors"
                aria-expanded={mobileDetailsOpen}
                aria-controls="header-mobile-panel"
              >
                {/* {mobileDetailsOpen ? 'Hide tools' : 'Show tools'} */}
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${mobileDetailsOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <div
              id="header-mobile-panel"
              className={`${mobileDetailsOpen ? 'flex' : 'hidden'} lg:flex flex-wrap items-center justify-between gap-6`}
            >
              <div className="hidden lg:flex items-start gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-semibold flex items-center justify-center text-xl shadow-lg">
                    {userInitial}
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back</p>
                    <p className="text-2xl font-display text-slate-900 dark:text-white">
                      Hi, {user?.name || 'Explorer'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Track every rupee effortlessly</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-[220px] max-w-xl w-full">
                <div className="relative">
                  <form
                    className="relative flex items-center gap-3 bg-white/90 dark:bg-slate-950/80 rounded-2xl px-4 py-2 border border-slate-200 dark:border-slate-800 shadow-lg shadow-indigo-100/70 dark:shadow-black/30 transition-colors"
                    onSubmit={handleSearchSubmit}
                  >
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M9 17a8 8 0 100-16 8 8 0 000 16z" />
                    </svg>
                    <input
                      ref={searchInputRef}
                      type="search"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                      placeholder="Search expenses, cards, subscriptions..."
                      aria-label="Search across application"
                      autoComplete="off"
                      className="ml-3 flex-1 bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                    <button
                      type="submit"
                      className="ml-2 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                      Search
                    </button>
                  </form>
                  {searchFocused && searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 z-[55] max-h-72 overflow-y-auto space-y-1 p-1">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleResultNavigate(result.route)}
                          className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 rounded-xl border border-transparent bg-white/70 dark:bg-slate-950/40 hover:border-indigo-200 dark:hover:border-indigo-500/40 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{result.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{result.description}</p>
                          </div>
                          <span className="text-[11px] px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200">
                            {result.badge}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {contextualFilters.map((filter) => (
                    <button
                      type="button"
                      key={filter}
                      onClick={() => {
                        setSearchValue(filter);
                        setSearchFocused(true);
                        searchInputRef.current?.focus();
                      }}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-white/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-200 hover:text-indigo-600 hover:border-indigo-200 dark:hover:border-indigo-400 transition-colors"
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden lg:flex flex-col text-sm text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formattedTime} | {formattedDate}
                  </span>
                </div>
                <CurrencySelector />
                <button
                  onClick={() => dispatch(toggleTheme())}
                  className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-100 hover:text-indigo-600 hover:border-indigo-200 dark:hover:border-indigo-500/40 transition-colors"
                  aria-label="Toggle theme"
                >
                  {themeMode === 'light' ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414m0-11.314l1.414 1.414M17.95 16.95l1.414 1.414M12 8a4 4 0 100 8 4 4 0 000-8z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    </svg>
                  )}
                </button>
                <div className="relative" ref={notificationsRef}>
                  <button
                    className="relative p-2 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-100 hover:text-indigo-600 hover:border-indigo-200 dark:hover:border-indigo-500/40 transition-colors"
                    onClick={() => setNotificationsOpen((prev) => !prev)}
                    aria-label="Notifications"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    {notificationCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-pink-500 text-white text-[10px] rounded-full flex items-center justify-center">
                        {notificationCount}
                      </span>
                    )}
                  </button>
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-3 w-72 bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 p-4 z-[70] max-h-80 overflow-y-auto">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</p>
                      <div className="mt-3 space-y-3">
                        {notifications.length > 0 ? (
                          notifications.map((item) => (
                            <div key={item.id} className="border border-slate-100 dark:border-slate-800 rounded-xl p-3 bg-white/80 dark:bg-slate-900/40">
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500 dark:text-slate-400">You're all caught up!</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              className={`${mobileDetailsOpen ? 'flex' : 'hidden'} lg:flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-300`}
            >
              <span className="px-3 py-1 bg-white/80 dark:bg-slate-950/60 rounded-full border border-slate-200 dark:border-slate-800">
                {smartInsightStatus}
              </span>
              <span className="px-3 py-1 bg-white/80 dark:bg-slate-950/60 rounded-full border border-slate-200 dark:border-slate-800">
                {secureSyncStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
