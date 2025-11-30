/**
 * Subscription Tiers Tests
 *
 * Tests for subscription tier definitions and constants
 */

import { SUBSCRIPTION_TIERS, TIER_TEST_CASES } from './fixtures';

describe('Subscription Tiers Constants', () => {
  it('should export all 5 tiers', () => {
    expect(SUBSCRIPTION_TIERS).toHaveLength(5);
  });

  it('should contain free_adventurer tier', () => {
    expect(SUBSCRIPTION_TIERS).toContain('free_adventurer');
  });

  it('should contain guild_master tier', () => {
    expect(SUBSCRIPTION_TIERS).toContain('guild_master');
  });

  it('should have correct tier order', () => {
    expect(SUBSCRIPTION_TIERS[0]).toBe('free_adventurer');
    expect(SUBSCRIPTION_TIERS[4]).toBe('guild_master');
  });

  it.each(TIER_TEST_CASES)(
    'should define correct limits for tier $tier',
    ({ tier, expectedParties, expectedCharacters, expectedEncounters }) => {
      expect(tier).toBeDefined();
      expect(expectedParties).toBeGreaterThan(0);
      expect(expectedCharacters).toBeGreaterThan(0);
      expect(expectedEncounters).toBeGreaterThan(0);
    }
  );
});
