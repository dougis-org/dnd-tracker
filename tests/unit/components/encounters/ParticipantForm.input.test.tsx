 
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ParticipantForm from '@/components/encounters/ParticipantForm'
import { createMockParticipant } from '../../../test-helpers/encounter-fixtures'

describe('ParticipantForm - Input Handling', () => {
  const mockParticipant = createMockParticipant()
  const mockOnUpdate = jest.fn()
  const mockOnRemove = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Remove button', () => {
    it('does not show Remove button for first participant (index 0)', () => {
      render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      expect(screen.queryByText('Remove')).not.toBeInTheDocument()
    })

    it('shows Remove button for non-first participants', () => {
      render(
        <ParticipantForm
          index={1}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      expect(screen.getByText('Remove')).toBeInTheDocument()
    })

    it('calls onRemove with correct index when Remove button clicked', () => {
      render(
        <ParticipantForm
          index={2}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      fireEvent.click(screen.getByText('Remove'))
      expect(mockOnRemove).toHaveBeenCalledWith(2)
    })

    it('Remove button has correct styling', () => {
      render(
        <ParticipantForm
          index={1}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      const removeButton = screen.getByText('Remove')
      expect(removeButton).toHaveClass('px-2', 'py-1', 'text-sm', 'bg-red-500', 'text-white')
    })
  })

  describe('Type selection', () => {
    it('displays type as dropdown with correct default', () => {
      render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      const typeSelect = screen.getByLabelText('Type') as HTMLSelectElement
      expect(typeSelect.value).toBe('monster')
    })

    it('has all three type options', () => {
      render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      const typeSelect = screen.getByLabelText('Type') as HTMLSelectElement
      const options = Array.from(typeSelect.options).map((o) => o.value)
      expect(options).toContain('monster')
      expect(options).toContain('party_member')
      expect(options).toContain('custom')
    })

    it('calls onUpdate when type changes', () => {
      render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      const typeSelect = screen.getByLabelText('Type') as HTMLSelectElement
      fireEvent.change(typeSelect, { target: { value: 'party_member' } })
      expect(mockOnUpdate).toHaveBeenCalledWith(0, { type: 'party_member' })
    })
  })

  describe('Display Name field', () => {
    it('renders with correct value', () => {
      render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      expect(screen.getByDisplayValue('Goblin')).toBeInTheDocument()
    })

    it('calls onUpdate when display name changes', async () => {
      const user = userEvent.setup()
      render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      const nameInput = screen.getByDisplayValue('Goblin')
      await user.clear(nameInput)
      await user.type(nameInput, 'Orc Warrior')
      expect(mockOnUpdate).toHaveBeenCalled()
    })

    it('has placeholder text', () => {
      render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      expect(screen.getByPlaceholderText('e.g., Goblin')).toBeInTheDocument()
    })
  })

  describe('Quantity field', () => {
    it('renders with correct value', () => {
      render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      const quantityInput = screen.getByDisplayValue('2') as HTMLInputElement
      expect(quantityInput.name).toBe('participants.0.quantity')
    })

    it('calls onUpdate when quantity changes', async () => {
      const user = userEvent.setup()
      render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      const quantityInput = screen.getByLabelText('Quantity') as HTMLInputElement
      await user.clear(quantityInput)
      await user.type(quantityInput, '5')
      expect(mockOnUpdate).toHaveBeenCalled()
    })

    it('has min constraint of 1', () => {
      const { container } = render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      const quantityInput = container.querySelector('input[name="participants.0.quantity"]') as HTMLInputElement
      expect(quantityInput.min).toBe('1')
    })
  })

  describe('HP field', () => {
    it('renders with correct value', () => {
      render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      expect(screen.getByDisplayValue('7')).toBeInTheDocument()
    })

    it('calls onUpdate when HP changes', async () => {
      const user = userEvent.setup()
      render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      const hpInput = screen.getByLabelText('HP (per individual)') as HTMLInputElement
      await user.clear(hpInput)
      await user.type(hpInput, '15')
      expect(mockOnUpdate).toHaveBeenCalled()
    })

    it('has min constraint of 0', () => {
      const { container } = render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      const hpInput = container.querySelector('input[name="participants.0.hp"]') as HTMLInputElement
      expect(hpInput.min).toBe('0')
    })
  })

  describe('Initiative field', () => {
    it('renders with empty value when initiative is null', () => {
      render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      const initiativeInput = screen.getByLabelText('Initiative (optional)') as HTMLInputElement
      expect(initiativeInput.value).toBe('')
    })

    it('calls onUpdate when initiative is set', async () => {
      const user = userEvent.setup()
      render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      const initiativeInput = screen.getByLabelText('Initiative (optional)') as HTMLInputElement
      await user.type(initiativeInput, '12')
      expect(mockOnUpdate).toHaveBeenCalled()
    })

    it('calls onUpdate with null when initiative is cleared', async () => {
      const participantWithInitiative = { ...mockParticipant, initiative: 5 }
      const user = userEvent.setup()
      render(
        <ParticipantForm
          index={0}
          participant={participantWithInitiative}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      const initiativeInput = screen.getByDisplayValue('5')
      await user.clear(initiativeInput)
      expect(mockOnUpdate).toHaveBeenCalledWith(0, { initiative: null })
    })
  })
})
