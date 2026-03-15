// src/components/PatientLookup.jsx — Patient lookup form (landing page)
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ShieldCheck, IdCard, CalendarDays, Loader2 } from 'lucide-react';
import { getPatientTest } from '../api';

export default function PatientLookup() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state?.prefill || {};

  const [formData, setFormData] = useState({
    name: prefill.name || '',
    dob: prefill.dob || '',
    insuranceId: prefill.insuranceId || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // UX-010: At least one field required (relaxed from all 3)
    if (!formData.name.trim() && !formData.dob && !formData.insuranceId.trim()) {
      setError('Please fill in at least one field to search.');
      return;
    }

    setLoading(true);
    try {
      const data = await getPatientTest(formData);
      navigate('/results', {
        state: {
          records: data.records || data,
          patientId: data.patientId,
          patientName: formData.name,
          patientDob: formData.dob,
        },
      });
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-white">Patient Lookup</h1>
        <p className="text-sm text-text-muted mt-1">
          Search for a patient by name, date of birth, or insurance ID.
        </p>
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
            <input
              id="patient-dob"
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-surface-darker border border-border-glass rounded-lg
                text-text-white text-sm
                focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 focus:border-accent-cyan/60
                transition-colors"
            />
          </div>

          {/* Insurance ID */}
          <div>
            <label htmlFor="patient-insurance-id" className="block text-sm font-medium text-text-light mb-1.5">Insurance ID</label>
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
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search Records
              </>
            )}
          </button>
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
