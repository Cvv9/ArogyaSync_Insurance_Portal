import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import InsurancePage from '../components/Insurance_page'

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

// Helper to get the date input (type="date" input, no placeholder)
const getDateInput = () => document.querySelector('input[type="date"]')

describe('InsurancePage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        global.fetch = vi.fn()
    })

    const renderComponent = () =>
        render(
            <MemoryRouter>
                <InsurancePage />
            </MemoryRouter>
        )

    it('renders the insurance form with all fields', () => {
        renderComponent()
        expect(screen.getByText('Patient Insurance Portal')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Date of Birth')).toBeInTheDocument()
        expect(getDateInput()).toBeTruthy()
        expect(screen.getByPlaceholderText('INS123456')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
    })

    it('renders left panel info icons and text', () => {
        renderComponent()
        expect(screen.getByText('Secure & Encrypted Submission')).toBeInTheDocument()
        expect(screen.getByText('Verify via Insurance ID')).toBeInTheDocument()
        expect(screen.getByText('Check coverage date records')).toBeInTheDocument()
    })

    it('updates form fields on user input', async () => {
        renderComponent()
        const user = userEvent.setup()

        const nameInput = screen.getByPlaceholderText('John Doe')
        const insuranceInput = screen.getByPlaceholderText('INS123456')

        await user.type(nameInput, 'Jane Smith')
        await user.type(insuranceInput, 'INS789012')

        expect(nameInput).toHaveValue('Jane Smith')
        expect(insuranceInput).toHaveValue('INS789012')
    })

    it('shows loading state during submission', async () => {
        // Make fetch hang
        global.fetch = vi.fn(() => new Promise(() => { }))

        renderComponent()
        const user = userEvent.setup()

        await user.type(screen.getByPlaceholderText('John Doe'), 'Test')
        await user.type(screen.getByPlaceholderText('INS123456'), 'INS123')

        // Set a date value using the DOM element directly
        fireEvent.change(getDateInput(), { target: { value: '2000-01-15' } })

        const submitButton = screen.getByRole('button', { name: /submit/i })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Submitting...')).toBeInTheDocument()
        })
    })

    it('navigates to results page on successful submission', async () => {
        const mockRecords = [{ id: 1, deviceId: 'D001', status: 'match' }]
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockRecords),
            })
        )

        renderComponent()

        fireEvent.change(screen.getByPlaceholderText('John Doe'), {
            target: { value: 'Test Patient' },
        })
        fireEvent.change(getDateInput(), { target: { value: '1990-05-10' } })
        fireEvent.change(screen.getByPlaceholderText('INS123456'), {
            target: { value: 'INS999' },
        })

        fireEvent.click(screen.getByRole('button', { name: /submit/i }))

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/next-page', {
                state: {
                    records: mockRecords,
                    patientName: 'Test Patient',
                    patientDob: '1990-05-10',
                },
            })
        })
    })

    it('shows error message on failed API call', async () => {
        global.fetch = vi.fn(() => Promise.resolve({ ok: false }))

        renderComponent()

        fireEvent.change(screen.getByPlaceholderText('John Doe'), {
            target: { value: 'Bad Patient' },
        })
        fireEvent.change(getDateInput(), { target: { value: '1985-03-20' } })
        fireEvent.change(screen.getByPlaceholderText('INS123456'), {
            target: { value: 'INVALID' },
        })

        fireEvent.click(screen.getByRole('button', { name: /submit/i }))

        await waitFor(() => {
            expect(
                screen.getByText('Invalid insurance details. Please check and try again.')
            ).toBeInTheDocument()
        })
    })

    it('shows error on network exception', async () => {
        global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))

        renderComponent()

        fireEvent.change(screen.getByPlaceholderText('John Doe'), {
            target: { value: 'Offline' },
        })
        fireEvent.change(getDateInput(), { target: { value: '2000-01-01' } })
        fireEvent.change(screen.getByPlaceholderText('INS123456'), {
            target: { value: 'INS000' },
        })

        fireEvent.click(screen.getByRole('button', { name: /submit/i }))

        await waitFor(() => {
            expect(
                screen.getByText('An unexpected error occurred. Please try again later.')
            ).toBeInTheDocument()
        })
    })
})
