// src/components/LoginPage.jsx — Split-layout login for Insurance Portal
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ShieldCheck, Shield, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function HeartbeatLine({ className = '' }) {
  return (
    <svg viewBox="0 0 600 100" className={className} preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points="0,50 80,50 120,50 140,15 160,85 180,30 200,65 220,50 300,50 340,50 360,15 380,85 400,30 420,65 440,50 520,50 600,50"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-ecg-draw"
      />
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const features = [
    { icon: ShieldCheck, label: 'Fraud Detection Analytics' },
    { icon: Shield, label: 'Blockchain-Verified Records' },
    { icon: Activity, label: 'Real-time Data Integrity' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-darker flex">
      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#0e7490] via-[#0c4a6e] to-[#1e3a5f]">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.07]" aria-hidden="true">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col h-full px-10 py-12">
          {/* Logo + branding */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 overflow-hidden">
              <img src="/app_logo.png" alt="" className="w-9 h-9 object-contain" />
            </div>
            <div>
              <span className="text-white font-bold text-lg tracking-tight">ArogyaSync</span>
              <span className="block text-cyan-200 text-xs">Insurance Portal</span>
            </div>
          </div>

          {/* Hero */}
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-white text-3xl font-bold leading-tight mb-4">
              Data Integrity<br />Verification
            </h2>
            <p className="text-cyan-100/80 text-sm leading-relaxed max-w-xs mb-10">
              Verify patient medical records with blockchain-anchored evidence and real-time fraud detection analytics.
            </p>

            <div className="space-y-4">
              {features.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                    <Icon className="w-4 h-4 text-cyan-200" />
                  </div>
                  <span className="text-cyan-50 text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <HeartbeatLine className="w-full h-12 text-cyan-300/40" />
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile-only branding */}
          <div className="text-center lg:text-left mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-accent-cyan/15 border border-accent-cyan/20 rounded-2xl mb-4 shadow-card overflow-hidden lg:hidden">
              <img src="/app_logo.png" alt="ArogyaSync Logo" className="w-14 h-14 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-text-white tracking-tight">ArogyaSync</h1>
            <p className="text-text-muted text-sm mt-1">Insurance Verification Portal</p>
          </div>

          {/* Form card */}
          <div className="bg-surface-card border border-border-glass rounded-2xl p-8 shadow-card">
            <h2 className="text-lg font-semibold text-text-white mb-6">Sign in to your account</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-text-light mb-1.5">Email address</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                  placeholder="agent@insurance.com"
                  autoComplete="email"
                  className="w-full px-4 py-2.5 bg-surface-darker border border-border-glass rounded-lg
                    text-text-white placeholder:text-text-muted text-sm
                    focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 focus:border-accent-cyan/60 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-text-light mb-1.5">Password</label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full px-4 py-2.5 pr-12 bg-surface-darker border border-border-glass rounded-lg
                      text-text-white placeholder:text-text-muted text-sm
                      focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 focus:border-accent-cyan/60 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-light transition"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="px-4 py-2.5 bg-accent-red-light border border-accent-red/30 rounded-lg">
                  <p className="text-accent-red text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent-cyan text-white
                  rounded-lg font-semibold text-sm transition-all shadow-card
                  hover:bg-accent-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-border-glass text-center">
              <p className="text-sm text-text-muted">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-accent-cyan hover:underline font-medium">
                  Create Account
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-text-muted mt-6">&copy; 2026 ArogyaSync. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
