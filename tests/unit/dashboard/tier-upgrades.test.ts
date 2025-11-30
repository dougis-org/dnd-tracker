/**
 * Tier Upgrade Scenario Tests
 * Tests for subscription tier upgrade scenarios
 */

import { SubscriptionTier, TierLimits } from '@/types/subscription';

describe('Tier Upgrade Scenarios', () => {
  it('should show correct limits after upgrade from free to seasoned', () => {
    const freeLimits = TierLimits.free_adventurer;
    const seasonedLimits = TierLimits.seasoned_adventurer;

    expect(freeLimits.parties).toBe(1);
    expect(seasonedLimits.parties).toBe(3);
    expect(seasonedLimits.parties > freeLimits.parties).toBe(true);
  });

  it('should show correct limits progression across all tiers', () => {
    const tiers: SubscriptionTier[] = [
      'free_adventurer',
      'seasoned_adventurer',
      'expert_dungeon_master',
      'master_of_dungeons',
      'guild_master',
    ];

    let prevLimit = 0;
    tiers.forEach((tier) => {
      const limits = TierLimits[tier];
      expect(limits.characters >= prevLimit).toBe(true);
      prevLimit = limits.characters;
    });
  });

  it('should verify each tier has higher limits than previous', () => {
    const free = TierLimits.free_adventurer.characters;
    const seasoned = TierLimits.seasoned_adventurer.characters;
    const expert = TierLimits.expert_dungeon_master.characters;
    const master = TierLimits.master_of_dungeons.characters;
    const guild = TierLimits.guild_master.characters;

    expect(seasoned).toBeGreaterThan(free);
    expect(expert).toBeGreaterThan(seasoned);
    expect(master).toBeGreaterThan(expert);
    expect(guild).toBeGreaterThan(master);
  });
});
