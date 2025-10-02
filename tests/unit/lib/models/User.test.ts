/**
 * Unit tests for User Mongoose model (D&D profile fields)
 * These tests follow TDD - written BEFORE implementation
 * Expected: All tests should FAIL initially
 *
 * @jest-environment node
 */

// IMPORTANT: Unmock the User model for integration testing with real MongoDB
jest.unmock('@/lib/db/models/User');

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
  setupTestDatabase,
  clearTestDatabase,
  teardownTestDatabase,
  expectDocumentFields,
} from '@tests/helpers/db-helpers';
import { createMinimalUserData } from '@tests/helpers/user-fixtures';

// These imports will work with existing model but test new fields
import { User } from '@/lib/db/models/User';
import type { IUser } from '@/lib/db/models/User';

beforeEach(async () => {
  await setupTestDatabase();
});

afterEach(async () => {
  await teardownTestDatabase();
});

describe('User Model - D&D Profile Fields', () => {

  describe('Default Values', () => {
    test('should set timezone to UTC by default', async () => {
      const user = await User.create(createMinimalUserData());
      expect(user.timezone).toBe('UTC');
    });

    test('should set dndEdition to "5th Edition" by default', async () => {
      const user = await User.create(createMinimalUserData());
      expect(user.dndEdition).toBe('5th Edition');
    });

    test('should set profileSetupCompleted to false by default', async () => {
      const user = await User.create(createMinimalUserData());
      expect(user.profileSetupCompleted).toBe(false);
    });

    test('should set role to "user" by default', async () => {
      const user = await User.create(createMinimalUserData());
      expect(user.role).toBe('user');
    });

    test('should set subscriptionTier to "free" by default', async () => {
      const user = await User.create(createMinimalUserData());
      expect(user.subscriptionTier).toBe('free');
    });
  });

  describe('Optional Fields', () => {
    test('should allow displayName to be undefined', async () => {
      const user = await User.create(createMinimalUserData());
      expect(user.displayName).toBeUndefined();
    });

    test('should allow experienceLevel to be undefined', async () => {
      const user = await User.create(createMinimalUserData());
      expect(user.experienceLevel).toBeUndefined();
    });

    test('should allow primaryRole to be undefined', async () => {
      const user = await User.create(createMinimalUserData());
      expect(user.primaryRole).toBeUndefined();
    });

    test('should allow optional fields to be set', async () => {
      const user = await User.create(createMinimalUserData({
        displayName: 'Dungeon Master Alex',
        experienceLevel: 'intermediate',
        primaryRole: 'dm',
      }));

      expect(user.displayName).toBe('Dungeon Master Alex');
      expect(user.experienceLevel).toBe('intermediate');
      expect(user.primaryRole).toBe('dm');
    });
  });

  describe('Field Constraints', () => {
    test('should enforce displayName max length of 100 characters', async () => {
      await expect(
        User.create(createMinimalUserData({
          displayName: 'A'.repeat(101),
        }))
      ).rejects.toThrow();
    });

    test('should accept displayName at exactly 100 characters', async () => {
      const user = await User.create(createMinimalUserData({
        displayName: 'A'.repeat(100),
      }));
      expect(user.displayName).toBe('A'.repeat(100));
    });

    test('should enforce dndEdition max length of 50 characters', async () => {
      await expect(
        User.create(createMinimalUserData({
          dndEdition: 'A'.repeat(51),
        }))
      ).rejects.toThrow();
    });

    test('should accept dndEdition at exactly 50 characters', async () => {
      const user = await User.create(createMinimalUserData({
        dndEdition: 'A'.repeat(50),
      }));
      expect(user.dndEdition).toBe('A'.repeat(50));
    });

    test('should trim displayName whitespace', async () => {
      const user = await User.create(createMinimalUserData({
        displayName: '  Trimmed Name  ',
      }));
      expect(user.displayName).toBe('Trimmed Name');
    });

    test('should trim dndEdition whitespace', async () => {
      const user = await User.create(createMinimalUserData({
        dndEdition: '  5th Edition  ',
      }));
      expect(user.dndEdition).toBe('5th Edition');
    });
  });

  describe('Enum Validation', () => {
    test('should accept valid experienceLevel enum values', async () => {
      const levels = ['new', 'beginner', 'intermediate', 'experienced', 'veteran'];

      for (const level of levels) {
        const user = await User.create(createMinimalUserData({
          id: `clerk_test_${level}`,
          email: `${level}@example.com`,
          username: `user_${level}`,
          experienceLevel: level,
        }));

        expect(user.experienceLevel).toBe(level);
      }
    });

    test('should reject invalid experienceLevel values', async () => {
      await expect(
        User.create(createMinimalUserData({
          experienceLevel: 'expert' as any, // Invalid value
        }))
      ).rejects.toThrow();
    });

    test('should accept valid primaryRole enum values', async () => {
      const roles = ['dm', 'player', 'both'];

      for (const role of roles) {
        const user = await User.create(createMinimalUserData({
          id: `clerk_test_${role}`,
          email: `${role}@example.com`,
          username: `user_${role}`,
          primaryRole: role,
        }));

        expect(user.primaryRole).toBe(role);
      }
    });

    test('should reject invalid primaryRole values', async () => {
      await expect(
        User.create(createMinimalUserData({
          primaryRole: 'gm' as any, // Invalid value
        }))
      ).rejects.toThrow();
    });
  });

  describe('Usage Metrics', () => {
    test('should initialize usage metrics to 0 by default', async () => {
      const user = await User.create(createMinimalUserData());

      expect(user.sessionsCount).toBe(0);
      expect(user.charactersCreatedCount).toBe(0);
      expect(user.campaignsCreatedCount).toBe(0);
    });

    test('should allow atomic increment of sessionsCount', async () => {
      const user = await User.create(createMinimalUserData());

      await User.updateOne(
        { _id: user._id },
        { $inc: { sessionsCount: 1 } }
      );

      const updated = await User.findById(user._id);
      expect(updated?.sessionsCount).toBe(1);
    });

    test('should allow atomic increment of charactersCreatedCount', async () => {
      const user = await User.create(createMinimalUserData());

      await User.updateOne(
        { _id: user._id },
        { $inc: { charactersCreatedCount: 1 } }
      );

      const updated = await User.findById(user._id);
      expect(updated?.charactersCreatedCount).toBe(1);
    });

    test('should allow atomic increment of campaignsCreatedCount', async () => {
      const user = await User.create(createMinimalUserData());

      await User.updateOne(
        { _id: user._id },
        { $inc: { campaignsCreatedCount: 1 } }
      );

      const updated = await User.findById(user._id);
      expect(updated?.campaignsCreatedCount).toBe(1);
    });

    test('should update metricsLastUpdated timestamp on metric change', async () => {
      const user = await User.create(createMinimalUserData());

      const now = new Date();
      await User.updateOne(
        { _id: user._id },
        {
          $inc: { sessionsCount: 1 },
          $set: { metricsLastUpdated: now }
        }
      );

      const updated = await User.findById(user._id);
      expect(updated?.metricsLastUpdated).toBeDefined();
      expect(updated?.metricsLastUpdated?.getTime()).toBe(now.getTime());
    });
  });

  describe('Clerk User Creation', () => {
    test('should create user from Clerk webhook data with D&D fields', async () => {
      const clerkUser = {
        id: 'clerk_123abc',
        emailAddresses: [{ emailAddress: 'clerk@example.com' }],
        firstName: 'John',
        lastName: 'Smith',
      };

      const user = await User.create({
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        username: 'johnsmith',
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        authProvider: 'clerk',
        isEmailVerified: true,
        displayName: 'DM John',
        experienceLevel: 'intermediate',
        primaryRole: 'dm',
        profile: {
          displayName: 'DM John',
          dndRuleset: '5e',
          experienceLevel: 'intermediate',
          role: 'dm'
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
        },
      });

      expect(user.id).toBe(clerkUser.id);
      expect(user.email).toBe('clerk@example.com');
      expect(user.timezone).toBe('UTC');
      expect(user.dndEdition).toBe('5th Edition');
      expect(user.profileSetupCompleted).toBe(false);
      expect(user.role).toBe('user');
      expect(user.subscriptionTier).toBe('free');
      expect(user.displayName).toBe('DM John');
      expect(user.experienceLevel).toBe('intermediate');
      expect(user.primaryRole).toBe('dm');
    });
  });
});
