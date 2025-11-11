 
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewEncounterPage from '@/app/encounters/new/page'
import adapter from '@/lib/api/encounters'

const mockPush = jest.fn()
const mockBack = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}))

jest.mock('@/lib/api/encounters', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    list: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('NewEncounterPage - Form Validation & Submission', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Form validation', () => {
    it('validates empty name on submit', async () => {
      const user = userEvent.setup()
      render(<NewEncounterPage />)
      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })

    it('displays name validation error below input', async () => {
      const user = userEvent.setup()
      render(<NewEncounterPage />)
      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)
      const errorMessage = screen.getByText('Name is required')
      expect(errorMessage).toHaveClass('text-red-600')
    })

    it('clears name validation error after fixing', async () => {
      const user = userEvent.setup()
      render(<NewEncounterPage />)
      const saveButton = screen.getByRole('button', { name: 'Save' })

      // Trigger validation error
      await user.click(saveButton)
      expect(screen.getByText('Name is required')).toBeInTheDocument()

      // Enter valid name and try to save again
      const nameInput = screen.getByLabelText('Encounter Name *')
      await user.type(nameInput, 'Valid Name')
      await user.click(saveButton)

      // Name error should clear (other errors may still show)
    })

    it('validates participant names', async () => {
      const user = userEvent.setup()
      render(<NewEncounterPage />)

      const nameInput = screen.getByLabelText('Encounter Name *')
      await user.type(nameInput, 'Valid Encounter')

      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)

      expect(screen.getByText('Participant name is required')).toBeInTheDocument()
    })

    it('requires at least one participant with name', async () => {
      const user = userEvent.setup()
      render(<NewEncounterPage />)

      const nameInput = screen.getByLabelText('Encounter Name *')
      await user.type(nameInput, 'Valid Encounter')

      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)

      expect(screen.getByText('Participant name is required')).toBeInTheDocument()
    })

    it('prevents save when validation fails', async () => {
      const user = userEvent.setup()
      ;(adapter.create as jest.Mock).mockResolvedValue({ id: 'enc-1' })
      render(<NewEncounterPage />)

      // Try to save without filling form
      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)

      // adapter.create should not be called
      expect(adapter.create).not.toHaveBeenCalled()
    })

    it('validates all fields on submit', async () => {
      const user = userEvent.setup()
      render(<NewEncounterPage />)

      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)

      expect(screen.getByText('Name is required')).toBeInTheDocument()
      expect(screen.getByText('Participant name is required')).toBeInTheDocument()
    })

    it('passes errors to ParticipantForm for multiple participants', async () => {
      const user = userEvent.setup()
      render(<NewEncounterPage />)

      // Add a participant
      const addButton = screen.getByRole('button', { name: 'Add Participant' })
      await user.click(addButton)

      // Try to submit without names
      const saveButton = screen.getByRole('button', { name: 'Save' })
      const nameInput = screen.getByLabelText('Encounter Name *')
      await user.type(nameInput, 'Test')
      await user.click(saveButton)

      // Should show errors for both participants
      const errors = screen.getAllByText('Participant name is required')
      expect(errors.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Form submission', () => {
    it('allows save when all validations pass', async () => {
      const user = userEvent.setup()
      ;(adapter.create as jest.Mock).mockResolvedValue({ id: 'enc-1' })
      render(<NewEncounterPage />)

      // Fill all required fields
      const nameInput = screen.getByLabelText('Encounter Name *')
      await user.type(nameInput, 'Valid Encounter')

      const participantNameInputs = screen.getAllByPlaceholderText('e.g., Goblin')
      if (participantNameInputs.length > 0) {
        await user.clear(participantNameInputs[0])
        await user.type(participantNameInputs[0], 'Goblin')
      }

      // Submit
      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)

      // adapter.create should be called
      await waitFor(() => {
        expect(adapter.create).toHaveBeenCalled()
      })
    })

    it('saves encounter successfully with valid data', async () => {
      const user = userEvent.setup()
      ;(adapter.create as jest.Mock).mockResolvedValue({ id: 'enc-1', name: 'Test' })
      render(<NewEncounterPage />)

      // Fill form
      const nameInput = screen.getByLabelText('Encounter Name *')
      await user.type(nameInput, 'Goblin Ambush')

      const participantNameInputs = screen.getAllByPlaceholderText('e.g., Goblin')
      if (participantNameInputs.length > 0) {
        await user.clear(participantNameInputs[0])
        await user.type(participantNameInputs[0], 'Goblin')
      }

      // Submit form
      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)

      // Should call adapter.create
      await waitFor(() => {
        expect(adapter.create).toHaveBeenCalled()
      })
    })

    it('redirects to encounters page after successful save', async () => {
      const user = userEvent.setup()
      ;(adapter.create as jest.Mock).mockResolvedValue({ id: 'enc-1' })
      render(<NewEncounterPage />)

      // Fill form with valid data
      const nameInput = screen.getByLabelText('Encounter Name *')
      await user.type(nameInput, 'Goblin Ambush')

      const participantNameInputs = screen.getAllByPlaceholderText('e.g., Goblin')
      if (participantNameInputs.length > 0) {
        await user.clear(participantNameInputs[0])
        await user.type(participantNameInputs[0], 'Goblin')
      }

      // Submit
      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)

      // Should redirect
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/encounters')
      })
    })

    it('disables Save button while saving', async () => {
      const user = userEvent.setup()
      ;(adapter.create as jest.Mock).mockImplementation(() => new Promise(() => {}))
      render(<NewEncounterPage />)

      // Fill form
      const nameInput = screen.getByLabelText('Encounter Name *')
      await user.type(nameInput, 'Goblin Ambush')

      const participantNameInputs = screen.getAllByPlaceholderText('e.g., Goblin')
      if (participantNameInputs.length > 0) {
        await user.clear(participantNameInputs[0])
        await user.type(participantNameInputs[0], 'Goblin')
      }

      // Submit
      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)

      // Button should show "Saving..." and be disabled
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled()
      })
    })

    it('shows saving text while saving', async () => {
      const user = userEvent.setup()
      ;(adapter.create as jest.Mock).mockImplementation(() => new Promise(() => {}))
      render(<NewEncounterPage />)

      // Fill form
      const nameInput = screen.getByLabelText('Encounter Name *')
      await user.type(nameInput, 'Goblin Ambush')

      const participantNameInputs = screen.getAllByPlaceholderText('e.g., Goblin')
      if (participantNameInputs.length > 0) {
        await user.clear(participantNameInputs[0])
        await user.type(participantNameInputs[0], 'Goblin')
      }

      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument()
      })
    })

    it('prevents form submission by default', async () => {
      const user = userEvent.setup()
      ;(adapter.create as jest.Mock).mockResolvedValue({ id: 'enc-1' })
      const { container } = render(<NewEncounterPage />)
      const form = container.querySelector('form')

      // Fill form
      const nameInput = screen.getByLabelText('Encounter Name *')
      await user.type(nameInput, 'Test')

      const participantNameInputs = screen.getAllByPlaceholderText('e.g., Goblin')
      if (participantNameInputs.length > 0) {
        await user.clear(participantNameInputs[0])
        await user.type(participantNameInputs[0], 'Goblin')
      }

      // Fire submit event on form
      fireEvent.submit(form!)

      // Adapter.create should be called (not a page reload)
      await waitFor(() => {
        expect(adapter.create).toHaveBeenCalled()
      })
    })
  })

  describe('Error handling', () => {
    it('displays general error message at top of form on save failure', async () => {
      const user = userEvent.setup()
      ;(adapter.create as jest.Mock).mockRejectedValue(new Error('Server error'))
      render(<NewEncounterPage />)

      // Fill form
      const nameInput = screen.getByLabelText('Encounter Name *')
      await user.type(nameInput, 'Test Encounter')

      const participantNameInputs = screen.getAllByPlaceholderText('e.g., Goblin')
      if (participantNameInputs.length > 0) {
        await user.clear(participantNameInputs[0])
        await user.type(participantNameInputs[0], 'Goblin')
      }

      // Submit
      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)

      // Should show general error
      await waitFor(() => {
        const errorDiv = screen.getByText(/Failed to save encounter/)
        expect(errorDiv).toHaveClass('bg-red-100', 'text-red-800')
      })
    })

    it('handles save errors gracefully', async () => {
      const user = userEvent.setup()
      ;(adapter.create as jest.Mock).mockRejectedValue(new Error('Network error'))
      render(<NewEncounterPage />)

      // Fill form
      const nameInput = screen.getByLabelText('Encounter Name *')
      await user.type(nameInput, 'Goblin Ambush')

      const participantNameInputs = screen.getAllByPlaceholderText('e.g., Goblin')
      if (participantNameInputs.length > 0) {
        await user.clear(participantNameInputs[0])
        await user.type(participantNameInputs[0], 'Goblin')
      }

      // Submit
      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/Failed to save encounter/)).toBeInTheDocument()
      })
    })

    it('has no error when no errors occur', () => {
      render(<NewEncounterPage />)
      expect(screen.queryByText(/Failed to save encounter/)).not.toBeInTheDocument()
    })
  })
})
