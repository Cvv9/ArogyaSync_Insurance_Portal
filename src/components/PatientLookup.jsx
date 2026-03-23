// src/components/PatientLookup.jsx — Patient lookup form (landing page)
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ShieldCheck, IdCard, CalendarDays, Loader2, Building2 } from 'lucide-react';
import { comprehensivePatientScan } from '../api';
import { useAuth } from '../contexts/AuthContext';
import DateInput from './DateInput';

export default function PatientLookup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { agent } = useAuth();
  const prefill = location.state?.prefill || {};

  const [formData, setFormData] = useState({
    name: prefill.name || '',
    dob: prefill.dob || '',
    insuranceId: prefill.insuranceId || '',
    dateFrom: prefill.dateFrom || '',
    dateTo: prefill.dateTo || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const abortControllerRef = useRef(null);
  const isSubmittingRef = useRef(false);

  // Cancel in-flight request on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmittingRef.current) return;

    setError('');

    // UX-010: At least one field required (relaxed from all 3)
    if (!formData.name.trim() && !formData.dob && !formData.insuranceId.trim()) {
      setError('Please fill in at least one field to search.');
      return;
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    isSubmittingRef.current = true;
    setLoading(true);

    try {
      // Run comprehensive scan - compares ALL vitals against ALL CSV files
      const scanResults = await comprehensivePatientScan(formData, { signal: controller.signal });

      // Navigate to scan results page with comprehensive data
      navigate('/scan-results', {
        state: {
          scanResults,
          searchParams: formData,
        },
      });
    } catch (err) {
      if (err.name === 'AbortError') return; // Silently ignore cancelled requests
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-white">Patient Lookup</h1>
        <p className="text-sm text-text-muted mt-1">
          Search for a patient by name, date of birth, or policy number.
        </p>
        {agent?.insurance_company && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-accent-cyan/10 border border-accent-cyan/20 rounded-full text-xs text-accent-cyan font-medium">
            <Building2 className="w-3 h-3" />
            {agent.insurance_company}
          </div>
        )}
      </div>

      {/* Form card */}
      <div className="bg-surface-card border border-border-glass rounded-xl p-6 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="patient-name" className="block text-sm font-medium text-text-light mb-1.5">Full Name</label>
            <input
              id="patient-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-3.5 py-2.5 bg-surface-darker border border-border-glass rounded-lg
                text-text-white placeholder:text-text-muted text-sm
                focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 focus:border-accent-cyan/60
                transition-colors"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="patient-dob" className="block text-sm font-medium text-text-light mb-1.5">Date of Birth</label>
            <DateInput
              id="patient-dob"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />
          </div>

          {/* Policy Number */}
          <div>
            <label htmlFor="patient-insurance-id" className="block text-sm font-medium text-text-light mb-1.5">Policy Number</label>
            <input
              id="patient-insurance-id"
              type="text"
              name="insuranceId"
              value={formData.insuranceId}
              onChange={handleChange}
              placeholder="INS123456"
              className="w-full px-3.5 py-2.5 bg-surface-darker border border-border-glass rounded-lg
                text-text-white placeholder:text-text-muted text-sm
                focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 focus:border-accent-cyan/60
                transition-colors"
            />
          </div>

          {/* Admission Date Range (optional) */}
          <div className="pt-1 border-t border-border-glass">
            <p className="text-xs text-text-muted mb-3">Admission Date Range <span className="text-text-muted/60">(optional — leave blank to scan all history)</span></p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="date-from" className="block text-sm font-medium text-text-light mb-1.5">From</label>
                <DateInput
                  id="date-from"
                  name="dateFrom"
                  value={formData.dateFrom}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="date-to" className="block text-sm font-medium text-text-light mb-1.5">To</label>
                <DateInput
                  id="date-to"
                  name="dateTo"
                  value={formData.dateTo}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-3.5 py-2.5 bg-accent-red-light border border-accent-red/30 rounded-lg">
              <p className="text-accent-red text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent-cyan text-white
              rounded-lg font-medium text-sm transition-colors
              hover:bg-accent-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running comprehensive scan...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Run Verification Scan
              </>
            )}
          </button>

          {loading && (
            <p className="text-xs text-text-muted text-center -mt-2">
              Comparing all vitals against evidence files. This may take 30-120 seconds for large datasets.
            </p>
          )}
        </form>

        {/* Feature badges */}
        <div className="mt-6 pt-5 border-t border-border-glass flex flex-wrap gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" /> Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <IdCard className="w-3.5 h-3.5 text-accent-cyan" /> ID Verified
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-accent-cyan" /> Date Validated
          </span>
        </div>
      </div>
    </div>
  );
}
