import { render, screen } from '@testing-library/react'
import { StatCard } from '@/components/dashboard/StatCard'

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Active Parties" value={3} />)

    expect(screen.getByText('Active Parties')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows empty state when value is null', () => {
    render(<StatCard label="Encounters" value={null as any} />)

    expect(screen.getByText('Encounters')).toBeInTheDocument()
    expect(screen.getByText(/no data/i)).toBeInTheDocument()
  })
})
