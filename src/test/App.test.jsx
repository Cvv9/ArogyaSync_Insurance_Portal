import { describe, it, expect, vi } from 'vitest';
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
});
