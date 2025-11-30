/**
 * Dashboard Utilities Tests
 *
 * Tests for dashboard type builders, validators, and helper functions.
 * Feature 016: User Dashboard with Real Data
 */

import { DashboardBuilder, TierLimits, getUsageColorState, type SubscriptionTier } from '@/types/dashboard';

describe('Dashboard Utilities', () => {
  describe('TierLimits', () => {
    const tiers: SubscriptionTier[] = [
      'free_adventurer',
      'seasoned_adventurer',
      'expert_dungeon_master',
      'master_of_dungeons',
      'guild_master',
    ];

    tiers.forEach((tier) => {
      it(`provides limits for ${tier}`, () => {
        expect(TierLimits[tier]).toBeDefined();
        expect(TierLimits[tier].parties).toBeGreaterThan(0);
        expect(TierLimits[tier].characters).toBeGreaterThan(0);
        expect(TierLimits[tier].encounters).toBeGreaterThan(0);
      });
    });
  });

  describe('DashboardBuilder', () => {
    it('builds valid dashboard page data', () => {
      const data = DashboardBuilder.buildPageData(
        'user-1',
        {
          email: 'test@example.com',
          displayName: 'Test',
          subscriptionTier: 'free_adventurer',
        },
        { parties: 0, characters: 0, encounters: 2 }
      );

      expect(data.user.id).toBe('user-1');
      expect(data.usage.encounters).toBe(2);
      expect(data.limits.encounters).toBe(5);
      expect(data.percentages.encounters).toBe(40);
    });

    it('validates correct data structure', () => {
      const validData = {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          displayName: 'Test',
          tier: 'free_adventurer' as SubscriptionTier,
        },
        usage: { parties: 0, characters: 0, encounters: 1 },
        limits: { parties: 1, characters: 3, encounters: 5 },
        percentages: { parties: 0, characters: 0, encounters: 20 },
        isEmpty: false,
        createdAt: new Date().toISOString(),
      };

      expect(DashboardBuilder.isValidPageData(validData)).toBe(true);
    });

    it('rejects invalid data', () => {
      expect(DashboardBuilder.isValidPageData(null)).toBe(false);
      expect(DashboardBuilder.isValidPageData({})).toBe(false);
    });
  });

  describe('Color State Helper', () => {
    it('assigns correct colors', () => {
      expect(getUsageColorState(50)).toBe('green');
      expect(getUsageColorState(80)).toBe('yellow');
      expect(getUsageColorState(100)).toBe('red');
      expect(getUsageColorState(150)).toBe('red');
    });
  });
});
