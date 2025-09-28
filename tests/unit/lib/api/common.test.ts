import { NextResponse } from 'next/server'
import { ApiErrors, withAuthAndDb, formatUserProfile, buildProfileUpdateObject } from '@/lib/api/common'
import { auth } from '@clerk/nextjs/server'
import { connectToDatabase } from '@/lib/db/connection'
import { expectApiErrorResponse, createMockUser } from '../../utils/test-helpers'

jest.mock('@clerk/nextjs/server')
jest.mock('@/lib/db/connection')

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockConnectToDatabase = connectToDatabase as jest.MockedFunction<typeof connectToDatabase>

describe('common API utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('ApiErrors', () => {
    const errorTestCases = [
      {
        name: 'unauthorized',
        method: () => ApiErrors.unauthorized(),
        expectedStatus: 401,
        expectedMessage: 'Unauthorized'
      },
      {
        name: 'bad request',
        method: () => ApiErrors.badRequest('Invalid input'),
        expectedStatus: 400,
        expectedMessage: 'Invalid input'
      },
      {
        name: 'not found',
        method: () => ApiErrors.notFound('Resource not found'),
        expectedStatus: 404,
        expectedMessage: 'Resource not found'
      },
      {
        name: 'internal error with default message',
        method: () => ApiErrors.internalError(),
        expectedStatus: 500,
        expectedMessage: 'Internal server error'
      },
      {
        name: 'internal error with custom message',
        method: () => ApiErrors.internalError('Custom error'),
        expectedStatus: 500,
        expectedMessage: 'Custom error'
      },
      {
        name: 'validation error',
        method: () => ApiErrors.validationError('Missing required field'),
        expectedStatus: 400,
        expectedMessage: 'Validation error: Missing required field'
      },
      {
        name: 'method not allowed',
        method: () => ApiErrors.methodNotAllowed(),
        expectedStatus: 405,
        expectedMessage: 'Method not allowed'
      }
    ]

    errorTestCases.forEach(({ name, method, expectedStatus, expectedMessage }) => {
      it(`should return correct ${name} response`, async () => {
        await expectApiErrorResponse(method, expectedStatus, expectedMessage)
      })
    })
  })

  describe('withAuthAndDb', () => {
    it('should call handler when user is authenticated', async () => {
      const userId = 'user123'
      const mockHandler = jest.fn().mockResolvedValue({ success: true })

      mockAuth.mockResolvedValue({ userId })
      mockConnectToDatabase.mockResolvedValue()

      const result = await withAuthAndDb(mockHandler)

      expect(mockAuth).toHaveBeenCalled()
      expect(mockConnectToDatabase).toHaveBeenCalled()
      expect(mockHandler).toHaveBeenCalledWith(userId)
      expect(result).toEqual({ success: true })
    })

    it('should return unauthorized when no userId', async () => {
      mockAuth.mockResolvedValue({ userId: null })
      const mockHandler = jest.fn()

      const result = await withAuthAndDb(mockHandler)

      expect(mockAuth).toHaveBeenCalled()
      expect(mockConnectToDatabase).not.toHaveBeenCalled()
      expect(mockHandler).not.toHaveBeenCalled()
      expect(result).toHaveProperty('json')
      expect(result).toHaveProperty('status', 401)

      const response = result as any
      const data = await response.json()
      expect(data).toEqual({ error: 'Unauthorized' })
    })

    it('should return internal error when auth throws', async () => {
      mockAuth.mockRejectedValue(new Error('Auth failed'))
      const mockHandler = jest.fn()

      const result = await withAuthAndDb(mockHandler)

      expect(result).toHaveProperty('json')
      expect(result).toHaveProperty('status', 500)

      const response = result as any
      const data = await response.json()
      expect(data).toEqual({ error: 'Internal server error' })
    })

    it('should return internal error when database connection fails', async () => {
      const userId = 'user123'
      mockAuth.mockResolvedValue({ userId })
      mockConnectToDatabase.mockRejectedValue(new Error('DB connection failed'))
      const mockHandler = jest.fn()

      const result = await withAuthAndDb(mockHandler)

      expect(result).toHaveProperty('json')
      expect(result).toHaveProperty('status', 500)

      const response = result as any
      const data = await response.json()
      expect(data).toEqual({ error: 'Internal server error' })
    })
  })

  describe('formatUserProfile', () => {
    it('should format user profile correctly', () => {
      const user = {
        id: 'user123',
        email: 'test@example.com',
        profile: { displayName: 'Test User' },
        subscription: { tier: 'free' },
        usage: { parties: 0 },
        preferences: { theme: 'light' },
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        sensitiveField: 'should not be included'
      }

      const result = formatUserProfile(user)

      expect(result).toEqual({
        id: 'user123',
        email: 'test@example.com',
        profile: { displayName: 'Test User' },
        subscription: { tier: 'free' },
        usage: { parties: 0 },
        preferences: { theme: 'light' },
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      })
      expect(result).not.toHaveProperty('sensitiveField')
    })
  })

  describe('buildProfileUpdateObject', () => {
    it('should build update object for profile fields', () => {
      const validatedData = {
        profile: {
          displayName: 'New Name',
          dndRuleset: '5e'
        }
      }

      const result = buildProfileUpdateObject(validatedData)

      expect(result).toEqual({
        'profile.displayName': 'New Name',
        'profile.dndRuleset': '5e'
      })
    })

    it('should build update object for preferences fields', () => {
      const validatedData = {
        preferences: {
          theme: 'dark',
          initiativeType: 'auto'
        }
      }

      const result = buildProfileUpdateObject(validatedData)

      expect(result).toEqual({
        'preferences.theme': 'dark',
        'preferences.initiativeType': 'auto'
      })
    })

    it('should build update object for both profile and preferences', () => {
      const validatedData = {
        profile: {
          displayName: 'New Name'
        },
        preferences: {
          theme: 'dark'
        }
      }

      const result = buildProfileUpdateObject(validatedData)

      expect(result).toEqual({
        'profile.displayName': 'New Name',
        'preferences.theme': 'dark'
      })
    })

    it('should skip undefined values', () => {
      const validatedData = {
        profile: {
          displayName: 'New Name',
          dndRuleset: undefined
        }
      }

      const result = buildProfileUpdateObject(validatedData)

      expect(result).toEqual({
        'profile.displayName': 'New Name'
      })
      expect(result).not.toHaveProperty('profile.dndRuleset')
    })

    it('should return empty object when no profile or preferences', () => {
      const validatedData = {}

      const result = buildProfileUpdateObject(validatedData)

      expect(result).toEqual({})
    })
  })
})