import { describe, expect, it } from '@jest/globals'

import {
  calculateDerivedStats,
  getAbilityModifier,
  getProficiencyBonus,
} from '@/lib/services/dnd5e-calculations'

const dexModifierCases: Array<[number, number]> = [
  [2, -4],
  [3, -4],
  [8, -1],
  [10, 0],
  [12, 1],
  [14, 2],
  [18, 4],
]

describe('getAbilityModifier', () => {
  it.each(dexModifierCases)('maps ability score %s to modifier %s', (score, expected) => {
    expect(getAbilityModifier(score)).toBe(expected)
  })

  it('handles maximum PHB ability score of 20', () => {
    expect(getAbilityModifier(20)).toBe(5)
  })
})

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
  ]

  it.each(cases)('awards total level %s a proficiency bonus of %s', (level, expectedBonus) => {
    expect(getProficiencyBonus(level)).toBe(expectedBonus)
  })
})

describe('calculateDerivedStats', () => {
  it('computes AC, initiative, and hit points for multiclass characters', () => {
    const { armorClass, initiative, maxHitPoints } = calculateDerivedStats({
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
    })

    expect(armorClass).toBe(12)
    expect(initiative).toBe(2)
    expect(maxHitPoints).toBe(52)
  })
})
