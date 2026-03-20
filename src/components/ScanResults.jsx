// src/components/ScanResults.jsx — Comprehensive scan results with metrics and detailed comparison
import { useState, useMemo, useCallback, Fragment } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { compareVital } from '../api';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  BarChart3,
  FileCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Filter,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

const FRAUD_LEVEL_CONFIG = {
  verified_clean: {
    label: 'Verified Clean',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    iconBg: 'bg-green-500/20',
    Icon: ShieldCheck,
  },
  low_risk: {
    label: 'Low Risk',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    iconBg: 'bg-green-500/20',
    Icon: ShieldCheck,
  },
  medium_risk: {
    label: 'Medium Risk',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    iconBg: 'bg-yellow-500/20',
    Icon: ShieldAlert,
  },
  high_risk: {
    label: 'High Risk',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    iconBg: 'bg-orange-500/20',
    Icon: ShieldAlert,
  },
  critical_risk: {
    label: 'Critical Risk',
    color: 'text-accent-red',
    bg: 'bg-accent-red/10',
    border: 'border-accent-red/30',
    iconBg: 'bg-accent-red/20',
    Icon: ShieldAlert,
  },
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Records' },
  { value: 'match', label: 'Matches', color: 'text-green-400', activeBg: 'bg-green-500/20 border-green-500/40 text-green-400' },
  { value: 'mismatch', label: 'Mismatches', color: 'text-accent-red', activeBg: 'bg-accent-red/20 border-accent-red/40 text-accent-red' },
  { value: 'csv_missing', label: 'CSV Missing', color: 'text-yellow-400', activeBg: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400' },
  { value: 'csv_pending', label: 'Pending', color: 'text-blue-400', activeBg: 'bg-blue-500/20 border-blue-500/40 text-blue-400' },
];

export default function ScanResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { scanResults } = location.state || {};

  // All hooks must be called before any conditional returns (Rules of Hooks)
  const [filter, setFilter] = useState({ from: '', to: '', status: 'all' });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [fetchedComparisons, setFetchedComparisons] = useState({});
  const [loadingComparisons, setLoadingComparisons] = useState(new Set());

  // Extract values safely with defaults to prevent destructuring errors when scanResults is null
  const {
    patientId = null,
    totalScans = 0,
    matches = 0,
    mismatches = 0,
    csvMissing = 0,
    matchRate = 0,
    fraudScore = 0,
    fraudLevel = 'low_risk',
    csvCoverage = 0,
    details = [],
  } = scanResults || {};

  const fraudCfg = FRAUD_LEVEL_CONFIG[fraudLevel] ?? FRAUD_LEVEL_CONFIG.low_risk;

  // Count active filters for the badge
  const activeFilterCount = (filter.from ? 1 : 0) + (filter.to ? 1 : 0) + (filter.status !== 'all' ? 1 : 0);

  // Counts per status for the pill labels
  const statusCounts = useMemo(() => ({
    match: details.filter(r => r.status === 'match').length,
    mismatch: details.filter(r => r.status === 'mismatch').length,
    csv_missing: details.filter(r => r.status === 'csv_missing').length,
    csv_pending: details.filter(r => r.status === 'csv_pending').length,
  }), [details]);

  const PAGE_SIZE = 50;

  // Update a filter field, reset page + expanded rows
  const handleFilterChange = (updates) => {
    setFilter(prev => ({ ...prev, ...updates }));
    setCurrentPage(1);
    setExpandedRows(new Set());
  };

  const clearAllFilters = () => {
    setFilter({ from: '', to: '', status: 'all' });
    setCurrentPage(1);
    setExpandedRows(new Set());
  };

  // Apply all active filters
  const filteredDetails = useMemo(() => {
    if (!scanResults) return [];
    return details.filter((record) => {
      // Status filter
      if (filter.status !== 'all' && record.status !== filter.status) return false;
      // Date/time range filter — compare UTC timestamps directly (browser localises datetime-local input)
      if (filter.from || filter.to) {
        const recordMs = new Date(record.recordTime).getTime();
        if (filter.from && recordMs < new Date(filter.from).getTime()) return false;
        if (filter.to && recordMs > new Date(filter.to).getTime()) return false;
      }
      return true;
    });
  }, [details, filter, scanResults]);

  const totalPages = Math.max(1, Math.ceil(filteredDetails.length / PAGE_SIZE));
  const paginatedDetails = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredDetails.slice(start, start + PAGE_SIZE);
  }, [filteredDetails, currentPage]);

  // Filtered summary stats
  const filteredStats = useMemo(() => {
    const f = {
      total: filteredDetails.length,
      matches: filteredDetails.filter(r => r.status === 'match').length,
      mismatches: filteredDetails.filter(r => r.status === 'mismatch').length,
      csvMissing: filteredDetails.filter(r => r.status === 'csv_missing').length,
    };
    const verified = f.matches + f.mismatches;
    f.matchRate = verified > 0 ? ((f.matches / verified) * 100).toFixed(2) : 0;
    return f;
  }, [filteredDetails]);

  const toggleRow = useCallback(async (globalIndex, record) => {
    const next = new Set(expandedRows);
    if (next.has(globalIndex)) {
      next.delete(globalIndex);
      setExpandedRows(next);
      return;
    }
    next.add(globalIndex);
    setExpandedRows(next);

    // If comparison data is already inline (mismatches) or previously fetched, nothing to do
    if (record.comparison || fetchedComparisons[globalIndex]) return;
    // csv_missing / csv_pending have no comparison data to fetch
    if (record.status === 'csv_missing' || record.status === 'csv_pending') return;

    // Fetch comparison on-demand for match records
    setLoadingComparisons(prev => new Set(prev).add(globalIndex));
    try {
      const result = await compareVital({ record_time: record.recordTime, sensor_id: record.sensorId });
      if (result?.comparison) {
        setFetchedComparisons(prev => ({ ...prev, [globalIndex]: result.comparison }));
      }
    } catch {
      // Silently fail — row will show "Details unavailable"
    } finally {
      setLoadingComparisons(prev => { const s = new Set(prev); s.delete(globalIndex); return s; });
    }
  }, [expandedRows, fetchedComparisons]);

  const getStatusBadge = (status) => {
    if (status === 'match') return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-400">
        <CheckCircle2 className="w-3 h-3" /> Match
      </span>
    );
    if (status === 'mismatch') return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent-red-light border border-accent-red/30 rounded text-xs text-accent-red">
        <XCircle className="w-3 h-3" /> Mismatch
      </span>
    );
    if (status === 'csv_missing') return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-400">
        <AlertTriangle className="w-3 h-3" /> CSV Missing
      </span>
    );
    if (status === 'csv_pending') return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400">
        <AlertTriangle className="w-3 h-3" /> Pending Upload
      </span>
    );
    return null;
  };

  const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  // Redirect if no scan results (after all hooks have been called)
  if (!scanResults) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-text-muted">No scan results available.</p>
        <Link to="/patient-lookup" className="text-accent-cyan hover:underline mt-2 inline-block">
          Return to Patient Lookup
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/patient-lookup')}
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent-cyan transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </button>
        <h1 className="text-xl font-semibold text-text-white">Verification Scan Results</h1>
        <p className="text-sm text-text-muted mt-1">
          Patient ID: {patientId} • Scanned {totalScans.toLocaleString()} vitals
        </p>
      </div>

      {/* Fraud Risk Assessment Banner */}
      <div className={`rounded-xl border ${fraudCfg.bg} ${fraudCfg.border} p-4 mb-6 flex items-center justify-between gap-4`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${fraudCfg.iconBg}`}>
            <fraudCfg.Icon className={`w-5 h-5 ${fraudCfg.color}`} />
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-semibold ${fraudCfg.color}`}>{fraudCfg.label}</p>
            <p className="text-xs text-text-muted mt-0.5">
              {mismatches} mismatch{mismatches !== 1 ? 'es' : ''} in {(matches + mismatches).toLocaleString()} verified records
              {csvCoverage < 100 && <> · {csvCoverage}% verifiable</>}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`text-3xl font-bold leading-none ${fraudCfg.color}`}>{fraudScore}%</p>
          <p className="text-xs text-text-muted mt-1">fraud score</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-surface-card border border-border-glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-muted uppercase">Total Scans</span>
            <BarChart3 className="w-4 h-4 text-accent-cyan" />
          </div>
          <p className="text-2xl font-bold text-text-white">{totalScans.toLocaleString()}</p>
        </div>
        <div className="bg-surface-card border border-border-glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-muted uppercase">Matches</span>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-400">{matches.toLocaleString()}</p>
        </div>
        <div className="bg-surface-card border border-border-glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-muted uppercase">Mismatches</span>
            <XCircle className="w-4 h-4 text-accent-red" />
          </div>
          <p className="text-2xl font-bold text-accent-red">{mismatches.toLocaleString()}</p>
        </div>
        <div className="bg-surface-card border border-border-glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-muted uppercase">CSV Missing</span>
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-yellow-400">{csvMissing.toLocaleString()}</p>
        </div>
        <div className="bg-surface-card border border-border-glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-muted uppercase">Match Rate</span>
            <FileCheck className="w-4 h-4 text-accent-cyan" />
          </div>
          <p className="text-2xl font-bold text-text-white">{matchRate}%</p>
          <p className="text-xs text-text-muted mt-1">of verified records</p>
        </div>
      </div>

      {/* Verification Accounting Breakdown */}
      {csvMissing > 0 && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs mb-6 px-1">
          <span className="text-green-400 font-medium">{matches.toLocaleString()} verified matches</span>
          <span className="text-text-muted">+</span>
          <span className={`font-medium ${mismatches > 0 ? 'text-accent-red' : 'text-text-muted'}`}>{mismatches.toLocaleString()} mismatches</span>
          <span className="text-text-muted">+</span>
          <span className="text-yellow-400 font-medium">{csvMissing.toLocaleString()} unverifiable (CSV not in S3)</span>
          <span className="text-text-muted">=</span>
          <span className="text-text-white font-medium">{totalScans.toLocaleString()} total scans</span>
          <span className="text-text-muted/60 ml-1">· Match rate only counts verified records</span>
        </div>
      )}

      {/* Filter Panel */}
      <div className="bg-surface-card border border-border-glass rounded-xl p-4 mb-6">
        {/* Toggle button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-accent-cyan" />
            <span className="text-sm font-medium text-text-white">Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 bg-accent-cyan/20 border border-accent-cyan/30 rounded text-xs text-accent-cyan font-medium">
                {activeFilterCount} active
              </span>
            )}
          </div>
          {showFilters ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
        </button>

        {showFilters && (
          <div className="mt-4 space-y-5">
            {/* Status filter pills */}
            <div>
              <label className="block text-xs font-medium text-text-light mb-2">Filter by Status</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(opt => {
                  const count = opt.value !== 'all' ? statusCounts[opt.value] ?? 0 : details.length;
                  const isActive = filter.status === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleFilterChange({ status: opt.value })}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        isActive
                          ? (opt.activeBg || 'bg-accent-cyan/20 border-accent-cyan/40 text-accent-cyan')
                          : 'bg-surface-darker border-border-glass text-text-muted hover:text-text-white hover:border-border-glass/80'
                      }`}
                    >
                      {opt.label}
                      <span className={`px-1 py-0.5 rounded text-xs ${isActive ? 'opacity-80' : 'opacity-50'} bg-black/20`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date + Time range */}
            <div>
              <label className="block text-xs font-medium text-text-light mb-2">Filter by Date &amp; Time</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1">From</label>
                  <input
                    type="datetime-local"
                    value={filter.from}
                    onChange={e => handleFilterChange({ from: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-darker border border-border-glass rounded-lg text-text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/40"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">To</label>
                  <input
                    type="datetime-local"
                    value={filter.to}
                    onChange={e => handleFilterChange({ to: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-darker border border-border-glass rounded-lg text-text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/40"
                  />
                </div>
              </div>
            </div>

            {/* Clear all */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-surface-darker border border-border-glass rounded-lg text-text-white text-sm hover:bg-surface-card transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Filtered summary — shown when any filter is active */}
        {activeFilterCount > 0 && (
          <div className={`${showFilters ? 'mt-4' : 'mt-3'} pt-3 border-t border-border-glass`}>
            <p className="text-xs text-text-muted mb-2">
              Showing {filteredDetails.length.toLocaleString()} of {details.length.toLocaleString()} records
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-text-white">Total: <strong>{filteredStats.total}</strong></span>
              <span className="text-green-400">Matches: <strong>{filteredStats.matches}</strong></span>
              <span className="text-accent-red">Mismatches: <strong>{filteredStats.mismatches}</strong></span>
              <span className="text-yellow-400">CSV Missing: <strong>{filteredStats.csvMissing}</strong></span>
              <span className="text-text-white">Match Rate: <strong>{filteredStats.matchRate}%</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Comparison Table */}
      <div className="bg-surface-card border border-border-glass rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border-glass">
          <h2 className="text-sm font-semibold text-text-white">Detailed Vital Comparison</h2>
          <p className="text-xs text-text-muted mt-0.5">Click any row to expand field-by-field comparison</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-darker">
              <tr className="text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Sensor ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">CSV File</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-glass">
              {filteredDetails.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-text-muted text-sm">
                    No records match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedDetails.map((record, pageIndex) => {
                  // Use a global index so expansion state persists correctly across pages
                  const globalIndex = (currentPage - 1) * PAGE_SIZE + pageIndex;
                  const isExpanded = expandedRows.has(globalIndex);
                  const comparisonData = record.comparison || fetchedComparisons[globalIndex];
                  const isLoading = loadingComparisons.has(globalIndex);
                  const canExpand = record.status === 'match' || record.status === 'mismatch';
                  return (
                    <Fragment key={globalIndex}>
                      <tr
                        className={`hover:bg-surface-darker/50 transition-colors cursor-pointer ${
                          record.status === 'mismatch' ? 'bg-accent-red-light/5' : ''
                        }`}
                        onClick={() => toggleRow(globalIndex, record)}
                      >
                        <td className="px-4 py-3 text-sm text-text-white">{formatTimestamp(record.recordTime)}</td>
                        <td className="px-4 py-3 text-sm text-text-light">{record.sensorId}</td>
                        <td className="px-4 py-3">{getStatusBadge(record.status)}</td>
                        <td className="px-4 py-3 text-xs text-text-muted font-mono">{record.csvFile || '—'}</td>
                        <td className="px-4 py-3 text-right">
                          {canExpand && (
                            <span className="text-accent-cyan hover:text-accent-cyan/80 text-xs">
                              {isLoading ? 'Loading...' : isExpanded ? 'Hide' : 'View'} Details
                            </span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && canExpand && (
                        <tr className="bg-surface-darker/30">
                          <td colSpan="5" className="px-4 py-4 border-t border-border-glass">
                            {isLoading ? (
                              <p className="text-xs text-text-muted text-center py-2">Fetching comparison data...</p>
                            ) : comparisonData ? (
                              <>
                                <h3 className="text-xs font-semibold text-text-white mb-3 uppercase tracking-wider">
                                  Field-by-Field Comparison
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {Object.entries(comparisonData).map(([field, data]) => {
                                    const isMismatch = data.match === false;
                                    return (
                                      <div
                                        key={field}
                                        className={`p-3 rounded-lg border ${
                                          isMismatch
                                            ? 'bg-accent-red-light/10 border-accent-red/30'
                                            : 'bg-surface-card border-border-glass'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs font-medium text-text-light uppercase">{field}</span>
                                          {data.match === true && <CheckCircle2 className="w-3 h-3 text-green-400" />}
                                          {isMismatch && <XCircle className="w-3 h-3 text-accent-red" />}
                                        </div>
                                        <div className="space-y-1.5">
                                          <div className="flex justify-between text-xs">
                                            <span className="text-text-muted">CSV:</span>
                                            <span className="text-text-white font-mono">{data.csv ?? '—'}</span>
                                          </div>
                                          <div className="flex justify-between text-xs">
                                            <span className="text-text-muted">DB:</span>
                                            <span className="text-text-white font-mono">{data.db ?? '—'}</span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </>
                            ) : (
                              <p className="text-xs text-text-muted text-center py-2">Details unavailable for this record.</p>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border-glass flex items-center justify-between">
            <span className="text-xs text-text-muted">
              {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, filteredDetails.length)} of {filteredDetails.length.toLocaleString()} records
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-xs bg-surface-darker border border-border-glass rounded text-text-white disabled:opacity-40 hover:bg-surface-card transition-colors"
              >
                Prev
              </button>
              <span className="text-xs text-text-muted">{currentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-xs bg-surface-darker border border-border-glass rounded text-text-white disabled:opacity-40 hover:bg-surface-card transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
