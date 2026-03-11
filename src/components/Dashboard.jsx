import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Hospital, MapPin, Hash, Bell, User, Calendar, Wallet, HeartPulse, Activity
} from 'lucide-react';
import '../App.css';

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllPatients();
  }, []);

  const fetchAllPatients = async () => {
    const mockPatients = [
      { id: '101', name: 'John Doe', insurance_id: 'INS123', dob: '2000-01-01', gender: 'Male', hospital_name: 'City General', location: 'New York' },
      { id: '102', name: 'Jane Smith', insurance_id: 'INS456', dob: '1985-05-15', gender: 'Female', hospital_name: 'Westside Clinic', location: 'Los Angeles' },
      { id: '103', name: 'Robert Johnson', insurance_id: 'INS789', dob: '1992-11-20', gender: 'Male', hospital_name: 'Metro Health', location: 'Chicago' }
    ];

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'https://api.arogyasync.com'}/getAllpatients`
      );
      if (response.ok) {
        const result = await response.json();
        setPatients(result);
      } else {
        setPatients(mockPatients);
      }
    } catch (error) {
      console.warn('API Unreachable, falling back to mock data for testing.', error);
      setPatients(mockPatients);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (e, id) => {
    e.stopPropagation(); // Prevent navigation
    setExpanded(prev => (prev === id ? null : id));
  };

  const handleCardClick = (id) => {
    navigate(`/devices/${id}`);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside style={{ width: '260px', background: 'rgba(10, 15, 28, 0.95)', borderRight: '1px solid var(--color-border)', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '40px', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--color-primary-glow)', padding: '10px', borderRadius: '10px', color: 'var(--color-primary)' }}>
            <Activity size={24} />
          </div>
          <span className="text-gradient" style={{ fontSize: '1.25rem', fontWeight: 700 }}>ArogyaSync</span>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 600 }}>Menu</div>
          
          <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--color-primary-glow)', color: 'var(--color-primary)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', textAlign: 'left', fontWeight: 500, transition: 'all 0.2s' }}>
            <User size={18} /> Patients
          </button>
          
          <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'transparent', color: 'var(--color-text-muted)', border: '1px solid transparent', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', textAlign: 'left', fontWeight: 500, transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>
            <HeartPulse size={18} /> Analytics
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        <header className="page-header">
          <div>
            <h2 className="text-gradient" style={{ fontSize: '1.5rem', margin: 0 }}>Patient Directory</h2>
            <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '4px' }}>Manage and monitor patient health records</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--color-text-main)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
              <Bell size={18} />
            </button>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary-glow)', border: '1px solid var(--color-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: 'var(--color-primary)' }}>
              SA
            </div>
          </div>
        </header>

        <main className="main-content">
          {loading ? (
            <div className="flex-center" style={{ height: '50vh', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0, 240, 255, 0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ color: 'var(--color-primary)', fontWeight: 500, letterSpacing: '1px' }}>SYNCING RECORDS...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="flex-center" style={{ height: '50vh' }}>
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
                <div style={{ display: 'inline-flex', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
                  <User size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No Patients Found</h3>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>The patient directory is currently empty. Add a patient to get started.</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
              {patients.map((patient) => {
                const isExpanded = expanded === patient.id;
                return (
                  <div
                    key={patient.id}
                    onClick={() => handleCardClick(patient.id)}
                    className="glass-card"
                    style={{ padding: '24px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                  >
                    {/* Decorative glow in corner */}
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, var(--color-primary-glow) 0%, transparent 70%)', opacity: 0.5, pointerEvents: 'none' }}></div>
                    
                    <div className="flex-between" style={{ marginBottom: isExpanded ? '20px' : '0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--color-text-main)', fontWeight: 600, fontSize: '1.25rem' }}>
                          {(patient.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.125rem', margin: '0 0 4px 0', fontWeight: 600 }}>
                            {patient.name || 'Unnamed Patient'}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 8px var(--color-success)' }}></span>
                            Monitoring Active
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => toggleExpand(e, patient.id)}
                        className="btn-outline"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      >
                        {isExpanded ? 'Hide Details' : 'View'}
                      </button>
                    </div>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateRows: isExpanded ? '1fr' : '0fr', 
                      transition: 'grid-template-rows var(--transition-normal)'
                    }}>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.875rem' }} className="animate-fade-in">
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient ID</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                              <Hash size={14} style={{ color: 'var(--color-primary)' }} />
                              {patient.id}
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Insurance</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                              <Wallet size={14} style={{ color: 'var(--color-primary)' }} />
                              {patient.insurance_id || 'N/A'}
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DOB</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                              <Calendar size={14} style={{ color: 'var(--color-primary)' }} />
                              {new Date(patient.dob).toLocaleDateString('en-IN')}
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gender</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                              <User size={14} style={{ color: 'var(--color-primary)' }} />
                              {patient.gender}
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1' }}>
                            <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hospital</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                              <Hospital size={14} style={{ color: 'var(--color-primary)' }} />
                              {patient.hospital_name || `#${patient.hospital_id}`}
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1' }}>
                            <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                              <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
                              {patient.location || 'N/A'}
                            </div>
                          </div>
                          
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
