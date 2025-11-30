/**
 * Usage Percentage Calculations Tests
 *
 * Tests for calculating usage percentages across resources
 */

import { TierLimits } from '@/types/subscription';
import { PERCENTAGE_TEST_CASES } from './fixtures';

describe('Usage Percentage Calculations', () => {
  it.each(PERCENTAGE_TEST_CASES)(
    'should calculate $usage of $limit as $expected%',
    ({ usage, limit, expected }) => {
      const percentage = (usage / limit) * 100;
      expect(percentage).toBeCloseTo(expected, 1);
    }
  );

  it('should handle free tier: 0 of 3 characters (0%)', () => {
    const usage = 0;
    const limit = TierLimits.free_adventurer.characters;
    const percentage = (usage / limit) * 100;
    expect(percentage).toBe(0);
  });

  it('should handle free tier: 3 of 3 characters (100%)', () => {
    const usage = 3;
    const limit = TierLimits.free_adventurer.characters;
    const percentage = (usage / limit) * 100;
    expect(percentage).toBe(100);
  });

  it('should handle free tier: 5 of 5 encounters (100%)', () => {
    const usage = 5;
    const limit = TierLimits.free_adventurer.encounters;
    const percentage = (usage / limit) * 100;
    expect(percentage).toBe(100);
  });

  it('should handle seasoned tier: 10 of 10 characters (100%)', () => {
    const usage = 10;
    const limit = TierLimits.seasoned_adventurer.characters;
    const percentage = (usage / limit) * 100;
    expect(percentage).toBe(100);
  });

  it('should handle >100% usage (over limit)', () => {
    const usage = 15;
    const limit = 10;
    const percentage = (usage / limit) * 100;
    expect(percentage).toBe(150);
  });
});
