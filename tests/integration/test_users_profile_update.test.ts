/**
 * Integration test for PUT /api/users/profile endpoint
 * API Contract: contracts/auth-api.yaml:/api/users/profile PUT (lines 63-110)
 * Request validation: profile.dndRuleset, experienceLevel, role enums
 */
import { describe, it, expect } from '@jest/globals'

const API_BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

describe('PUT /api/users/profile', () => {
  const mockAuthToken = 'Bearer valid_jwt_token'

  it('should update user profile with valid data', async () => {
    const profileUpdate = {
      profile: {
        displayName: 'Updated DM Name',
        dndRuleset: '5e' as const,
        experienceLevel: 'expert' as const,
        role: 'dm' as const,
      },
      preferences: {
        theme: 'dark' as const,
        defaultInitiativeType: 'auto' as const,
        autoAdvanceRounds: true,
      },
    }

    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': mockAuthToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileUpdate),
    })

    expect(response.status).toBe(200)

    const updatedUser = await response.json()

    // Validate that the update was applied
    expect(updatedUser.profile.displayName).toBe('Updated DM Name')
    expect(updatedUser.profile.dndRuleset).toBe('5e')
    expect(updatedUser.profile.experienceLevel).toBe('expert')
    expect(updatedUser.profile.role).toBe('dm')

    expect(updatedUser.preferences.theme).toBe('dark')
    expect(updatedUser.preferences.defaultInitiativeType).toBe('auto')
    expect(updatedUser.preferences.autoAdvanceRounds).toBe(true)

    // Validate full user schema is returned
    expect(updatedUser).toHaveProperty('id')
    expect(updatedUser).toHaveProperty('email')
    expect(updatedUser).toHaveProperty('subscription')
    expect(updatedUser).toHaveProperty('usage')
    expect(updatedUser).toHaveProperty('createdAt')
    expect(updatedUser).toHaveProperty('updatedAt')
  })

  it('should validate dndRuleset enum values', async () => {
    const invalidRuleset = {
      profile: {
        displayName: 'Test User',
        dndRuleset: 'invalid_ruleset',
        experienceLevel: 'beginner' as const,
        role: 'player' as const,
      },
    }

    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': mockAuthToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidRuleset),
    })

    expect(response.status).toBe(400)

    const error = await response.json()
    expect(error).toHaveProperty('error')
    expect(error.error).toContain('dndRuleset')
  })

  it('should validate experienceLevel enum values', async () => {
    const invalidExperience = {
      profile: {
        displayName: 'Test User',
        dndRuleset: '5e' as const,
        experienceLevel: 'invalid_level',
        role: 'player' as const,
      },
    }

    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': mockAuthToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidExperience),
    })

    expect(response.status).toBe(400)

    const error = await response.json()
    expect(error).toHaveProperty('error')
    expect(error.error).toContain('experienceLevel')
  })

  it('should validate role enum values', async () => {
    const invalidRole = {
      profile: {
        displayName: 'Test User',
        dndRuleset: '5e' as const,
        experienceLevel: 'beginner' as const,
        role: 'invalid_role',
      },
    }

    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': mockAuthToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidRole),
    })

    expect(response.status).toBe(400)

    const error = await response.json()
    expect(error).toHaveProperty('error')
    expect(error.error).toContain('role')
  })

  it('should allow partial profile updates', async () => {
    const partialUpdate = {
      preferences: {
        theme: 'light' as const,
      },
    }

    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': mockAuthToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partialUpdate),
    })

    expect(response.status).toBe(200)

    const updatedUser = await response.json()
    expect(updatedUser.preferences.theme).toBe('light')

    // Other fields should remain unchanged
    expect(updatedUser).toHaveProperty('profile')
    expect(updatedUser.profile).toHaveProperty('displayName')
    expect(updatedUser.profile).toHaveProperty('dndRuleset')
  })

  it('should validate theme enum values', async () => {
    const invalidTheme = {
      preferences: {
        theme: 'invalid_theme',
      },
    }

    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': mockAuthToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidTheme),
    })

    expect(response.status).toBe(400)
  })

  it('should validate defaultInitiativeType enum values', async () => {
    const invalidInitiative = {
      preferences: {
        defaultInitiativeType: 'invalid_type',
      },
    }

    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': mockAuthToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidInitiative),
    })

    expect(response.status).toBe(400)
  })

  it('should return 401 for unauthenticated requests', async () => {
    const profileUpdate = {
      profile: {
        displayName: 'Test User',
      },
    }

    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileUpdate),
    })

    expect(response.status).toBe(401)
  })

  it('should preserve subscription and usage data during profile updates', async () => {
    const profileUpdate = {
      profile: {
        displayName: 'Preserve Test User',
        dndRuleset: 'pf1' as const,
        experienceLevel: 'intermediate' as const,
        role: 'both' as const,
      },
    }

    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': mockAuthToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileUpdate),
    })

    expect(response.status).toBe(200)

    const updatedUser = await response.json()

    // Subscription should not be modified by profile updates
    expect(updatedUser.subscription).toHaveProperty('tier')
    expect(updatedUser.subscription).toHaveProperty('status')
    expect(['free', 'seasoned', 'expert', 'master', 'guild']).toContain(updatedUser.subscription.tier)

    // Usage metrics should not be modified by profile updates
    expect(updatedUser.usage).toHaveProperty('partiesCount')
    expect(updatedUser.usage).toHaveProperty('encountersCount')
    expect(updatedUser.usage).toHaveProperty('creaturesCount')

    expect(typeof updatedUser.usage.partiesCount).toBe('number')
    expect(typeof updatedUser.usage.encountersCount).toBe('number')
    expect(typeof updatedUser.usage.creaturesCount).toBe('number')
  })
})