import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Mock useLocation and useNavigate
const mockNavigate = vi.fn()
let mockLocationState = {}

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ state: mockLocationState }),
    }
})

// Import after mocks are set up
import NextPage from '../components/Devices'

describe('Devices / Records Page (NextPage)', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockLocationState = {}
    })

    const renderComponent = (state = {}) => {
        mockLocationState = state
        return render(
            <MemoryRouter>
                <NextPage />
            </MemoryRouter>
        )
    }

    // ========== Empty State ==========

    it('shows "No Records Available" when no state is passed', () => {
        renderComponent()
        expect(screen.getByText('No Records Available')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument()
    })

    it('shows "No Records Available" when records array is empty', () => {
        renderComponent({ records: [], patientName: 'Test', patientDob: '2000-01-01' })
        expect(screen.getByText('No Records Available')).toBeInTheDocument()
    })

    // ========== Records Table ==========

    it('renders patient info header when records exist', () => {
        const state = {
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
        }

        renderComponent(state)
        expect(screen.getByText('Patient Vitals Records')).toBeInTheDocument()
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('1990-05-15')).toBeInTheDocument()
    })

    it('renders match status with green badge', () => {
        const state = {
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
        }

        renderComponent(state)
        const badge = screen.getByText('match')
        expect(badge).toBeInTheDocument()
        expect(badge.className).toContain('bg-green-600')
    })

    it('renders mismatch status with red badge and View Details button', () => {
        const state = {
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
        }

        renderComponent(state)
        const badge = screen.getByText('mismatch')
        expect(badge.className).toContain('bg-red-600')
        expect(screen.getByText('3')).toBeInTheDocument()
        expect(screen.getByText('View Details')).toBeInTheDocument()
    })

    it('expands and collapses mismatch details on click', () => {
        const state = {
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
        }

        renderComponent(state)

        // Initially collapsed
        expect(screen.queryByText('⚠ Mismatched Vitals')).not.toBeInTheDocument()

        // Click to expand
        fireEvent.click(screen.getByText('View Details'))
        expect(screen.getByText('⚠ Mismatched Vitals')).toBeInTheDocument()
        expect(screen.getByText('heart rate')).toBeInTheDocument()
        expect(screen.getByText('Hide Details')).toBeInTheDocument()

        // Click to collapse
        fireEvent.click(screen.getByText('Hide Details'))
        expect(screen.queryByText('⚠ Mismatched Vitals')).not.toBeInTheDocument()
    })

    it('does not show View Details for match records', () => {
        const state = {
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
        }

        renderComponent(state)
        expect(screen.queryByText('View Details')).not.toBeInTheDocument()
    })

    it('renders multiple records in table', () => {
        const state = {
            records: [
                {
                    id: 1,
                    deviceId: 'D-001',
                    status: 'match',
                    checkedAt: '2026-03-01T10:00:00Z',
                    recordedTimeStamp: '2026-03-01T09:55:00Z',
                    totalNoOfVitals: 50,
                    NoOfMismatch: 0,
                },
                {
                    id: 2,
                    deviceId: 'D-002',
                    status: 'mismatch',
                    checkedAt: '2026-03-01T11:00:00Z',
                    recordedTimeStamp: '2026-03-01T10:55:00Z',
                    totalNoOfVitals: 75,
                    NoOfMismatch: 1,
                    mismatchvitals: { spo2: { csv: '99', db: '96' } },
                },
            ],
            patientName: 'Multi Patient',
            patientDob: '1985-07-20',
        }

        renderComponent(state)
        expect(screen.getByText('D-001')).toBeInTheDocument()
        expect(screen.getByText('D-002')).toBeInTheDocument()
        expect(screen.getByText('match')).toBeInTheDocument()
        expect(screen.getByText('mismatch')).toBeInTheDocument()
    })
})
