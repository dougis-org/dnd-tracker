import { render, screen } from '@testing-library/react'
import EncounterCard from '@/components/encounters/EncounterCard'
import type { EncounterPayload } from '@/lib/api/encounters'

describe('EncounterCard', () => {
  const mockEncounter: EncounterPayload = {
    id: 'encounter-1',
    name: 'Goblin Ambush',
    description: 'A surprise attack by goblins',
    participants: [
      { id: 'p1', type: 'monster', displayName: 'Goblin', quantity: 3, hp: 7 },
      { id: 'p2', type: 'party_member', displayName: 'Archer', quantity: 1, hp: 25 },
    ],
    tags: ['combat', 'outdoor'],
    template_flag: false,
    created_at: '2025-11-01T10:00:00Z',
    updated_at: '2025-11-01T10:00:00Z',
  }

  it('renders encounter name as a link', () => {
    render(<EncounterCard encounter={mockEncounter} />)
    const link = screen.getByRole('link', { name: 'Goblin Ambush' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/encounters/encounter-1')
  })

  it('displays encounter description', () => {
    render(<EncounterCard encounter={mockEncounter} />)
    expect(screen.getByText('A surprise attack by goblins')).toBeInTheDocument()
  })

  it('shows participant count', () => {
    render(<EncounterCard encounter={mockEncounter} />)
    expect(screen.getByText('2 participants')).toBeInTheDocument()
  })

  it('shows total quantity of participants', () => {
    render(<EncounterCard encounter={mockEncounter} />)
    expect(screen.getByText('4 total')).toBeInTheDocument()
  })

  it('displays formatted creation date', () => {
    render(<EncounterCard encounter={mockEncounter} />)
    expect(screen.getByText(/Created 11\/1\/2025/)).toBeInTheDocument()
  })

  it('renders View button with correct link', () => {
    render(<EncounterCard encounter={mockEncounter} />)
    const viewButton = screen.getByRole('link', { name: 'View' })
    expect(viewButton).toHaveAttribute('href', '/encounters/encounter-1')
  })

  it('handles single participant correctly', () => {
    const singleParticipantEncounter: EncounterPayload = {
      ...mockEncounter,
      participants: [mockEncounter.participants[0]],
    }
    render(<EncounterCard encounter={singleParticipantEncounter} />)
    expect(screen.getByText('1 participant')).toBeInTheDocument()
  })

  it('handles empty description', () => {
    const noDescriptionEncounter: EncounterPayload = {
      ...mockEncounter,
      description: undefined,
    }
    render(<EncounterCard encounter={noDescriptionEncounter} />)
    expect(screen.queryByText('A surprise attack by goblins')).not.toBeInTheDocument()
  })

  it('handles missing created_at date', () => {
    const noDateEncounter: EncounterPayload = {
      ...mockEncounter,
      created_at: undefined,
    }
    render(<EncounterCard encounter={noDateEncounter} />)
    expect(screen.queryByText(/Created/)).not.toBeInTheDocument()
  })

  it('handles zero-quantity participants correctly', () => {
    const zeroQuantityEncounter: EncounterPayload = {
      ...mockEncounter,
      participants: [
        { id: 'p1', type: 'monster', displayName: 'Empty', quantity: 0, hp: 0 },
      ],
    }
    render(<EncounterCard encounter={zeroQuantityEncounter} />)
    expect(screen.getByText('0 total')).toBeInTheDocument()
  })

  it('applies correct CSS classes for styling', () => {
    render(<EncounterCard encounter={mockEncounter} />)
    const card = screen.getByText('Goblin Ambush').closest('div')?.parentElement?.parentElement
    expect(card).toHaveClass('p-4', 'border', 'rounded-lg', 'hover:shadow-md')
  })

  it('displays encounter name as semibold and blue', () => {
    render(<EncounterCard encounter={mockEncounter} />)
    const nameLink = screen.getByRole('link', { name: 'Goblin Ambush' })
    expect(nameLink).toHaveClass('text-lg', 'font-semibold', 'text-blue-600')
  })
})
