/**
 * API Helper Functions Tests
 *
 * Tests for subscription helper functions
 */

import {
  SubscriptionTier,
  isValidTier,
  getLimitsForTier,
} from '@/types/subscription';

describe('API Helper Functions', () => {
  describe('isValidTier', () => {
    it('should return true for valid tiers', () => {
      expect(isValidTier('free_adventurer')).toBe(true);
      expect(isValidTier('seasoned_adventurer')).toBe(true);
      expect(isValidTier('guild_master')).toBe(true);
    });

    it('should return false for invalid tiers', () => {
      expect(isValidTier('invalid_tier')).toBe(false);
      expect(isValidTier('')).toBe(false);
    });

    it('should return false for null and undefined', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(isValidTier(null as any)).toBe(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(isValidTier(undefined as any)).toBe(false);
    });

    it('should return false for non-string inputs', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(isValidTier(123 as any)).toBe(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(isValidTier({} as any)).toBe(false);
    });
  });

  describe('getLimitsForTier', () => {
    it('should return correct limits for free_adventurer', () => {
      const limits = getLimitsForTier('free_adventurer');
      expect(limits.parties).toBe(1);
      expect(limits.characters).toBe(3);
      expect(limits.encounters).toBe(5);
    });

    it('should return correct limits for seasoned_adventurer', () => {
      const limits = getLimitsForTier('seasoned_adventurer');
      expect(limits.parties).toBe(3);
      expect(limits.characters).toBe(10);
      expect(limits.encounters).toBe(20);
    });

    it('should return correct limits for guild_master', () => {
      const limits = getLimitsForTier('guild_master');
      expect(limits.parties).toBe(Number.POSITIVE_INFINITY);
      expect(limits.characters).toBe(Number.POSITIVE_INFINITY);
      expect(limits.encounters).toBe(Number.POSITIVE_INFINITY);
    });

    it('should throw error for invalid tier', () => {
      expect(() => {
        getLimitsForTier('invalid_tier' as SubscriptionTier);
      }).toThrow('Invalid subscription tier');
    });
  });
});
