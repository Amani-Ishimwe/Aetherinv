import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  onToggleView: () => void;
  onBackToLanding: () => void;
}

export const Login: React.FC<LoginProps> = ({ onToggleView, onBackToLanding }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    if (!email || !password) { setClientError('Please enter both email and password.'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setClientError('Please enter a valid email address.'); return; }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setClientError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkblue-950 flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brandorange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to landing */}
      <button
        onClick={onBackToLanding}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-brandorange-400 transition-colors text-sm font-semibold"
      >
        <i className="fa-solid fa-arrow-left text-xs"></i>
        Back to Home
      </button>

      <div className="w-full max-w-md z-10">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-brandorange-600 to-brandorange-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-brandorange-500/30 mb-4">
            <i className="fa-solid fa-boxes-stacked text-white text-2xl"></i>
          </div>
          <h2 className="text-3xl font-extrabold tracking-wider text-white">
            AETHER<span className="text-brandorange-500">INV</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">Welcome back — sign in to continue</p>
        </div>

        {/* Form Card */}
        <div className="bg-darkblue-900/70 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-darkblue-800/80">
          <h3 className="text-2xl font-bold text-white mb-6">Sign In</h3>

          {clientError && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3 text-red-400 text-sm">
              <i className="fa-solid fa-circle-exclamation mt-0.5 shrink-0"></i>
              <span>{clientError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <i className="fa-solid fa-envelope text-sm"></i>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 focus:ring-1 focus:ring-brandorange-500/30 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-600 transition-all outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <i className="fa-solid fa-lock text-sm"></i>
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-darkblue-950 border border-darkblue-800 focus:border-brandorange-500 focus:ring-1 focus:ring-brandorange-500/30 rounded-xl py-3 pl-11 pr-11 text-slate-200 placeholder-slate-600 transition-all outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <i className={`fa-solid ${showPass ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brandorange-600 to-brandorange-500 hover:from-brandorange-500 hover:to-brandorange-400 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-brandorange-500/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 mt-2"
            >
              {loading ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Signing in...</>
              ) : (
                <><i className="fa-solid fa-arrow-right-to-bracket"></i> Access Dashboard</>
              )}
            </button>
          </form>

          <div className="mt-7 text-center border-t border-darkblue-800/80 pt-6">
            <p className="text-slate-400 text-sm">
              New to AetherInv?{' '}
              <button
                type="button"
                onClick={onToggleView}
                className="text-brandorange-500 hover:text-brandorange-400 font-bold transition-colors focus:outline-none"
              >
                Create a free account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
