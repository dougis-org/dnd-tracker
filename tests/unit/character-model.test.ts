import { describe, expect, it } from '@jest/globals';

import { CharacterModel } from '@/lib/db/models/Character';

describe('CharacterModel.calculateDerivedStats', () => {
  const baseInput = {
    abilityScores: {
      str: 12,
      dex: 14,
      con: 13,
      int: 10,
      wis: 11,
      cha: 9,
    },
    classes: [
      { classId: 'fighter', level: 3 },
      { classId: 'wizard', level: 2 },
    ],
  };

  it('calculates total level as the sum of all class levels', () => {
    const result = CharacterModel.calculateDerivedStats(baseInput);

    expect(result.totalLevel).toBe(5);
  });

  it('rejects characters whose total level exceeds 20', () => {
    const overCapInput = {
      ...baseInput,
      classes: [
        { classId: 'fighter', level: 12 },
        { classId: 'wizard', level: 9 },
      ],
    };

    expect(() => CharacterModel.calculateDerivedStats(overCapInput)).toThrow(
      RangeError
    );
  });
});
