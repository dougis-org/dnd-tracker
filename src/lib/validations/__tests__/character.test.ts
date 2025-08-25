/**
 * @jest-environment jsdom
 */
import {
  characterFormSchema,
  basicInfoSchema,
  classesSchema,
  abilitiesSchema,
  skillsSchema,
  combatStatsSchema,
  spellcastingFormSchema,
  equipmentSchema,
  calculateAbilityModifier,
  calculateProficiencyBonus,
  type CharacterFormData,
  type BasicInfoFormData,
  DND_RACES,
  DND_CLASSES,
  DND_ALIGNMENTS
} from '../character';
import { ZodError } from 'zod';

describe('Character Form Validation', () => {
  // Valid test data
  const validCharacterData: CharacterFormData = {
    name: 'Aragorn',
    race: 'Human',
    subrace: 'Variant',
    background: 'Folk Hero',
    alignment: 'Chaotic Good',
    experiencePoints: 300,
    classes: [{
      className: 'Ranger',
      level: 3,
      subclass: 'Hunter',
      hitDiceSize: 10,
      hitDiceUsed: 1
    }],
    abilities: {
      strength: 16,
      dexterity: 14,
      constitution: 15,
      intelligence: 12,
      wisdom: 13,
      charisma: 10
    },
    skillProficiencies: ['Athletics', 'Survival'],
    savingThrowProficiencies: ['strength', 'dexterity'],
    hitPoints: {
      maximum: 25,
      current: 20,
      temporary: 5
    },
    armorClass: 15,
    speed: 30,
    initiative: 2,
    passivePerception: 13,
    spellcasting: {
      ability: 'wisdom',
      spellAttackBonus: 5,
      spellSaveDC: 13,
      spellSlots: {
        '1st': { total: 3, used: 1 }
      },
      spellsKnown: ['Hunter\'s Mark', 'Cure Wounds'],
      spellsPrepared: ['Hunter\'s Mark']
    },
    equipment: [{
      name: 'Longsword',
      quantity: 1,
      category: 'Weapon'
    }],
    features: ['Favored Enemy: Orcs'],
    notes: 'A ranger from the North'
  };

  describe('characterFormSchema', () => {
    it('should validate a complete valid character', () => {
      expect(() => characterFormSchema.parse(validCharacterData)).not.toThrow();
    });

    it('should require name', () => {
      const invalidData = { ...validCharacterData, name: '' };
      expect(() => characterFormSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should limit name length', () => {
      const invalidData = { ...validCharacterData, name: 'a'.repeat(101) };
      expect(() => characterFormSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should require at least one class', () => {
      const invalidData = { ...validCharacterData, classes: [] };
      expect(() => characterFormSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should limit number of classes', () => {
      const manyClasses = Array(13).fill(0).map((_, i) => ({
        className: `Class${i}`,
        level: 1,
        hitDiceSize: 8,
        hitDiceUsed: 0
      }));
      const invalidData = { ...validCharacterData, classes: manyClasses };
      expect(() => characterFormSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should validate ability score ranges', () => {
      const invalidData = { 
        ...validCharacterData, 
        abilities: { ...validCharacterData.abilities, strength: 0 } 
      };
      expect(() => characterFormSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should validate ability score maximum', () => {
      const invalidData = { 
        ...validCharacterData, 
        abilities: { ...validCharacterData.abilities, strength: 31 } 
      };
      expect(() => characterFormSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should validate hit points constraints', () => {
      const invalidData = {
        ...validCharacterData,
        hitPoints: {
          maximum: 20,
          current: 30, // Current > maximum + temporary
          temporary: 0
        }
      };
      expect(() => characterFormSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should allow current HP to equal maximum + temporary', () => {
      const validData = {
        ...validCharacterData,
        hitPoints: {
          maximum: 20,
          current: 25,
          temporary: 5
        }
      };
      expect(() => characterFormSchema.parse(validData)).not.toThrow();
    });

    it('should validate hit dice size', () => {
      const invalidData = {
        ...validCharacterData,
        classes: [{
          className: 'Fighter',
          level: 1,
          hitDiceSize: 7, // Invalid hit dice size
          hitDiceUsed: 0
        }]
      };
      expect(() => characterFormSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should validate spellcasting ability', () => {
      const invalidData = {
        ...validCharacterData,
        spellcasting: {
          ability: 'invalid' as any,
          spellAttackBonus: 5,
          spellSaveDC: 13
        }
      };
      expect(() => characterFormSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should limit notes length', () => {
      const invalidData = { 
        ...validCharacterData, 
        notes: 'a'.repeat(2001) 
      };
      expect(() => characterFormSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe('basicInfoSchema', () => {
    const validBasicInfo: BasicInfoFormData = {
      name: 'Legolas',
      race: 'Elf',
      subrace: 'Wood Elf',
      background: 'Outlander',
      alignment: 'Chaotic Good',
      experiencePoints: 0
    };

    it('should validate basic character info', () => {
      expect(() => basicInfoSchema.parse(validBasicInfo)).not.toThrow();
    });

    it('should require name, race, background, and alignment', () => {
      const requiredFields = ['name', 'race', 'background', 'alignment'];
      
      requiredFields.forEach(field => {
        const invalidData = { ...validBasicInfo, [field]: '' };
        expect(() => basicInfoSchema.parse(invalidData)).toThrow(ZodError);
      });
    });

    it('should make subrace optional', () => {
      const dataWithoutSubrace = { ...validBasicInfo };
      delete dataWithoutSubrace.subrace;
      expect(() => basicInfoSchema.parse(dataWithoutSubrace)).not.toThrow();
    });

    it('should default experiencePoints to 0', () => {
      const dataWithoutXP = { ...validBasicInfo };
      delete dataWithoutXP.experiencePoints;
      const result = basicInfoSchema.parse(dataWithoutXP);
      expect(result.experiencePoints).toBe(0);
    });
  });

  describe('classesSchema', () => {
    it('should validate single class', () => {
      const validData = {
        classes: [{
          className: 'Fighter',
          level: 5,
          subclass: 'Champion',
          hitDiceSize: 10,
          hitDiceUsed: 2
        }]
      };
      expect(() => classesSchema.parse(validData)).not.toThrow();
    });

    it('should validate multiclass characters', () => {
      const validData = {
        classes: [
          {
            className: 'Fighter',
            level: 3,
            subclass: 'Champion',
            hitDiceSize: 10,
            hitDiceUsed: 1
          },
          {
            className: 'Rogue',
            level: 2,
            hitDiceSize: 8,
            hitDiceUsed: 0
          }
        ]
      };
      expect(() => classesSchema.parse(validData)).not.toThrow();
    });

    it('should validate class level bounds', () => {
      const invalidData = {
        classes: [{
          className: 'Wizard',
          level: 21, // Over max level
          hitDiceSize: 6,
          hitDiceUsed: 0
        }]
      };
      expect(() => classesSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should make subclass optional', () => {
      const validData = {
        classes: [{
          className: 'Fighter',
          level: 1, // Low level, no subclass yet
          hitDiceSize: 10,
          hitDiceUsed: 0
        }]
      };
      expect(() => classesSchema.parse(validData)).not.toThrow();
    });
  });

  describe('abilitiesSchema', () => {
    it('should validate all six ability scores', () => {
      const validData = {
        abilities: {
          strength: 15,
          dexterity: 14,
          constitution: 13,
          intelligence: 12,
          wisdom: 10,
          charisma: 8
        }
      };
      expect(() => abilitiesSchema.parse(validData)).not.toThrow();
    });

    it('should require all ability scores', () => {
      const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
      
      abilities.forEach(ability => {
        const invalidData = {
          abilities: {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
          }
        };
        delete (invalidData.abilities as any)[ability];
        expect(() => abilitiesSchema.parse(invalidData)).toThrow(ZodError);
      });
    });
  });

  describe('Utility Functions', () => {
    describe('calculateAbilityModifier', () => {
      it('should calculate ability modifiers correctly', () => {
        expect(calculateAbilityModifier(10)).toBe(0);
        expect(calculateAbilityModifier(11)).toBe(0);
        expect(calculateAbilityModifier(12)).toBe(1);
        expect(calculateAbilityModifier(13)).toBe(1);
        expect(calculateAbilityModifier(8)).toBe(-1);
        expect(calculateAbilityModifier(6)).toBe(-2);
        expect(calculateAbilityModifier(20)).toBe(5);
      });
    });

    describe('calculateProficiencyBonus', () => {
      it('should calculate proficiency bonus by character level', () => {
        expect(calculateProficiencyBonus(1)).toBe(2);
        expect(calculateProficiencyBonus(4)).toBe(2);
        expect(calculateProficiencyBonus(5)).toBe(3);
        expect(calculateProficiencyBonus(8)).toBe(3);
        expect(calculateProficiencyBonus(9)).toBe(4);
        expect(calculateProficiencyBonus(12)).toBe(4);
        expect(calculateProficiencyBonus(13)).toBe(5);
        expect(calculateProficiencyBonus(16)).toBe(5);
        expect(calculateProficiencyBonus(17)).toBe(6);
        expect(calculateProficiencyBonus(20)).toBe(6);
      });
    });
  });

  describe('D&D Constants', () => {
    it('should have expected races', () => {
      expect(DND_RACES).toContain('Human');
      expect(DND_RACES).toContain('Elf');
      expect(DND_RACES).toContain('Dwarf');
      expect(DND_RACES.length).toBeGreaterThan(5);
    });

    it('should have expected classes', () => {
      expect(DND_CLASSES).toContain('Fighter');
      expect(DND_CLASSES).toContain('Wizard');
      expect(DND_CLASSES).toContain('Rogue');
      expect(DND_CLASSES.length).toBeGreaterThan(10);
    });

    it('should have all nine alignments', () => {
      expect(DND_ALIGNMENTS).toHaveLength(9);
      expect(DND_ALIGNMENTS).toContain('Lawful Good');
      expect(DND_ALIGNMENTS).toContain('True Neutral');
      expect(DND_ALIGNMENTS).toContain('Chaotic Evil');
    });
  });

  describe('Schema Composition', () => {
    it('should allow partial validation for form steps', () => {
      // Each step schema should validate independently
      expect(() => basicInfoSchema.parse({
        name: 'Test',
        race: 'Human',
        background: 'Acolyte',
        alignment: 'Lawful Good',
        experiencePoints: 0
      })).not.toThrow();

      expect(() => abilitiesSchema.parse({
        abilities: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10
        }
      })).not.toThrow();
    });

    it('should compose into full character schema', () => {
      // When combined, should create valid full character
      const basicInfo = {
        name: 'Test Character',
        race: 'Human',
        background: 'Acolyte',
        alignment: 'Lawful Good',
        experiencePoints: 0
      };

      const classes = {
        classes: [{
          className: 'Cleric',
          level: 1,
          hitDiceSize: 8,
          hitDiceUsed: 0
        }]
      };

      const abilities = {
        abilities: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 15,
          charisma: 12
        }
      };

      const combinedData = { ...basicInfo, ...classes, ...abilities };
      expect(() => characterFormSchema.parse(combinedData)).not.toThrow();
    });
  });
});