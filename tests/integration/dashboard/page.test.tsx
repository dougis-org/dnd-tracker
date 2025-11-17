import React from 'react'
import { render, screen } from '@testing-library/react'
import DashboardPage from '@/app/dashboard/page'

// Pages use the shared RootLayout in Next.js; tests should assert page content
// directly. Avoid mocking MainLayout here because RootLayout is applied at
// runtime by Next and we prefer to test the page content itself.

describe('Dashboard Page', () => {
  it('should render the dashboard page with all sections', () => {
    render(<DashboardPage />)

    // Root layout isn't available in unit render; verify page content directly

    // Verify page title
    expect(screen.getByRole('heading', { level: 1, name: /dashboard/i })).toBeInTheDocument()

    // Verify section headings
    expect(screen.getByRole('heading', { level: 2, name: /recent activity/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /quick actions/i })).toBeInTheDocument()
  })

  it('should render stat cards with mock data', () => {
    render(<DashboardPage />)

    // Verify stat cards are rendered
    expect(screen.getByText('Active Parties')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()

    expect(screen.getByText('Encounters')).toBeInTheDocument()
    // StatCard formats large numbers as 1.2k
    expect(screen.getByText('1.2k')).toBeInTheDocument()
  })

  it('should render quick action buttons', () => {
    render(<DashboardPage />)

    // Verify quick action buttons are rendered
    expect(screen.getByRole('link', { name: /new party/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /start session/i })).toBeInTheDocument()
  })

  it('should render recent activity feed', () => {
    render(<DashboardPage />)

    // Verify recent activity description is rendered
    expect(screen.getByText(/goblin ambush/i)).toBeInTheDocument()
  })
})
