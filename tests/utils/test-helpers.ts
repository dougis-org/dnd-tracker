/**
 * Common test utilities to reduce duplication across test files
 */
import { NextRequest } from 'next/server'
import { jest } from '@jest/globals'

/**
 * Mock user data factories
 */
const DEFAULT_USER_DATA = {
  id: 'test-user-id',
  email: 'test@example.com',
  profile: { displayName: 'Test User', dndRuleset: '5e', experienceLevel: 'beginner', role: 'player' },
  subscription: { tier: 'free', status: 'active' },
  usage: { partiesCount: 0, encountersCount: 0, creaturesCount: 0 },
  preferences: { theme: 'auto', defaultInitiativeType: 'manual', autoAdvanceRounds: false },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

const DEFAULT_CLERK_USER_DATA = {
  id: 'test-user-id',
  emailAddresses: [{ emailAddress: 'test@example.com' }],
  firstName: 'Test',
  lastName: 'User'
}

export const createMockUser = (overrides: Partial<any> = {}) => ({
  ...DEFAULT_USER_DATA,
  updateOne: jest.fn().mockResolvedValue({}),
  ...overrides
})

export const createMockClerkUser = (overrides: Partial<any> = {}) => ({
  ...DEFAULT_CLERK_USER_DATA,
  ...overrides
})

/**
 * API request helpers
 */
const DEFAULT_HEADERS = { 'Content-Type': 'application/json' }

export const createMockRequest = (
  url: string,
  method: string = 'POST',
  body?: any,
  headers: Record<string, string> = DEFAULT_HEADERS
): NextRequest => new NextRequest(url, {
  method,
  headers,
  body: body ? JSON.stringify(body) : undefined
})

export const createInvalidJsonRequest = (url: string, method: string = 'POST'): NextRequest =>
  new NextRequest(url, { method, headers: DEFAULT_HEADERS, body: 'invalid json' })

/**
 * Mock setup helpers for common API dependencies
 */
const createClerkUsersService = (userId: string | null) => ({
  getUser: jest.fn().mockResolvedValue(userId ? createMockClerkUser({ id: userId }) : null)
})

export const setupAuthMocks = (
  mockAuth: jest.MockedFunction<any>,
  mockClerkClient: any,
  mockConnectToDatabase: jest.MockedFunction<any>,
  userId: string | null = 'test-user-id'
) => {
  mockAuth.mockResolvedValue({ userId })
  mockClerkClient.users = createClerkUsersService(userId)
  mockConnectToDatabase.mockResolvedValue(undefined)
}

const createDbError = () => {
  const error = new Error('Connection failed')
  error.name = 'MongoError'
  return error
}

const authFailureConfigs = {
  'no-user': (mockAuth: jest.MockedFunction<any>) => mockAuth.mockResolvedValue({ userId: null }),
  'clerk-error': (mockAuth: jest.MockedFunction<any>) => mockAuth.mockRejectedValue(new Error('Clerk error')),
  'db-error': (_: jest.MockedFunction<any>, mockConnectToDatabase?: jest.MockedFunction<any>) =>
    mockConnectToDatabase?.mockRejectedValue(createDbError())
}

export const setupAuthFailure = (
  mockAuth: jest.MockedFunction<any>,
  errorType: 'no-user' | 'clerk-error' | 'db-error',
  mockConnectToDatabase?: jest.MockedFunction<any>
) => {
  const validKeys = Object.keys(authFailureConfigs) as Array<keyof typeof authFailureConfigs>
  if (validKeys.includes(errorType)) {
    authFailureConfigs[errorType](mockAuth, mockConnectToDatabase)
  }
}

const createUserMockMethods = (findResult: any, createResult?: any, createError?: Error) => ({
  findByClerkId: jest.fn().mockResolvedValue(findResult),
  ...(createResult && { createFromClerkUser: jest.fn().mockResolvedValue(createResult) }),
  ...(createError && { createFromClerkUser: jest.fn().mockRejectedValue(createError) })
})

const userMockConfigs = {
  found: (mockUser: any) => Object.assign(mockUser, createUserMockMethods(createMockUser())),
  'not-found': (mockUser: any) => Object.assign(mockUser, createUserMockMethods(null)),
  'create-success': (mockUser: any) => Object.assign(mockUser, createUserMockMethods(null, createMockUser())),
  'create-failure': (mockUser: any) => Object.assign(mockUser, createUserMockMethods(null, null, new Error('Creation failed'))),
  'update-failure': (mockUser: any) => {
    const user = createMockUser()
    user.updateOne = jest.fn().mockRejectedValue(new Error('Update failed'))
    Object.assign(mockUser, createUserMockMethods(user))
  }
}

export const setupUserMocks = (
  mockUser: any,
  scenario: 'found' | 'not-found' | 'create-success' | 'create-failure' | 'update-failure'
) => {
  const validKeys = Object.keys(userMockConfigs) as Array<keyof typeof userMockConfigs>
  if (validKeys.includes(scenario)) {
    userMockConfigs[scenario](mockUser)
  }
}

/**
 * Validation mock helpers
 */
const createValidationResult = (success: boolean, data?: any, errorMessage?: string) =>
  success
    ? { success: true, data: data || { profile: { displayName: 'Updated User' } } }
    : { success: false, error: { message: errorMessage || 'Validation failed' } }

export const setupValidationMocks = (
  mockValidateProfileUpdate: jest.MockedFunction<any>,
  success: boolean = true,
  data?: any,
  errorMessage?: string
) => mockValidateProfileUpdate.mockReturnValue(createValidationResult(success, data, errorMessage))

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
const assertResponseStatus = (response: Response, statusCode: number) =>
  expect(response.status).toBe(statusCode)

const assertErrorProperty = (data: any, errorMessage?: string) =>
  errorMessage ? expect(data.error).toContain(errorMessage) : expect(data).toHaveProperty('error')

const assertRequiredFields = (data: any, requiredFields?: string[]) =>
  requiredFields?.forEach(field => expect(data).toHaveProperty(field))

export const expectErrorResponse = async (response: Response, statusCode: number, errorMessage?: string) => {
  const data = await response.json()
  assertResponseStatus(response, statusCode)
  assertErrorProperty(data, errorMessage)
}

export const expectSuccessResponse = async (response: Response, statusCode: number = 200, requiredFields?: string[]) => {
  const data = await response.json()
  assertResponseStatus(response, statusCode)
  assertRequiredFields(data, requiredFields)
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