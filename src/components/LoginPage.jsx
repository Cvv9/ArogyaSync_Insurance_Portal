// src/components/LoginPage.jsx — API key login for Insurance Portal (UX-009)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, KeyRound, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = key.trim();
    if (!trimmed) {
      setError('Please enter your API key.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate the key against a lightweight endpoint
      const res = await fetch(`${API_URL}/stats/summary`, {
        headers: { 'Content-Type': 'application/json', 'X-API-Key': trimmed },
      });
      if (res.status === 401 || res.status === 403) {
        setError('Invalid API key. Please check and try again.');
        return;
      }
      if (!res.ok) {
        setError(`Server error (${res.status}). Please try again later.`);
        return;
      }
      login(trimmed);
      navigate('/');
    } catch {
      setError('Cannot connect to the API server. Is it running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-darker flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo + Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent-cyan/15 flex items-center justify-center border border-accent-cyan/20">
            <img src="/app_logo.png" alt="ArogyaSync" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-2xl font-semibold text-text-white">Insurance Portal</h1>
          <p className="text-sm text-text-muted mt-1">Enter your API key to access the portal.</p>
        </div>

        {/* Login card */}
        <div className="bg-surface-card border border-border-glass rounded-xl p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium text-text-light mb-1.5">
                API Key
              </label>
              <div className="relative">
                <input
                  id="api-key"
                  type={showKey ? 'text' : 'password'}
                  value={key}
                  onChange={(e) => { setKey(e.target.value); if (error) setError(''); }}
                  placeholder="Paste your API key"
                  autoFocus
                  className="w-full px-3.5 py-2.5 pr-10 bg-surface-darker border border-border-glass rounded-lg
                    text-text-white placeholder:text-text-muted text-sm
                    focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 focus:border-accent-cyan/60
                    transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-light"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-3.5 py-2.5 bg-accent-red-light border border-accent-red/30 rounded-lg">
                <p className="text-accent-red text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent-cyan text-white
                rounded-lg font-medium text-sm transition-colors
                hover:bg-accent-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
              ) : (
                <><KeyRound className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border-glass flex items-center gap-2 text-xs text-text-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
            Key stored in session only — never persisted to disk.
          </div>
        </div>
      </div>
    </div>
  );
}
