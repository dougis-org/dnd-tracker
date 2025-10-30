import { describe, expect, it } from '@jest/globals';

import { CharacterService } from '@/lib/services/characterService';

describe('CharacterService.checkTierLimit', () => {
  const tierCases = [
    { tier: 'free', limit: 10 },
    { tier: 'seasoned', limit: 50 },
    { tier: 'expert', limit: 250 },
  ] as const;

  it.each(tierCases)(
    'allows character creation for %s tier when usage is below the limit',
    async ({ tier, limit }) => {
      const result = await CharacterService.checkTierLimit({
        subscriptionTier: tier,
        activeCharacterCount: Math.floor(limit * 0.7), // Well below 80% threshold
      });

      expect(result.canCreate).toBe(true);
      expect(result.shouldWarn).toBe(false);
      expect(result.usage).toMatchObject({
        used: Math.floor(limit * 0.7),
        limit,
        remaining: limit - Math.floor(limit * 0.7),
      });
    }
  );

  it.each(tierCases)(
    'signals a warning when usage is at or above 80% of the tier limit',
    async ({ tier, limit }) => {
      const warningThreshold = Math.floor(limit * 0.8);
      const result = await CharacterService.checkTierLimit({
        subscriptionTier: tier,
        activeCharacterCount: warningThreshold,
      });

      expect(result.shouldWarn).toBe(true);
      expect(result.usage).toMatchObject({ limit, used: warningThreshold });
    }
  );

  it('rejects creation when usage meets the tier limit', async () => {
    await expect(
      CharacterService.checkTierLimit({
        subscriptionTier: 'free',
        activeCharacterCount: 10,
      })
    ).rejects.toThrow(RangeError);
  });
});
