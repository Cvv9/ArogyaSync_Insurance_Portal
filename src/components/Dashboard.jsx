// src/components/Dashboard.jsx — Analytics dashboard with patient listing
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Hospital,
  MapPin,
  Calendar,
  IdCard,
  Loader2,
  AlertCircle,
  Activity,
  BarChart3,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { getAllPatients, getAllTests, getStatsSummary } from '../api';

const COLOR_MAP = {
  'accent-cyan':  { bg: 'bg-accent-cyan-light', text: 'text-accent-cyan' },
  'accent-amber': { bg: 'bg-accent-amber/15',   text: 'text-accent-amber' },
  'accent-green': { bg: 'bg-accent-green/15',    text: 'text-accent-green' },
  'accent-red':   { bg: 'bg-accent-red/15',      text: 'text-accent-red' },
};

function StatCard({ icon: Icon, label, value, color = 'accent-cyan' }) {
  const c = COLOR_MAP[color] || COLOR_MAP['accent-cyan'];
  return (
    <div className="bg-surface-card border border-border-glass rounded-xl p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${c.text}`} />
      </div>
      <div>
        <div className="text-lg font-bold text-text-white">{value}</div>
        <div className="text-[11px] text-text-muted uppercase tracking-wide">{label}</div>
      </div>
    </div>
  );
}

function PatientDetailModal({ patient, onClose }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!patient) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getAllTests(patient.id);
        if (!cancelled) setTests(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [patient]);

  if (!patient) return null;

  const totalScans = tests.length;
  const mismatches = tests.filter(t => t.status === 'mismatch').length;
  const matchRate = totalScans > 0 ? Math.round(((totalScans - mismatches) / totalScans) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-surface-dark border border-border-glass rounded-2xl shadow-glass w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-glass">
          <div>
            <h2 className="text-base font-semibold text-text-white">{patient.name || 'Unknown'}</h2>
            <p className="text-xs text-text-muted mt-0.5">{patient.insurance_id || 'No Insurance ID'}</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Patient info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-surface-card border border-border-glass rounded-lg px-3 py-2.5">
              <span className="text-text-muted block mb-0.5">Date of Birth</span>
              <span className="text-text-light font-medium">
                {patient.dob ? new Date(patient.dob).toLocaleDateString('en-IN') : 'N/A'}
              </span>
            </div>
            <div className="bg-surface-card border border-border-glass rounded-lg px-3 py-2.5">
              <span className="text-text-muted block mb-0.5">Hospital</span>
              <span className="text-text-light font-medium">
                {patient.hospital_name || `#${patient.hospital_id}`}
              </span>
            </div>
            {patient.gender && (
              <div className="bg-surface-card border border-border-glass rounded-lg px-3 py-2.5">
                <span className="text-text-muted block mb-0.5">Gender</span>
                <span className="text-text-light font-medium capitalize">{patient.gender}</span>
              </div>
            )}
            {patient.location && (
              <div className="bg-surface-card border border-border-glass rounded-lg px-3 py-2.5">
                <span className="text-text-muted block mb-0.5">Location</span>
                <span className="text-text-light font-medium">{patient.location}</span>
              </div>
            )}
          </div>

          {/* Risk indicator */}
          {!loading && !error && totalScans > 0 && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
              mismatches === 0
                ? 'bg-accent-green/15 text-accent-green'
                : mismatches / totalScans >= 0.5
                  ? 'bg-accent-red/15 text-accent-red'
                  : 'bg-accent-amber/15 text-accent-amber'
            }`}>
              {mismatches === 0
                ? <><CheckCircle2 className="w-3.5 h-3.5" /> Low Risk — All scans matched</>
                : mismatches / totalScans >= 0.5
                  ? <><AlertTriangle className="w-3.5 h-3.5" /> High Risk — {Math.round((mismatches / totalScans) * 100)}% mismatch rate</>
                  : <><AlertTriangle className="w-3.5 h-3.5" /> Medium Risk — {mismatches} of {totalScans} scans mismatched</>
              }
            </div>
          )}

          {/* Scan summary */}
          <div>
            <h3 className="text-sm font-semibold text-text-white mb-3">Fraud Scan History</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-accent-cyan animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <AlertCircle className="w-8 h-8 text-accent-red mx-auto mb-2" />
                <p className="text-xs text-accent-red">{error}</p>
              </div>
            ) : totalScans === 0 ? (
              <div className="text-center py-6">
                <FileText className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-xs text-text-muted">No scan results found for this patient.</p>
              </div>
            ) : (
              <>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-surface-card border border-border-glass rounded-lg p-2.5 text-center">
                    <div className="text-base font-bold text-text-white">{totalScans}</div>
                    <div className="text-[10px] text-text-muted uppercase">Scans</div>
                  </div>
                  <div className="bg-surface-card border border-border-glass rounded-lg p-2.5 text-center">
                    <div className={`text-base font-bold ${mismatches > 0 ? 'text-accent-red' : 'text-accent-green'}`}>
                      {mismatches}
                    </div>
                    <div className="text-[10px] text-text-muted uppercase">Mismatches</div>
                  </div>
                  <div className="bg-surface-card border border-border-glass rounded-lg p-2.5 text-center">
                    <div className={`text-base font-bold ${matchRate >= 90 ? 'text-accent-green' : 'text-accent-amber'}`}>
                      {matchRate}%
                    </div>
                    <div className="text-[10px] text-text-muted uppercase">Match Rate</div>
                  </div>
                </div>

                {/* Recent scans list */}
                <div className="space-y-1.5">
                  {tests.slice(0, 10).map((test, i) => (
                    <div key={test.id || i}
                      className="flex items-center justify-between bg-surface-card border border-border-subtle rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        {test.status === 'match' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-accent-red" />
                        )}
                        <span className="text-xs text-text-light font-mono">{test.deviceId}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {test.NoOfMismatch > 0 && (
                          <span className="text-[10px] text-accent-red font-semibold">
                            {test.NoOfMismatch} mismatch{test.NoOfMismatch !== 1 ? 'es' : ''}
                          </span>
                        )}
                        <span className="text-[10px] text-text-muted">
                          {test.checkedAt ? new Date(test.checkedAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border-glass flex justify-end gap-2">
          <button onClick={onClose}
            className="px-3 py-1.5 text-xs text-text-muted hover:text-text-white transition">
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              navigate('/', { state: { prefill: { name: patient.name, insuranceId: patient.insurance_id } } });
            }}
            className="px-3 py-1.5 bg-accent-cyan text-white text-xs font-medium rounded-lg hover:bg-accent-cyan/90 transition flex items-center gap-1.5"
          >
            <Search className="w-3 h-3" />
            Run Lookup
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [patientData, summaryData] = await Promise.all([
          getAllPatients(),
          getStatsSummary().catch(() => null),
        ]);
        if (!cancelled) {
          setPatients(Array.isArray(patientData) ? patientData : []);
          setStats(summaryData);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.insurance_id || '').toLowerCase().includes(q) ||
      (p.id || '').toLowerCase().includes(q)
    );
  });

  if (loading) {
    const shimmer = 'animate-shimmer bg-gradient-to-r from-surface-card via-surface-card-hover to-surface-card bg-[length:200%_100%]';
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <div className={`h-6 w-32 rounded ${shimmer}`} />
            <div className={`h-4 w-48 rounded mt-2 ${shimmer}`} />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-surface-card border border-border-glass rounded-xl p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg ${shimmer}`} />
              <div className="flex-1">
                <div className={`h-5 w-12 rounded mb-1 ${shimmer}`} />
                <div className={`h-3 w-20 rounded ${shimmer}`} />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-surface-card border border-border-glass rounded-xl p-4">
              <div className={`h-4 w-3/4 rounded mb-3 ${shimmer}`} />
              <div className="space-y-2">
                <div className={`h-3 w-full rounded ${shimmer}`} />
                <div className={`h-3 w-2/3 rounded ${shimmer}`} />
                <div className={`h-3 w-5/6 rounded ${shimmer}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-10 h-10 text-accent-red mb-3" />
        <p className="text-sm text-accent-red">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-white">Dashboard</h1>
          <p className="text-sm text-text-muted mt-0.5">Insurance verification overview</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or ID..."
            className="w-full pl-9 pr-3 py-2 bg-surface-card border border-border-glass rounded-lg
              text-sm text-text-white placeholder:text-text-muted
              focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 focus:border-accent-cyan/60
              transition-colors"
          />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Users} label="Total Patients" value={stats?.total_patients ?? patients.length} color="accent-cyan" />
        <StatCard icon={BarChart3} label="Total Scans" value={stats?.total_records ?? '—'} color="accent-amber" />
        <StatCard icon={ShieldCheck} label="Match Rate" value={stats ? `${stats.match_rate}%` : '—'} color="accent-green" />
        <StatCard icon={ShieldAlert} label="Mismatch Rate" value={stats ? `${stats.mismatch_rate}%` : '—'} color="accent-red" />
      </div>

      {/* Patient grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="w-10 h-10 text-text-muted mb-3" />
          <p className="text-sm text-text-muted">
            {search ? 'No patients match your search.' : 'No patients registered yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((patient) => (
            <div
              key={patient.id}
              onClick={() => setSelectedPatient(patient)}
              className="bg-surface-card border border-border-glass rounded-xl p-4 cursor-pointer
                hover:border-accent-cyan/30 hover:shadow-card-hover transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-white group-hover:text-accent-cyan transition-colors truncate flex-1">
                  {patient.name || 'Unnamed Patient'}
                </h3>
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent-cyan transition-colors flex-shrink-0 ml-2" />
              </div>

              <div className="space-y-1.5 text-xs text-text-muted">
                <div className="flex items-center gap-2">
                  <IdCard className="w-3.5 h-3.5 text-accent-cyan/60" />
                  <span>{patient.insurance_id || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-accent-cyan/60" />
                  <span>{patient.dob ? new Date(patient.dob).toLocaleDateString('en-IN') : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hospital className="w-3.5 h-3.5 text-accent-cyan/60" />
                  <span>{patient.hospital_name || `Hospital #${patient.hospital_id}`}</span>
                </div>
                {patient.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-accent-cyan/60" />
                    <span>{patient.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient detail modal */}
      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
}
