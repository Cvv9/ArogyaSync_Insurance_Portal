// src/components/FraudResults.jsx — Fraud scan results table + Vital Explorer with on-demand CSV comparison
import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  FileWarning,
  Download,
  Search,
  Loader2,
  Database,
  FileSearch,
} from 'lucide-react';
import { getPatientVitals, compareVital } from '../api';

/* ─── Shared sub-components ─── */

function StatusBadge({ status }) {
  const isMatch = status === 'match';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
        ${isMatch
          ? 'bg-accent-green/15 text-accent-green'
          : 'bg-accent-red/15 text-accent-red'
        }`}
    >
      {isMatch ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
      {isMatch ? 'Match' : 'Mismatch'}
    </span>
  );
}

function DeviationBar({ label, csvVal, dbVal }) {
  const csv = parseFloat(csvVal);
  const db = parseFloat(dbVal);
  const bothNumeric = !isNaN(csv) && !isNaN(db) && db !== 0;

  const deviationPct = bothNumeric ? Math.abs(((csv - db) / db) * 100) : 0;
  const barColor = deviationPct > 20 ? 'bg-accent-red' : deviationPct > 10 ? 'bg-accent-amber' : 'bg-accent-cyan';
  const barWidth = bothNumeric ? Math.min(deviationPct, 100) : 0;

  return (
    <div className="bg-surface-card border border-border-subtle rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-text-light capitalize">
          {label.replace(/_/g, ' ')}
        </span>
        {bothNumeric && (
          <span className={`text-[10px] font-semibold ${deviationPct > 20 ? 'text-accent-red' : deviationPct > 10 ? 'text-accent-amber' : 'text-accent-cyan'}`}>
            {deviationPct.toFixed(1)}% deviation
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs mb-2">
        <div className="flex-1">
          <span className="text-text-muted text-[10px] block mb-0.5">CSV Value</span>
          <span className="text-accent-cyan font-mono font-semibold">{csvVal}</span>
        </div>
        <div className="w-px h-6 bg-border-glass" />
        <div className="flex-1">
          <span className="text-text-muted text-[10px] block mb-0.5">DB Value</span>
          <span className="text-accent-red font-mono font-semibold">{dbVal}</span>
        </div>
      </div>
      {bothNumeric && (
        <div className="h-1.5 bg-surface-darker rounded-full overflow-hidden">
          <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${barWidth}%` }} />
        </div>
      )}
    </div>
  );
}

function ComparisonDetail({ comparedFields, mismatchVitals, status }) {
  const hasCompared = comparedFields && Object.keys(comparedFields).length > 0;
  const hasMismatch = mismatchVitals && Object.keys(mismatchVitals).length > 0;

  if (!hasCompared && !hasMismatch) {
    return (
      <div className="bg-surface-darker border border-border-glass rounded-lg p-4 mt-2 text-center">
        <CheckCircle2 className="w-5 h-5 text-accent-green mx-auto mb-1.5" />
        <p className="text-xs text-text-muted">All vitals verified — no detailed data stored for this scan.</p>
      </div>
    );
  }

  // Legacy record: only mismatch data
  if (!hasCompared && hasMismatch) {
    return (
      <div className="bg-surface-darker border border-accent-red/20 rounded-lg p-4 mt-2">
        <h4 className="text-xs font-semibold text-accent-red flex items-center gap-1.5 mb-3">
          <FileWarning className="w-3.5 h-3.5" />
          Mismatched Vitals — {Object.keys(mismatchVitals).length} field{Object.keys(mismatchVitals).length !== 1 ? 's' : ''}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(mismatchVitals).map(([vitalName, values]) => (
            <DeviationBar key={vitalName} label={vitalName} csvVal={values.csv} dbVal={values.db} />
          ))}
        </div>
      </div>
    );
  }

  // Full comparison view — all fields
  const isMatch = status === 'match';
  const borderColor = isMatch ? 'border-accent-green/20' : 'border-accent-red/20';
  const matchedCount = Object.values(comparedFields).filter(v => v.match === true).length;
  const mismatchedCount = Object.values(comparedFields).filter(v => v.match === false).length;

  return (
    <div className={`bg-surface-darker border ${borderColor} rounded-lg p-4 mt-2`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`text-xs font-semibold flex items-center gap-1.5 ${isMatch ? 'text-accent-green' : 'text-accent-red'}`}>
          {isMatch ? <CheckCircle2 className="w-3.5 h-3.5" /> : <FileWarning className="w-3.5 h-3.5" />}
          Vital Comparison — {matchedCount} matched{mismatchedCount > 0 ? `, ${mismatchedCount} mismatched` : ''}
        </h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {Object.entries(comparedFields).map(([field, values]) => {
          const fieldMatch = values.match;
          if (fieldMatch === false) {
            return <DeviationBar key={field} label={field} csvVal={values.csv} dbVal={values.db} />;
          }
          return (
            <div key={field} className="bg-surface-card border border-border-subtle rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-text-light capitalize">
                  {field.replace(/_/g, ' ')}
                </span>
                <CheckCircle2 className="w-3 h-3 text-accent-green" />
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex-1">
                  <span className="text-text-muted text-[10px] block mb-0.5">CSV (Cold)</span>
                  <span className="text-accent-cyan font-mono font-semibold">{values.csv ?? '—'}</span>
                </div>
                <div className="w-px h-6 bg-border-glass" />
                <div className="flex-1">
                  <span className="text-text-muted text-[10px] block mb-0.5">DB (Hot)</span>
                  <span className="text-text-light font-mono font-semibold">{values.db ?? '—'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── CSV Export ─── */

function exportToCSV(records, patientName) {
  const headers = ['#', 'Device ID', 'Status', 'Checked At', 'Recorded At', 'Total Vitals', 'Mismatches', 'Mismatched Fields'];
  const rows = records.map((rec, i) => [
    i + 1,
    rec.deviceId || '',
    rec.status || '',
    rec.checkedAt ? new Date(rec.checkedAt).toISOString() : '',
    rec.recordedTimeStamp ? new Date(rec.recordedTimeStamp).toISOString() : '',
    rec.totalNoOfVitals || 0,
    rec.NoOfMismatch || 0,
    rec.mismatchvitals ? Object.keys(rec.mismatchvitals).join('; ') : '',
  ]);

  const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fraud-scan-${(patientName || 'report').replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Vital Explorer ─── */

function VitalExplorer({ patientId }) {
  const [vitals, setVitals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [comparingId, setComparingId] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);

  const fetchVitals = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const data = await getPatientVitals(patientId, page, 10);
      setVitals(data.data || []);
      setPagination(data.pagination || { page: 1, total_pages: 1, total: 0 });
    } catch (err) {
      setError(err.message || 'Failed to load vitals');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) fetchVitals(1);
  }, [patientId, fetchVitals]);

  const handleCompare = async (vital) => {
    setComparingId(vital.id);
    setComparisonResult(null);
    try {
      const result = await compareVital({
        record_time: vital.record_time,
        sensor_id: vital.sensor_id,
      });
      setComparisonResult(result);
    } catch (err) {
      setComparisonResult({ error: err.message });
    } finally {
      setComparingId(null);
    }
  };

  if (!patientId) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 id="vital-explorer-heading" className="text-lg font-semibold text-text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-accent-cyan" aria-hidden="true" />
            Vital Explorer
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Browse raw vitals from the database and compare any record against its CSV backup.
          </p>
        </div>
        {pagination.total > 0 && (
          <span className="text-xs text-text-muted" aria-live="polite">{pagination.total} records</span>
        )}
      </div>

      <section className="bg-surface-card border border-border-glass rounded-xl overflow-hidden shadow-card" aria-labelledby="vital-explorer-heading">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-accent-cyan animate-spin" />
            <span className="ml-2 text-sm text-text-muted">Loading vitals...</span>
          </div>
        ) : error ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-accent-red">{error}</p>
            <button onClick={() => fetchVitals(1)} className="mt-2 text-xs text-accent-cyan hover:underline">
              Retry
            </button>
          </div>
        ) : vitals.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <Database className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-muted">No vitals found for this patient.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-glass bg-surface-dark/50">
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Recorded At</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Device</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">HR</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">SpO2</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">BP</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Temp</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">RR</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {vitals.map((v) => (
                    <tr key={v.id} className="group hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-text-muted text-xs">
                        {new Date(v.record_time).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-text-light text-xs">{v.sensor_id ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-text-light text-xs">{v.heart_rate ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-text-light text-xs">{v.sp_o2 ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-text-light text-xs">{v.blood_pressure ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-text-light text-xs">{v.temperature ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-text-light text-xs">{v.respiration ?? '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleCompare(v)}
                          disabled={comparingId === v.id}
                          aria-label={comparingId === v.id ? "Comparing vital record against CSV" : "Compare this vital record against CSV backup"}
                          className="flex items-center gap-1 text-xs text-accent-cyan hover:text-accent-cyan/80
                            font-medium transition-colors disabled:opacity-50"
                        >
                          {comparingId === v.id ? (
                            <><Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" /> Checking...</>
                          ) : (
                            <><FileSearch className="w-3 h-3" aria-hidden="true" /> Compare</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <nav className="flex items-center justify-between px-4 py-3 border-t border-border-glass" aria-label="Vital records pagination">
                <span className="text-xs text-text-muted" aria-live="polite">
                  Page {pagination.page} of {pagination.total_pages}
                </span>
                <div className="flex gap-1" role="group">
                  <button
                    onClick={() => fetchVitals(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    aria-label="Previous page"
                    className="p-1.5 rounded-md text-text-muted hover:text-text-light hover:bg-white/5
                      disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => fetchVitals(pagination.page + 1)}
                    disabled={pagination.page >= pagination.total_pages}
                    aria-label="Next page"
                    className="p-1.5 rounded-md text-text-muted hover:text-text-light hover:bg-white/5
                      disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </nav>
            )}
          </>
        )}

        {/* On-demand comparison result */}
        {comparisonResult && (
          <div className="border-t border-border-glass px-4 py-4">
            {comparisonResult.error ? (
              <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-3 text-center">
                <p className="text-xs text-accent-red">{comparisonResult.error}</p>
              </div>
            ) : comparisonResult.comparison ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-text-white flex items-center gap-1.5">
                    <FileSearch className="w-3.5 h-3.5 text-accent-cyan" />
                    On-Demand Comparison Result
                    {comparisonResult.csv_file && (
                      <span className="text-text-muted font-normal ml-2">
                        CSV: {comparisonResult.csv_file}
                      </span>
                    )}
                  </h4>
                  <StatusBadge status={comparisonResult.status} />
                </div>
                <ComparisonDetail
                  comparedFields={comparisonResult.comparison}
                  status={comparisonResult.status}
                />
                <button
                  onClick={() => setComparisonResult(null)}
                  className="mt-3 text-xs text-text-muted hover:text-text-light transition-colors"
                >
                  Dismiss
                </button>
              </div>
            ) : (
              <div className="bg-surface-darker border border-border-glass rounded-lg p-4 text-center">
                <Search className="w-5 h-5 text-text-muted mx-auto mb-1.5" />
                <p className="text-xs text-text-muted">
                  {comparisonResult.message || 'No matching CSV record found for this vital.'}
                </p>
                <p className="text-[10px] text-text-muted mt-1">
                  The DB record exists but no corresponding row was found in any CSV file.
                </p>
                <button
                  onClick={() => setComparisonResult(null)}
                  className="mt-3 text-xs text-text-muted hover:text-text-light transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

/* ─── Main Component ─── */

export default function FraudResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { records = [], patientId, patientName, patientDob } = location.state || {};
  const [expandedRow, setExpandedRow] = useState(null);

  if (!location.state || records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileWarning className="w-12 h-12 text-text-muted mb-4" />
        <h2 className="text-lg font-medium text-text-white mb-2">No Records Available</h2>
        <p className="text-sm text-text-muted mb-6">
          Search for a patient first to view their fraud scan results.
        </p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-white rounded-lg text-sm font-medium
            hover:bg-accent-cyan/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go to Patient Lookup
        </button>
      </div>
    );
  }

  const totalScans = records.length;
  const mismatches = records.filter((r) => r.status === 'mismatch').length;
  const matchRateValue = totalScans > 0 ? ((totalScans - mismatches) / totalScans) * 100 : 0;
  const matchRate = matchRateValue.toFixed(1);

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-accent-cyan transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Lookup
          </button>
          <h1 className="text-xl font-semibold text-text-white">Fraud Scan Results</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Patient: <span className="text-text-light font-medium">{patientName}</span>
            {patientDob && <> &middot; DOB: <span className="text-text-light">{patientDob}</span></>}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Summary pills */}
          <div className="flex gap-3">
            <div className="px-3 py-1.5 bg-surface-card border border-border-glass rounded-lg text-center">
              <div className="text-lg font-semibold text-text-white">{totalScans}</div>
              <div className="text-[10px] text-text-muted uppercase tracking-wide">Scans</div>
            </div>
            <div className="px-3 py-1.5 bg-surface-card border border-border-glass rounded-lg text-center">
              <div className={`text-lg font-semibold ${mismatches > 0 ? 'text-accent-red' : 'text-accent-green'}`}>
                {mismatches}
              </div>
              <div className="text-[10px] text-text-muted uppercase tracking-wide">Mismatches</div>
            </div>
            <div className="px-3 py-1.5 bg-surface-card border border-border-glass rounded-lg text-center">
              <div className={`text-lg font-semibold ${matchRateValue >= 90 ? 'text-accent-green' : 'text-accent-amber'}`}>
                {matchRate}%
              </div>
              <div className="text-[10px] text-text-muted uppercase tracking-wide">Match Rate</div>
            </div>
          </div>

          {/* CSV export */}
          <button
            onClick={() => exportToCSV(records, patientName)}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface-card border border-border-glass rounded-lg
              text-xs text-text-muted hover:text-accent-cyan hover:border-accent-cyan/30 transition-colors"
            title="Export as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Results table */}
      <div className="bg-surface-card border border-border-glass rounded-xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-glass bg-surface-dark/50">
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">#</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Device ID</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Checked At</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Recorded</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Vitals</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Mismatches</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {records.map((rec, i) => {
                const isExpanded = expandedRow === rec.id;
                return (
                  <tr key={rec.id} className="group">
                    <td className="px-4 py-3 text-text-muted">{i + 1}</td>
                    <td className="px-4 py-3 font-mono text-text-light text-xs">{rec.deviceId || <span className="text-text-muted italic">—</span>}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={rec.status} />
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs">
                      {new Date(rec.checkedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs">
                      {new Date(rec.recordedTimeStamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-text-light">{rec.totalNoOfVitals}</td>
                    <td className="px-4 py-3">
                      {rec.NoOfMismatch > 0 ? (
                        <span className="text-accent-red font-semibold">{rec.NoOfMismatch}</span>
                      ) : (
                        <span className="text-accent-green">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setExpandedRow(isExpanded ? null : rec.id)}
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? "Hide comparison details" : "View comparison details"}
                        className="flex items-center gap-1 text-xs text-accent-cyan hover:text-accent-cyan/80 font-medium transition-colors"
                      >
                        {isExpanded ? 'Hide' : 'View'}
                        {isExpanded ? <ChevronUp className="w-3 h-3" aria-hidden="true" /> : <ChevronDown className="w-3 h-3" aria-hidden="true" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Expanded comparison detail — rendered outside table to avoid invalid HTML */}
        {expandedRow && (() => {
          const rec = records.find(r => r.id === expandedRow);
          if (!rec) return null;
          return (
            <div className="border-t border-border-glass px-4 py-3">
              <ComparisonDetail
                comparedFields={rec.comparedFields}
                mismatchVitals={rec.mismatchvitals}
                status={rec.status}
              />
            </div>
          );
        })()}
      </div>

      {/* Vital Explorer — on-demand comparison */}
      <VitalExplorer patientId={patientId} />
    </div>
  );
}
