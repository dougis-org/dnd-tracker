import { render, screen, waitFor } from '@testing-library/react'
import EncountersList from '@/components/encounters/EncountersList'
import type { EncounterPayload } from '@/lib/api/encounters'

// Mock the entire lib/api/encounters module
jest.mock('@/lib/api/encounters', () => ({
  __esModule: true,
  default: {
    list: jest.fn(),
  },
}))

// Import after mocking to get the mocked version
let mockAdapter: { list: jest.Mock }

beforeEach(() => {
  // Dynamic import to get fresh mock
  mockAdapter = require('@/lib/api/encounters').default as { list: jest.Mock }
  jest.clearAllMocks()
})

describe('EncountersList', () => {
  const mockEncounter1: EncounterPayload = {
    id: 'encounter-1',
    name: 'Goblin Ambush',
    description: 'A surprise attack',
    participants: [
      { id: 'p1', type: 'monster', displayName: 'Goblin', quantity: 3, hp: 7 },
    ],
    tags: [],
    template_flag: false,
    created_at: '2025-11-01T10:00:00Z',
    updated_at: '2025-11-01T10:00:00Z',
  }

  const mockEncounter2: EncounterPayload = {
    id: 'encounter-2',
    name: 'Dragon Lair',
    description: 'Battle with a dragon',
    participants: [
      { id: 'p2', type: 'monster', displayName: 'Dragon', quantity: 1, hp: 180 },
      { id: 'p3', type: 'party_member', displayName: 'Knight', quantity: 4, hp: 30 },
    ],
    tags: ['boss'],
    template_flag: false,
    created_at: '2025-11-02T10:00:00Z',
    updated_at: '2025-11-02T10:00:00Z',
  }

  it('displays loading state initially', () => {
    mockAdapter.list.mockImplementation(() => new Promise(() => {}))
    render(<EncountersList userId="user-001" />)
    expect(screen.getByText('Loading encounters...')).toBeInTheDocument()
  })

  it('loads and displays encounters', async () => {
    mockAdapter.list.mockResolvedValue([mockEncounter1, mockEncounter2])
    render(<EncountersList userId="user-001" />)

    await waitFor(() => {
      expect(screen.getByText('Goblin Ambush')).toBeInTheDocument()
      expect(screen.getByText('Dragon Lair')).toBeInTheDocument()
    })
  })

  it('calls adapter.list with the provided userId', async () => {
    mockAdapter.list.mockResolvedValue([mockEncounter1])
    render(<EncountersList userId="user-123" />)

    await waitFor(() => {
      expect(mockAdapter.list).toHaveBeenCalledWith('user-123')
    })
  })

  it('uses default userId when not provided', async () => {
    mockAdapter.list.mockResolvedValue([mockEncounter1])
    render(<EncountersList />)

    await waitFor(() => {
      expect(mockAdapter.list).toHaveBeenCalledWith('user-001')
    })
  })

  it('displays error state when loading fails', async () => {
    mockAdapter.list.mockRejectedValue(new Error('Network error'))
    render(<EncountersList userId="user-001" />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load encounters')).toBeInTheDocument()
    })
  })

  it('displays empty state when no encounters exist', async () => {
    mockAdapter.list.mockResolvedValue([])
    render(<EncountersList userId="user-001" />)

    await waitFor(() => {
      expect(screen.getByText('No encounters yet. Create one to get started!')).toBeInTheDocument()
    })
  })

  it('shows Create New Encounter button in empty state', async () => {
    mockAdapter.list.mockResolvedValue([])
    render(<EncountersList userId="user-001" />)

    await waitFor(() => {
      const createButton = screen.getByRole('link', { name: 'Create New Encounter' })
      expect(createButton).toHaveAttribute('href', '/encounters/new')
    })
  })

  it('renders cards for each encounter', async () => {
    mockAdapter.list.mockResolvedValue([mockEncounter1, mockEncounter2])
    render(<EncountersList userId="user-001" />)

    await waitFor(() => {
      expect(screen.getByText('Goblin Ambush')).toBeInTheDocument()
      expect(screen.getByText('Dragon Lair')).toBeInTheDocument()
      expect(screen.getByText('A surprise attack')).toBeInTheDocument()
      expect(screen.getByText('Battle with a dragon')).toBeInTheDocument()
    })
  })

  it('displays correct number of View buttons', async () => {
    mockAdapter.list.mockResolvedValue([mockEncounter1, mockEncounter2])
    render(<EncountersList userId="user-001" />)

    await waitFor(() => {
      const viewButtons = screen.getAllByRole('link', { name: 'View' })
      expect(viewButtons).toHaveLength(2)
    })
  })

  it('reruns adapter.list when userId changes', async () => {
    mockAdapter.list.mockResolvedValue([mockEncounter1])
    const { rerender } = render(<EncountersList userId="user-001" />)

    await waitFor(() => {
      expect(mockAdapter.list).toHaveBeenCalledWith('user-001')
    })

    jest.clearAllMocks()
    mockAdapter.list.mockResolvedValue([mockEncounter2])

    rerender(<EncountersList userId="user-002" />)

    await waitFor(() => {
      expect(mockAdapter.list).toHaveBeenCalledWith('user-002')
    })
  })

  it('logs error to console on load failure', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    mockAdapter.list.mockRejectedValue(new Error('Network error'))
    render(<EncountersList userId="user-001" />)

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load encounters:',
        expect.any(Error)
      )
    })

    consoleErrorSpy.mockRestore()
  })
})
