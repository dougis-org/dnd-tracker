 
import { render, screen } from '@testing-library/react'
import ParticipantForm from '@/components/encounters/ParticipantForm'
import { createMockParticipant } from '../../../test-helpers/encounter-fixtures'

describe('ParticipantForm - Rendering', () => {
  const mockParticipant = createMockParticipant()
  const mockOnUpdate = jest.fn()
  const mockOnRemove = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders participant form with index number', () => {
    render(
      <ParticipantForm
        index={0}
        participant={mockParticipant}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        errors={[]}
      />
    )
    expect(screen.getByText('Participant 1')).toBeInTheDocument()
  })

  it('renders with correct participant index', () => {
    render(
      <ParticipantForm
        index={2}
        participant={mockParticipant}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        errors={[]}
      />
    )
    expect(screen.getByText('Participant 3')).toBeInTheDocument()
  })

  it('renders all required form fields', () => {
    render(
      <ParticipantForm
        index={0}
        participant={mockParticipant}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        errors={[]}
      />
    )
    expect(screen.getByLabelText('Type')).toBeInTheDocument()
    expect(screen.getByLabelText('Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument()
    expect(screen.getByLabelText('HP (per individual)')).toBeInTheDocument()
    expect(screen.getByLabelText('Initiative (optional)')).toBeInTheDocument()
  })

  it('has correct input IDs based on index', () => {
    const { container } = render(
      <ParticipantForm
        index={0}
        participant={mockParticipant}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        errors={[]}
      />
    )
    expect(container.querySelector('#type-0')).toBeInTheDocument()
    expect(container.querySelector('#displayName-0')).toBeInTheDocument()
    expect(container.querySelector('#quantity-0')).toBeInTheDocument()
    expect(container.querySelector('#hp-0')).toBeInTheDocument()
    expect(container.querySelector('#initiative-0')).toBeInTheDocument()
  })

  it('applies correct container styling', () => {
    const { container } = render(
      <ParticipantForm
        index={0}
        participant={mockParticipant}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        errors={[]}
      />
    )
    const formDiv = container.querySelector('div.mb-4')
    expect(formDiv).toHaveClass('p-4', 'border', 'rounded-md', 'bg-gray-50')
  })

  it('uses grid layout with 2 columns', () => {
    const { container } = render(
      <ParticipantForm
        index={0}
        participant={mockParticipant}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        errors={[]}
      />
    )
    const gridDiv = container.querySelector('div.grid')
    expect(gridDiv).toHaveClass('grid-cols-2', 'gap-4')
  })

  it('displays correct type option labels in dropdown', () => {
    render(
      <ParticipantForm
        index={0}
        participant={mockParticipant}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        errors={[]}
      />
    )
    expect(screen.getByText('Monster')).toBeInTheDocument()
    expect(screen.getByText('Party Member')).toBeInTheDocument()
    expect(screen.getByText('Custom NPC')).toBeInTheDocument()
  })
})
