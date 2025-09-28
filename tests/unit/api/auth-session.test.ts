/**
 * Unit tests for /api/auth/session route handler
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { POST } from '@/app/api/auth/session/route'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { connectToDatabase } from '@/lib/db/connection'
import User from '@/lib/db/models/User'
import {
  createMockRequest,
  createInvalidJsonRequest,
  setupAuthMocks,
  setupAuthFailure,
  setupUserMocks,
  expectErrorResponse,
  expectSuccessResponse,
  createError,
  TEST_URLS,
  TEST_REQUEST_BODIES
} from '../../utils/test-helpers'

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockClerkClient = clerkClient as any
const mockConnectToDatabase = connectToDatabase as jest.MockedFunction<typeof connectToDatabase>
const mockUser = User as any

describe('/api/auth/session POST', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return user data for valid session', async () => {
    setupAuthMocks(mockAuth, mockClerkClient, mockConnectToDatabase)
    setupUserMocks(mockUser, 'found')

    const request = createMockRequest(TEST_URLS.AUTH_SESSION, 'POST', TEST_REQUEST_BODIES.VALID_SESSION_TOKEN)
    const response = await POST(request)
    const data = await expectSuccessResponse(response, 200, ['user', 'session'])

    expect(data.user.id).toBe('test-user-id')
    expect(data.user.email).toBe('test@example.com')
  })

  it('should return 401 for invalid session', async () => {
    setupAuthFailure(mockAuth, 'no-user')
    mockConnectToDatabase.mockResolvedValue(undefined)

    const request = createMockRequest(TEST_URLS.AUTH_SESSION, 'POST', TEST_REQUEST_BODIES.VALID_SESSION_TOKEN)
    const response = await POST(request)

    await expectErrorResponse(response, 401, 'Unauthorized')
  })

  it('should return 400 for missing session token', async () => {
    const request = createMockRequest(TEST_URLS.AUTH_SESSION, 'POST', TEST_REQUEST_BODIES.EMPTY_SESSION_TOKEN)
    const response = await POST(request)

    await expectErrorResponse(response, 400, 'sessionToken is required and must be a string')
  })

  it('should return 400 for invalid session token type', async () => {
    const request = createMockRequest(TEST_URLS.AUTH_SESSION, 'POST', TEST_REQUEST_BODIES.INVALID_SESSION_TOKEN)
    const response = await POST(request)

    await expectErrorResponse(response, 400, 'sessionToken is required and must be a string')
  })

  it('should return 401 when Clerk user is not found', async () => {
    setupAuthMocks(mockAuth, mockClerkClient, mockConnectToDatabase)
    mockClerkClient.users.getUser.mockResolvedValue(null)

    const request = createMockRequest(TEST_URLS.AUTH_SESSION, 'POST', TEST_REQUEST_BODIES.VALID_SESSION_TOKEN)
    const response = await POST(request)

    await expectErrorResponse(response, 401, 'Unauthorized')
  })

  it('should return 401 when Clerk throws error', async () => {
    setupAuthFailure(mockAuth, 'clerk-error')
    mockConnectToDatabase.mockResolvedValue(undefined)

    const request = createMockRequest(TEST_URLS.AUTH_SESSION, 'POST', TEST_REQUEST_BODIES.VALID_SESSION_TOKEN)
    const response = await POST(request)

    await expectErrorResponse(response, 401, 'Unauthorized')
  })

  it('should create new user when user not found in database', async () => {
    setupAuthMocks(mockAuth, mockClerkClient, mockConnectToDatabase, 'new-user-id')
    setupUserMocks(mockUser, 'create-success')

    const request = createMockRequest(TEST_URLS.AUTH_SESSION, 'POST', TEST_REQUEST_BODIES.VALID_SESSION_TOKEN)
    const response = await POST(request)
    const data = await expectSuccessResponse(response, 200)

    expect(data.user.id).toBe('test-user-id')
    expect(mockUser.createFromClerkUser).toHaveBeenCalled()
  })

  it('should return 500 when user creation fails', async () => {
    setupAuthMocks(mockAuth, mockClerkClient, mockConnectToDatabase, 'new-user-id')
    setupUserMocks(mockUser, 'create-failure')

    const request = createMockRequest(TEST_URLS.AUTH_SESSION, 'POST', TEST_REQUEST_BODIES.VALID_SESSION_TOKEN)
    const response = await POST(request)

    await expectErrorResponse(response, 500, 'Failed to create user profile')
  })

  it('should return 400 for invalid JSON in request body', async () => {
    const request = createInvalidJsonRequest(TEST_URLS.AUTH_SESSION)
    const response = await POST(request)

    await expectErrorResponse(response, 400, 'Invalid JSON in request body')
  })

  it('should return 500 for database errors', async () => {
    setupAuthMocks(mockAuth, mockClerkClient, mockConnectToDatabase)
    setupAuthFailure(mockAuth, 'db-error', mockConnectToDatabase)

    const request = createMockRequest(TEST_URLS.AUTH_SESSION, 'POST', TEST_REQUEST_BODIES.VALID_SESSION_TOKEN)
    const response = await POST(request)

    await expectErrorResponse(response, 500, 'Database connection failed')
  })

  it('should return 500 for Mongoose errors', async () => {
    setupAuthMocks(mockAuth, mockClerkClient, mockConnectToDatabase)
    const dbError = createError('MongooseError', 'Mongoose error')
    mockConnectToDatabase.mockRejectedValue(dbError)

    const request = createMockRequest(TEST_URLS.AUTH_SESSION, 'POST', TEST_REQUEST_BODIES.VALID_SESSION_TOKEN)
    const response = await POST(request)

    await expectErrorResponse(response, 500, 'Database connection failed')
  })

  it('should return 500 for generic errors', async () => {
    setupAuthMocks(mockAuth, mockClerkClient, mockConnectToDatabase)
    mockConnectToDatabase.mockRejectedValue(new Error('Generic error'))

    const request = createMockRequest(TEST_URLS.AUTH_SESSION, 'POST', TEST_REQUEST_BODIES.VALID_SESSION_TOKEN)
    const response = await POST(request)

    await expectErrorResponse(response, 500, 'Internal server error')
  })
})

// Import the other HTTP methods
import { GET, PUT, DELETE } from '@/app/api/auth/session/route'

describe('HTTP method handlers', () => {
  const httpMethods = [
    { name: 'GET', handler: GET },
    { name: 'PUT', handler: PUT },
    { name: 'DELETE', handler: DELETE }
  ]

  httpMethods.forEach(({ name, handler }) => {
    it(`should return 405 for ${name} method`, async () => {
      const response = await handler()
      await expectErrorResponse(response, 405, 'Method not allowed')
    })
  })
})