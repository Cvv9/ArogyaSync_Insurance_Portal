// src/components/FraudResults.jsx — Fraud scan results table with deviation visualization + CSV export
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  FileWarning,
  Download,
} from 'lucide-react';

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

function MismatchDetail({ vitals }) {
  if (!vitals || Object.keys(vitals).length === 0) return null;

  return (
    <div className="bg-surface-darker border border-accent-red/20 rounded-lg p-4 mt-2">
      <h4 className="text-xs font-semibold text-accent-red flex items-center gap-1.5 mb-3">
        <FileWarning className="w-3.5 h-3.5" />
        Mismatched Vitals — {Object.keys(vitals).length} field{Object.keys(vitals).length !== 1 ? 's' : ''}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {Object.entries(vitals).map(([vitalName, values]) => (
          <DeviationBar key={vitalName} label={vitalName} csvVal={values.csv} dbVal={values.db} />
        ))}
      </div>
    </div>
  );
}

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

export default function FraudResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { records = [], patientName, patientDob } = location.state || {};
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
  const matchRate = totalScans > 0 ? Math.round(((totalScans - mismatches) / totalScans) * 100) : 0;

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
              <div className={`text-lg font-semibold ${matchRate >= 90 ? 'text-accent-green' : 'text-accent-amber'}`}>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Device ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Checked At</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Recorded</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Vitals</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Mismatches</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {records.map((rec, i) => {
                const isExpanded = expandedRow === rec.id;
                return (
                  <tr key={rec.id} className="group">
                    <td className="px-4 py-3 text-text-muted">{i + 1}</td>
                    <td className="px-4 py-3 font-mono text-text-light text-xs">{rec.deviceId}</td>
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
                      {rec.status === 'mismatch' ? (
                        <button
                          onClick={() => setExpandedRow(isExpanded ? null : rec.id)}
                          className="flex items-center gap-1 text-xs text-accent-cyan hover:text-accent-cyan/80 font-medium transition-colors"
                        >
                          {isExpanded ? 'Hide' : 'Details'}
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      ) : (
                        <span className="text-xs text-text-muted">&mdash;</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Expanded mismatch detail — rendered outside table to avoid invalid HTML */}
        {expandedRow && (() => {
          const rec = records.find(r => r.id === expandedRow);
          if (!rec) return null;
          return (
            <div className="border-t border-border-glass px-4 py-3">
              <MismatchDetail vitals={rec.mismatchvitals} />
            </div>
          );
        })()}
      </div>
    </div>
  );
}
