/**
 * Metrics Utilities Tests
 * Tests for user metrics formatting and transformation helpers
 * Constitutional: TDD - Tests written before implementation
 */

import { describe, it, expect } from '@jest/globals';

// Import utilities to test (will fail until T034 is implemented)
import {
  formatLastLogin,
  calculateMetricsSummary,
  buildDashboardMetrics,
} from '@/lib/utils/metrics';

describe('Metrics Utilities', () => {
  describe('formatLastLogin', () => {
    it('should format recent login (within 1 hour) as "X minutes ago"', () => {
      const now = new Date();
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const formatted = formatLastLogin(thirtyMinutesAgo);
      expect(formatted).toContain('minute');
      expect(formatted).toContain('ago');
    });

    it('should format login within 24 hours as "X hours ago"', () => {
      const now = new Date();
      const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);
      const formatted = formatLastLogin(fiveHoursAgo);
      expect(formatted).toContain('hour');
      expect(formatted).toContain('ago');
    });

    it('should format login within 7 days as "X days ago"', () => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const formatted = formatLastLogin(threeDaysAgo);
      expect(formatted).toContain('day');
      expect(formatted).toContain('ago');
    });

    it('should format old login with date', () => {
      const oldDate = new Date('2024-01-15');
      const formatted = formatLastLogin(oldDate);
      // Should include month and day at minimum
      expect(formatted).toMatch(/\d/);
    });

    it('should handle null date gracefully', () => {
      const formatted = formatLastLogin(null);
      expect(formatted).toBe('Never');
    });

    it('should handle undefined date gracefully', () => {
      const formatted = formatLastLogin(undefined);
      expect(formatted).toBe('Never');
    });

    it('should handle just now (< 1 minute)', () => {
      const now = new Date();
      const formatted = formatLastLogin(now);
      expect(formatted).toContain('Just now');
    });
  });

  describe('calculateMetricsSummary', () => {
    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      sessionsCount: 5,
      charactersCreatedCount: 12,
      campaignsCreatedCount: 2,
      lastLoginAt: new Date(),
      createdAt: new Date('2024-01-01'),
    };

    it('should return summary with all metrics', () => {
      const summary = calculateMetricsSummary(mockUser);
      expect(summary).toHaveProperty('sessionsCount', 5);
      expect(summary).toHaveProperty('charactersCreatedCount', 12);
      expect(summary).toHaveProperty('campaignsCreatedCount', 2);
      expect(summary).toHaveProperty('lastLogin');
      expect(summary).toHaveProperty('memberSince');
    });

    it('should format lastLogin timestamp', () => {
      const summary = calculateMetricsSummary(mockUser);
      expect(typeof summary.lastLogin).toBe('string');
      expect(summary.lastLogin).not.toBe('');
    });

    it('should format memberSince timestamp', () => {
      const summary = calculateMetricsSummary(mockUser);
      expect(typeof summary.memberSince).toBe('string');
      expect(summary.memberSince).toMatch(/\d{4}/); // Should contain a year
    });

    it('should handle user with no lastLoginAt', () => {
      const userWithoutLogin = {
        ...mockUser,
        lastLoginAt: undefined,
      };
      const summary = calculateMetricsSummary(userWithoutLogin);
      expect(summary.lastLogin).toBe('Never');
    });

    it('should handle zero metrics', () => {
      const newUser = {
        ...mockUser,
        sessionsCount: 0,
        charactersCreatedCount: 0,
        campaignsCreatedCount: 0,
      };
      const summary = calculateMetricsSummary(newUser);
      expect(summary.sessionsCount).toBe(0);
      expect(summary.charactersCreatedCount).toBe(0);
      expect(summary.campaignsCreatedCount).toBe(0);
    });
  });

  describe('buildDashboardMetrics', () => {
    const mockUser = {
      _id: 'user123',
      clerkId: 'clerk_123',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      subscriptionTier: 'free',
      role: 'user',
      timezone: 'America/New_York',
      dndEdition: '5th Edition',
      experienceLevel: 'intermediate',
      primaryRole: 'dm',
      profileSetupCompleted: true,
      sessionsCount: 5,
      charactersCreatedCount: 12,
      campaignsCreatedCount: 2,
      lastLoginAt: new Date(),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      // Nested profile data (matches User schema)
      profile: {
        displayName: 'DM Test',
        timezone: 'America/New_York',
        dndEdition: '5th Edition',
        experienceLevel: 'intermediate',
        primaryRole: 'dm',
        profileSetupCompleted: true,
      },
      // Nested usage data (matches User schema)
      usage: {
        partiesCount: 1,
        encountersCount: 2,
        creaturesCount: 12,
      },
    };

    it('should return complete dashboard metrics structure', () => {
      const metrics = buildDashboardMetrics(mockUser);
      expect(metrics).toHaveProperty('user');
      expect(metrics).toHaveProperty('subscription');
      expect(metrics).toHaveProperty('metrics');
    });

    it('should include user info in correct format', () => {
      const metrics = buildDashboardMetrics(mockUser);
      expect(metrics.user).toMatchObject({
        id: mockUser._id,
        displayName: 'DM Test',
        email: 'test@example.com',
      });
    });

    it('should include subscription data with tier and limits', () => {
      const metrics = buildDashboardMetrics(mockUser);
      expect(metrics.subscription).toHaveProperty('tier', 'free');
      expect(metrics.subscription).toHaveProperty('limits');
      expect(metrics.subscription.limits).toHaveProperty('parties', 1);
      expect(metrics.subscription.limits).toHaveProperty('encounters', 3);
    });

    it('should calculate usage from user data', () => {
      const metrics = buildDashboardMetrics(mockUser);
      expect(metrics.subscription).toHaveProperty('usage');
      expect(metrics.subscription.usage).toMatchObject({
        parties: 1,
        encounters: 2,
        characters: 12,
      });
    });

    it('should calculate usage percentages', () => {
      const metrics = buildDashboardMetrics(mockUser);
      expect(metrics.subscription).toHaveProperty('percentages');
      expect(metrics.subscription.percentages.parties).toBeGreaterThanOrEqual(0);
      expect(metrics.subscription.percentages.parties).toBeLessThanOrEqual(100);
    });

    it('should include usage warnings when appropriate', () => {
      const highUsageUser = {
        ...mockUser,
        usage: {
          ...mockUser.usage,
          encountersCount: 3, // 100% of free tier
        },
      };
      const metrics = buildDashboardMetrics(highUsageUser);
      expect(metrics.subscription).toHaveProperty('warnings');
      expect(Array.isArray(metrics.subscription.warnings)).toBe(true);
    });

    it('should include activity metrics', () => {
      const metrics = buildDashboardMetrics(mockUser);
      expect(metrics.metrics).toMatchObject({
        sessionsCount: 5,
        charactersCreatedCount: 12,
        campaignsCreatedCount: 2,
      });
      expect(metrics.metrics).toHaveProperty('lastLogin');
      expect(metrics.metrics).toHaveProperty('memberSince');
    });

    it('should handle user without displayName (use firstName)', () => {
      const userWithoutDisplayName = {
        ...mockUser,
        profile: {
          ...mockUser.profile,
          displayName: undefined,
        },
      };
      const metrics = buildDashboardMetrics(userWithoutDisplayName);
      expect(metrics.user.displayName).toBe('Test');
    });

    it('should handle different subscription tiers', () => {
      const seasonedUser = {
        ...mockUser,
        subscriptionTier: 'seasoned',
      };
      const metrics = buildDashboardMetrics(seasonedUser);
      expect(metrics.subscription.tier).toBe('seasoned');
      expect(metrics.subscription.limits.parties).toBe(3);
      expect(metrics.subscription.limits.encounters).toBe(15);
    });

    it('should handle guild tier (infinite limits)', () => {
      const guildUser = {
        ...mockUser,
        subscriptionTier: 'guild',
        usage: {
          ...mockUser.usage,
          encountersCount: 1000,
        },
      };
      const metrics = buildDashboardMetrics(guildUser);
      expect(metrics.subscription.limits.encounters).toBe(Infinity);
      expect(metrics.subscription.percentages.encounters).toBe(0);
    });
  });
});
