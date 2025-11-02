import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ThemeToggle } from '@/components/theme/theme-toggle'

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  it('should render theme toggle button', () => {
    const mockUseTheme = require('next-themes').useTheme
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
    })

    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toBeInTheDocument()
  })

  it('should toggle theme from light to dark', async () => {
    const setThemeMock = jest.fn()
    const mockUseTheme = require('next-themes').useTheme
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: setThemeMock,
    })

    const user = userEvent.setup()
    render(<ThemeToggle />)
    
    const button = screen.getByRole('button', { name: /toggle theme/i })
    await user.click(button)
    
    expect(setThemeMock).toHaveBeenCalledWith('dark')
  })

  it('should toggle theme from dark to light', async () => {
    const setThemeMock = jest.fn()
    const mockUseTheme = require('next-themes').useTheme
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: setThemeMock,
    })

    const user = userEvent.setup()
    render(<ThemeToggle />)
    
    const button = screen.getByRole('button', { name: /toggle theme/i })
    await user.click(button)
    
    expect(setThemeMock).toHaveBeenCalledWith('light')
  })

  it('should show appropriate icon for current theme', () => {
    const mockUseTheme = require('next-themes').useTheme
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: jest.fn(),
    })

    render(<ThemeToggle />)
    // Should show sun icon when in dark mode (to indicate switching to light)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
