import { describe, it, expect } from '@jest/globals';
import { 
  validateMulticlassingPrerequisites,
  getMulticlassingPrerequisites,
  canMulticlassInto,
  hasAbilityScorePrerequisites
} from '../multiclassing-prerequisites';

// These functions don't exist yet - we'll implement them

describe('Multiclassing Prerequisites Validation', () => {
  const baseAbilities = {
    strength: 13,
    dexterity: 13,
    constitution: 13,
    intelligence: 13,
    wisdom: 13,
    charisma: 13
  };

  describe('getMulticlassingPrerequisites', () => {

    it('should return correct prerequisites for Fighter', () => {
      const prereqs = getMulticlassingPrerequisites('Fighter');
      expect(prereqs).toEqual({ strength: 13 });
    });

    it('should return correct prerequisites for Wizard', () => {
      const prereqs = getMulticlassingPrerequisites('Wizard');
      expect(prereqs).toEqual({ intelligence: 13 });
    });

    it('should return correct prerequisites for Paladin', () => {
      const prereqs = getMulticlassingPrerequisites('Paladin');
      expect(prereqs).toEqual({ strength: 13, charisma: 13 });
    });

    it('should return empty object for unknown class', () => {
      const prereqs = getMulticlassingPrerequisites('UnknownClass');
      expect(prereqs).toEqual({});
    });
  });

  describe('hasAbilityScorePrerequisites', () => {

    it('should return true when prerequisites are met', () => {
      const result = hasAbilityScorePrerequisites(baseAbilities, { strength: 13 });
      expect(result).toBe(true);
    });

    it('should return false when prerequisites are not met', () => {
      const lowAbilities = { ...baseAbilities, strength: 12 };
      const result = hasAbilityScorePrerequisites(lowAbilities, { strength: 13 });
      expect(result).toBe(false);
    });

    it('should handle multiple prerequisites correctly', () => {
      const result = hasAbilityScorePrerequisites(baseAbilities, { 
        strength: 13, 
        charisma: 13 
      });
      expect(result).toBe(true);
    });

    it('should fail when one of multiple prerequisites is not met', () => {
      const lowAbilities = { ...baseAbilities, charisma: 12 };
      const result = hasAbilityScorePrerequisites(lowAbilities, { 
        strength: 13, 
        charisma: 13 
      });
      expect(result).toBe(false);
    });
  });

  describe('canMulticlassInto', () => {

    it('should allow multiclassing into Fighter with sufficient Strength', () => {
      const result = canMulticlassInto('Fighter', baseAbilities);
      expect(result).toBe(true);
    });

    it('should prevent multiclassing into Fighter without sufficient Strength', () => {
      const lowAbilities = { ...baseAbilities, strength: 12 };
      const result = canMulticlassInto('Fighter', lowAbilities);
      expect(result).toBe(false);
    });

    it('should allow multiclassing into Paladin with sufficient Str and Cha', () => {
      const result = canMulticlassInto('Paladin', baseAbilities);
      expect(result).toBe(true);
    });

    it('should prevent multiclassing into Paladin without sufficient Charisma', () => {
      const lowAbilities = { ...baseAbilities, charisma: 12 };
      const result = canMulticlassInto('Paladin', lowAbilities);
      expect(result).toBe(false);
    });

    it('should handle classes without prerequisites', () => {
      const result = canMulticlassInto('UnknownClass', baseAbilities);
      expect(result).toBe(true); // No prerequisites means allowed
    });
  });

  describe('validateMulticlassingPrerequisites', () => {
    const validCharacter = {
      abilities: baseAbilities,
      classes: [
        { className: 'Fighter', level: 5 },
        { className: 'Rogue', level: 3 }
      ]
    };


    it('should validate successful multiclassing with prerequisites met', () => {
      const result = validateMulticlassingPrerequisites(validCharacter);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation when multiclassing into Fighter without Strength', () => {
      const invalidCharacter = {
        abilities: { ...baseAbilities, strength: 12 },
        classes: [
          { className: 'Wizard', level: 1 },
          { className: 'Fighter', level: 1 }
        ]
      };

      const result = validateMulticlassingPrerequisites(invalidCharacter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Fighter multiclassing requires Strength 13 or higher');
    });

    it('should fail validation when multiclassing into Paladin without Charisma', () => {
      const invalidCharacter = {
        abilities: { ...baseAbilities, charisma: 12 },
        classes: [
          { className: 'Fighter', level: 1 },
          { className: 'Paladin', level: 1 }
        ]
      };

      const result = validateMulticlassingPrerequisites(invalidCharacter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Paladin multiclassing requires Strength 13 and Charisma 13 or higher');
    });

    it('should validate single-class characters without checking prerequisites', () => {
      const singleClassCharacter = {
        abilities: { ...baseAbilities, strength: 8 },
        classes: [{ className: 'Wizard', level: 5 }]
      };

      const result = validateMulticlassingPrerequisites(singleClassCharacter);
      expect(result.isValid).toBe(true); // No multiclassing, so no prerequisites needed
    });

    it('should check prerequisites for leaving current class', () => {
      const character = {
        abilities: { ...baseAbilities, strength: 12 }, // Not enough for Fighter
        classes: [
          { className: 'Fighter', level: 5 },
          { className: 'Rogue', level: 1 }
        ]
      };

      const result = validateMulticlassingPrerequisites(character);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Fighter multiclassing requires Strength 13 or higher to leave the class');
    });

    it('should accumulate all prerequisite errors for multiple invalid classes', () => {
      const invalidCharacter = {
        abilities: { 
          ...baseAbilities, 
          strength: 12, 
          intelligence: 12,
          charisma: 12 
        },
        classes: [
          { className: 'Fighter', level: 3 },
          { className: 'Wizard', level: 2 },
          { className: 'Paladin', level: 1 }
        ]
      };

      const result = validateMulticlassingPrerequisites(invalidCharacter);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.join(' ')).toContain('Fighter');
      expect(result.errors.join(' ')).toContain('Wizard');
      expect(result.errors.join(' ')).toContain('Paladin');
    });
  });

  describe('D&D 5e Multiclassing Rules Compliance', () => {
    const classPrerequisites = [
      { className: 'Barbarian', prereqs: { strength: 13 } },
      { className: 'Bard', prereqs: { charisma: 13 } },
      { className: 'Cleric', prereqs: { wisdom: 13 } },
      { className: 'Druid', prereqs: { wisdom: 13 } },
      { className: 'Fighter', prereqs: { strength: 13 } },
      { className: 'Monk', prereqs: { dexterity: 13, wisdom: 13 } },
      { className: 'Paladin', prereqs: { strength: 13, charisma: 13 } },
      { className: 'Ranger', prereqs: { dexterity: 13, wisdom: 13 } },
      { className: 'Rogue', prereqs: { dexterity: 13 } },
      { className: 'Sorcerer', prereqs: { charisma: 13 } },
      { className: 'Warlock', prereqs: { charisma: 13 } },
      { className: 'Wizard', prereqs: { intelligence: 13 } }
    ];

    it('should implement all official D&D 5e multiclassing prerequisites', () => {
      classPrerequisites.forEach(({ className, prereqs }) => {
        const actualPrereqs = getMulticlassingPrerequisites(className);
        expect(actualPrereqs).toEqual(prereqs);
      });
    });
  });
});