import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PatientLookup from '../components/PatientLookup';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../api', () => ({
  comprehensivePatientScan: vi.fn(),
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    agent: { name: 'Test Agent', email: 'test@example.com', insurance_company: 'Test Insurance' },
    isAuthenticated: true,
    getAccessToken: () => 'test-jwt-token',
  }),
}));

import { comprehensivePatientScan } from '../api';

function renderComponent() {
  return render(
    <MemoryRouter>
      <PatientLookup />
    </MemoryRouter>
  );
}

const getDateInput = () => screen.getByLabelText('Date of Birth');

describe('PatientLookup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with all fields', () => {
    renderComponent();
    expect(screen.getByText('Patient Lookup')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(getDateInput()).toBeTruthy();
    expect(screen.getByPlaceholderText('INS123456')).toBeInTheDocument();
    expect(screen.getByText('Run Verification Scan')).toBeInTheDocument();
  });

  it('renders feature badges', () => {
    renderComponent();
    expect(screen.getByText('Encrypted')).toBeInTheDocument();
    expect(screen.getByText('ID Verified')).toBeInTheDocument();
    expect(screen.getByText('Date Validated')).toBeInTheDocument();
  });

  it('updates form fields on change', () => {
    renderComponent();
    const nameInput = screen.getByPlaceholderText('John Doe');
    fireEvent.change(nameInput, { target: { name: 'name', value: 'Jane Smith' } });
    expect(nameInput.value).toBe('Jane Smith');
  });

  it('shows loading state during submission', async () => {
    comprehensivePatientScan.mockImplementation(() => new Promise(() => {}));
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('John Doe'), {
      target: { name: 'name', value: 'Test' },
    });
    fireEvent.change(screen.getByPlaceholderText('INS123456'), {
      target: { name: 'insuranceId', value: 'INS123' },
    });
    fireEvent.change(getDateInput(), { target: { value: '15012000' } });
    fireEvent.submit(screen.getByText('Run Verification Scan').closest('form'));

    expect(await screen.findByText('Running comprehensive scan...')).toBeInTheDocument();
  });

  it('navigates to /scan-results on success', async () => {
    const mockScanResults = { metrics: { totalVitals: 10 }, comparisons: [] };
    comprehensivePatientScan.mockResolvedValue(mockScanResults);
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('John Doe'), {
      target: { name: 'name', value: 'Test Patient' },
    });
    fireEvent.change(getDateInput(), { target: { value: '10051990' } });
    fireEvent.change(screen.getByPlaceholderText('INS123456'), {
      target: { name: 'insuranceId', value: 'INS999' },
    });
    fireEvent.submit(screen.getByText('Run Verification Scan').closest('form'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/scan-results', {
        state: {
          scanResults: mockScanResults,
          searchParams: {
            name: 'Test Patient',
            dob: '1990-05-10',
            insuranceId: 'INS999',
            dateFrom: '',
            dateTo: '',
          },
        },
      });
    });
  });

  it('shows error on API failure', async () => {
    comprehensivePatientScan.mockRejectedValue(new Error('Patient not found'));
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('John Doe'), {
      target: { name: 'name', value: 'Bad' },
    });
    fireEvent.change(getDateInput(), { target: { value: '20031985' } });
    fireEvent.change(screen.getByPlaceholderText('INS123456'), {
      target: { name: 'insuranceId', value: 'INVALID' },
    });
    fireEvent.submit(screen.getByText('Run Verification Scan').closest('form'));

    expect(await screen.findByText('Patient not found')).toBeInTheDocument();
  });
});
