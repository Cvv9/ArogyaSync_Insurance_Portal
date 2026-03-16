import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../components/PatientLookup', () => ({
  default: () => <div data-testid="patient-lookup">PatientLookup</div>,
}));
vi.mock('../components/FraudResults', () => ({
  default: () => <div data-testid="fraud-results">FraudResults</div>,
}));
vi.mock('../components/Dashboard', () => ({
  default: () => <div data-testid="dashboard">Dashboard</div>,
}));

import App from '../App';

describe('App routing', () => {
  beforeEach(() => {
    // FE-001: Seed a valid JWT session so ProtectedRoute (useAuth) lets us through
    sessionStorage.setItem('ip_session', JSON.stringify({
      access_token: 'test-jwt-token',
      refresh_token: 'test-refresh-token',
      agent: { name: 'Test Agent', email: 'test@example.com', insurance_company: 'Test Insurance' },
    }));
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('renders PatientLookup at /', () => {
    window.location.hash = '#/';
    render(<App />);
    expect(screen.getByTestId('patient-lookup')).toBeInTheDocument();
  });

  it('renders FraudResults at /results', () => {
    window.location.hash = '#/results';
    render(<App />);
    expect(screen.getByTestId('fraud-results')).toBeInTheDocument();
  });

  it('renders Dashboard at /dashboard', () => {
    window.location.hash = '#/dashboard';
    render(<App />);
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    sessionStorage.clear();
    window.location.hash = '#/';
    render(<App />);
    // Should not see patient-lookup when unauthenticated
    expect(screen.queryByTestId('patient-lookup')).not.toBeInTheDocument();
  });
});
