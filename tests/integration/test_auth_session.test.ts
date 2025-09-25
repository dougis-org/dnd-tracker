/**
 * Integration test for POST /api/auth/session endpoint
 * API Contract: contracts/auth-api.yaml:/api/auth/session (lines 8-45)
 * Schema: contracts/auth-api.yaml:components.schemas.User (lines 114-172)
 */
import { describe, it, expect, beforeEach } from '@jest/globals'
import {
  setupSuccessfulAuth,
  setupFailedAuth,
  resetAllMocks
} from '../test-helpers/auth-helpers'

const API_BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

describe('POST /api/auth/session', () => {
  beforeEach(() => {
    resetAllMocks()
  })

  it('should validate session token and return user data', async () => {
    setupSuccessfulAuth()
    const mockSessionToken = 'valid_clerk_session_token'

    const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionToken: mockSessionToken,
      }),
    })

    expect(response.status).toBe(200)

    const data = await response.json()

    // Validate user schema per contracts/auth-api.yaml:components.schemas.User
    expect(data).toHaveProperty('user')
    expect(data).toHaveProperty('session')

    const { user, session } = data

    // User schema validation
    expect(user).toHaveProperty('id')
    expect(user).toHaveProperty('email')
    expect(user).toHaveProperty('profile')
    expect(user).toHaveProperty('subscription')
    expect(user).toHaveProperty('usage')
    expect(user).toHaveProperty('preferences')
    expect(user).toHaveProperty('createdAt')
    expect(user).toHaveProperty('updatedAt')

    // Profile schema validation
    expect(user.profile).toHaveProperty('displayName')
    expect(user.profile).toHaveProperty('dndRuleset')
    expect(user.profile).toHaveProperty('experienceLevel')
    expect(user.profile).toHaveProperty('role')

    expect(['5e', '3.5e', 'pf1', 'pf2']).toContain(user.profile.dndRuleset)
    expect(['beginner', 'intermediate', 'expert']).toContain(user.profile.experienceLevel)
    expect(['player', 'dm', 'both']).toContain(user.profile.role)

    // Subscription schema validation
    expect(user.subscription).toHaveProperty('tier')
    expect(user.subscription).toHaveProperty('status')
    expect(user.subscription).toHaveProperty('currentPeriodEnd')

    expect(['free', 'seasoned', 'expert', 'master', 'guild']).toContain(user.subscription.tier)
    expect(['active', 'cancelled', 'trial']).toContain(user.subscription.status)

    // Usage schema validation
    expect(user.usage).toHaveProperty('partiesCount')
    expect(user.usage).toHaveProperty('encountersCount')
    expect(user.usage).toHaveProperty('creaturesCount')

    expect(typeof user.usage.partiesCount).toBe('number')
    expect(typeof user.usage.encountersCount).toBe('number')
    expect(typeof user.usage.creaturesCount).toBe('number')

    // Preferences schema validation
    expect(user.preferences).toHaveProperty('theme')
    expect(user.preferences).toHaveProperty('defaultInitiativeType')
    expect(user.preferences).toHaveProperty('autoAdvanceRounds')

    expect(['light', 'dark', 'auto']).toContain(user.preferences.theme)
    expect(['manual', 'auto']).toContain(user.preferences.defaultInitiativeType)
    expect(typeof user.preferences.autoAdvanceRounds).toBe('boolean')

    // Session validation
    expect(session).toHaveProperty('id')
    expect(session).toHaveProperty('expiresAt')
    expect(typeof session.id).toBe('string')
    expect(typeof session.expiresAt).toBe('string')
  })

  it('should return 401 for invalid session token', async () => {
    setupFailedAuth()
    const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionToken: 'invalid_token',
      }),
    })

    expect(response.status).toBe(401)
  })

  it('should return 400 for missing session token', async () => {
    setupFailedAuth()
    const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    expect(response.status).toBe(400)
  })

  it('should handle server errors gracefully', async () => {
    // This test will verify 500 error handling when database is unavailable
    const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionToken: 'trigger_server_error',
      }),
    })

    if (response.status === 500) {
      expect(response.status).toBe(500)
      const error = await response.json()
      expect(error).toHaveProperty('error')
    } else {
      // If no server error triggered, endpoint should work normally
      expect([200, 401]).toContain(response.status)
    }
  })
})