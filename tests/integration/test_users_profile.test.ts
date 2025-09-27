/**
 * Integration test for GET /api/users/profile endpoint
 * API Contract: contracts/auth-api.yaml:/api/users/profile GET (lines 47-61)
 * Response Schema: contracts/auth-api.yaml:components.schemas.User
 */
import { describe, it, expect } from '@jest/globals'

const API_BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

describe('GET /api/users/profile', () => {
  const mockAuthToken = 'Bearer valid_jwt_token'

  it('should return current user profile with valid authentication', async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': mockAuthToken,
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(200)

    const user = await response.json()

    // Validate complete User schema per contracts/auth-api.yaml
    expect(user).toHaveProperty('id')
    expect(user).toHaveProperty('email')
    expect(user).toHaveProperty('profile')
    expect(user).toHaveProperty('subscription')
    expect(user).toHaveProperty('usage')
    expect(user).toHaveProperty('preferences')
    expect(user).toHaveProperty('createdAt')
    expect(user).toHaveProperty('updatedAt')

    // Validate data types
    expect(typeof user.id).toBe('string')
    expect(typeof user.email).toBe('string')
    expect(typeof user.profile).toBe('object')
    expect(typeof user.subscription).toBe('object')
    expect(typeof user.usage).toBe('object')
    expect(typeof user.preferences).toBe('object')

    // Validate profile structure
    expect(user.profile).toHaveProperty('displayName')
    expect(user.profile).toHaveProperty('dndRuleset')
    expect(user.profile).toHaveProperty('experienceLevel')
    expect(user.profile).toHaveProperty('role')

    // Validate enum values match contract
    expect(['5e', '3.5e', 'pf1', 'pf2']).toContain(user.profile.dndRuleset)
    expect(['beginner', 'intermediate', 'expert']).toContain(user.profile.experienceLevel)
    expect(['player', 'dm', 'both']).toContain(user.profile.role)

    // Validate subscription structure
    expect(user.subscription).toHaveProperty('tier')
    expect(user.subscription).toHaveProperty('status')
    expect(user.subscription).toHaveProperty('currentPeriodEnd')

    expect(['free', 'seasoned', 'expert', 'master', 'guild']).toContain(user.subscription.tier)
    expect(['active', 'cancelled', 'trial']).toContain(user.subscription.status)

    // Validate usage metrics structure
    expect(user.usage).toHaveProperty('partiesCount')
    expect(user.usage).toHaveProperty('encountersCount')
    expect(user.usage).toHaveProperty('creaturesCount')

    expect(typeof user.usage.partiesCount).toBe('number')
    expect(typeof user.usage.encountersCount).toBe('number')
    expect(typeof user.usage.creaturesCount).toBe('number')

    // For Free Adventurer tier, validate limits
    if (user.subscription.tier === 'free') {
      expect(user.usage.partiesCount).toBeLessThanOrEqual(1)
      expect(user.usage.encountersCount).toBeLessThanOrEqual(3)
      expect(user.usage.creaturesCount).toBeLessThanOrEqual(10)
    }

    // Validate preferences structure
    expect(user.preferences).toHaveProperty('theme')
    expect(user.preferences).toHaveProperty('defaultInitiativeType')
    expect(user.preferences).toHaveProperty('autoAdvanceRounds')

    expect(['light', 'dark', 'auto']).toContain(user.preferences.theme)
    expect(['manual', 'auto']).toContain(user.preferences.defaultInitiativeType)
    expect(typeof user.preferences.autoAdvanceRounds).toBe('boolean')

    // Validate timestamps
    expect(() => new Date(user.createdAt)).not.toThrow()
    expect(() => new Date(user.updatedAt)).not.toThrow()
  })

  it('should return 401 for unauthenticated requests', async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(401)
  })

  it('should return 401 for invalid bearer token', async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid_token',
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(401)
  })

  it('should return 401 for malformed authorization header', async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': 'malformed_header',
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(401)
  })

  it('should return user profile with current usage metrics', async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': mockAuthToken,
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(200)

    const user = await response.json()

    // Usage metrics should be non-negative integers
    expect(user.usage.partiesCount).toBeGreaterThanOrEqual(0)
    expect(user.usage.encountersCount).toBeGreaterThanOrEqual(0)
    expect(user.usage.creaturesCount).toBeGreaterThanOrEqual(0)

    // Usage should be integers, not floats
    expect(Number.isInteger(user.usage.partiesCount)).toBe(true)
    expect(Number.isInteger(user.usage.encountersCount)).toBe(true)
    expect(Number.isInteger(user.usage.creaturesCount)).toBe(true)
  })
})