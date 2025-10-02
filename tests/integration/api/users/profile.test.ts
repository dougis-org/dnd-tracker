/**
 * Integration tests for User Profile API
 * Tests follow TDD - written BEFORE implementation
 * Expected: All tests should FAIL initially
 *
 * Scenarios covered (from quickstart.md):
 * - Scenario 2: First-time profile setup (indirectly)
 * - Scenario 4: Update profile in settings
 * - Scenario 7: Profile validation errors
 * - Scenario 8: Authorization checks
 *
 * @jest-environment node
 */

// Unmock User model for real database operations
jest.unmock('@/lib/db/models/User');

import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import {
  setupTestDatabase,
  clearTestDatabase,
  teardownTestDatabase,
} from '@tests/helpers/db-helpers';
import { User } from '@/lib/db/models/User';
import type { IUser } from '@/lib/db/models/User';
import { GET, PATCH } from '@/app/api/users/[id]/profile/route';
import { MAX_DISPLAY_NAME_LENGTH } from '@/lib/services/profileValidation';

beforeAll(async () => {
  await setupTestDatabase();
});

afterEach(async () => {
  await clearTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});

/**
 * Create a test user with standard profile data
 * Extracted to reduce duplication across test suites
 */
async function createTestUser(
  userId = 'user_test123',
  overrides: Partial<{
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    displayName: string;
    dndRuleset: string;
    experienceLevel: string;
    role: string;
  }> = {}
): Promise<IUser> {
  return User.create({
    id: userId,
    email: overrides.email || 'testuser@example.com',
    username: overrides.username || 'testuser',
    firstName: overrides.firstName || 'Test',
    lastName: overrides.lastName || 'User',
    authProvider: 'clerk',
    isEmailVerified: true,
    profile: {
      displayName: overrides.displayName || 'Test User',
      dndRuleset: overrides.dndRuleset || '5e',
      experienceLevel: overrides.experienceLevel || 'intermediate',
      role: overrides.role || 'dm',
    },
    subscription: {
      tier: 'free',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    usage: {
      partiesCount: 0,
      encountersCount: 0,
      creaturesCount: 0,
    },
    preferences: {
      theme: 'auto',
      defaultInitiativeType: 'manual',
      autoAdvanceRounds: false,
    },
    lastClerkSync: new Date(),
    syncStatus: 'active',
  });
}

describe('User Profile API - GET /api/users/[id]/profile', () => {
  let testUser: IUser;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  test('should return user profile with authentication', async () => {
    // Simulate authenticated request with Clerk context
    const mockRequest = new Request(
      `http://localhost:3000/api/users/${testUser._id}/profile`,
      {
        method: 'GET',
      }
    );

    // Mock Clerk auth context
    const mockAuth = {
      userId: testUser.id,
      sessionId: 'session_123',
    };

    // Call GET handler
    const response = await GET(mockRequest, {
      params: Promise.resolve({ id: String(testUser._id) }),
      auth: mockAuth,
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toMatchObject({
      id: testUser._id.toString(),
      email: 'testuser@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      profile: {
        displayName: 'Test User',
        dndRuleset: '5e',
        experienceLevel: 'intermediate',
        role: 'dm',
      },
    });
  });

  test('should return 401 without Clerk authentication', async () => {
    const mockRequest = new Request(
      `http://localhost:3000/api/users/${testUser._id}/profile`,
      {
        method: 'GET',
      }
    );

    // No auth context provided
    const response = await GET(mockRequest, {
      params: Promise.resolve({ id: String(testUser._id) }),
    });

    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data).toMatchObject({
      success: false,
      error: expect.stringContaining('Unauthorized'),
    });
  });

  test('should return 403 if user ID does not match authenticated user', async () => {
    // Create different user
    const otherUser = await createTestUser('user_other456', {
      email: 'other@example.com',
      username: 'otheruser',
      firstName: 'Other',
      lastName: 'User',
      displayName: 'Other User',
      experienceLevel: 'beginner',
      role: 'player',
    });

    const mockRequest = new Request(
      `http://localhost:3000/api/users/${testUser._id}/profile`,
      {
        method: 'GET',
      }
    );

    // Authenticated as different user trying to access testUser's profile
    const mockAuth = {
      userId: otherUser.id, // Different user ID
      sessionId: 'session_456',
    };

    const response = await GET(mockRequest, {
      params: Promise.resolve({ id: String(testUser._id) }),
      auth: mockAuth,
    });

    expect(response.status).toBe(403);

    const data = await response.json();
    expect(data).toMatchObject({
      success: false,
      error: expect.stringContaining('Forbidden'),
    });
  });

  test('should return 404 if user not found', async () => {
    const mockRequest = new Request(
      'http://localhost:3000/api/users/507f1f77bcf86cd799439011/profile',
      {
        method: 'GET',
      }
    );

    const mockAuth = {
      userId: testUser.id,
      sessionId: 'session_123',
    };

    const response = await GET(mockRequest, {
      params: Promise.resolve({ id: '507f1f77bcf86cd799439011' }),
      auth: mockAuth,
    });

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data).toMatchObject({
      success: false,
      error: expect.stringContaining('not found'),
    });
  });
});

describe('User Profile API - PATCH /api/users/[id]/profile', () => {
  let testUser: IUser;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  test('should update profile fields with valid data', async () => {
    const updateData = {
      displayName: 'Updated DM Name',
      experienceLevel: 'expert' as const,
      role: 'both' as const,
    };

    const mockRequest = new Request(
      `http://localhost:3000/api/users/${testUser._id}/profile`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }
    );

    const mockAuth = {
      userId: testUser.id,
      sessionId: 'session_123',
    };

    const response = await PATCH(mockRequest, {
      params: Promise.resolve({ id: String(testUser._id) }),
      auth: mockAuth,
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.profile).toMatchObject({
      displayName: 'Updated DM Name',
      experienceLevel: 'expert',
      role: 'both',
      dndRuleset: '5e', // Should remain unchanged
    });

    // Verify database was updated
    const updatedUser = await User.findById(testUser._id);
    expect(updatedUser?.profile.displayName).toBe('Updated DM Name');
    expect(updatedUser?.profile.experienceLevel).toBe('expert');
    expect(updatedUser?.profile.role).toBe('both');
  });

  test('should return 400 with validation errors for invalid data', async () => {
    const invalidData = {
      displayName: 'x'.repeat(MAX_DISPLAY_NAME_LENGTH + 1), // Exceeds max length
      experienceLevel: 'invalid_level', // Invalid enum
      dndRuleset: 'invalid_ruleset', // Invalid enum
    };

    const mockRequest = new Request(
      `http://localhost:3000/api/users/${testUser._id}/profile`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidData),
      }
    );

    const mockAuth = {
      userId: testUser.id,
      sessionId: 'session_123',
    };

    const response = await PATCH(mockRequest, {
      params: Promise.resolve({ id: String(testUser._id) }),
      auth: mockAuth,
    });

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data).toMatchObject({
      success: false,
      error: expect.stringContaining('Validation'),
      errors: expect.arrayContaining([
        expect.objectContaining({
          field: expect.any(String),
          message: expect.any(String),
        }),
      ]),
    });

    // Verify database was NOT updated
    const unchangedUser = await User.findById(testUser._id);
    expect(unchangedUser?.profile.displayName).toBe('Test User');
  });

  test('should return 401 without authentication', async () => {
    const mockRequest = new Request(
      `http://localhost:3000/api/users/${testUser._id}/profile`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ displayName: 'New Name' }),
      }
    );

    // No auth context provided
    const response = await PATCH(mockRequest, {
      params: Promise.resolve({ id: String(testUser._id) }),
    });

    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data).toMatchObject({
      success: false,
      error: expect.stringContaining('Unauthorized'),
    });
  });

  test('should return 403 if user ID does not match authenticated user', async () => {
    // Create different user
    const otherUser = await createTestUser('user_other456', {
      email: 'other@example.com',
      username: 'otheruser',
      firstName: 'Other',
      lastName: 'User',
      displayName: 'Other User',
      experienceLevel: 'beginner',
      role: 'player',
    });

    const mockRequest = new Request(
      `http://localhost:3000/api/users/${testUser._id}/profile`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ displayName: 'Hacked Name' }),
      }
    );

    // Authenticated as different user
    const mockAuth = {
      userId: otherUser.id,
      sessionId: 'session_456',
    };

    const response = await PATCH(mockRequest, {
      params: Promise.resolve({ id: String(testUser._id) }),
      auth: mockAuth,
    });

    expect(response.status).toBe(403);

    const data = await response.json();
    expect(data).toMatchObject({
      success: false,
      error: expect.stringContaining('Forbidden'),
    });

    // Verify profile was NOT updated
    const unchangedUser = await User.findById(testUser._id);
    expect(unchangedUser?.profile.displayName).toBe('Test User');
  });

  test('should return 404 if user not found', async () => {
    const mockRequest = new Request(
      'http://localhost:3000/api/users/507f1f77bcf86cd799439011/profile',
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ displayName: 'New Name' }),
      }
    );

    const mockAuth = {
      userId: testUser.id,
      sessionId: 'session_123',
    };

    const response = await PATCH(mockRequest, {
      params: Promise.resolve({ id: '507f1f77bcf86cd799439011' }),
      auth: mockAuth,
    });

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data).toMatchObject({
      success: false,
      error: expect.stringContaining('not found'),
    });
  });
});
