/**
 * Dashboard Service Tests
 * Integration tests for dashboard metrics aggregation service
 * Constitutional: TDD - Tests written before implementation
 *
 * @jest-environment node
 */

// Unmock User model to test real database operations
jest.unmock('@/lib/db/models/User');

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
  setupTestDatabase,
  teardownTestDatabase,
} from '@tests/helpers/db-helpers';
import { createTestUser } from '@tests/helpers/user-fixtures';
import { getDashboardMetrics } from '@/lib/services/dashboardService';

beforeEach(async () => {
  await setupTestDatabase();
});

afterEach(async () => {
  await teardownTestDatabase();
});

describe('Dashboard Service', () => {
  describe('getDashboardMetrics', () => {
    test('should return complete dashboard metrics for valid user', async () => {
      const user = await createTestUser({
        subscriptionTier: 'free',
        sessionsCount: 5,
        charactersCreatedCount: 12,
        campaignsCreatedCount: 2,
      });

      const result = await getDashboardMetrics(user._id.toString());

      expect(result).toBeDefined();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('subscription');
      expect(result).toHaveProperty('metrics');
    });

    test('should include user information', async () => {
      const user = await createTestUser({
        email: 'test@example.com',
      });
      user.profile.displayName = 'DM Test';
      await user.save();

      const result = await getDashboardMetrics(user._id.toString());

      expect(result.user.displayName).toBe('DM Test');
      expect(result.user.email).toBe('test@example.com');
    });

    test('should include subscription tier and limits', async () => {
      const user = await createTestUser();
      // Default tier is 'free'

      const result = await getDashboardMetrics(user._id.toString());

      expect(result.subscription.tier).toBe('free');
      expect(result.subscription.limits).toMatchObject({
        parties: 1,
        encounters: 3,
        characters: 10,
      });
    });

    test('should calculate usage percentages', async () => {
      const user = await createTestUser();
      // Update usage counts directly
      user.usage.partiesCount = 1;
      user.usage.encountersCount = 2;
      user.usage.creaturesCount = 12;
      await user.save();

      const result = await getDashboardMetrics(user._id.toString());

      expect(result.subscription.percentages.parties).toBe(100);
      expect(result.subscription.percentages.encounters).toBeCloseTo(66.67, 1);
      expect(result.subscription.percentages.characters).toBe(120);
    });

    test('should generate usage warnings when appropriate', async () => {
      const user = await createTestUser();
      // Set encounters to 100% usage
      user.usage.encountersCount = 3;
      await user.save();

      const result = await getDashboardMetrics(user._id.toString());

      expect(result.subscription.warnings.length).toBeGreaterThan(0);
      const encounterWarning = result.subscription.warnings.find(
        (w) => w.resource === 'encounters'
      );
      expect(encounterWarning).toBeDefined();
      expect(encounterWarning?.severity).toBe('critical');
    });

    test('should include activity metrics', async () => {
      const user = await createTestUser({
        sessionsCount: 5,
        charactersCreatedCount: 12,
        campaignsCreatedCount: 2,
      });

      const result = await getDashboardMetrics(user._id.toString());

      expect(result.metrics.sessionsCount).toBe(5);
      expect(result.metrics.charactersCreatedCount).toBe(12);
      expect(result.metrics.campaignsCreatedCount).toBe(2);
      expect(result.metrics).toHaveProperty('lastLogin');
      expect(result.metrics).toHaveProperty('memberSince');
    });

    test('should throw error when user not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format

      await expect(getDashboardMetrics(fakeId)).rejects.toThrow('User not found');
    });

    test('should handle seasoned tier correctly', async () => {
      const user = await createTestUser();
      user.subscription.tier = 'seasoned';
      await user.save();

      const result = await getDashboardMetrics(user._id.toString());

      expect(result.subscription.tier).toBe('seasoned');
      expect(result.subscription.limits.parties).toBe(3);
      expect(result.subscription.limits.encounters).toBe(15);
    });

    test('should handle guild tier with infinite limits', async () => {
      const user = await createTestUser();
      user.subscription.tier = 'guild';
      user.usage.encountersCount = 1000;
      await user.save();

      const result = await getDashboardMetrics(user._id.toString());

      expect(result.subscription.tier).toBe('guild');
      expect(result.subscription.limits.encounters).toBe(Infinity);
      expect(result.subscription.percentages.encounters).toBe(0);
      expect(result.subscription.warnings).toEqual([]);
    });

    test('should handle user without profile displayName', async () => {
      const user = await createTestUser();
      // Profile exists by default with displayName from email

      const result = await getDashboardMetrics(user._id.toString());

      // Should use profile.displayName or fall back to email-based name
      expect(result.user.displayName).toBeDefined();
      expect(typeof result.user.displayName).toBe('string');
    });

    test('should handle user with zero usage', async () => {
      const user = await createTestUser();
      // Default usage is already 0, just verify

      const result = await getDashboardMetrics(user._id.toString());

      expect(result.subscription.usage).toMatchObject({
        parties: 0,
        encounters: 0,
        characters: 0,
      });
      expect(result.subscription.percentages.parties).toBe(0);
      expect(result.subscription.warnings).toEqual([]);
    });

    test('should accept user object directly to avoid redundant query', async () => {
      const user = await createTestUser({
        sessionsCount: 10,
      });
      user.subscription.tier = 'seasoned';
      await user.save();

      // Pass user object instead of ID
      const result = await getDashboardMetrics(user);

      expect(result).toBeDefined();
      expect(result.subscription.tier).toBe('seasoned');
      expect(result.metrics.sessionsCount).toBe(10);
      expect(result.user.email).toBe(user.email);
    });
  });
});
