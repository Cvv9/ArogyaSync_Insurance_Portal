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
  getPatientTest: vi.fn(),
}));

import { getPatientTest } from '../api';

function renderComponent() {
  return render(
    <MemoryRouter>
      <PatientLookup />
    </MemoryRouter>
  );
}

const getDateInput = () => document.querySelector('input[type="date"]');

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
    expect(screen.getByText('Search Records')).toBeInTheDocument();
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
    getPatientTest.mockImplementation(() => new Promise(() => {}));
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('John Doe'), {
      target: { name: 'name', value: 'Test' },
    });
    fireEvent.change(screen.getByPlaceholderText('INS123456'), {
      target: { name: 'insuranceId', value: 'INS123' },
    });
    fireEvent.change(getDateInput(), { target: { value: '2000-01-15' } });
    fireEvent.submit(screen.getByText('Search Records').closest('form'));

    expect(await screen.findByText('Searching...')).toBeInTheDocument();
  });

  it('navigates to /results on success', async () => {
    const mockRecords = [{ id: 1, deviceId: 'D001', status: 'match' }];
    getPatientTest.mockResolvedValue({ patientId: '42', records: mockRecords });
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('John Doe'), {
      target: { name: 'name', value: 'Test Patient' },
    });
    fireEvent.change(getDateInput(), { target: { value: '1990-05-10' } });
    fireEvent.change(screen.getByPlaceholderText('INS123456'), {
      target: { name: 'insuranceId', value: 'INS999' },
    });
    fireEvent.submit(screen.getByText('Search Records').closest('form'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/results', {
        state: {
          records: mockRecords,
          patientId: '42',
          patientName: 'Test Patient',
          patientDob: '1990-05-10',
        },
      });
    });
  });

  it('shows error on API failure', async () => {
    getPatientTest.mockRejectedValue(new Error('Patient not found'));
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('John Doe'), {
      target: { name: 'name', value: 'Bad' },
    });
    fireEvent.change(getDateInput(), { target: { value: '1985-03-20' } });
    fireEvent.change(screen.getByPlaceholderText('INS123456'), {
      target: { name: 'insuranceId', value: 'INVALID' },
    });
    fireEvent.submit(screen.getByText('Search Records').closest('form'));

    expect(await screen.findByText('Patient not found')).toBeInTheDocument();
  });
});
