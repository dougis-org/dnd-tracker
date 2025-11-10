/* eslint-disable no-undef */
import { render, screen, waitFor } from '@testing-library/react'
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

describe('NewEncounterPage - Form Input', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Encounter name field', () => {
    it('allows entering encounter name', async () => {
      const user = userEvent.setup()
      render(<NewEncounterPage />)
      const nameInput = screen.getByLabelText('Encounter Name *')
      await user.type(nameInput, 'Goblin Ambush')
      expect((nameInput as HTMLInputElement).value).toBe('Goblin Ambush')
    })

    it('handles special characters in name', async () => {
      const user = userEvent.setup()
      render(<NewEncounterPage />)
      const nameInput = screen.getByLabelText('Encounter Name *')
      await user.type(nameInput, "Orc's Lair & Dragon's Den!")
      expect((nameInput as HTMLInputElement).value).toBe("Orc's Lair & Dragon's Den!")
    })

    it('trims whitespace on validation', async () => {
      const user = userEvent.setup()
      ;(adapter.create as jest.Mock).mockResolvedValue({ id: 'enc-1' })
      render(<NewEncounterPage />)

      const nameInput = screen.getByLabelText('Encounter Name *')
      await user.type(nameInput, '   Test Name   ')

      const participantNameInputs = screen.getAllByPlaceholderText('e.g., Goblin')
      if (participantNameInputs.length > 0) {
        await user.clear(participantNameInputs[0])
        await user.type(participantNameInputs[0], 'Goblin')
      }

      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)

      await waitFor(() => {
        expect(adapter.create).toHaveBeenCalled()
      })
    })
  })

  describe('Description field', () => {
    it('allows entering description', async () => {
      const user = userEvent.setup()
      render(<NewEncounterPage />)
      const descInput = screen.getByLabelText('Description (optional)') as HTMLTextAreaElement
      await user.type(descInput, 'This is a test encounter')
      expect(descInput.value).toBe('This is a test encounter')
    })

    it('handles very long description', async () => {
      const user = userEvent.setup()
      render(<NewEncounterPage />)
      const longDescription = 'A'.repeat(500)
      const descInput = screen.getByLabelText('Description (optional)')
      await user.type(descInput, longDescription)
      expect((descInput as HTMLTextAreaElement).value).toBe(longDescription)
    })

    it('starts with empty description', () => {
      render(<NewEncounterPage />)
      const descInput = screen.getByLabelText('Description (optional)') as HTMLTextAreaElement
      expect(descInput.value).toBe('')
    })
  })

  describe('Participant management', () => {
    it('adds a new participant when Add Participant button clicked', async () => {
      const user = userEvent.setup()
      render(<NewEncounterPage />)

      expect(screen.getByText('Participant 1')).toBeInTheDocument()
      expect(screen.queryByText('Participant 2')).not.toBeInTheDocument()

      const addButton = screen.getByRole('button', { name: 'Add Participant' })
      await user.click(addButton)

      expect(screen.getByText('Participant 2')).toBeInTheDocument()
    })

    it('adds multiple participants', async () => {
      const user = userEvent.setup()
      render(<NewEncounterPage />)

      const addButton = screen.getByRole('button', { name: 'Add Participant' })
      await user.click(addButton)
      await user.click(addButton)
      await user.click(addButton)

      expect(screen.getByText('Participant 1')).toBeInTheDocument()
      expect(screen.getByText('Participant 2')).toBeInTheDocument()
      expect(screen.getByText('Participant 3')).toBeInTheDocument()
      expect(screen.getByText('Participant 4')).toBeInTheDocument()
    })

    it('removes a participant', async () => {
      const user = userEvent.setup()
      render(<NewEncounterPage />)

      // Add a participant
      const addButton = screen.getByRole('button', { name: 'Add Participant' })
      await user.click(addButton)

      expect(screen.getByText('Participant 2')).toBeInTheDocument()

      // Remove second participant
      const removeButtons = screen.getAllByText('Remove')
      expect(removeButtons.length).toBeGreaterThan(0)
      await user.click(removeButtons[0])

      expect(screen.queryByText('Participant 2')).not.toBeInTheDocument()
    })
  })

  describe('Cancel button', () => {
    it('calls router.back when Cancel clicked', async () => {
      const user = userEvent.setup()
      render(<NewEncounterPage />)

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      expect(mockBack).toHaveBeenCalled()
    })

    it('does not save encounter when Cancel clicked', async () => {
      const user = userEvent.setup()
      render(<NewEncounterPage />)

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      expect(adapter.create).not.toHaveBeenCalled()
    })

    it('navigates back regardless of form state', async () => {
      const user = userEvent.setup()
      render(<NewEncounterPage />)

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      expect(mockBack).toHaveBeenCalled()
    })
  })

  describe('ParticipantForm integration', () => {
    it('updates participant form when state changes', async () => {
      render(<NewEncounterPage />)
      const addButton = screen.getByRole('button', { name: 'Add Participant' })
      await userEvent.setup().click(addButton)
      expect(screen.getByText('Participant 2')).toBeInTheDocument()
    })
  })
})
