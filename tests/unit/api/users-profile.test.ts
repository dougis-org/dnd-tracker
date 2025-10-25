/**
 * Unit tests for /api/users/profile route handlers
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { GET, PUT } from '@/app/api/users/profile/route'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { connectToDatabase } from '@/lib/db/connection'
import User from '@/lib/db/models/User'
import { validateProfileUpdate } from '@/lib/validations/auth'
import {
  createMockRequest,
  createInvalidJsonRequest,
  setupAuthMocks,
  setupAuthFailure,
  setupUserMocks,
  setupValidationMocks,
  expectErrorResponse,
  expectSuccessResponse,
  createError,
  TEST_URLS,
  TEST_REQUEST_BODIES
} from '@tests/utils/test-helpers'

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockClerkClient = clerkClient as jest.MockedFunction<typeof clerkClient>
const mockConnectToDatabase = connectToDatabase as jest.MockedFunction<typeof connectToDatabase>
const mockUser = User as any
const mockValidateProfileUpdate = validateProfileUpdate as jest.MockedFunction<typeof validateProfileUpdate>

describe('/api/users/profile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return user profile for authenticated user', async () => {
      setupAuthMocks(mockAuth, mockClerkClient, mockConnectToDatabase)
      setupUserMocks(mockUser, 'found')

      const response = await GET()
      const data = await expectSuccessResponse(response, 200, ['id', 'email', 'profile', 'usage'])

      expect(data.id).toBe('test-user-id')
      expect(data.email).toBe('test@example.com')
    })

    it('should return 401 for unauthenticated user', async () => {
      setupAuthFailure(mockAuth, 'no-user')

      const response = await GET()
      await expectErrorResponse(response, 401, 'Unauthorized')
    })

    it('should return 404 if user not found', async () => {
      setupAuthMocks(mockAuth, mockClerkClient, mockConnectToDatabase)
      setupUserMocks(mockUser, 'not-found')

      const response = await GET()
      await expectErrorResponse(response, 404, 'User profile not found')
    })
  })

  describe('PUT', () => {
    it('should update user profile with valid data', async () => {
      setupAuthMocks(mockAuth, mockClerkClient, mockConnectToDatabase)
      setupUserMocks(mockUser, 'found')
      setupValidationMocks(mockValidateProfileUpdate, true, TEST_REQUEST_BODIES.PROFILE_UPDATE)

      const request = createMockRequest(TEST_URLS.USERS_PROFILE, 'PUT', TEST_REQUEST_BODIES.PROFILE_UPDATE)
      const response = await PUT(request)
      const data = await expectSuccessResponse(response, 200, ['profile'])

      expect(data.profile.displayName).toBe('Test User')
    })

    it('should return 401 for unauthenticated user', async () => {
      setupAuthFailure(mockAuth, 'no-user')

      const request = createMockRequest(TEST_URLS.USERS_PROFILE, 'PUT', { profile: { displayName: 'Test' } })
      const response = await PUT(request)

      await expectErrorResponse(response, 401, 'Unauthorized')
    })

    it('should return 400 for invalid data', async () => {
      setupAuthMocks(mockAuth, mockClerkClient, mockConnectToDatabase)
      setupValidationMocks(mockValidateProfileUpdate, false, undefined, 'Invalid dndRuleset')

      const request = createMockRequest(TEST_URLS.USERS_PROFILE, 'PUT', { profile: { dndRuleset: 'invalid' } })
      const response = await PUT(request)

      await expectErrorResponse(response, 400, 'Validation error')
    })

    it('should return 404 if user not found during update', async () => {
      setupAuthMocks(mockAuth, mockClerkClient, mockConnectToDatabase)
      setupUserMocks(mockUser, 'not-found')
      setupValidationMocks(mockValidateProfileUpdate, true, { profile: { displayName: 'Updated User' } })

      const request = createMockRequest(TEST_URLS.USERS_PROFILE, 'PUT', { profile: { displayName: 'Updated User' } })
      const response = await PUT(request)

      await expectErrorResponse(response, 404, 'User profile not found')
    })

    it('should return 500 if updated user cannot be retrieved', async () => {
      setupAuthMocks(mockAuth, mockClerkClient, mockConnectToDatabase)
      setupValidationMocks(mockValidateProfileUpdate, true, { profile: { displayName: 'Updated User' } })

      const mockUserInstance = {
        id: 'test-user-id',
        email: 'test@example.com',
        updateOne: jest.fn().mockResolvedValue({})
      }

      // First call returns user, second call (after update) returns null
      mockUser.findByClerkId = jest.fn()
        .mockResolvedValueOnce(mockUserInstance)
        .mockResolvedValueOnce(null)

      const request = createMockRequest(TEST_URLS.USERS_PROFILE, 'PUT', { profile: { displayName: 'Updated User' } })
      const response = await PUT(request)

      await expectErrorResponse(response, 500, 'Failed to retrieve updated profile')
    })

    it('should return 400 for invalid JSON in request body', async () => {
      const request = createInvalidJsonRequest(TEST_URLS.USERS_PROFILE, 'PUT')
      const response = await PUT(request)

      await expectErrorResponse(response, 400, 'Invalid JSON in request body')
    })

    it('should return 400 for mongoose validation errors', async () => {
      setupAuthMocks(mockAuth, mockClerkClient, mockConnectToDatabase)
      setupValidationMocks(mockValidateProfileUpdate, true, { profile: { displayName: 'Updated User' } })

      const validationError = createError('ValidationError', 'Mongoose validation failed')
      const mockUserInstance = {
        id: 'test-user-id',
        email: 'test@example.com',
        updateOne: jest.fn().mockRejectedValue(validationError)
      }
      mockUser.findByClerkId = jest.fn().mockResolvedValue(mockUserInstance)

      const request = createMockRequest(TEST_URLS.USERS_PROFILE, 'PUT', { profile: { displayName: 'Updated User' } })
      const response = await PUT(request)

      await expectErrorResponse(response, 400, 'Validation error')
    })
  })
})

// Import the other HTTP methods
import { POST, DELETE } from '@/app/api/users/profile/route'

describe('HTTP method handlers', () => {
  const httpMethods = [
    { name: 'POST', handler: POST },
    { name: 'DELETE', handler: DELETE }
  ]

  httpMethods.forEach(({ name, handler }) => {
    it(`should return 405 for ${name} method`, async () => {
      const response = await handler()
      await expectErrorResponse(response, 405, 'Method not allowed')
    })
  })
})