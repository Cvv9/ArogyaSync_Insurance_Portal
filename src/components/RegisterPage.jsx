// src/components/RegisterPage.jsx — Agent registration with split-layout
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ShieldCheck, Shield, Activity, CheckCircle2, ChevronDown } from 'lucide-react';
import { registerAgent, getInsuranceCompanies } from '../api';

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

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', employee_id: '', insurance_company: '', password: '', confirmPassword: '',
  });
  const [companies, setCompanies] = useState([]);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getInsuranceCompanies()
      .then((data) => setCompanies(data.companies || []))
      .catch(() => {});
  }, []);

  const features = [
    { icon: ShieldCheck, label: 'Fraud Detection Analytics' },
    { icon: Shield, label: 'Blockchain-Verified Records' },
    { icon: Activity, label: 'Real-time Data Integrity' },
  ];

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.password || !form.insurance_company) {
      setError('Name, email, insurance company, and password are required.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await registerAgent({
        name: form.name.trim(),
        email: form.email.trim(),
        employee_id: form.employee_id.trim(),
        insurance_company: form.insurance_company,
        password: form.password,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-surface-darker flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-green/15 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-accent-green" />
          </div>
          <h1 className="text-xl font-semibold text-text-white mb-2">Verification Email Sent!</h1>
          <p className="text-sm text-text-muted mb-6">
            We&apos;ve sent a verification link to <strong className="text-text-light">{form.email}</strong>.
            Please check your inbox and click the link to activate your account.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent-cyan text-white rounded-lg font-medium text-sm hover:bg-accent-cyan/90 transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-darker flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#0e7490] via-[#0c4a6e] to-[#1e3a5f]">
        <div className="absolute inset-0 opacity-[0.07]" aria-hidden="true">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid-r" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-r)" />
          </svg>
        </div>
        <div className="relative z-10 flex flex-col h-full px-10 py-12">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 overflow-hidden">
              <img src="/app_logo.png" alt="" className="w-9 h-9 object-contain" />
            </div>
            <div>
              <span className="text-white font-bold text-lg tracking-tight">ArogyaSync</span>
              <span className="block text-cyan-200 text-xs">Insurance Portal</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-white text-3xl font-bold leading-tight mb-4">
              Join Our<br />Verification Network
            </h2>
            <p className="text-cyan-100/80 text-sm leading-relaxed max-w-xs mb-10">
              Register as an insurance verification agent to access patient medical record integrity reports.
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

      {/* Right panel — registration form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="text-center lg:text-left mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-accent-cyan/15 border border-accent-cyan/20 rounded-2xl mb-4 shadow-card overflow-hidden lg:hidden">
              <img src="/app_logo.png" alt="ArogyaSync Logo" className="w-14 h-14 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-text-white tracking-tight">Create Account</h1>
            <p className="text-text-muted text-sm mt-1">Register as an insurance verification agent</p>
          </div>

          <div className="bg-surface-card border border-border-glass rounded-2xl p-8 shadow-card">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="reg-name" className="block text-sm font-medium text-text-light mb-1.5">Full Name</label>
                <input id="reg-name" name="name" type="text" value={form.name} onChange={handleChange}
                  placeholder="Jane Doe" autoComplete="name"
                  className="w-full px-4 py-2.5 bg-surface-darker border border-border-glass rounded-lg text-text-white placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 focus:border-accent-cyan/60 transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-text-light mb-1.5">Email Address</label>
                <input id="reg-email" name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="jane@insurance.com" autoComplete="email"
                  className="w-full px-4 py-2.5 bg-surface-darker border border-border-glass rounded-lg text-text-white placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 focus:border-accent-cyan/60 transition-colors"
                />
              </div>

              {/* Employee ID */}
              <div>
                <label htmlFor="reg-eid" className="block text-sm font-medium text-text-light mb-1.5">Employee ID <span className="text-text-muted">(optional)</span></label>
                <input id="reg-eid" name="employee_id" type="text" value={form.employee_id} onChange={handleChange}
                  placeholder="EMP-12345"
                  className="w-full px-4 py-2.5 bg-surface-darker border border-border-glass rounded-lg text-text-white placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 focus:border-accent-cyan/60 transition-colors"
                />
              </div>

              {/* Insurance Company */}
              <div>
                <label htmlFor="reg-company" className="block text-sm font-medium text-text-light mb-1.5">Insurance Company</label>
                <div className="relative">
                  <select id="reg-company" name="insurance_company" value={form.insurance_company} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-surface-darker border border-border-glass rounded-lg text-text-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 focus:border-accent-cyan/60 transition-colors"
                  >
                    <option value="" className="text-text-muted">Select your company</option>
                    {companies.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="reg-pw" className="block text-sm font-medium text-text-light mb-1.5">Password</label>
                <div className="relative">
                  <input id="reg-pw" name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handleChange}
                    placeholder="Min. 8 characters" autoComplete="new-password"
                    className="w-full px-4 py-2.5 pr-12 bg-surface-darker border border-border-glass rounded-lg text-text-white placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 focus:border-accent-cyan/60 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-light transition">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="reg-cpw" className="block text-sm font-medium text-text-light mb-1.5">Confirm Password</label>
                <input id="reg-cpw" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
                  placeholder="••••••••" autoComplete="new-password"
                  className="w-full px-4 py-2.5 bg-surface-darker border border-border-glass rounded-lg text-text-white placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 focus:border-accent-cyan/60 transition-colors"
                />
              </div>

              {error && (
                <div className="px-4 py-2.5 bg-accent-red-light border border-accent-red/30 rounded-lg">
                  <p className="text-accent-red text-sm">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent-cyan text-white rounded-lg font-semibold text-sm transition-all shadow-card hover:bg-accent-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</> : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-border-glass text-center">
              <p className="text-sm text-text-muted">
                Already have an account?{' '}
                <Link to="/login" className="text-accent-cyan hover:underline font-medium">Sign In</Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-text-muted mt-6">&copy; 2026 ArogyaSync. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
