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
  it('renders single home crumb for root path', () => {
    mockUsePathname.mockReturnValue('/')

    render(<Breadcrumb />)

    const navigation = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(within(navigation).getByText('Home')).toBeInTheDocument()
    expect(within(navigation).queryByRole('link', { name: 'Home' })).toBeNull()
    expect(within(navigation).queryAllByRole('listitem')).toHaveLength(1)
  })

  it('applies custom className when provided', () => {
    mockUsePathname.mockReturnValue('/dashboard')

    render(<Breadcrumb className="bg-muted" />)

    const navigation = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(navigation).toHaveClass('bg-muted')
  })
})
