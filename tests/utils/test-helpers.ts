/**
 * Common test utilities to reduce duplication across test files
 */
import { NextRequest } from 'next/server'
import { jest } from '@jest/globals'

/**
 * Mock user data factories
 */
export const createMockUser = (overrides: Partial<any> = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  profile: {
    displayName: 'Test User',
    dndRuleset: '5e',
    experienceLevel: 'beginner',
    role: 'player'
  },
  subscription: { tier: 'free', status: 'active' },
  usage: { partiesCount: 0, encountersCount: 0, creaturesCount: 0 },
  preferences: { theme: 'auto', defaultInitiativeType: 'manual', autoAdvanceRounds: false },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  updateOne: jest.fn().mockResolvedValue({}),
  ...overrides
})

export const createMockClerkUser = (overrides: Partial<any> = {}) => ({
  id: 'test-user-id',
  emailAddresses: [{ emailAddress: 'test@example.com' }],
  firstName: 'Test',
  lastName: 'User',
  ...overrides
})

/**
 * API request helpers
 */
export const createMockRequest = (
  url: string,
  method: string = 'POST',
  body?: any,
  headers: Record<string, string> = { 'Content-Type': 'application/json' }
): NextRequest => {
  return new NextRequest(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })
}

export const createInvalidJsonRequest = (url: string, method: string = 'POST'): NextRequest => {
  return new NextRequest(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: 'invalid json'
  })
}

/**
 * Mock setup helpers for common API dependencies
 */
export const setupAuthMocks = (
  mockAuth: jest.MockedFunction<any>,
  mockClerkClient: any,
  mockConnectToDatabase: jest.MockedFunction<any>,
  userId: string | null = 'test-user-id'
) => {
  mockAuth.mockResolvedValue({ userId })
  mockClerkClient.users = {
    getUser: jest.fn().mockResolvedValue(
      userId ? createMockClerkUser({ id: userId }) : null
    )
  }
  mockConnectToDatabase.mockResolvedValue(undefined)
}

const authFailureConfigs = {
  'no-user': (mockAuth: jest.MockedFunction<any>) =>
    mockAuth.mockResolvedValue({ userId: null }),
  'clerk-error': (mockAuth: jest.MockedFunction<any>) =>
    mockAuth.mockRejectedValue(new Error('Clerk error')),
  'db-error': (_: jest.MockedFunction<any>, mockConnectToDatabase?: jest.MockedFunction<any>) => {
    if (mockConnectToDatabase) {
      const dbError = new Error('Connection failed')
      dbError.name = 'MongoError'
      mockConnectToDatabase.mockRejectedValue(dbError)
    }
  }
}

export const setupAuthFailure = (
  mockAuth: jest.MockedFunction<any>,
  errorType: 'no-user' | 'clerk-error' | 'db-error',
  mockConnectToDatabase?: jest.MockedFunction<any>
) => {
  switch (errorType) {
    case 'no-user':
      authFailureConfigs['no-user'](mockAuth, mockConnectToDatabase)
      break
    case 'clerk-error':
      authFailureConfigs['clerk-error'](mockAuth, mockConnectToDatabase)
      break
    case 'db-error':
      authFailureConfigs['db-error'](mockAuth, mockConnectToDatabase)
      break
  }
}

const userMockConfigs = {
  found: (mockUser: any) => {
    mockUser.findByClerkId = jest.fn().mockResolvedValue(createMockUser())
  },
  'not-found': (mockUser: any) => {
    mockUser.findByClerkId = jest.fn().mockResolvedValue(null)
  },
  'create-success': (mockUser: any) => {
    mockUser.findByClerkId = jest.fn().mockResolvedValue(null)
    mockUser.createFromClerkUser = jest.fn().mockResolvedValue(createMockUser())
  },
  'create-failure': (mockUser: any) => {
    mockUser.findByClerkId = jest.fn().mockResolvedValue(null)
    mockUser.createFromClerkUser = jest.fn().mockRejectedValue(new Error('Creation failed'))
  },
  'update-failure': (mockUser: any) => {
    const user = createMockUser()
    user.updateOne = jest.fn().mockRejectedValue(new Error('Update failed'))
    mockUser.findByClerkId = jest.fn().mockResolvedValue(user)
  }
}

export const setupUserMocks = (
  mockUser: any,
  scenario: 'found' | 'not-found' | 'create-success' | 'create-failure' | 'update-failure'
) => {
  switch (scenario) {
    case 'found':
      userMockConfigs.found(mockUser)
      break
    case 'not-found':
      userMockConfigs['not-found'](mockUser)
      break
    case 'create-success':
      userMockConfigs['create-success'](mockUser)
      break
    case 'create-failure':
      userMockConfigs['create-failure'](mockUser)
      break
    case 'update-failure':
      userMockConfigs['update-failure'](mockUser)
      break
  }
}

/**
 * Validation mock helpers
 */
export const setupValidationMocks = (
  mockValidateProfileUpdate: jest.MockedFunction<any>,
  success: boolean = true,
  data?: any,
  errorMessage?: string
) => {
  const result = success
    ? { success: true, data: data || { profile: { displayName: 'Updated User' } } }
    : { success: false, error: { message: errorMessage || 'Validation failed' } }

  mockValidateProfileUpdate.mockReturnValue(result)
}

/**
 * Error creation helpers
 */
export const createError = (name: string, message: string): Error => {
  const error = new Error(message)
  error.name = name
  return error
}

/**
 * Response assertion helpers
 */
export const expectErrorResponse = async (
  response: Response,
  statusCode: number,
  errorMessage?: string
) => {
  const data = await response.json()
  expect(response.status).toBe(statusCode)
  if (errorMessage) {
    expect(data.error).toContain(errorMessage)
  } else {
    expect(data).toHaveProperty('error')
  }
}

export const expectSuccessResponse = async (
  response: Response,
  statusCode: number = 200,
  requiredFields?: string[]
) => {
  const data = await response.json()
  expect(response.status).toBe(statusCode)
  if (requiredFields) {
    requiredFields.forEach(field => {
      expect(data).toHaveProperty(field)
    })
  }
  return data
}

/**
 * Helper for testing API Error response methods
 */
export const expectApiErrorResponse = async (
  responseMethod: () => Response,
  expectedStatus: number,
  expectedMessage: string
) => {
  const response = responseMethod()
  const data = await response.json()
  expect(data).toEqual({ error: expectedMessage })
  expect(response.status).toBe(expectedStatus)
}

/**
 * Common test data
 */
export const TEST_URLS = {
  AUTH_SESSION: 'http://localhost:3000/api/auth/session',
  USERS_PROFILE: 'http://localhost:3000/api/users/profile'
} as const

export const TEST_REQUEST_BODIES = {
  VALID_SESSION_TOKEN: { sessionToken: 'valid-token' },
  INVALID_SESSION_TOKEN: { sessionToken: 123 },
  EMPTY_SESSION_TOKEN: {},
  PROFILE_UPDATE: {
    profile: { displayName: 'Updated User', role: 'dm', experienceLevel: 'expert' },
    preferences: { theme: 'dark', autoAdvanceRounds: true }
  }
} as const