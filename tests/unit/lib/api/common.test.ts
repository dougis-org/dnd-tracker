import { NextResponse } from 'next/server'
import { ApiErrors, withAuthAndDb, formatUserProfile, buildProfileUpdateObject } from '@/lib/api/common'
import { auth } from '@clerk/nextjs/server'
import { connectToDatabase } from '@/lib/db/connection'

jest.mock('@clerk/nextjs/server')
jest.mock('@/lib/db/connection')

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockConnectToDatabase = connectToDatabase as jest.MockedFunction<typeof connectToDatabase>

describe('common API utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('ApiErrors', () => {
    it('should return correct unauthorized response', async () => {
      const response = ApiErrors.unauthorized()
      const data = await response.json()
      expect(data).toEqual({ error: 'Unauthorized' })
      expect(response.status).toBe(401)
    })

    it('should return correct bad request response', async () => {
      const message = 'Invalid input'
      const response = ApiErrors.badRequest(message)
      const data = await response.json()
      expect(data).toEqual({ error: message })
      expect(response.status).toBe(400)
    })

    it('should return correct not found response', async () => {
      const message = 'Resource not found'
      const response = ApiErrors.notFound(message)
      const data = await response.json()
      expect(data).toEqual({ error: message })
      expect(response.status).toBe(404)
    })

    it('should return correct internal error response with default message', async () => {
      const response = ApiErrors.internalError()
      const data = await response.json()
      expect(data).toEqual({ error: 'Internal server error' })
      expect(response.status).toBe(500)
    })

    it('should return correct internal error response with custom message', async () => {
      const message = 'Custom error'
      const response = ApiErrors.internalError(message)
      const data = await response.json()
      expect(data).toEqual({ error: message })
      expect(response.status).toBe(500)
    })

    it('should return correct validation error response', async () => {
      const message = 'Missing required field'
      const response = ApiErrors.validationError(message)
      const data = await response.json()
      expect(data).toEqual({ error: 'Validation error: Missing required field' })
      expect(response.status).toBe(400)
    })

    it('should return correct method not allowed response', async () => {
      const response = ApiErrors.methodNotAllowed()
      const data = await response.json()
      expect(data).toEqual({ error: 'Method not allowed' })
      expect(response.status).toBe(405)
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