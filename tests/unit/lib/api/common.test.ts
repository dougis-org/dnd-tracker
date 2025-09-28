import { NextResponse } from 'next/server'
import { ApiErrors, withAuthAndDb, formatUserProfile, buildProfileUpdateObject } from '@/lib/api/common'
import { auth } from '@clerk/nextjs/server'
import { connectToDatabase } from '@/lib/db/connection'
import { expectApiErrorResponse, createMockUser } from '@tests/utils/test-helpers'

jest.mock('@clerk/nextjs/server')
jest.mock('@/lib/db/connection')

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockConnectToDatabase = connectToDatabase as jest.MockedFunction<typeof connectToDatabase>

describe('common API utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('ApiErrors', () => {
    const testErrorMethod = async (name: string, method: () => Response, expectedStatus: number, expectedMessage: string) => {
      it(`should return correct ${name} response`, async () => {
        await expectApiErrorResponse(method, expectedStatus, expectedMessage)
      })
    }

    testErrorMethod('unauthorized', () => ApiErrors.unauthorized(), 401, 'Unauthorized')
    testErrorMethod('bad request', () => ApiErrors.badRequest('Invalid input'), 400, 'Invalid input')
    testErrorMethod('not found', () => ApiErrors.notFound('Resource not found'), 404, 'Resource not found')
    testErrorMethod('internal error with default message', () => ApiErrors.internalError(), 500, 'Internal server error')
    testErrorMethod('internal error with custom message', () => ApiErrors.internalError('Custom error'), 500, 'Custom error')
    testErrorMethod('validation error', () => ApiErrors.validationError('Missing required field'), 400, 'Validation error: Missing required field')
    testErrorMethod('method not allowed', () => ApiErrors.methodNotAllowed(), 405, 'Method not allowed')
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

    const testErrorScenario = async (name: string, setup: () => void, expectedStatus: number, expectedMessage: string, shouldCallDb: boolean) => {
      setup()
      const mockHandler = jest.fn()
      const result = await withAuthAndDb(mockHandler)

      expect(mockAuth).toHaveBeenCalled()
      shouldCallDb ? expect(mockConnectToDatabase).toHaveBeenCalled() : expect(mockConnectToDatabase).not.toHaveBeenCalled()
      expect(mockHandler).not.toHaveBeenCalled()
      expect(result).toHaveProperty('status', expectedStatus)

      const data = await (result as any).json()
      expect(data).toEqual({ error: expectedMessage })
    }

    it('should return unauthorized when no userId', async () => {
      await testErrorScenario(
        'no userId',
        () => mockAuth.mockResolvedValue({ userId: null }),
        401,
        'Unauthorized',
        false
      )
    })

    it('should return internal error when auth throws', async () => {
      await testErrorScenario(
        'auth throws',
        () => mockAuth.mockRejectedValue(new Error('Auth failed')),
        500,
        'Internal server error',
        false
      )
    })

    it('should return internal error when database connection fails', async () => {
      await testErrorScenario(
        'database fails',
        () => {
          mockAuth.mockResolvedValue({ userId: 'user123' })
          mockConnectToDatabase.mockRejectedValue(new Error('DB connection failed'))
        },
        500,
        'Internal server error',
        true
      )
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
    const updateTestCases = [
      {
        name: 'profile fields',
        input: { profile: { displayName: 'New Name', dndRuleset: '5e' } },
        expected: { 'profile.displayName': 'New Name', 'profile.dndRuleset': '5e' }
      },
      {
        name: 'preferences fields',
        input: { preferences: { theme: 'dark', initiativeType: 'auto' } },
        expected: { 'preferences.theme': 'dark', 'preferences.initiativeType': 'auto' }
      },
      {
        name: 'both profile and preferences',
        input: { profile: { displayName: 'New Name' }, preferences: { theme: 'dark' } },
        expected: { 'profile.displayName': 'New Name', 'preferences.theme': 'dark' }
      },
      {
        name: 'empty object when no profile or preferences',
        input: {},
        expected: {}
      }
    ]

    updateTestCases.forEach(({ name, input, expected }) => {
      it(`should build update object for ${name}`, () => {
        const result = buildProfileUpdateObject(input)
        expect(result).toEqual(expected)
      })
    })

    it('should skip undefined values', () => {
      const validatedData = { profile: { displayName: 'New Name', dndRuleset: undefined } }
      const result = buildProfileUpdateObject(validatedData)
      expect(result).toEqual({ 'profile.displayName': 'New Name' })
      expect(result).not.toHaveProperty('profile.dndRuleset')
    })
  })
})