/**
 * Unit tests for user service operations
 * These tests follow TDD - written BEFORE implementation
 * Expected: All tests should FAIL initially
 *
 * @jest-environment node
 */

// Unmock User model to test real database operations
jest.unmock('@/lib/db/models/User');

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '@/lib/db/models/User';
import {
  updateUserProfile,
  getUserProfile,
  incrementUsageMetric,
  checkProfileComplete
} from '@/lib/services/userService';

let mongoServer: MongoMemoryServer;

beforeEach(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('User Service', () => {
  // Helper to create test user
  const createTestUser = async () => {
    return await User.create({
      id: 'test_user_123',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      profile: {
        displayName: 'Test User',
        dndRuleset: '5e',
        experienceLevel: 'beginner',
        role: 'player'
      },
      subscription: {
        tier: 'free',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      usage: {
        partiesCount: 0,
        encountersCount: 0,
        creaturesCount: 0
      },
      preferences: {
        theme: 'auto',
        defaultInitiativeType: 'manual',
        autoAdvanceRounds: false
      }
    });
  };

  describe('updateUserProfile', () => {
    test('should update profile fields successfully', async () => {
      const user = await createTestUser();
      const profileData = {
        displayName: 'Updated Name',
        timezone: 'America/New_York',
        experienceLevel: 'intermediate' as const,
        primaryRole: 'dm' as const
      };

      const updated = await updateUserProfile(user._id.toString(), profileData);

      expect(updated).toBeDefined();
      expect(updated?.displayName).toBe('Updated Name');
      expect(updated?.timezone).toBe('America/New_York');
      expect(updated?.experienceLevel).toBe('intermediate');
      expect(updated?.primaryRole).toBe('dm');
    });

    test('should return null for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const result = await updateUserProfile(fakeId, { displayName: 'Test' });
      expect(result).toBeNull();
    });

    test('should handle validation errors', async () => {
      const user = await createTestUser();
      const invalidData = {
        displayName: 'x'.repeat(101), // Exceeds 100 char limit
      };

      await expect(updateUserProfile(user._id.toString(), invalidData))
        .rejects.toThrow();
    });

    test('should allow partial updates', async () => {
      const user = await createTestUser();
      // Set a displayName first
      await updateUserProfile(user._id.toString(), { displayName: 'Original Name' });

      // Then do partial update
      const partialData = { timezone: 'Europe/London' };
      const updated = await updateUserProfile(user._id.toString(), partialData);

      expect(updated?.timezone).toBe('Europe/London');
      expect(updated?.displayName).toBe('Original Name'); // Other fields unchanged
    });
  });

  describe('getUserProfile', () => {
    test('should fetch user profile successfully', async () => {
      const user = await createTestUser();
      const fetched = await getUserProfile(user._id.toString());

      expect(fetched).toBeDefined();
      expect(fetched?._id.toString()).toBe(user._id.toString());
      expect(fetched?.email).toBe('test@example.com');
    });

    test('should return null for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const result = await getUserProfile(fakeId);
      expect(result).toBeNull();
    });
  });

  describe('incrementUsageMetric', () => {
    test('should atomically increment sessionsCount', async () => {
      const user = await createTestUser();
      const updated = await incrementUsageMetric(user._id.toString(), 'sessionsCount');

      expect(updated).toBeDefined();
      expect(updated?.sessionsCount).toBe(1);
      expect(updated?.metricsLastUpdated).toBeDefined();
    });

    test('should atomically increment charactersCreatedCount', async () => {
      const user = await createTestUser();
      const updated = await incrementUsageMetric(user._id.toString(), 'charactersCreatedCount');

      expect(updated).toBeDefined();
      expect(updated?.charactersCreatedCount).toBe(1);
    });

    test('should atomically increment campaignsCreatedCount', async () => {
      const user = await createTestUser();
      const updated = await incrementUsageMetric(user._id.toString(), 'campaignsCreatedCount');

      expect(updated).toBeDefined();
      expect(updated?.campaignsCreatedCount).toBe(1);
    });

    test('should handle concurrent increments correctly', async () => {
      const user = await createTestUser();

      // Simulate concurrent increments
      await Promise.all([
        incrementUsageMetric(user._id.toString(), 'sessionsCount'),
        incrementUsageMetric(user._id.toString(), 'sessionsCount'),
        incrementUsageMetric(user._id.toString(), 'sessionsCount'),
      ]);

      const updated = await getUserProfile(user._id.toString());
      expect(updated?.sessionsCount).toBe(3); // All three increments should succeed
    });

    test('should return null for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const result = await incrementUsageMetric(fakeId, 'sessionsCount');
      expect(result).toBeNull();
    });
  });

  describe('checkProfileComplete', () => {
    test('should return true for complete profile', async () => {
      const user = await createTestUser();
      // Set profile as complete
      user.profileSetupCompleted = true;
      user.primaryRole = 'dm';
      user.experienceLevel = 'intermediate';
      await user.save();

      const isComplete = checkProfileComplete(user);
      expect(isComplete).toBe(true);
    });

    test('should return false if profileSetupCompleted is false', async () => {
      const user = await createTestUser();
      user.profileSetupCompleted = false;
      await user.save();

      const isComplete = checkProfileComplete(user);
      expect(isComplete).toBe(false);
    });

    test('should return false if primary fields are missing', async () => {
      const user = await createTestUser();
      user.profileSetupCompleted = true;
      user.primaryRole = undefined;
      await user.save();

      const isComplete = checkProfileComplete(user);
      expect(isComplete).toBe(false);
    });
  });
});
