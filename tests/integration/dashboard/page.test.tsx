import React from 'react'
import { render, screen } from '@testing-library/react'
import DashboardPage from '@/app/dashboard/page'

// Mock the MainLayout component
jest.mock('@/components/layouts/MainLayout', () => {
  return {
    MainLayout: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="main-layout">{children}</div>
    ),
  }
})

describe('Dashboard Page', () => {
  it('should render the dashboard page with all sections', () => {
    render(<DashboardPage />)

    // Verify main layout is rendered
    expect(screen.getByTestId('main-layout')).toBeInTheDocument()

    // Verify page title
    expect(screen.getByRole('heading', { level: 2, name: /dashboard/i })).toBeInTheDocument()

    // Verify section headings
    expect(screen.getByRole('heading', { level: 3, name: /recent activity/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /quick actions/i })).toBeInTheDocument()
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
