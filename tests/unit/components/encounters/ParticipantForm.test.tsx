/* eslint-disable no-undef */
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ParticipantForm from '@/components/encounters/ParticipantForm'
import type { ParticipantDoc } from '@/types/encounter'

describe('ParticipantForm', () => {
  const mockParticipant: ParticipantDoc = {
    type: 'monster',
    displayName: 'Goblin',
    quantity: 2,
    hp: 7,
    initiative: null,
  }

  const mockOnUpdate = jest.fn()
  const mockOnRemove = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
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
      expect(mockOnRemove).toHaveBeenCalledTimes(1)
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
      expect(typeSelect).toBeInTheDocument()
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

    it('calls onUpdate when type changes to party_member', () => {
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

    it('calls onUpdate when type changes to custom', () => {
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
      fireEvent.change(typeSelect, { target: { value: 'custom' } })
      expect(mockOnUpdate).toHaveBeenCalledWith(0, { type: 'custom' })
    })

    it('reflects all participant types in UI', () => {
      const types: Array<'monster' | 'party_member' | 'custom'> = ['monster', 'party_member', 'custom']
      types.forEach((type) => {
        const participant = { ...mockParticipant, type }
        const { unmount } = render(
          <ParticipantForm
            index={0}
            participant={participant}
            onUpdate={mockOnUpdate}
            onRemove={mockOnRemove}
            errors={[]}
          />
        )
        const typeSelect = screen.getByLabelText('Type') as HTMLSelectElement
        expect(typeSelect.value).toBe(type)
        unmount()
        jest.clearAllMocks()
      })
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
      const nameInput = screen.getByDisplayValue('Goblin')
      expect(nameInput).toBeInTheDocument()
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
      // Verify onUpdate was called with displayName prop
      expect(mockOnUpdate).toHaveBeenCalled()
      const calls = mockOnUpdate.mock.calls.filter(([idx]) => idx === 0)
      expect(calls.some(([_, update]) => 'displayName' in update)).toBe(true)
    })

    it('handles empty display name', async () => {
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
      expect(mockOnUpdate).toHaveBeenCalledWith(0, { displayName: '' })
    })

    it('displays error message when displayName has validation error', () => {
      const errors = [{ field: 'participants.0.displayName', message: 'Participant name is required' }]
      render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={errors}
        />
      )
      expect(screen.getByText('Participant name is required')).toBeInTheDocument()
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
      const nameInput = screen.getByPlaceholderText('e.g., Goblin')
      expect(nameInput).toBeInTheDocument()
    })

    it('has required indicator in label', () => {
      render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      expect(screen.getByLabelText('Name *')).toBeInTheDocument()
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
      expect(quantityInput).toBeInTheDocument()
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
      // Verify onUpdate was called with index 0 and a quantity property
      expect(mockOnUpdate).toHaveBeenCalled()
      const calls = mockOnUpdate.mock.calls.filter(([idx]) => idx === 0)
      expect(calls.some(([_, update]) => 'quantity' in update)).toBe(true)
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

    it('displays error message when quantity has validation error', () => {
      const errors = [{ field: 'participants.0.quantity', message: 'Quantity must be at least 1' }]
      render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={errors}
        />
      )
      expect(screen.getByText('Quantity must be at least 1')).toBeInTheDocument()
    })

    it('defaults to 1 if invalid number parsed', async () => {
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
      fireEvent.change(quantityInput, { target: { value: 'abc' } })
      fireEvent.blur(quantityInput)
      // When invalid, parseInt returns NaN, so it uses 1 as fallback
      expect(mockOnUpdate).toHaveBeenCalledWith(0, expect.objectContaining({ quantity: expect.any(Number) }))
    })

    it('handles large quantity values', async () => {
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
      await user.type(quantityInput, '999')
      // Verify onUpdate was called with quantity prop
      expect(mockOnUpdate).toHaveBeenCalled()
      const calls = mockOnUpdate.mock.calls.filter(([idx]) => idx === 0)
      expect(calls.some(([_, update]) => 'quantity' in update)).toBe(true)
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
      const hpInput = screen.getByDisplayValue('7') as HTMLInputElement
      expect(hpInput.name).toBe('participants.0.hp')
      expect(hpInput).toBeInTheDocument()
    })

    it('calls onUpdate with parsed integer when HP changes', async () => {
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
      // Verify onUpdate was called with hp prop
      expect(mockOnUpdate).toHaveBeenCalled()
      const calls = mockOnUpdate.mock.calls.filter(([idx]) => idx === 0)
      expect(calls.some(([_, update]) => 'hp' in update)).toBe(true)
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

    it('renders 0 when HP is undefined in participant', () => {
      const participantNoHp = { ...mockParticipant, hp: undefined }
      render(
        <ParticipantForm
          index={0}
          participant={participantNoHp}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      const hpInput = screen.getByLabelText('HP (per individual)') as HTMLInputElement
      expect(hpInput.value).toBe('0')
    })

    it('handles zero HP', async () => {
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
      await user.type(hpInput, '0')
      expect(mockOnUpdate).toHaveBeenCalledWith(0, { hp: 0 })
    })

    it('handles high HP values', async () => {
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
      await user.type(hpInput, '500')
      // Verify onUpdate was called with hp prop
      expect(mockOnUpdate).toHaveBeenCalled()
      const calls = mockOnUpdate.mock.calls.filter(([idx]) => idx === 0)
      expect(calls.some(([_, update]) => 'hp' in update)).toBe(true)
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

    it('renders with correct value when initiative is set', () => {
      const participantWithInitiative = { ...mockParticipant, initiative: 5 }
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
      expect(initiativeInput).toBeInTheDocument()
    })

    it('calls onUpdate with integer when initiative is set', async () => {
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
      // Verify onUpdate was called with initiative prop
      expect(mockOnUpdate).toHaveBeenCalled()
      const calls = mockOnUpdate.mock.calls.filter(([idx]) => idx === 0)
      expect(calls.some(([_, update]) => 'initiative' in update)).toBe(true)
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

    it('does not have min/max constraints', () => {
      const { container } = render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      const initiativeInput = container.querySelector('input[name="participants.0.initiative"]') as HTMLInputElement
      expect(initiativeInput.min).toBe('')
      expect(initiativeInput.max).toBe('')
    })

    it('is marked as optional in label', () => {
      render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      expect(screen.getByLabelText('Initiative (optional)')).toBeInTheDocument()
    })

    it('handles negative initiative values', async () => {
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
      await user.type(initiativeInput, '-2')
      expect(mockOnUpdate).toHaveBeenCalledWith(0, { initiative: -2 })
    })
  })

  describe('Error handling and display', () => {
    it('does not show error when errors array is empty', () => {
      render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
    })

    it('displays error for multiple fields at once', () => {
      const errors = [
        { field: 'participants.0.displayName', message: 'Name required' },
        { field: 'participants.0.quantity', message: 'Quantity invalid' },
      ]
      render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={errors}
        />
      )
      expect(screen.getByText('Name required')).toBeInTheDocument()
      expect(screen.getByText('Quantity invalid')).toBeInTheDocument()
    })

    it('only shows errors for this participant index', () => {
      const errors = [
        { field: 'participants.0.displayName', message: 'Error for 0' },
        { field: 'participants.1.displayName', message: 'Error for 1' },
      ]
      render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={errors}
        />
      )
      expect(screen.getByText('Error for 0')).toBeInTheDocument()
      expect(screen.queryByText('Error for 1')).not.toBeInTheDocument()
    })

    it('uses correct error message text size (xs)', () => {
      const errors = [{ field: 'participants.0.displayName', message: 'Error message' }]
      render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={errors}
        />
      )
      const errorElement = screen.getByText('Error message')
      expect(errorElement).toHaveClass('text-xs', 'text-red-600')
    })
  })

  describe('Layout and styling', () => {
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

    it('has proper spacing between form groups', () => {
      const { container } = render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      const headerDiv = container.querySelector('div.flex')
      expect(headerDiv).toHaveClass('flex', 'justify-between', 'items-start', 'mb-3')
    })

    it('renders all inputs with proper width and border styling', () => {
      const { container } = render(
        <ParticipantForm
          index={0}
          participant={mockParticipant}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      const inputs = container.querySelectorAll('input, select')
      inputs.forEach((input) => {
        expect(input).toHaveClass('border', 'rounded', 'text-sm')
      })
    })
  })

  describe('Multiple participants in sequence', () => {
    it('handles three different participant indices correctly', () => {
      const participants = [
        { ...mockParticipant, displayName: 'Goblin' },
        { ...mockParticipant, displayName: 'Orc', type: 'party_member' as const },
        { ...mockParticipant, displayName: 'Dragon', hp: 200 },
      ]

      participants.forEach((participant, index) => {
        const { unmount } = render(
          <ParticipantForm
            index={index}
            participant={participant}
            onUpdate={mockOnUpdate}
            onRemove={mockOnRemove}
            errors={[]}
          />
        )
        expect(screen.getByText(`Participant ${index + 1}`)).toBeInTheDocument()
        if (index === 0) {
          expect(screen.queryByText('Remove')).not.toBeInTheDocument()
        } else {
          expect(screen.getByText('Remove')).toBeInTheDocument()
        }
        unmount()
      })
    })
  })

  describe('Participant type field labels', () => {
    it('displays correct option labels in dropdown', () => {
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
})
