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
        activeCharacterCount: limit - 1,
      });

      expect(result.canCreate).toBe(true);
      expect(result.shouldWarn).toBe(false);
      expect(result.usage).toMatchObject({
        used: limit - 1,
        limit,
        remaining: 1,
      });
    }
  );

  it('signals a warning when usage meets 80% of the tier limit', async () => {
    const result = await CharacterService.checkTierLimit({
      subscriptionTier: 'free',
      activeCharacterCount: 8,
    });

    expect(result.shouldWarn).toBe(true);
    expect(result.usage).toMatchObject({ limit: 10, used: 8 });
  });

  it('rejects creation when usage meets the tier limit', async () => {
    await expect(
      CharacterService.checkTierLimit({
        subscriptionTier: 'free',
        activeCharacterCount: 10,
      })
    ).rejects.toThrow(RangeError);
  });
});
