import type { ParticipantDoc } from '@/types/encounter'

/**
 * Shared test fixtures for encounter-related tests
 * Eliminates duplication across ParticipantForm and NewEncounterPage tests
 */

export const createMockParticipant = (overrides?: Partial<ParticipantDoc>): ParticipantDoc => ({
  type: 'monster',
  displayName: 'Goblin',
  quantity: 2,
  hp: 7,
  initiative: null,
  ...overrides,
})

export const createMockParticipantWithType = (type: ParticipantDoc['type']): ParticipantDoc =>
  createMockParticipant({ type })

export const createMockParticipantWithName = (displayName: string): ParticipantDoc =>
  createMockParticipant({ displayName })

export const createMockParticipantWithHp = (hp: number): ParticipantDoc =>
  createMockParticipant({ hp })

export const createMockParticipantWithQuantity = (quantity: number): ParticipantDoc =>
  createMockParticipant({ quantity })

export const createMockParticipantWithInitiative = (initiative: number | null): ParticipantDoc =>
  createMockParticipant({ initiative })

// Commonly used participant types
export const mockMonsterParticipant = createMockParticipantWithType('monster')
export const mockPartyMemberParticipant = createMockParticipantWithType('party_member')
export const mockCustomParticipant = createMockParticipantWithType('custom')

// Common test participants
export const mockGoblin = createMockParticipantWithName('Goblin')
export const mockOrcWarrior = createMockParticipantWithName('Orc Warrior')
export const mockGiantSpider = createMockParticipantWithName('Giant Spider')

/**
 * Creates mock functions for component callbacks
 */
export const createMockCallbacks = () => ({
  onUpdate: jest.fn(),
  onRemove: jest.fn(),
})

/**
 * Setup function for common test initialization
 */
export const setupParticipantFormTest = () => {
  const mockParticipant = createMockParticipant()
  const { onUpdate, onRemove } = createMockCallbacks()

  const beforeEach = () => {
    jest.clearAllMocks()
  }

  return {
    mockParticipant,
    onUpdate,
    onRemove,
    beforeEach,
  }
}

/**
 * Common error scenarios for testing
 */
export const mockErrors = {
  emptyNameError: [{ field: 'participants.0.displayName', message: 'Participant name is required' }],
  emptyEncounterNameError: [{ field: 'name', message: 'Name is required' }],
  negativeHpError: [{ field: 'participants.0.hp', message: 'HP must be positive' }],
}
