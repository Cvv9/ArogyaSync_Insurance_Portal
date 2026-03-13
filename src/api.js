// src/api.js — Insurance Portal API service layer

export const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.arogyasync.com/csv';
export const API_KEY = import.meta.env.VITE_API_KEY || '';

const headers = () => ({
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
});

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: headers(),
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

/** Fetch all registered patients */
export async function getAllPatients() {
  return request('/getAllpatients');
}

/** Fetch fraud scan results for a specific patient */
export async function getPatientTest({ name, dob, insuranceId }) {
  return request('/getPatientTest', {
    method: 'POST',
    body: JSON.stringify({ name, dob, insuranceId }),
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
