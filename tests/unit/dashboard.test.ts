/**
 * Dashboard Utilities Tests
 *
 * Tests for dashboard type builders, validators, and helper functions.
 * Feature 016: User Dashboard with Real Data
 */

import {
  DashboardBuilder,
  TierLimits,
  getUsageColorState,
  getDisplayName,
  shouldShowWarning,
  getWarningMessage,
  isWarningLevel,
  type SubscriptionTier,
} from '@/types/dashboard';

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

    it('returns green for low usage', () => {
      expect(getUsageColorState(0)).toBe('green');
      expect(getUsageColorState(1)).toBe('green');
      expect(getUsageColorState(79)).toBe('green');
    });

    it('returns yellow for warning levels', () => {
      expect(getUsageColorState(80)).toBe('yellow');
      expect(getUsageColorState(85)).toBe('yellow');
      expect(getUsageColorState(99)).toBe('yellow');
    });

    it('returns red for critical levels', () => {
      expect(getUsageColorState(100)).toBe('red');
      expect(getUsageColorState(101)).toBe('red');
      expect(getUsageColorState(200)).toBe('red');
    });
  });

  describe('Display Name Helper', () => {
    it('returns displayName when available', () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'John Doe',
        tier: 'free_adventurer' as SubscriptionTier,
      };
      expect(getDisplayName(user)).toBe('John Doe');
    });

    it('falls back to email when displayName is empty', () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        displayName: '',
        tier: 'free_adventurer' as SubscriptionTier,
      };
      expect(getDisplayName(user)).toBe('test@example.com');
    });

    it('falls back to email when displayName is whitespace', () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        displayName: '   ',
        tier: 'free_adventurer' as SubscriptionTier,
      };
      expect(getDisplayName(user)).toBe('test@example.com');
    });

    it('handles undefined displayName', () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        displayName: undefined,
        tier: 'free_adventurer' as SubscriptionTier,
      };
      expect(getDisplayName(user)).toBe('test@example.com');
    });
  });

  describe('Warning Level Helper', () => {
    it('returns true for usage >= 80%', () => {
      expect(shouldShowWarning(80)).toBe(true);
      expect(shouldShowWarning(85)).toBe(true);
      expect(shouldShowWarning(100)).toBe(true);
      expect(shouldShowWarning(150)).toBe(true);
    });

    it('returns false for usage < 80%', () => {
      expect(shouldShowWarning(0)).toBe(false);
      expect(shouldShowWarning(50)).toBe(false);
      expect(shouldShowWarning(79)).toBe(false);
    });

    it('returns true at exactly 80%', () => {
      expect(shouldShowWarning(80)).toBe(true);
    });
  });

  describe('Warning Message Helper', () => {
    it('returns exceeded message when usage > limit', () => {
      const msg = getWarningMessage('parties', 5, 3);
      expect(msg).toContain('exceeded');
      expect(msg).toContain('5');
      expect(msg).toContain('3');
      expect(msg).toContain('parties');
    });

    it('returns reached limit message when usage === limit', () => {
      const msg = getWarningMessage('characters', 10, 10);
      expect(msg).toContain('reached');
      expect(msg).toContain('10');
      expect(msg).toContain('characters');
    });

    it('returns empty string for normal usage', () => {
      const msg = getWarningMessage('encounters', 3, 50);
      expect(msg).toBe('');
    });

    it('handles all resource types', () => {
      const resources: Array<'parties' | 'characters' | 'encounters'> = [
        'parties',
        'characters',
        'encounters',
      ];

      resources.forEach((resource) => {
        const msg = getWarningMessage(resource, 10, 5);
        expect(msg).toContain(resource);
      });
    });
  });

  describe('isWarningLevel Helper', () => {
    it('returns true when usage is at warning threshold', () => {
      expect(isWarningLevel(80)).toBe(true);
      expect(isWarningLevel(100)).toBe(true);
    });

    it('returns false when usage is below warning threshold', () => {
      expect(isWarningLevel(0)).toBe(false);
      expect(isWarningLevel(79)).toBe(false);
    });
  });

  describe('DashboardBuilder - Advanced Scenarios', () => {
    it('handles all subscription tiers', () => {
      const tiers: SubscriptionTier[] = [
        'free_adventurer',
        'seasoned_adventurer',
        'expert_dungeon_master',
        'master_of_dungeons',
        'guild_master',
      ];

      tiers.forEach((tier) => {
        const data = DashboardBuilder.buildPageData(
          'user-1',
          {
            email: `user@${tier}.com`,
            displayName: `User ${tier}`,
            subscriptionTier: tier,
          },
          { parties: 0, characters: 0, encounters: 0 }
        );

        expect(data.user.tier).toBe(tier);
        expect(data.isEmpty).toBe(true);
      });
    });

    it('calculates percentages correctly', () => {
      const data = DashboardBuilder.buildPageData(
        'user-1',
        {
          email: 'test@example.com',
          displayName: 'Test',
          subscriptionTier: 'free_adventurer',
        },
        { parties: 1, characters: 2, encounters: 3 }
      );

      // free_adventurer: 1 party, 3 characters, 5 encounters
      expect(data.percentages.parties).toBe(100);
      expect(Math.round(data.percentages.characters)).toBe(67); // 2/3 * 100
      expect(data.percentages.encounters).toBe(60); // 3/5 * 100
    });

    it('sets isEmpty flag correctly', () => {
      const emptyData = DashboardBuilder.buildPageData(
        'user-1',
        {
          email: 'test@example.com',
          displayName: 'Test',
          subscriptionTier: 'free_adventurer',
        },
        { parties: 0, characters: 0, encounters: 0 }
      );
      expect(emptyData.isEmpty).toBe(true);

      const nonEmptyData = DashboardBuilder.buildPageData(
        'user-1',
        {
          email: 'test@example.com',
          displayName: 'Test',
          subscriptionTier: 'free_adventurer',
        },
        { parties: 1, characters: 0, encounters: 0 }
      );
      expect(nonEmptyData.isEmpty).toBe(false);
    });

    it('handles over-limit usage', () => {
      const data = DashboardBuilder.buildPageData(
        'user-1',
        {
          email: 'test@example.com',
          displayName: 'Test',
          subscriptionTier: 'free_adventurer',
        },
        { parties: 10, characters: 10, encounters: 10 }
      );

      expect(data.percentages.parties).toBe(1000); // 10/1 * 100
      expect(data.percentages.characters).toBeGreaterThan(100);
      expect(data.percentages.encounters).toBe(200); // 10/5 * 100
    });

    it('sets createdAt timestamp', () => {
      const beforeDate = new Date();
      const data = DashboardBuilder.buildPageData(
        'user-1',
        {
          email: 'test@example.com',
          displayName: 'Test',
          subscriptionTier: 'free_adventurer',
        },
        { parties: 0, characters: 0, encounters: 0 }
      );
      const afterDate = new Date();

      const createdAtDate = new Date(data.createdAt);
      expect(createdAtDate.getTime()).toBeGreaterThanOrEqual(
        beforeDate.getTime()
      );
      expect(createdAtDate.getTime()).toBeLessThanOrEqual(afterDate.getTime());
    });

    it('validates user data structure', () => {
      const data = DashboardBuilder.buildPageData(
        'user-1',
        {
          email: 'test@example.com',
          displayName: 'Test User',
          subscriptionTier: 'seasoned_adventurer',
        },
        { parties: 0, characters: 0, encounters: 0 }
      );

      expect(data.user.id).toBe('user-1');
      expect(data.user.email).toBe('test@example.com');
      expect(data.user.displayName).toBe('Test User');
      expect(data.user.tier).toBe('seasoned_adventurer');
    });

    it('validates complete data structure with isValidPageData', () => {
      const data = DashboardBuilder.buildPageData(
        'user-1',
        {
          email: 'test@example.com',
          displayName: 'Test',
          subscriptionTier: 'free_adventurer',
        },
        { parties: 0, characters: 1, encounters: 0 }
      );

      // Should be valid
      expect(DashboardBuilder.isValidPageData(data)).toBe(true);

      // Should be invalid with missing fields
      expect(DashboardBuilder.isValidPageData({ ...data, user: null })).toBe(
        false
      );
      expect(DashboardBuilder.isValidPageData({ ...data, usage: null })).toBe(
        false
      );
      expect(DashboardBuilder.isValidPageData({ ...data, limits: null })).toBe(
        false
      );
      expect(
        DashboardBuilder.isValidPageData({ ...data, percentages: null })
      ).toBe(false);
    });
  });
});
