import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
let mockLocationState = {};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: mockLocationState }),
  };
});

import FraudResults from '../components/FraudResults';

describe('FraudResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocationState = {};
  });

  const renderComponent = (state = {}) => {
    mockLocationState = state;
    return render(
      <MemoryRouter>
        <FraudResults />
      </MemoryRouter>
    );
  };

  it('shows empty state when no records', () => {
    renderComponent();
    expect(screen.getByText('No Records Available')).toBeInTheDocument();
    expect(screen.getByText('Go to Patient Lookup')).toBeInTheDocument();
  });

  it('shows empty state when records array is empty', () => {
    renderComponent({ records: [], patientName: 'Test', patientDob: '2000-01-01' });
    expect(screen.getByText('No Records Available')).toBeInTheDocument();
  });

  it('renders patient info and summary pills', () => {
    renderComponent({
      records: [
        {
          id: 1,
          deviceId: 'D-101',
          status: 'match',
          checkedAt: '2026-03-01T10:00:00Z',
          recordedTimeStamp: '2026-03-01T09:55:00Z',
          totalNoOfVitals: 50,
          NoOfMismatch: 0,
        },
      ],
      patientName: 'John Doe',
      patientDob: '1990-05-15',
    });
    expect(screen.getByText('Fraud Scan Results')).toBeInTheDocument();
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  it('renders match status badge', () => {
    renderComponent({
      records: [
        {
          id: 1,
          deviceId: 'D-101',
          status: 'match',
          checkedAt: '2026-03-01T10:00:00Z',
          recordedTimeStamp: '2026-03-01T09:55:00Z',
          totalNoOfVitals: 50,
          NoOfMismatch: 0,
        },
      ],
      patientName: 'Jane',
      patientDob: '1995-01-01',
    });
    expect(screen.getByText('Match')).toBeInTheDocument();
  });

  it('renders mismatch status with Details button', () => {
    renderComponent({
      records: [
        {
          id: 2,
          deviceId: 'D-202',
          status: 'mismatch',
          checkedAt: '2026-03-01T12:00:00Z',
          recordedTimeStamp: '2026-03-01T11:50:00Z',
          totalNoOfVitals: 100,
          NoOfMismatch: 3,
          mismatchvitals: {
            heart_rate: { csv: '72', db: '85' },
            spo2: { csv: '98', db: '95' },
          },
        },
      ],
      patientName: 'Mismatch Patient',
      patientDob: '1980-12-25',
    });
    expect(screen.getByText('Mismatch')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('expands and collapses mismatch details', () => {
    renderComponent({
      records: [
        {
          id: 3,
          deviceId: 'D-303',
          status: 'mismatch',
          checkedAt: '2026-03-01T14:00:00Z',
          recordedTimeStamp: '2026-03-01T13:50:00Z',
          totalNoOfVitals: 80,
          NoOfMismatch: 2,
          mismatchvitals: {
            heart_rate: { csv: '72', db: '85' },
            temperature: { csv: '36.5', db: '37.2' },
          },
        },
      ],
      patientName: 'Toggle Patient',
      patientDob: '1975-06-30',
    });

    expect(screen.queryByText(/Mismatched Vitals/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Details'));
    expect(screen.getByText(/Mismatched Vitals/)).toBeInTheDocument();
    expect(screen.getByText('heart rate')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Hide'));
    expect(screen.queryByText(/Mismatched Vitals/)).not.toBeInTheDocument();
  });

  it('does not show Details for match records', () => {
    renderComponent({
      records: [
        {
          id: 4,
          deviceId: 'D-404',
          status: 'match',
          checkedAt: '2026-03-01T16:00:00Z',
          recordedTimeStamp: '2026-03-01T15:55:00Z',
          totalNoOfVitals: 30,
          NoOfMismatch: 0,
        },
      ],
      patientName: 'Match Patient',
      patientDob: '2000-03-15',
    });
    expect(screen.queryByText('Details')).not.toBeInTheDocument();
  });
});
