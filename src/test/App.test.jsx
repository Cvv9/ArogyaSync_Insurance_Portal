import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../components/PatientLookup', () => ({
  default: () => <div data-testid="patient-lookup">PatientLookup</div>,
}));
vi.mock('../components/FraudResults', () => ({
  default: () => <div data-testid="fraud-results">FraudResults</div>,
}));
vi.mock('../components/ScanResults', () => ({
  default: () => <div data-testid="scan-results">ScanResults</div>,
}));

// CR4-001: Mock AuthContext to provide in-memory auth state (no sessionStorage)
vi.mock('../contexts/AuthContext', () => {
  let mockAuth = {
    isAuthenticated: true,
    agent: { name: 'Test Agent', email: 'test@example.com', insurance_company: 'Test Insurance' },
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    getAccessToken: () => 'test-jwt-token',
  };
  return {
    AuthProvider: ({ children }) => children,
    useAuth: () => mockAuth,
    __setMockAuth: (overrides) => { mockAuth = { ...mockAuth, ...overrides }; },
  };
});

import App from '../App';
import { __setMockAuth } from '../contexts/AuthContext';

describe('App routing', () => {
  beforeEach(() => {
    __setMockAuth({ isAuthenticated: true });
  });

  afterEach(() => {
    __setMockAuth({ isAuthenticated: true });
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

  it('renders ScanResults at /scan-results', () => {
    window.location.hash = '#/scan-results';
    render(<App />);
    expect(screen.getByTestId('scan-results')).toBeInTheDocument();
  });

  it('redirects /dashboard to / (patient lookup)', () => {
    window.location.hash = '#/dashboard';
    render(<App />);
    // /dashboard redirects to /, which renders PatientLookup
    expect(screen.getByTestId('patient-lookup')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    __setMockAuth({ isAuthenticated: false });
    window.location.hash = '#/';
    render(<App />);
    // Should not see patient-lookup when unauthenticated
    expect(screen.queryByTestId('patient-lookup')).not.toBeInTheDocument();
  });
});
