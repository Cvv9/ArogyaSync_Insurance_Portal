import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// The App component wraps its own BrowserRouter, so we test it directly.
// Components are already tested individually with MemoryRouter.
vi.mock('../components/Insurance_page', () => ({
    default: () => <div data-testid="insurance-page">InsurancePage</div>,
}))
vi.mock('../components/Devices', () => ({
    default: () => <div data-testid="devices-page">DevicesPage</div>,
}))

import App from '../App'

describe('App', () => {
    it('renders without crashing', () => {
        render(<App />)
        // At "/" route, InsurancePage should render
        expect(screen.getByTestId('insurance-page')).toBeInTheDocument()
    })
})
