/**
 * Unit tests for SiteHeader component
 * Tests the navigation header component structure and links
 */

import { describe, test, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'

// Mock Clerk's useAuth hook to return unauthenticated state
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(() => ({ isSignedIn: false })),
}))

import { SiteHeader } from '@/components/layout/site-header'

describe('SiteHeader', () => {
  test('renders header with logo and title', () => {
    render(<SiteHeader />)

    expect(screen.getByText('D&D Tracker')).toBeInTheDocument()
    expect(screen.getByText('Encounter Manager')).toBeInTheDocument()
  })

  test('logo links to home page', () => {
    render(<SiteHeader />)

    const logoLink = screen.getByText('D&D Tracker').closest('a')
    expect(logoLink).toHaveAttribute('href', '/')
  })

  test('renders navigation buttons', () => {
    render(<SiteHeader />)

    // Component should render navigation buttons
    // (either Sign In/Get Started or Dashboard/Profile depending on auth)
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
  })

  test('header is sticky and positioned at top', () => {
    render(<SiteHeader />)

    const header = screen.getByRole('banner')
    expect(header).toHaveClass('sticky', 'top-0')
  })
})
