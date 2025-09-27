/**
 * Unit tests for /api/auth/session route handler
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/session/route'

// Dependencies mocked in jest.setup.ts

import { auth, clerkClient } from '@clerk/nextjs/server'
import { connectToDatabase } from '@/lib/db/connection'
import User from '@/lib/db/models/User'

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockClerkClient = clerkClient as any
const mockConnectToDatabase = connectToDatabase as jest.MockedFunction<typeof connectToDatabase>
const mockUser = User as any

describe('/api/auth/session POST', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return user data for valid session', async () => {
    // Setup successful auth
    mockAuth.mockResolvedValue({ userId: 'test-user-id' })
    mockClerkClient.users = {
      getUser: jest.fn().mockResolvedValue({
        id: 'test-user-id',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'Test',
        lastName: 'User'
      })
    }
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
      updatedAt: new Date('2024-01-01'),
      updateOne: jest.fn().mockResolvedValue({})
    }
    mockUser.findByClerkId = jest.fn().mockResolvedValue(mockUserInstance)

    const request = new NextRequest('http://localhost:3000/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionToken: 'valid-token' })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('user')
    expect(data).toHaveProperty('session')
    expect(data.user.id).toBe('test-user-id')
    expect(data.user.email).toBe('test@example.com')
  })

  it('should return 401 for invalid session', async () => {
    mockAuth.mockResolvedValue({ userId: null })
    mockConnectToDatabase.mockResolvedValue(undefined)

    const request = new NextRequest('http://localhost:3000/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionToken: 'invalid-token' })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 400 for missing session token', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('sessionToken is required and must be a string')
  })
})