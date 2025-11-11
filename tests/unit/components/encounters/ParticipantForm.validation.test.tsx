/* eslint-disable no-undef */
import { render, screen } from '@testing-library/react'
import ParticipantForm from '@/components/encounters/ParticipantForm'
import { createMockParticipant } from '../../../test-helpers/encounter-fixtures'

describe('ParticipantForm - Validation & Errors', () => {
  const mockParticipant = createMockParticipant()
  const mockOnUpdate = jest.fn()
  const mockOnRemove = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
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

    it('displays error for displayName validation error', () => {
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

    it('displays error for quantity validation error', () => {
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

    it('uses correct error message text size and color (xs, red-600)', () => {
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

  describe('Field requirements', () => {
    it('has required indicator (*) for Name field', () => {
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

    it('has optional indicator for Initiative field', () => {
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
  })

  describe('Edge cases', () => {
    it('handles undefined HP by rendering as 0', () => {
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

    it('handles participant with initiative set', () => {
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
      expect(screen.getByDisplayValue('5')).toBeInTheDocument()
    })

    it('handles negative initiative values', () => {
      const participantNegativeInitiative = { ...mockParticipant, initiative: -2 }
      render(
        <ParticipantForm
          index={0}
          participant={participantNegativeInitiative}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      expect(screen.getByDisplayValue('-2')).toBeInTheDocument()
    })

    it('handles different participant types', () => {
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
      })
    })

    it('handles high HP values (500)', () => {
      const participantHighHp = { ...mockParticipant, hp: 500 }
      render(
        <ParticipantForm
          index={0}
          participant={participantHighHp}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      expect(screen.getByDisplayValue('500')).toBeInTheDocument()
    })

    it('handles large quantity values (999)', () => {
      const participantLargeQuantity = { ...mockParticipant, quantity: 999 }
      render(
        <ParticipantForm
          index={0}
          participant={participantLargeQuantity}
          onUpdate={mockOnUpdate}
          onRemove={mockOnRemove}
          errors={[]}
        />
      )
      expect(screen.getByDisplayValue('999')).toBeInTheDocument()
    })
  })
})
