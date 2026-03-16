// src/components/ScanResults.jsx — Comprehensive scan results with metrics and detailed comparison
import { useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Calendar,
  BarChart3,
  FileCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';

export default function ScanResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { scanResults, searchParams } = location.state || {};

  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 50;

  // Redirect if no scan results
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

  const {
    patientId,
    totalScans,
    matches,
    mismatches,
    csvMissing = 0,
    matchRate,
    dateRangeStart,
    dateRangeEnd,
    details = [],
  } = scanResults;

  // Filter details by date range
  const filteredDetails = useMemo(() => {
    if (!dateFilter.from && !dateFilter.to) return details;

    return details.filter((record) => {
      const recordDate = new Date(record.recordTime);
      const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
      const toDate = dateFilter.to ? new Date(dateFilter.to + 'T23:59:59') : null;

      if (fromDate && recordDate < fromDate) return false;
      if (toDate && recordDate > toDate) return false;
      return true;
    });
  }, [details, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredDetails.length / PAGE_SIZE));
  const paginatedDetails = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredDetails.slice(start, start + PAGE_SIZE);
  }, [filteredDetails, currentPage, PAGE_SIZE]);

  // Calculate filtered stats
  const filteredStats = useMemo(() => {
    const filtered = {
      total: filteredDetails.length,
      matches: filteredDetails.filter((r) => r.status === 'match').length,
      mismatches: filteredDetails.filter((r) => r.status === 'mismatch').length,
      csvMissing: filteredDetails.filter((r) => r.status === 'csv_missing').length,
    };
    filtered.matchRate = filtered.total > 0 ? ((filtered.matches / filtered.total) * 100).toFixed(2) : 0;
    return filtered;
  }, [filteredDetails]);

  const toggleRow = (index) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusBadge = (status) => {
    if (status === 'match') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-400">
          <CheckCircle2 className="w-3 h-3" />
          Match
        </span>
      );
    }
    if (status === 'mismatch') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent-red-light border border-accent-red/30 rounded text-xs text-accent-red">
          <XCircle className="w-3 h-3" />
          Mismatch
        </span>
      );
    }
    if (status === 'csv_missing') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-400">
          <AlertTriangle className="w-3 h-3" />
          CSV Missing
        </span>
      );
    }
    if (status === 'csv_pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400">
          <AlertTriangle className="w-3 h-3" />
          Pending Upload
        </span>
      );
    }
    return null;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-white">Verification Scan Results</h1>
            <p className="text-sm text-text-muted mt-1">
              Patient ID: {patientId} • Scanned {totalScans.toLocaleString()} vitals
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {/* Total Scans */}
        <div className="bg-surface-card border border-border-glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-muted uppercase">Total Scans</span>
            <BarChart3 className="w-4 h-4 text-accent-cyan" />
          </div>
          <p className="text-2xl font-bold text-text-white">{totalScans.toLocaleString()}</p>
        </div>

        {/* Matches */}
        <div className="bg-surface-card border border-border-glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-muted uppercase">Matches</span>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-400">{matches.toLocaleString()}</p>
        </div>

        {/* Mismatches */}
        <div className="bg-surface-card border border-border-glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-muted uppercase">Mismatches</span>
            <XCircle className="w-4 h-4 text-accent-red" />
          </div>
          <p className="text-2xl font-bold text-accent-red">{mismatches.toLocaleString()}</p>
        </div>

        {/* CSV Missing */}
        <div className="bg-surface-card border border-border-glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-muted uppercase">CSV Missing</span>
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-yellow-400">{csvMissing.toLocaleString()}</p>
        </div>

        {/* Match Rate */}
        <div className="bg-surface-card border border-border-glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-muted uppercase">Match Rate</span>
            <FileCheck className="w-4 h-4 text-accent-cyan" />
          </div>
          <p className="text-2xl font-bold text-text-white">{matchRate}%</p>
        </div>
      </div>

      {/* Date Range & Filters */}
      <div className="bg-surface-card border border-border-glass rounded-xl p-4 mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-accent-cyan" />
            <span className="text-sm font-medium text-text-white">Filter by Date Range</span>
            {dateRangeStart && dateRangeEnd && (
              <span className="text-xs text-text-muted">
                ({new Date(dateRangeStart).toLocaleDateString()} - {new Date(dateRangeEnd).toLocaleDateString()})
              </span>
            )}
          </div>
          {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-light mb-1.5">From Date</label>
              <input
                type="date"
                value={dateFilter.from}
                onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
                className="w-full px-3 py-2 bg-surface-darker border border-border-glass rounded-lg text-text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-light mb-1.5">To Date</label>
              <input
                type="date"
                value={dateFilter.to}
                onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
                className="w-full px-3 py-2 bg-surface-darker border border-border-glass rounded-lg text-text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/40"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setDateFilter({ from: '', to: '' }); setCurrentPage(1); }}
                className="px-4 py-2 bg-surface-darker border border-border-glass rounded-lg text-text-white text-sm hover:bg-surface-card transition-colors"
              >
                Clear Filter
              </button>
            </div>
          </div>
        )}

        {/* Filtered Stats */}
        {(dateFilter.from || dateFilter.to) && (
          <div className="mt-4 pt-4 border-t border-border-glass">
            <p className="text-xs text-text-muted mb-2">Filtered Results:</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-text-white">
                Total: <strong>{filteredStats.total}</strong>
              </span>
              <span className="text-green-400">
                Matches: <strong>{filteredStats.matches}</strong>
              </span>
              <span className="text-accent-red">
                Mismatches: <strong>{filteredStats.mismatches}</strong>
              </span>
              <span className="text-yellow-400">
                CSV Missing: <strong>{filteredStats.csvMissing}</strong>
              </span>
              <span className="text-text-white">
                Match Rate: <strong>{filteredStats.matchRate}%</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Comparison Table */}
      <div className="bg-surface-card border border-border-glass rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border-glass">
          <h2 className="text-sm font-semibold text-text-white">Detailed Vital Comparison</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Click on any row to view field-by-field comparison
          </p>
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
                    No records found for the selected date range.
                  </td>
                </tr>
              ) : (
                paginatedDetails.map((record, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-surface-darker/50 transition-colors cursor-pointer ${
                      record.status === 'mismatch' ? 'bg-accent-red-light/5' : ''
                    }`}
                    onClick={() => toggleRow(index)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-text-white">{formatTimestamp(record.recordTime)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-light">{record.sensorId}</td>
                    <td className="px-4 py-3">{getStatusBadge(record.status)}</td>
                    <td className="px-4 py-3 text-xs text-text-muted font-mono">
                      {record.csvFile || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {record.comparison && (
                        <button className="text-accent-cyan hover:text-accent-cyan/80 text-xs">
                          {expandedRows.has(index) ? 'Hide' : 'View'} Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border-glass flex items-center justify-between">
            <span className="text-xs text-text-muted">
              Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, filteredDetails.length)} of {filteredDetails.length} records
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

        {/* Expanded Row Details */}
        {paginatedDetails.map((record, index) => {
          if (!expandedRows.has(index) || !record.comparison) return null;

          return (
            <div key={`expanded-${index}`} className="border-t border-border-glass bg-surface-darker/30 px-4 py-4">
              <h3 className="text-xs font-semibold text-text-white mb-3 uppercase">
                Field-by-Field Comparison
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(record.comparison).map(([field, data]) => {
                  const isMatch = data.match === true;
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
                        {isMatch && <CheckCircle2 className="w-3 h-3 text-green-400" />}
                        {isMismatch && <XCircle className="w-3 h-3 text-accent-red" />}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-text-muted">CSV:</span>
                          <span className="text-text-white font-mono">{data.csv || '-'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-text-muted">DB:</span>
                          <span className="text-text-white font-mono">{data.db || '-'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
