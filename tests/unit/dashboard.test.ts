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
  const tiers: SubscriptionTier[] = [
    'free_adventurer',
    'seasoned_adventurer',
    'expert_dungeon_master',
    'master_of_dungeons',
    'guild_master',
  ];

  const testUser = (tier: SubscriptionTier = 'free_adventurer') => ({
    email: 'test@example.com',
    displayName: 'Test User',
    subscriptionTier: tier,
  });

  it('provides tier limits for all subscriptions', () => {
    tiers.forEach((tier) => {
      expect(TierLimits[tier]).toBeDefined();
      expect(TierLimits[tier].parties).toBeGreaterThan(0);
      expect(TierLimits[tier].characters).toBeGreaterThan(0);
      expect(TierLimits[tier].encounters).toBeGreaterThan(0);
    });
  });

  it('builds and validates dashboard data correctly', () => {
    const data = DashboardBuilder.buildPageData('user-1', testUser(), {
      parties: 0,
      characters: 0,
      encounters: 2,
    });
    expect(data.user.id).toBe('user-1');
    expect(data.usage.encounters).toBe(2);
    expect(DashboardBuilder.isValidPageData(data)).toBe(true);
  });

  it('rejects invalid data structures', () => {
    expect(DashboardBuilder.isValidPageData(null)).toBe(false);
    expect(DashboardBuilder.isValidPageData({})).toBe(false);
  });

  it('assigns usage colors correctly', () => {
    const colorTests = [
      { percentage: 50, color: 'green' },
      { percentage: 79, color: 'green' },
      { percentage: 80, color: 'yellow' },
      { percentage: 99, color: 'yellow' },
      { percentage: 100, color: 'red' },
      { percentage: 200, color: 'red' },
    ];

    colorTests.forEach(({ percentage, color }) => {
      expect(getUsageColorState(percentage)).toBe(color);
    });
  });

  it('handles display names with fallbacks', () => {
    const displayNameTests = [
      { input: 'John Doe', expected: 'John Doe' },
      { input: '', expected: 'test@example.com' },
      { input: '   ', expected: 'test@example.com' },
      { input: undefined, expected: 'test@example.com' },
    ];

    displayNameTests.forEach(({ input, expected }) => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        displayName: input,
        tier: 'free_adventurer' as SubscriptionTier,
      };
      expect(getDisplayName(user)).toBe(expected);
    });
  });

  it('determines warning levels correctly', () => {
    const warningTests = [
      { percentage: 79, shouldWarn: false },
      { percentage: 80, shouldWarn: true },
      { percentage: 100, shouldWarn: true },
      { percentage: 150, shouldWarn: true },
    ];

    warningTests.forEach(({ percentage, shouldWarn }) => {
      expect(shouldShowWarning(percentage)).toBe(shouldWarn);
      expect(isWarningLevel(percentage)).toBe(shouldWarn);
    });
  });

  it('generates appropriate warning messages', () => {
    const messageTests = [
      { usage: 5, limit: 3, text: 'exceeded' },
      { usage: 10, limit: 10, text: 'reached' },
      { usage: 3, limit: 50, text: '' },
    ];

    messageTests.forEach(({ usage, limit, text }) => {
      const msg = getWarningMessage('parties', usage, limit);
      if (text) expect(msg).toContain(text);
      else expect(msg).toBe('');
    });
  });

  it('handles all tiers and empty states', () => {
    tiers.forEach((tier) => {
      const data = DashboardBuilder.buildPageData(
        'user-1',
        testUser(tier),
        { parties: 0, characters: 0, encounters: 0 }
      );
      expect(data.user.tier).toBe(tier);
      expect(data.isEmpty).toBe(true);
    });
  });

  it('calculates percentages including over-limit scenarios', () => {
    const data = DashboardBuilder.buildPageData('user-1', testUser(), {
      parties: 10,
      characters: 10,
      encounters: 10,
    });
    expect(data.percentages.parties).toBe(1000);
    expect(data.percentages.characters).toBeGreaterThan(100);
    expect(data.percentages.encounters).toBe(200);
  });

  it('sets and validates createdAt timestamp', () => {
    const beforeDate = new Date();
    const data = DashboardBuilder.buildPageData('user-1', testUser(), {
      parties: 0,
      characters: 0,
      encounters: 0,
    });
    const afterDate = new Date();
    const createdAtDate = new Date(data.createdAt);
    expect(createdAtDate.getTime()).toBeGreaterThanOrEqual(
      beforeDate.getTime()
    );
    expect(createdAtDate.getTime()).toBeLessThanOrEqual(afterDate.getTime());
  });

  it('validates complete data structure and rejects invalid modifications', () => {
    const data = DashboardBuilder.buildPageData('user-1', testUser(), {
      parties: 0,
      characters: 1,
      encounters: 0,
    });
    expect(DashboardBuilder.isValidPageData(data)).toBe(true);
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
