/**
 * Common utilities for integration tests to reduce duplication
 */

export const TEST_CONFIG = {
  API_BASE_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  MOCK_AUTH_TOKEN: 'Bearer valid_jwt_token'
}

/**
 * Common API request helper
 */
export async function apiRequest(
  endpoint: string,
  options: {
    method?: string
    body?: any
    headers?: Record<string, string>
    includeAuth?: boolean
  } = {}
) {
  const {
    method = 'GET',
    body,
    headers = {},
    includeAuth = true
  } = options

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers
  }

  if (includeAuth) {
    requestHeaders['Authorization'] = TEST_CONFIG.MOCK_AUTH_TOKEN
  }

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders
  }

  if (body) {
    requestOptions.body = JSON.stringify(body)
  }

  return fetch(`${TEST_CONFIG.API_BASE_URL}${endpoint}`, requestOptions)
}

/**
 * Common user profile validation
 */
export function validateUserSchema(user: any) {
  expect(user).toHaveProperty('id')
  expect(user).toHaveProperty('email')
  expect(user).toHaveProperty('profile')
  expect(user).toHaveProperty('subscription')
  expect(user).toHaveProperty('usage')
  expect(user).toHaveProperty('preferences')
  expect(user).toHaveProperty('createdAt')
  expect(user).toHaveProperty('updatedAt')
}

/**
 * Common profile schema validation
 */
export function validateProfileSchema(profile: any) {
  expect(profile).toHaveProperty('displayName')
  expect(profile).toHaveProperty('dndRuleset')
  expect(profile).toHaveProperty('experienceLevel')
  expect(profile).toHaveProperty('role')

  expect(['5e', '3.5e', 'pf1', 'pf2']).toContain(profile.dndRuleset)
  expect(['beginner', 'intermediate', 'expert']).toContain(profile.experienceLevel)
  expect(['player', 'dm', 'both']).toContain(profile.role)
}

/**
 * Common subscription schema validation
 */
export function validateSubscriptionSchema(subscription: any) {
  expect(subscription).toHaveProperty('tier')
  expect(subscription).toHaveProperty('status')

  expect(['free', 'seasoned', 'expert', 'master', 'guild']).toContain(subscription.tier)
  expect(['active', 'cancelled', 'trial']).toContain(subscription.status)
}

/**
 * Common usage metrics validation
 */
export function validateUsageSchema(usage: any) {
  expect(usage).toHaveProperty('partiesCount')
  expect(usage).toHaveProperty('encountersCount')
  expect(usage).toHaveProperty('creaturesCount')

  expect(typeof usage.partiesCount).toBe('number')
  expect(typeof usage.encountersCount).toBe('number')
  expect(typeof usage.creaturesCount).toBe('number')
  expect(usage.partiesCount).toBeGreaterThanOrEqual(0)
  expect(usage.encountersCount).toBeGreaterThanOrEqual(0)
  expect(usage.creaturesCount).toBeGreaterThanOrEqual(0)
}

/**
 * Common preferences validation
 */
export function validatePreferencesSchema(preferences: any) {
  expect(preferences).toHaveProperty('theme')
  expect(preferences).toHaveProperty('defaultInitiativeType')
  expect(preferences).toHaveProperty('autoAdvanceRounds')

  expect(['light', 'dark', 'auto']).toContain(preferences.theme)
  expect(['manual', 'auto']).toContain(preferences.defaultInitiativeType)
  expect(typeof preferences.autoAdvanceRounds).toBe('boolean')
}

/**
 * Common test data factories
 */
export const TestData = {
  profileUpdate: {
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
  },

  invalidData: {
    invalidRuleset: { profile: { dndRuleset: 'invalid' } },
    invalidExperience: { profile: { experienceLevel: 'invalid' } },
    invalidRole: { profile: { role: 'invalid' } },
    invalidTheme: { preferences: { theme: 'invalid' } },
    invalidInitiative: { preferences: { defaultInitiativeType: 'invalid' } }
  }
}