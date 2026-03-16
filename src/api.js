// src/api.js — Insurance Portal API service layer (JWT auth)

export const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.arogyasync.com/csv';

/** Returns the JWT access token from sessionStorage. */
function getAccessToken() {
  try {
    const session = JSON.parse(sessionStorage.getItem('ip_session') || '{}');
    return session.access_token || '';
  } catch {
    return '';
  }
}

const headers = () => {
  const h = { 'Content-Type': 'application/json' };
  const token = getAccessToken();
  if (token) {
    h['Authorization'] = `Bearer ${token}`;
  }
  return h;
};

async function request(path, options = {}) {
  const { signal: externalSignal, timeout = 15000, ...rest } = options;

  // Create a timeout abort if no external signal provided
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // If external signal provided, link it to our controller
  if (externalSignal) {
    externalSignal.addEventListener('abort', () => controller.abort());
  }

  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: headers(),
      signal: controller.signal,
      ...rest,
    });
    clearTimeout(timeoutId);

    // Check if response is JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Rate-limited responses may arrive as HTML before the JSON handler kicks in
      if (res.status === 429) {
        throw new Error('Too many requests. Please wait a moment before trying again.');
      }
      throw new Error(`API returned ${res.status}: Expected JSON but got ${contentType || 'unknown content type'}. Is the API server running at ${API_URL}?`);
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || `Request failed (${res.status})`);
    }
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      if (externalSignal?.aborted) throw err; // User-initiated cancellation
      throw new Error('Request timed out. Please try again.');
    }
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error(`Cannot connect to API server at ${API_URL}. Is it running?`);
    }
    throw err;
  }
}

// ── Auth Endpoints (no Bearer token needed) ──

/** Register a new insurance agent */
export async function registerAgent({ name, email, employee_id, insurance_company, password }) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, employee_id, insurance_company, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Registration failed');
  return data;
}

/** Verify agent email via token */
export async function verifyAgentEmail(token) {
  const res = await fetch(`${API_URL}/auth/verify?token=${encodeURIComponent(token)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Verification failed');
  return data;
}

/** Login and get JWT tokens */
export async function loginAgent(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Login failed');
  return data;
}

/** Refresh access token */
export async function refreshToken(refresh_token) {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Token refresh failed');
  return data;
}

/** Get list of insurance companies */
export async function getInsuranceCompanies() {
  const res = await fetch(`${API_URL}/auth/insurance-companies`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to load companies');
  return data;
}

// ── Protected Endpoints (use Bearer token via request()) ──

/** Fetch registered patients (supports pagination) */
export async function getAllPatients({ page, limit, search } = {}) {
  const params = new URLSearchParams();
  if (page) params.set('page', page);
  if (limit) params.set('limit', limit);
  if (search) params.set('search', search);
  const qs = params.toString();
  return request(`/getAllpatients${qs ? '?' + qs : ''}`);
}

/** Fetch fraud scan results for a specific patient */
export async function getPatientTest({ name, dob, insuranceId }, { signal } = {}) {
  return request('/getPatientTest', {
    method: 'POST',
    body: JSON.stringify({ name, dob, insuranceId }),
    signal,
  });
}

/**
 * Comprehensive on-demand patient scan - compares ALL vitals against ALL CSV files
 * @param {Object} params - Patient search parameters
 * @param {string} params.name - Patient name
 * @param {string} params.dob - Date of birth (DD/MM/YYYY)
 * @param {string} params.insuranceId - Insurance policy number
 * @param {string} [params.dateFrom] - Optional start date for filtering (YYYY-MM-DD)
 * @param {string} [params.dateTo] - Optional end date for filtering (YYYY-MM-DD)
 * @param {Object} options - Request options
 * @param {AbortSignal} [options.signal] - Abort signal for cancellation
 * @returns {Promise<Object>} Scan results with metrics and detailed comparison
 */
export async function comprehensivePatientScan({ name, dob, insuranceId, dateFrom, dateTo }, { signal } = {}) {
  return request('/patient/comprehensive-scan', {
    method: 'POST',
    body: JSON.stringify({ name, dob, insuranceId, dateFrom, dateTo }),
    signal,
    timeout: 120000, // 120 second timeout for comprehensive scan (can process many records)
  });
}

/** Fetch all test results for a patient by ID */
export async function getAllTests(patientId) {
  return request(`/getAlltest/${patientId}`);
}

// ── Analytics Endpoints ──

/** Aggregate stats: totals, match/mismatch rates, last scan */
export async function getStatsSummary() {
  return request('/stats/summary');
}

/** Mismatch trend over time */
export async function getStatsTrends(period = 'daily', days = 30) {
  return request(`/stats/trends?period=${period}&days=${days}`);
}

/** Which vital fields mismatch most frequently */
export async function getFieldAnalysis() {
  return request('/stats/field-analysis');
}

/** Devices with highest mismatch rates */
export async function getProblematicDevices(limit = 10) {
  return request(`/stats/devices/problematic?limit=${limit}`);
}

/** Per-patient risk score */
export async function getPatientRisk(patientId) {
  return request(`/stats/patient/${patientId}/risk`);
}

/** Blockchain anchor record for a file */
export async function getAnchor(fileName) {
  return request(`/anchor/${encodeURIComponent(fileName)}`);
}

// ── Vitals Browsing & On-Demand Comparison ──

/** Paginated raw vitals from RDS for a patient */
export async function getPatientVitals(patientId, page = 1, limit = 20) {
  return request(`/vitals/patient/${patientId}?page=${page}&limit=${limit}`);
}

/** On-demand comparison of a single vital against CSV */
export async function compareVital({ record_time, sensor_id }) {
  return request('/compareVital', {
    method: 'POST',
    body: JSON.stringify({ record_time, sensor_id }),
  });
}
