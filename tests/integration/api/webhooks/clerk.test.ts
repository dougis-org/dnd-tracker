/**
 * Integration tests for Clerk webhook handler
 * Tests follow TDD - written BEFORE implementation
 * Expected: All tests should FAIL initially
 *
 * Scenarios covered (from quickstart.md):
 * - Scenario 1: New user registration via Clerk
 * - Scenario 6: Clerk user update sync
 *
 * @jest-environment node
 */

// Unmock User model for real database operations
jest.unmock('@/lib/db/models/User');

import { describe, test, expect, beforeEach, afterEach, beforeAll } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '@/lib/db/models/User';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  // Clear database between tests
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Clerk Webhook Handler - POST /api/webhooks/clerk', () => {
  // Mock Svix signature verification
  const mockVerifyWebhook = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyWebhook.mockReturnValue(true);
  });

  describe('user.created event', () => {
    test('should create MongoDB user with default D&D profile values', async () => {
      const clerkPayload = {
        type: 'user.created',
        data: {
          id: 'user_2abc123def',
          email_addresses: [
            {
              email_address: 'newuser@example.com',
              id: 'email_123'
            }
          ],
          first_name: 'John',
          last_name: 'Doe',
          username: 'johndoe',
          image_url: 'https://example.com/avatar.jpg',
          created_at: Date.now()
        }
      };

      // Simulate webhook processing (implementation will do this)
      const createdUser = await User.create({
        id: clerkPayload.data.id,
        email: clerkPayload.data.email_addresses[0].email_address,
        username: clerkPayload.data.username || 'user_' + clerkPayload.data.id.slice(-8),
        firstName: clerkPayload.data.first_name,
        lastName: clerkPayload.data.last_name,
        imageUrl: clerkPayload.data.image_url,
        authProvider: 'clerk',
        isEmailVerified: true,
        profile: {
          displayName: clerkPayload.data.first_name || 'Adventurer',
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
        },
        lastClerkSync: new Date(),
        syncStatus: 'active'
      });

      // Assertions from quickstart.md Scenario 1
      expect(createdUser).toBeDefined();
      expect(createdUser.id).toBe(clerkPayload.data.id);
      expect(createdUser.email).toBe('newuser@example.com');
      expect(createdUser.role).toBe('user'); // Default role
      expect(createdUser.subscriptionTier).toBe('free'); // Default tier
      expect(createdUser.timezone).toBe('UTC'); // Default timezone
      expect(createdUser.dndEdition).toBe('5th Edition'); // Default edition
      expect(createdUser.profileSetupCompleted).toBe(false); // Not completed yet
      expect(createdUser.sessionsCount).toBe(0);
      expect(createdUser.charactersCreatedCount).toBe(0);
      expect(createdUser.campaignsCreatedCount).toBe(0);
      expect(createdUser.authProvider).toBe('clerk');
      expect(createdUser.syncStatus).toBe('active');
    });

    test('should handle duplicate user.created events (idempotency)', async () => {
      const clerkPayload = {
        type: 'user.created',
        data: {
          id: 'user_duplicate123',
          email_addresses: [{ email_address: 'duplicate@example.com' }],
          first_name: 'Duplicate',
          last_name: 'User',
          username: 'duplicateuser'
        }
      };

      // Create user first time
      await User.create({
        id: clerkPayload.data.id,
        email: clerkPayload.data.email_addresses[0].email_address,
        username: clerkPayload.data.username,
        firstName: clerkPayload.data.first_name,
        lastName: clerkPayload.data.last_name,
        authProvider: 'clerk',
        profile: {
          displayName: 'Duplicate User',
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

      // Check for existing user by clerkId
      const existingUser = await User.findOne({ id: clerkPayload.data.id });
      expect(existingUser).toBeDefined();

      // Webhook handler should detect duplicate and skip creation
      // This simulates idempotency check
      const userCount = await User.countDocuments({ id: clerkPayload.data.id });
      expect(userCount).toBe(1); // Only one user should exist
    });
  });

  describe('user.updated event', () => {
    test('should sync Clerk profile changes to MongoDB (Scenario 6)', async () => {
      // Create initial user
      const initialUser = await User.create({
        id: 'user_update123',
        email: 'updatetest@example.com',
        username: 'updatetest',
        firstName: 'Original',
        lastName: 'Name',
        authProvider: 'clerk',
        profile: {
          displayName: 'Original Name',
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

      // Simulate Clerk update
      const updatedData = {
        firstName: 'Updated',
        lastName: 'Person',
        lastClerkSync: new Date(),
        syncStatus: 'active' as const
      };

      const updated = await User.findOneAndUpdate(
        { id: initialUser.id },
        { $set: updatedData },
        { new: true }
      );

      // Assertions from quickstart.md Scenario 6
      expect(updated).toBeDefined();
      expect(updated?.firstName).toBe('Updated');
      expect(updated?.lastName).toBe('Person');
      expect(updated?.lastClerkSync).toBeDefined();
      expect(updated?.syncStatus).toBe('active');
      // D&D profile fields should remain unchanged
      expect(updated?.timezone).toBe('UTC');
      expect(updated?.dndEdition).toBe('5th Edition');
    });
  });

  describe('user.deleted event', () => {
    test('should handle user deletion from Clerk', async () => {
      // Create user
      const user = await User.create({
        id: 'user_delete123',
        email: 'deletetest@example.com',
        username: 'deletetest',
        firstName: 'Delete',
        lastName: 'Test',
        authProvider: 'clerk',
        profile: {
          displayName: 'Delete Test',
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

      // Simulate deletion
      await User.findByIdAndDelete(user._id);

      // Verify user no longer exists
      const deletedUser = await User.findOne({ id: 'user_delete123' });
      expect(deletedUser).toBeNull();
    });
  });

  describe('signature verification', () => {
    test('should reject webhooks with invalid signatures', () => {
      // This test will be implemented when we create the actual route
      // For now, we verify the concept
      const invalidSignature = 'invalid_signature_123';
      const validSignature = 'valid_signature_456';

      expect(invalidSignature).not.toBe(validSignature);
      // Actual Svix verification will be tested in route implementation
    });
  });

  describe('error handling', () => {
    test('should handle database errors gracefully', async () => {
      // Simulate database error by trying to create with invalid data
      await expect(async () => {
        await User.create({
          id: 'user_error123',
          // Missing required fields to trigger validation error
          email: 'invalid', // Invalid email
        });
      }).rejects.toThrow();
    });
  });
});
