/**
 * Test helpers for authentication mocking
 */

// Create a mock auth function that can be controlled by tests
export const mockAuth = jest.fn()
export const mockClerkClient = {
  users: {
    getUser: jest.fn()
  }
}
export const mockUser = {
  findByClerkId: jest.fn(),
  createFromClerkUser: jest.fn(),
  findOneAndUpdate: jest.fn()
}
export const mockConnectToDatabase = jest.fn()

// Helper functions for test setup
export const setupSuccessfulAuth = () => {
  mockAuth.mockResolvedValue({ userId: 'test-user-id' })
  mockClerkClient.users.getUser.mockResolvedValue({
    id: 'test-user-id',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
    firstName: 'Test',
    lastName: 'User'
  })

  const userInstance = {
    id: 'test-user-id',
    email: 'test@example.com',
    profile: {
      displayName: 'Test User',
      dndRuleset: '5e',
      experienceLevel: 'beginner',
      role: 'player'
    },
    subscription: {
      tier: 'free',
      status: 'active'
    },
    usage: {
      partiesCount: 0,
      encountersCount: 0,
      creaturesCount: 0
    },
    preferences: {
      theme: 'auto',
      defaultInitiativeType: 'manual',
      autoAdvanceRounds: false
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    updateOne: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockImplementation(function() { return Promise.resolve(this) })
  }

  mockUser.findByClerkId.mockResolvedValue(userInstance)
  mockUser.createFromClerkUser.mockResolvedValue(userInstance)
  mockUser.findOneAndUpdate.mockResolvedValue(userInstance)
  mockConnectToDatabase.mockResolvedValue(undefined)
}

export const setupFailedAuth = () => {
  mockAuth.mockResolvedValue({ userId: null })
  mockClerkClient.users.getUser.mockRejectedValue(new Error('Invalid session token'))
  mockUser.findByClerkId.mockResolvedValue(null)
  mockConnectToDatabase.mockResolvedValue(undefined)
}

export const setupMissingUser = () => {
  mockAuth.mockResolvedValue({ userId: 'test-user-id' })
  mockClerkClient.users.getUser.mockResolvedValue({
    id: 'test-user-id',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
    firstName: 'Test',
    lastName: 'User'
  })
  mockUser.findByClerkId.mockResolvedValue(null)
  mockConnectToDatabase.mockResolvedValue(undefined)
}

export const resetAllMocks = () => {
  mockAuth.mockReset()
  mockClerkClient.users.getUser.mockReset()
  mockUser.findByClerkId.mockReset()
  mockUser.createFromClerkUser.mockReset()
  mockUser.findOneAndUpdate.mockReset()
  mockConnectToDatabase.mockReset()
}