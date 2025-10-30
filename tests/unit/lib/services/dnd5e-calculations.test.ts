import {
  getAbilityModifier,
  getProficiencyBonus,
  calculateAbilityModifiers,
  calculateDerivedStats,
} from '@/lib/services/dnd5e-calculations';

describe('dnd5e-calculations - Branch Coverage', () => {
  describe('getAbilityModifier', () => {
    it('calculates correct modifier for standard ability scores', () => {
      expect(getAbilityModifier(10)).toBe(0); // (10-10)/2 = 0
      expect(getAbilityModifier(11)).toBe(0); // (11-10)/2 = 0.5 -> 0
      expect(getAbilityModifier(12)).toBe(1); // (12-10)/2 = 1
      expect(getAbilityModifier(13)).toBe(1); // (13-10)/2 = 1.5 -> 1
      expect(getAbilityModifier(14)).toBe(2); // (14-10)/2 = 2
      expect(getAbilityModifier(15)).toBe(2); // (15-10)/2 = 2.5 -> 2
    });

    it('calculates correct modifier for low ability scores', () => {
      expect(getAbilityModifier(9)).toBe(-1); // (9-10)/2 = -0.5 -> -1
      expect(getAbilityModifier(8)).toBe(-1); // (8-10)/2 = -1
      expect(getAbilityModifier(7)).toBe(-2); // (7-10)/2 = -1.5 -> -2
      expect(getAbilityModifier(3)).toBe(-4); // (3-10)/2 = -3.5 -> -4
    });

    it('calculates correct modifier for high ability scores', () => {
      expect(getAbilityModifier(18)).toBe(4); // (18-10)/2 = 4
      expect(getAbilityModifier(20)).toBe(5); // (20-10)/2 = 5
    });

    it('throws TypeError for non-finite values', () => {
      expect(() => getAbilityModifier(Infinity)).toThrow(TypeError);
      expect(() => getAbilityModifier(-Infinity)).toThrow(TypeError);
      expect(() => getAbilityModifier(NaN)).toThrow(TypeError);
    });
  });

  describe('getProficiencyBonus', () => {
    it('calculates correct proficiency bonus for each level range', () => {
      expect(getProficiencyBonus(1)).toBe(2); // Levels 1-4
      expect(getProficiencyBonus(4)).toBe(2);
      expect(getProficiencyBonus(5)).toBe(3); // Levels 5-8
      expect(getProficiencyBonus(8)).toBe(3);
      expect(getProficiencyBonus(9)).toBe(4); // Levels 9-12
      expect(getProficiencyBonus(12)).toBe(4);
      expect(getProficiencyBonus(13)).toBe(5); // Levels 13-16
      expect(getProficiencyBonus(16)).toBe(5);
      expect(getProficiencyBonus(17)).toBe(6); // Levels 17-20
      expect(getProficiencyBonus(20)).toBe(6);
    });

    it('throws RangeError for level below 1', () => {
      expect(() => getProficiencyBonus(0)).toThrow(RangeError);
      expect(() => getProficiencyBonus(-1)).toThrow(RangeError);
    });

    it('works correctly for levels above 20', () => {
      expect(getProficiencyBonus(21)).toBe(7);
      expect(getProficiencyBonus(24)).toBe(7);
      expect(getProficiencyBonus(25)).toBe(8);
    });
  });

  describe('calculateAbilityModifiers', () => {
    it('calculates modifiers for all ability scores correctly', () => {
      const result = calculateAbilityModifiers({
        str: 15,
        dex: 14,
        con: 13,
        int: 12,
        wis: 11,
        cha: 10,
      });

      expect(result).toEqual({
        str: 2, // (15-10)/2 = 2
        dex: 2, // (14-10)/2 = 2
        con: 1, // (13-10)/2 = 1
        int: 1, // (12-10)/2 = 1
        wis: 0, // (11-10)/2 = 0
        cha: 0, // (10-10)/2 = 0
      });
    });

    it('handles all low ability scores', () => {
      const result = calculateAbilityModifiers({
        str: 3,
        dex: 4,
        con: 5,
        int: 6,
        wis: 7,
        cha: 8,
      });

      expect(result.str).toBe(-4);
      expect(result.dex).toBe(-3);
      expect(result.con).toBe(-3);
      expect(result.int).toBe(-2);
      expect(result.wis).toBe(-2);
      expect(result.cha).toBe(-1);
    });

    it('handles all high ability scores', () => {
      const result = calculateAbilityModifiers({
        str: 20,
        dex: 19,
        con: 18,
        int: 17,
        wis: 16,
        cha: 15,
      });

      expect(result.str).toBe(5);
      expect(result.dex).toBe(4);
      expect(result.con).toBe(4);
      expect(result.int).toBe(3);
      expect(result.wis).toBe(3);
      expect(result.cha).toBe(2);
    });
  });

  describe('calculateDerivedStats', () => {
    it('calculates derived stats for single class character', () => {
      const result = calculateDerivedStats({
        abilityScores: {
          str: 15,
          dex: 14,
          con: 13,
          int: 12,
          wis: 11,
          cha: 10,
        },
        classes: [
          {
            level: 5,
            hitDie: 'd12',
          },
        ],
      });

      expect(result).toMatchObject({
        totalLevel: 5,
        proficiencyBonus: 3,
        armorClass: 12, // 10 + dex modifier (2)
        initiative: 2, // dex modifier
      });
      expect(result.maxHitPoints).toBeGreaterThan(0);
    });

    it('calculates derived stats for multiclass character', () => {
      const result = calculateDerivedStats({
        abilityScores: {
          str: 10,
          dex: 10,
          con: 10,
          int: 10,
          wis: 10,
          cha: 10,
        },
        classes: [
          { level: 3, hitDie: 'd8' },
          { level: 2, hitDie: 'd6' },
        ],
      });

      expect(result.totalLevel).toBe(5);
      expect(result.proficiencyBonus).toBe(3);
    });

    it('applies custom baseArmorClass', () => {
      const result = calculateDerivedStats({
        abilityScores: {
          str: 10,
          dex: 10,
          con: 10,
          int: 10,
          wis: 10,
          cha: 10,
        },
        classes: [{ level: 1, hitDie: 'd8' }],
        baseArmorClass: 14,
      });

      expect(result.armorClass).toBe(14); // 14 + 0 (dex modifier)
    });

    it('handles negative dex modifier in armor class calculation', () => {
      const result = calculateDerivedStats({
        abilityScores: {
          str: 10,
          dex: 8, // -1 modifier
          con: 10,
          int: 10,
          wis: 10,
          cha: 10,
        },
        classes: [{ level: 1, hitDie: 'd8' }],
        baseArmorClass: 10,
      });

      expect(result.armorClass).toBe(9); // 10 + (-1)
      expect(result.initiative).toBe(-1);
    });

    it('throws RangeError when no classes provided', () => {
      expect(() =>
        calculateDerivedStats({
          abilityScores: {
            str: 10,
            dex: 10,
            con: 10,
            int: 10,
            wis: 10,
            cha: 10,
          },
          classes: [],
        })
      ).toThrow(RangeError);
    });

    it('throws Error when hitDie is invalid format', () => {
      expect(() =>
        calculateDerivedStats({
          abilityScores: {
            str: 10,
            dex: 10,
            con: 10,
            int: 10,
            wis: 10,
            cha: 10,
          },
          classes: [
            {
              level: 1,
              hitDie: 'invalid' as never,
            },
          ],
        })
      ).toThrow();
    });

    it('calculates hit points with constitution modifier', () => {
      const resultWithHighCon = calculateDerivedStats({
        abilityScores: {
          str: 10,
          dex: 10,
          con: 18, // +4 modifier
          int: 10,
          wis: 10,
          cha: 10,
        },
        classes: [{ level: 1, hitDie: 'd8' }],
      });

      const resultWithLowCon = calculateDerivedStats({
        abilityScores: {
          str: 10,
          dex: 10,
          con: 8, // -1 modifier
          int: 10,
          wis: 10,
          cha: 10,
        },
        classes: [{ level: 1, hitDie: 'd8' }],
      });

      // High CON should result in more HP
      expect(resultWithHighCon.maxHitPoints).toBeGreaterThan(
        resultWithLowCon.maxHitPoints
      );

      // Low CON should still result in at least 1 HP per level
      expect(resultWithLowCon.maxHitPoints).toBeGreaterThanOrEqual(1);
    });

    it('calculates proficiency bonus based on total level', () => {
      const level1 = calculateDerivedStats({
        abilityScores: {
          str: 10,
          dex: 10,
          con: 10,
          int: 10,
          wis: 10,
          cha: 10,
        },
        classes: [{ level: 1, hitDie: 'd8' }],
      });

      const level5 = calculateDerivedStats({
        abilityScores: {
          str: 10,
          dex: 10,
          con: 10,
          int: 10,
          wis: 10,
          cha: 10,
        },
        classes: [{ level: 5, hitDie: 'd8' }],
      });

      const level9 = calculateDerivedStats({
        abilityScores: {
          str: 10,
          dex: 10,
          con: 10,
          int: 10,
          wis: 10,
          cha: 10,
        },
        classes: [{ level: 9, hitDie: 'd8' }],
      });

      expect(level1.proficiencyBonus).toBe(2);
      expect(level5.proficiencyBonus).toBe(3);
      expect(level9.proficiencyBonus).toBe(4);
    });
  });
});
