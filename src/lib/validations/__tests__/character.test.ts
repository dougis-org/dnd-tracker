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

// Test Helpers
const createValidCharacterData = (): CharacterFormData => ({
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
});

const expectValidationError = (fn: () => any, expectedError?: string) => {
  expect(fn).toThrow(ZodError);
  if (expectedError) {
    try {
      fn();
    } catch (error) {
      if (error instanceof ZodError && error.errors) {
        expect(error.errors.some(e => e.message && e.message.includes(expectedError))).toBe(true);
      }
    }
  }
};

const expectValidationSuccess = (fn: () => any) => {
  expect(fn).not.toThrow();
};

describe('Character Form Validation', () => {
  let validCharacterData: CharacterFormData;

  beforeEach(() => {
    validCharacterData = createValidCharacterData();
  });

  describe('characterFormSchema', () => {
    it('should validate a complete valid character', () => {
      expectValidationSuccess(() => characterFormSchema.parse(validCharacterData));
    });

    describe('Field Requirements', () => {
      const requiredFieldTests = [
        { field: 'name', value: '', expectedError: 'Name is required' },
        { field: 'name', value: 'a'.repeat(101), expectedError: 'Name cannot exceed 100 characters' }
      ] as const;

      test.each(requiredFieldTests)('should validate $field field', ({ field, value, expectedError }) => {
        const invalidData = { ...validCharacterData, [field]: value };
        expectValidationError(() => characterFormSchema.parse(invalidData), expectedError);
      });
    });

    describe('Classes Validation', () => {
      it('should require at least one class', () => {
        const invalidData = { ...validCharacterData, classes: [] };
        expectValidationError(() => characterFormSchema.parse(invalidData), 'At least one class is required');
      });

      it('should limit number of classes', () => {
        const manyClasses = Array(13).fill(0).map((_, i) => ({
          className: `Class${i}`,
          level: 1,
          hitDiceSize: 8 as const,
          hitDiceUsed: 0
        }));
        const invalidData = { ...validCharacterData, classes: manyClasses };
        expectValidationError(() => characterFormSchema.parse(invalidData), 'Character cannot have more than 12 classes');
      });
    });

    describe('Ability Scores Validation', () => {
      const abilityTests = [
        { score: 0, shouldFail: true },
        { score: 1, shouldFail: false },
        { score: 15, shouldFail: false },
        { score: 30, shouldFail: false },
        { score: 31, shouldFail: true }
      ];

      test.each(abilityTests)('should validate ability score $score (fail: $shouldFail)', ({ score, shouldFail }) => {
        const invalidData = { 
          ...validCharacterData, 
          abilities: { ...validCharacterData.abilities, strength: score }
        };
        
        if (shouldFail) {
          expectValidationError(() => characterFormSchema.parse(invalidData), 'Ability scores must be between 1 and 30');
        } else {
          expectValidationSuccess(() => characterFormSchema.parse(invalidData));
        }
      });
    });

    describe('Hit Points Validation', () => {
      const hitPointTests = [
        { current: 20, maximum: 25, temporary: 0, shouldFail: false, desc: 'current <= maximum' },
        { current: 25, maximum: 25, temporary: 5, shouldFail: false, desc: 'current = maximum + temporary' },
        { current: 31, maximum: 25, temporary: 5, shouldFail: true, desc: 'current > maximum + temporary' }
      ];

      test.each(hitPointTests)('should validate hit points: $desc', ({ current, maximum, temporary, shouldFail }) => {
        const invalidData = {
          ...validCharacterData,
          hitPoints: { current, maximum, temporary }
        };

        if (shouldFail) {
          expectValidationError(() => characterFormSchema.parse(invalidData), 'Current HP cannot exceed maximum HP + temporary HP');
        } else {
          expectValidationSuccess(() => characterFormSchema.parse(invalidData));
        }
      });
    });

    describe('Hit Dice Size Validation', () => {
      const hitDiceSizes = [6, 8, 10, 12] as const;
      const invalidHitDiceSizes = [4, 20, 100];

      test.each(hitDiceSizes)('should accept valid hit dice size %d', (hitDiceSize) => {
        const validData = {
          ...validCharacterData,
          classes: [{ ...validCharacterData.classes[0], hitDiceSize }]
        };
        expectValidationSuccess(() => characterFormSchema.parse(validData));
      });

      test.each(invalidHitDiceSizes)('should reject invalid hit dice size %d', (hitDiceSize) => {
        const invalidData = {
          ...validCharacterData,
          classes: [{ ...validCharacterData.classes[0], hitDiceSize: hitDiceSize as any }]
        };
        expectValidationError(() => characterFormSchema.parse(invalidData));
      });
    });

    describe('Spellcasting Validation', () => {
      const validAbilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const;
      const invalidAbilities = ['magic', 'luck', 'speed'];

      test.each(validAbilities)('should accept valid spellcasting ability: %s', (ability) => {
        const validData = {
          ...validCharacterData,
          spellcasting: { ...validCharacterData.spellcasting!, ability }
        };
        expectValidationSuccess(() => characterFormSchema.parse(validData));
      });

      test.each(invalidAbilities)('should reject invalid spellcasting ability: %s', (ability) => {
        const invalidData = {
          ...validCharacterData,
          spellcasting: { ...validCharacterData.spellcasting!, ability: ability as any }
        };
        expectValidationError(() => characterFormSchema.parse(invalidData));
      });
    });

    describe('Notes Length Validation', () => {
      const notesTests = [
        { length: 0, shouldFail: false, desc: 'empty notes' },
        { length: 1000, shouldFail: false, desc: 'normal length notes' },
        { length: 2000, shouldFail: false, desc: 'maximum length notes' },
        { length: 2001, shouldFail: true, desc: 'exceeding maximum length' }
      ];

      test.each(notesTests)('should validate $desc', ({ length, shouldFail }) => {
        const testData = {
          ...validCharacterData,
          notes: 'a'.repeat(length)
        };

        if (shouldFail) {
          expectValidationError(() => characterFormSchema.parse(testData), 'Notes cannot exceed 2000 characters');
        } else {
          expectValidationSuccess(() => characterFormSchema.parse(testData));
        }
      });
    });
  });

  describe('Schema Composition', () => {
    describe('basicInfoSchema', () => {
      const createBasicInfo = (): BasicInfoFormData => ({
        name: 'Aragorn',
        race: 'Human',
        subrace: 'Variant',
        background: 'Folk Hero',
        alignment: 'Chaotic Good',
        experiencePoints: 300
      });

      const requiredFieldTests = [
        { field: 'name', expectedError: 'Name is required' },
        { field: 'race', expectedError: 'Race is required' },
        { field: 'background', expectedError: 'Background is required' },
        { field: 'alignment', expectedError: 'Alignment is required' }
      ] as const;

      test.each(requiredFieldTests)('should require $field', ({ field, expectedError }) => {
        const invalidData = { ...createBasicInfo(), [field]: '' };
        expectValidationError(() => basicInfoSchema.parse(invalidData), expectedError);
      });

      it('should make subrace optional', () => {
        const validData = { ...createBasicInfo(), subrace: undefined };
        expectValidationSuccess(() => basicInfoSchema.parse(validData));
      });

      it('should default experiencePoints to 0', () => {
        const { experiencePoints, ...dataWithoutXP } = createBasicInfo();
        const result = basicInfoSchema.parse(dataWithoutXP);
        expect(result.experiencePoints).toBe(0);
      });
    });
  });

  describe('Utility Functions', () => {
    describe('calculateAbilityModifier', () => {
      const modifierTests = [
        { score: 1, expected: -5 },
        { score: 8, expected: -1 },
        { score: 10, expected: 0 },
        { score: 11, expected: 0 },
        { score: 12, expected: 1 },
        { score: 16, expected: 3 },
        { score: 20, expected: 5 },
        { score: 30, expected: 10 }
      ];

      test.each(modifierTests)('should calculate modifier for score $score as $expected', ({ score, expected }) => {
        expect(calculateAbilityModifier(score)).toBe(expected);
      });
    });

    describe('calculateProficiencyBonus', () => {
      const proficiencyTests = [
        { level: 1, expected: 2 },
        { level: 4, expected: 2 },
        { level: 5, expected: 3 },
        { level: 8, expected: 3 },
        { level: 9, expected: 4 },
        { level: 12, expected: 4 },
        { level: 13, expected: 5 },
        { level: 16, expected: 5 },
        { level: 17, expected: 6 },
        { level: 20, expected: 6 }
      ];

      test.each(proficiencyTests)('should calculate proficiency bonus for level $level as $expected', ({ level, expected }) => {
        expect(calculateProficiencyBonus(level)).toBe(expected);
      });
    });
  });

  describe('D&D Constants', () => {
    const constantTests = [
      { name: 'races', data: DND_RACES, expectedLength: 9, includes: ['Human', 'Elf', 'Dwarf'] },
      { name: 'classes', data: DND_CLASSES, expectedLength: 12, includes: ['Fighter', 'Wizard', 'Rogue'] },
      { name: 'alignments', data: DND_ALIGNMENTS, expectedLength: 9, includes: ['Lawful Good', 'Chaotic Evil', 'True Neutral'] }
    ] as const;

    test.each(constantTests)('should have expected $name', ({ data, expectedLength, includes }) => {
      expect(data).toHaveLength(expectedLength);
      includes.forEach(item => {
        expect(data).toContain(item);
      });
    });
  });
});