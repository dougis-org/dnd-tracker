/**
 * Unit tests for /api/users/profile route handlers
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { GET, PUT } from '@/app/api/users/profile/route'

// Dependencies mocked in jest.setup.ts

import { auth } from '@clerk/nextjs/server'
import { connectToDatabase } from '@/lib/db/connection'
import User from '@/lib/db/models/User'
import { validateProfileUpdate } from '@/lib/validations/auth'

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockConnectToDatabase = connectToDatabase as jest.MockedFunction<typeof connectToDatabase>
const mockUser = User as any
const mockValidateProfileUpdate = validateProfileUpdate as jest.MockedFunction<typeof validateProfileUpdate>

describe('/api/users/profile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return user profile for authenticated user', async () => {
      mockAuth.mockResolvedValue({ userId: 'test-user-id' })
      mockConnectToDatabase.mockResolvedValue(undefined)

      const mockUserInstance = {
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
        updatedAt: new Date('2024-01-01')
      }
      mockUser.findByClerkId = jest.fn().mockResolvedValue(mockUserInstance)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe('test-user-id')
      expect(data.email).toBe('test@example.com')
      expect(data.profile).toEqual(mockUserInstance.profile)
      expect(data.usage).toEqual(mockUserInstance.usage)
    })

    it('should return 401 for unauthenticated user', async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 if user not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'test-user-id' })
      mockConnectToDatabase.mockResolvedValue(undefined)
      mockUser.findByClerkId = jest.fn().mockResolvedValue(null)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('User profile not found')
    })
  })

  describe('PUT', () => {
    it('should update user profile with valid data', async () => {
      mockAuth.mockResolvedValue({ userId: 'test-user-id' })
      mockConnectToDatabase.mockResolvedValue(undefined)

      const mockUserInstance = {
        id: 'test-user-id',
        email: 'test@example.com',
        profile: {
          displayName: 'Updated User',
          dndRuleset: '5e',
          experienceLevel: 'expert',
          role: 'dm'
        },
        subscription: { tier: 'free', status: 'active' },
        usage: { partiesCount: 0, encountersCount: 0, creaturesCount: 0 },
        preferences: { theme: 'dark', defaultInitiativeType: 'auto', autoAdvanceRounds: true },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        updateOne: jest.fn().mockResolvedValue({})
      }

      mockUser.findByClerkId = jest.fn().mockResolvedValue(mockUserInstance)
      mockUser.findOneAndUpdate = jest.fn().mockResolvedValue(mockUserInstance)

      mockValidateProfileUpdate.mockReturnValue({
        success: true,
        data: {
          profile: { displayName: 'Updated User', role: 'dm', experienceLevel: 'expert' },
          preferences: { theme: 'dark', autoAdvanceRounds: true }
        }
      })

      const request = new NextRequest('http://localhost:3000/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: { displayName: 'Updated User', role: 'dm', experienceLevel: 'expert' },
          preferences: { theme: 'dark', autoAdvanceRounds: true }
        })
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.profile.displayName).toBe('Updated User')
    })

    it('should return 401 for unauthenticated user', async () => {
      mockAuth.mockResolvedValue({ userId: null })

      const request = new NextRequest('http://localhost:3000/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: { displayName: 'Test' } })
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 400 for invalid data', async () => {
      mockAuth.mockResolvedValue({ userId: 'test-user-id' })

      mockValidateProfileUpdate.mockReturnValue({
        success: false,
        error: { message: 'Invalid dndRuleset' }
      })

      const request = new NextRequest('http://localhost:3000/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: { dndRuleset: 'invalid' } })
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Validation error')
    })
  })
})