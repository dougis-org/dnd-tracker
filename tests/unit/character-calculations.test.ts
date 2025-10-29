import { describe, expect, it } from '@jest/globals';

import {
  calculateDerivedStats,
  getAbilityModifier,
  getProficiencyBonus,
} from '@/lib/services/dnd5e-calculations';

const abilityModifierCases: Array<[number, number]> = [
  [1, -5],
  [2, -4],
  [3, -4],
  [4, -3],
  [5, -3],
  [8, -1],
  [9, -1],
  [10, 0],
  [11, 0],
  [12, 1],
  [13, 1],
  [14, 2],
  [15, 2],
  [18, 4],
  [20, 5],
];

describe('getAbilityModifier', () => {
  it.each(abilityModifierCases)(
    'maps ability score %s to modifier %s',
    (score, expected) => {
      expect(getAbilityModifier(score)).toBe(expected);
    }
  );

  it('rounds fractional scores down before applying the modifier formula', () => {
    expect(getAbilityModifier(13.9)).toBe(1);
  });

  it('throws when the ability score is not a finite number', () => {
    expect(() => getAbilityModifier(Number.POSITIVE_INFINITY)).toThrow(TypeError);
  });
});

describe('getProficiencyBonus', () => {
  const cases: Array<[number, number]> = [
    [1, 2],
    [4, 2],
    [5, 3],
    [8, 3],
    [9, 4],
    [12, 4],
    [13, 5],
    [16, 5],
    [17, 6],
    [20, 6],
  ];

  it.each(cases)(
    'awards total level %s a proficiency bonus of %s',
    (level, expectedBonus) => {
      expect(getProficiencyBonus(level)).toBe(expectedBonus);
    }
  );

  it('throws a RangeError when total level is less than 1', () => {
    expect(() => getProficiencyBonus(0)).toThrow(RangeError);
  });
});

describe('calculateDerivedStats', () => {
  it('computes SRD-compliant derived stats for multiclass characters', () => {
    const result = calculateDerivedStats({
      abilityScores: {
        str: 10,
        dex: 14,
        con: 14,
        int: 12,
        wis: 10,
        cha: 8,
      },
      classes: [
        { className: 'Fighter', hitDie: 'd10', level: 3 },
        { className: 'Wizard', hitDie: 'd6', level: 2 },
      ],
    });

    expect(result).toMatchObject({
      totalLevel: 5,
      proficiencyBonus: 3,
      armorClass: 12,
      initiative: 2,
      maxHitPoints: 52,
      abilityModifiers: {
        str: 0,
        dex: 2,
        con: 2,
        int: 1,
        wis: 0,
        cha: -1,
      },
    });
  });

  it('allows overriding the base armor class when provided', () => {
    const { armorClass } = calculateDerivedStats({
      abilityScores: {
        str: 10,
        dex: 14,
        con: 12,
        int: 10,
        wis: 10,
        cha: 10,
      },
      classes: [{ className: 'Rogue', hitDie: 'd8', level: 3 }],
      baseArmorClass: 12,
    });

    expect(armorClass).toBe(14);
  });

  it('throws when no class levels are provided', () => {
    expect(() =>
      calculateDerivedStats({
        abilityScores: {
          str: 10,
          dex: 12,
          con: 12,
          int: 10,
          wis: 10,
          cha: 10,
        },
        classes: [],
      })
    ).toThrow(RangeError);
  });
});
