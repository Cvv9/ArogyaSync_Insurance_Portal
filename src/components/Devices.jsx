import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, User, Activity, FileText, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import '../App.css';

const NextPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { records = [], patientName, patientDob } = location.state || {};
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleExpand = (id) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  if (!records || records.length === 0) {
    return (
      <div className="app-container flex-center">
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', padding: '24px', borderRadius: '50%', border: '1px solid var(--color-border)', marginBottom: '24px' }}>
            <FileText size={48} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', fontWeight: 600 }}>No Records Available</h2>
          <p className="text-muted" style={{ marginBottom: '32px', lineHeight: 1.6 }}>We couldn't find any vital records for the selected patient. Please verify the details or try again.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Return to Verification
          </button>
        </div>
      </div>
    );
  }

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
          
          <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'transparent', color: 'var(--color-text-muted)', border: '1px solid transparent', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', textAlign: 'left', fontWeight: 500, transition: 'all 0.2s' }} onClick={() => navigate('/')} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>
            <Activity size={18} /> Dashboard
          </button>
          
          <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--color-primary-glow)', color: 'var(--color-primary)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', textAlign: 'left', fontWeight: 500, transition: 'all 0.2s' }}>
            <FileText size={18} /> Records
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        <header className="page-header">
          <div>
            <h2 className="text-gradient" style={{ fontSize: '1.5rem', margin: 0 }}>Patient Vitals Records</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-main)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px', border: '1px solid var(--color-border)' }}>
                Name: <strong style={{ color: '#fff' }}>{patientName}</strong>
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-main)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px', border: '1px solid var(--color-border)' }}>
                DOB: <strong style={{ color: '#fff' }}>{patientDob}</strong>
              </span>
            </div>
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
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '20px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600 }}>#</th>
                    <th style={{ padding: '20px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600 }}>Device ID</th>
                    <th style={{ padding: '20px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '20px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600 }}>Checked At</th>
                    <th style={{ padding: '20px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600 }}>Recorded Time</th>
                    <th style={{ padding: '20px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Vitals</th>
                    <th style={{ padding: '20px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600 }}>Mismatches</th>
                    <th style={{ padding: '20px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec, i) => (
                    <React.Fragment key={rec.id}>
                      <tr style={{ 
                        borderBottom: '1px solid var(--color-border)', 
                        background: expandedRow === rec.id ? 'rgba(255,255,255,0.02)' : 'transparent',
                        transition: 'background 0.2s',
                        cursor: rec.status === 'mismatch' ? 'pointer' : 'default'
                      }}
                      onClick={() => rec.status === 'mismatch' && toggleExpand(rec.id)}
                      onMouseOver={e => rec.status === 'mismatch' && !expandedRow && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseOut={e => { if(expandedRow !== rec.id) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '20px 24px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{i + 1}</td>
                        <td style={{ padding: '20px 24px', fontSize: '0.875rem', fontWeight: 500, color: '#fff' }}>{rec.deviceId}</td>
                        <td style={{ padding: '20px 24px' }}>
                          <span className={`badge ${rec.status === 'match' ? 'badge-success' : 'badge-danger'}`}>
                            {rec.status}
                          </span>
                        </td>
                        <td style={{ padding: '20px 24px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                          {new Date(rec.checkedAt).toLocaleDateString()} <span style={{ opacity: 0.5 }}>{new Date(rec.checkedAt).toLocaleTimeString()}</span>
                        </td>
                        <td style={{ padding: '20px 24px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                          {new Date(rec.recordedTimeStamp).toLocaleDateString()} <span style={{ opacity: 0.5 }}>{new Date(rec.recordedTimeStamp).toLocaleTimeString()}</span>
                        </td>
                        <td style={{ padding: '20px 24px', fontSize: '0.875rem', color: '#fff' }}>{rec.totalNoOfVitals}</td>
                        <td style={{ padding: '20px 24px', fontSize: '0.875rem' }}>
                          {rec.NoOfMismatch > 0 ? (
                            <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{rec.NoOfMismatch}</span>
                          ) : (
                            <span style={{ color: 'var(--color-success)', opacity: 0.7 }}>0</span>
                          )}
                        </td>
                        <td style={{ padding: '20px 24px' }}>
                          {rec.status === 'mismatch' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleExpand(rec.id); }}
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                              onMouseOver={e => e.currentTarget.style.textShadow = '0 0 8px var(--color-primary-glow)'}
                              onMouseOut={e => e.currentTarget.style.textShadow = 'none'}
                            >
                              Details
                              {expandedRow === rec.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          )}
                        </td>
                      </tr>

                      {expandedRow === rec.id && (
                        <tr className="animate-fade-in" style={{ background: 'rgba(0,0,0,0.2)' }}>
                          <td colSpan="8" style={{ padding: '0' }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)', borderLeft: '4px solid var(--color-danger)' }}>
                              <div className="glass-card" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)', marginBottom: '20px' }}>
                                  <AlertCircle size={20} />
                                  <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Vital Discrepancies Detected</h4>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) 1fr 1fr', padding: '0 16px 8px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div>Vital Name</div>
                                    <div>Database Record</div>
                                    <div>Device Input (CSV)</div>
                                  </div>

                                  {Object.entries(rec.mismatchvitals || {}).map(([vitalName, values]) => (
                                    <div
                                      key={vitalName}
                                      style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) 1fr 1fr', alignItems: 'center', padding: '12px 16px', background: 'rgba(10, 15, 28, 0.5)', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(255,255,255,0.05)' }}
                                    >
                                      <div style={{ textTransform: 'capitalize', fontWeight: 500, color: '#fff', fontSize: '0.875rem' }}>
                                        {vitalName.replace(/_/g, ' ')}
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }}></div>
                                        <span style={{ color: 'var(--color-text-muted)' }}>{values.db}</span>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-danger)' }}></div>
                                        <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{values.csv}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NextPage;
