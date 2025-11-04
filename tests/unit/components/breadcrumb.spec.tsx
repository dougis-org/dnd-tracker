// codacy:ignore
import { render, screen, within } from '@testing-library/react'
import { Breadcrumb } from '@/components/Breadcrumb'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

const mockUsePathname = jest.requireMock('next/navigation').usePathname as jest.Mock

describe('Breadcrumb', () => {
  beforeEach(() => {
    mockUsePathname.mockReset()
  })

  it('renders breadcrumb segments for nested route', () => {
    mockUsePathname.mockReturnValue('/characters/123')

    render(<Breadcrumb />)

    const navigation = screen.getByRole('navigation', { name: /breadcrumb/i })
    const homeLink = within(navigation).getByRole('link', { name: 'Home' })
    const charactersLink = within(navigation).getByRole('link', { name: 'Characters' })

    expect(homeLink).toHaveAttribute('href', '/')
    expect(charactersLink).toHaveAttribute('href', '/characters')
    expect(within(navigation).getByText('Character 123')).toBeInTheDocument()
    expect(within(navigation).queryByRole('link', { name: 'Character 123' })).toBeNull()
  })
  it('returns null when only the home segment is present', () => {
    mockUsePathname.mockReturnValue('/')

    render(<Breadcrumb />)

    expect(screen.queryByRole('navigation', { name: /breadcrumb/i })).toBeNull()
  })

  it('applies custom className when provided', () => {
    mockUsePathname.mockReturnValue('/dashboard')

    render(<Breadcrumb className="bg-muted" />)

    const navigation = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(navigation).toHaveClass('bg-muted')
  })
})
