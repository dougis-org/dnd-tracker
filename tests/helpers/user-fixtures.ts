/**
 * Test fixtures for User model
 * Provides common test data to reduce duplication across test files
 */

import { User } from '@/lib/db/models/User';

/**
 * Default profile data for test users
 */
export const DEFAULT_TEST_PROFILE = {
  displayName: 'Test User',
  timezone: 'UTC',
  dndEdition: '5th Edition',
  experienceLevel: 'beginner',
  primaryRole: 'player',
  profileSetupCompleted: false,
  // Legacy fields for backward compatibility
  dndRuleset: '5e',
  role: 'player',
} as const;

/**
 * Default subscription data for test users
 */
export const DEFAULT_TEST_SUBSCRIPTION = {
  tier: 'free',
  status: 'active',
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
} as const;

/**
 * Default usage data for test users
 */
export const DEFAULT_TEST_USAGE = {
  partiesCount: 0,
  encountersCount: 0,
  creaturesCount: 0,
} as const;

/**
 * Default preferences for test users
 */
export const DEFAULT_TEST_PREFERENCES = {
  theme: 'system',
  emailNotifications: true,
  browserNotifications: false,
  timezone: 'UTC',
  language: 'en',
  diceRollAnimations: true,
  autoSaveEncounters: true,
  // Legacy fields for backward compatibility
  defaultInitiativeType: 'manual',
  autoAdvanceRounds: false,
} as const;

/**
 * Create minimal valid user data with required nested schemas
 * Can be used with User.create() or as test data
 */
export function createMinimalUserData(overrides: Record<string, unknown> = {}) {
  return {
    id: 'clerk_test_123',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    profile: DEFAULT_TEST_PROFILE,
    subscription: DEFAULT_TEST_SUBSCRIPTION,
    usage: DEFAULT_TEST_USAGE,
    preferences: DEFAULT_TEST_PREFERENCES,
    ...overrides,
  };
}

/**
 * Create and save a test user to the database
 * Returns the created user document
 */
export async function createTestUser(overrides: Record<string, unknown> = {}) {
  return await User.create(createMinimalUserData(overrides));
}

/**
 * Clerk webhook payload for user.created event
 */
export function createClerkUserCreatedPayload(overrides: Record<string, unknown> = {}) {
  return {
    type: 'user.created',
    data: {
      id: 'clerk_123abc',
      email_addresses: [{ email_address: 'clerk@example.com' }],
      first_name: 'John',
      last_name: 'Doe',
      ...overrides,
    },
  };
}

/**
 * Clerk webhook payload for user.updated event
 */
export function createClerkUserUpdatedPayload(userId: string, overrides: Record<string, unknown> = {}) {
  return {
    type: 'user.updated',
    data: {
      id: userId,
      email_addresses: [{ email_address: 'updated@example.com' }],
      ...overrides,
    },
  };
}

/**
 * Clerk webhook payload for user.deleted event
 */
export function createClerkUserDeletedPayload(userId: string) {
  return {
    type: 'user.deleted',
    data: {
      id: userId,
    },
  };
}
