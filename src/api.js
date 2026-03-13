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
