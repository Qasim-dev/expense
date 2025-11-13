import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { checkAuth } from './store/slices/authSlice';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setOnlineStatus, syncOfflineChanges, fetchExpenses, setPendingSyncCount } from './store/slices/expenseSlice';
import { fetchGoals } from './store/slices/goalSlice';
import { fetchInvestments } from './store/slices/investmentSlice';
import { fetchBills } from './store/slices/billSlice';
import { fetchIncome, setIncomeOnlineStatus } from './store/slices/incomeSlice';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AllExpenses from './pages/AllExpenses';
import Bills from './pages/Bills';
import Goals from './pages/Goals';
import Investments from './pages/Investments';
import Cards from './pages/Cards';
import Insight from './pages/Insight';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Support from './pages/Support';
import Income from './pages/Income';
import { setIndexedDBOnlineStatus } from './utils/indexedDB';

const ThemeWatcher = () => {
  const mode = useAppSelector((state) => state.theme.mode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  return null;
};

const NetworkStatusWatcher = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const readQueueCount = async () => {
      try {
        const { getSyncQueue } = await import('./utils/indexedDB');
        const queue = await getSyncQueue();
        dispatch(setPendingSyncCount(queue.length));
      } catch (error) {
        console.error('Unable to read sync queue', error);
      }
    };

    const applyOnlineState = (value) => {
      setIndexedDBOnlineStatus(value);
      dispatch(setOnlineStatus(value));
      dispatch(setIncomeOnlineStatus(value));
    };

    const handleOnline = () => {
      applyOnlineState(true);
      readQueueCount();
      if (isAuthenticated) {
        dispatch(syncOfflineChanges());
        dispatch(fetchExpenses());
        dispatch(fetchGoals());
        dispatch(fetchInvestments());
        dispatch(fetchBills());
        dispatch(fetchIncome());
      }
    };

    const handleOffline = () => {
      applyOnlineState(false);
      readQueueCount();
    };

    const initialOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    applyOnlineState(initialOnline);
    readQueueCount();
    if (initialOnline) {
      handleOnline();
    } else {
      handleOffline();
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch, isAuthenticated]);

  return null;
};

const AppRoutes = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <ThemeWatcher />
      <NetworkStatusWatcher />
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <PrivateRoute>
              <AllExpenses />
            </PrivateRoute>
          }
        />
        <Route
          path="/bills"
          element={
            <PrivateRoute>
              <Bills />
            </PrivateRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <PrivateRoute>
              <Goals />
            </PrivateRoute>
          }
        />
        <Route
          path="/investment"
          element={
            <PrivateRoute>
              <Investments />
            </PrivateRoute>
          }
        />
        <Route
          path="/income"
          element={
            <PrivateRoute>
              <Income />
            </PrivateRoute>
          }
        />
        <Route
          path="/cards"
          element={
            <PrivateRoute>
              <Cards />
            </PrivateRoute>
          }
        />
        <Route
          path="/insight"
          element={
            <PrivateRoute>
              <Insight />
            </PrivateRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <Analytics />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path="/help"
          element={
            <PrivateRoute>
              <Help />
            </PrivateRoute>
          }
        />
        <Route
          path="/support"
          element={
            <PrivateRoute>
              <Support />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}

export default App;
