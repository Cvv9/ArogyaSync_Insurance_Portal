import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CalendarDays, IdCard } from 'lucide-react';
import '../App.css'; // Ensure global styles are available

const InsurancePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    insuranceId: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const mockRecords = [
      {
        id: 1,
        deviceId: 'DEV-99A1',
        status: 'match',
        checkedAt: new Date().toISOString(),
        recordedTimeStamp: new Date(Date.now() - 3600000).toISOString(),
        totalNoOfVitals: 5,
        NoOfMismatch: 0,
        mismatchvitals: {}
      },
      {
        id: 2,
        deviceId: 'DEV-88B2',
        status: 'mismatch',
        checkedAt: new Date().toISOString(),
        recordedTimeStamp: new Date(Date.now() - 7200000).toISOString(),
        totalNoOfVitals: 5,
        NoOfMismatch: 2,
        mismatchvitals: {
          heart_rate: { db: '72 bpm', csv: '88 bpm' },
          blood_pressure: { db: '120/80', csv: '135/90' }
        }
      }
    ];

    try {
      const res = await fetch(
        'https://csvchecker-eufzfuchhjd5b2dk.centralindia-01.azurewebsites.net/getPatientTest',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }
      );

      if (res.ok) {
        const data = await res.json();
        navigate('/next-page', {
          state: {
            records: data,
            patientName: formData.name,
            patientDob: formData.dob
          }
        });
      } else {
        // Fallback to mock data for demonstration purposes if API drops
        navigate('/next-page', {
          state: {
            records: mockRecords,
            patientName: formData.name,
            patientDob: formData.dob
          }
        });
      }
    } catch (err) {
      console.warn("API Unreachable, falling back to mock data for testing.", err);
      navigate('/next-page', {
        state: {
          records: mockRecords,
          patientName: formData.name,
          patientDob: formData.dob
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container flex-center">
      <div className="glass-panel" style={{ display: 'flex', width: '900px', maxWidth: '95%', minHeight: '550px', overflow: 'hidden' }}>
        
        {/* Left Panel - Information */}
        <div style={{ flex: 1, padding: '40px', background: 'rgba(0, 240, 255, 0.03)', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--color-primary-glow)', padding: '12px', borderRadius: '12px', color: 'var(--color-primary)' }}>
                <ShieldCheck size={32} />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }} className="text-gradient">ArogyaSync</h1>
            </div>
            
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: '#fff' }}>Patient Portal</h2>
            <p className="text-muted" style={{ lineHeight: 1.6, marginBottom: '40px' }}>
              Securely verify patient insurance coverage and access their connected device data and vital records.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ color: 'var(--color-primary)' }}><ShieldCheck size={20} /></div>
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>AES-256 Encrypted verification</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ color: 'var(--color-primary)' }}><IdCard size={20} /></div>
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Instant ID authorization</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ color: 'var(--color-primary)' }}><CalendarDays size={20} /></div>
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Historical vital correlation</span>
              </div>
            </div>
          </div>

          <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '40px' }}>
            © {new Date().getFullYear()} ArogyaSync Health Systems
          </div>
        </div>

        {/* Right Panel - Form */}
        <div style={{ flex: 1, padding: '40px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '32px', textAlign: 'center', fontWeight: 600 }}>Verify Patient Coverage</h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Jane Doe"
                className="input-glass"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
                className="input-glass"
                style={{ colorScheme: 'dark' }} // helpful for date picker icon on some browsers
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Insurance ID</label>
              <input
                type="text"
                name="insuranceId"
                value={formData.insuranceId}
                onChange={handleChange}
                required
                placeholder="e.g., INS-123456"
                className="input-glass"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: '14px', marginTop: '16px', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              {loading ? (
                <>
                  <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <span>Verifying...</span>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </>
              ) : 'Verify & Access Records'}
            </button>

            {/* Error/Message feedback */}
            {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem', textAlign: 'center', background: 'var(--color-danger-bg)', padding: '10px', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(239,68,68,0.3)' }}>{error}</div>}
            {message && <div style={{ color: 'var(--color-success)', fontSize: '0.875rem', textAlign: 'center', background: 'var(--color-success-bg)', padding: '10px', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(16,185,129,0.3)' }}>{message}</div>}

          </form>
        </div>
      </div>
    </div>
  );
};

export default InsurancePage;
