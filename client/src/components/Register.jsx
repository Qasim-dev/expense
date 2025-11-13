import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { registerUser, clearError } from '../store/slices/authSlice';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    dispatch(clearError());

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    await dispatch(registerUser({ name, email, password }));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-6 bg-white/5 rounded-[32px] border border-white/10 backdrop-blur-xl shadow-[0_40px_120px_rgba(15,23,42,0.45)] overflow-hidden">
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-fuchsia-500 via-rose-500 to-amber-400 p-10 text-white">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Create account</p>
            <h1 className="text-3xl font-bold mt-4 leading-tight">Set up your financial cockpit</h1>
            <p className="text-sm text-white/80 mt-3">
              Add expenses, log income, and see insights instantly with secure sync across all your devices.
            </p>
          </div>
          <div className="space-y-4">
            {['Unlimited wallets', 'Auto backup + offline queue', 'Advanced dashboards'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-white/80">
                <span className="w-8 h-8 rounded-2xl bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-950 rounded-[28px] m-4 p-8 shadow-xl flex flex-col justify-center">
          <div className="space-y-3 text-center mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">Create an account</h2>
            <p className="text-sm text-slate-500">
              Already have one?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            {(error || localError) && (
              <div className="border border-rose-100 bg-rose-50 text-rose-600 text-sm rounded-2xl px-4 py-3">
                {error || localError}
              </div>
            )}
            <label className="block text-sm text-slate-600 font-medium">
              Full name
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 text-sm"
                placeholder="Qasim Shah"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="block text-sm text-slate-600 font-medium">
              Email address
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 text-sm"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="block text-sm text-slate-600 font-medium">
              Password
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 text-sm"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

