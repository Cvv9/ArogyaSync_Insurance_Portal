// src/components/VerifyEmail.jsx — Email verification callback page
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { verifyAgentEmail } from '../api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  // CR5-041: AbortController prevents setting state on unmounted component
  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    const controller = new AbortController();

    verifyAgentEmail(token, { signal: controller.signal })
      .then((data) => {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setStatus('error');
        setMessage(err.message || 'Verification failed.');
      });

    return () => controller.abort();
  }, [token]);

  return (
    <div className="min-h-screen bg-surface-darker flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-accent-cyan animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-text-white mb-2">Verifying your email...</h1>
            <p className="text-sm text-text-muted">Please wait while we confirm your account.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-green/15 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-accent-green" />
            </div>
            <h1 className="text-xl font-semibold text-text-white mb-2">Email Verified!</h1>
            <p className="text-sm text-text-muted mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent-cyan text-white rounded-lg font-medium text-sm hover:bg-accent-cyan/90 transition"
            >
              Sign In
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-red/15 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-accent-red" />
            </div>
            <h1 className="text-xl font-semibold text-text-white mb-2">Verification Failed</h1>
            <p className="text-sm text-text-muted mb-6">{message}</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent-cyan text-white rounded-lg font-medium text-sm hover:bg-accent-cyan/90 transition"
            >
              Register Again
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
