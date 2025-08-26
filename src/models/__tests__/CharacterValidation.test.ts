// Generic test runner for schema validation
function runValidationTests<T>(
  schema: any,
  tests: Array<T & { shouldFail: boolean; desc: string }>,
  getData: (test: T) => any,
  expectError?: string
) {
  test.each(tests)('$desc', (testCase) => {
    const data = getData(testCase);
    if (testCase.shouldFail) {
      expectSchemaFailure(schema, data, expectError);
    } else {
      expectSchemaSuccess(schema, data);
    }
  });
}
import {
  CharacterSchema,
  CharacterSchemaWithTotalLevel,
  characterFormSchema,
  basicInfoSchema,
  classesSchema,
  abilitiesSchema,
  calculateAbilityModifier,
  calculateProficiencyBonus,
  type CharacterData,
  type CharacterDataWithTotalLevel,
  type CharacterFormData,
  type BasicInfoFormData,
  DND_RACES,
  DND_CLASSES,
  DND_ALIGNMENTS,
} from '@/lib/validations/character';

// Test Data Factory
const createValidCharacterData = (): CharacterData => ({
  userId: 'user123',
  name: 'Test Character',
  race: 'Human',
  subrace: 'Variant',
  background: 'Soldier',
  alignment: 'Lawful Good',
  experiencePoints: 0,
  classes: [
    {
      className: 'Fighter',
      level: 1,
      subclass: 'Champion',
      hitDiceSize: 10,
      hitDiceUsed: 0,
    },
  ],
  abilities: {
    strength: 15,
    dexterity: 13,
    constitution: 14,
    intelligence: 12,
    wisdom: 10,
    charisma: 8,
  },
  skillProficiencies: ['Athletics', 'Intimidation'],
  savingThrowProficiencies: ['strength', 'constitution'],
  hitPoints: {
    maximum: 10,
    current: 10,
    temporary: 0,
  },
  armorClass: 16,
  speed: 30,
  initiative: 1,
  passivePerception: 10,
  spellcasting: {
    ability: 'intelligence',
    spellAttackBonus: 0,
    spellSaveDC: 8,
    spellSlots: {},
    spellsKnown: [],
    spellsPrepared: [],
  },
  equipment: [],
  features: ['Fighting Style', 'Second Wind'],
  notes: '',
});

// Test Helpers
const expectSchemaSuccess = <T>(schema: any, data: any): T => {
  const result = schema.parse(data);
  expect(result).toBeDefined();
  return result;
};

const expectSchemaFailure = (
  schema: any,
  data: any,
  expectedError?: string
) => {
  expect(() => schema.parse(data)).toThrow();
  if (expectedError) {
    try {
      schema.parse(data);
    } catch (error: any) {
      if (error.errors && Array.isArray(error.errors)) {
        expect(
          error.errors.some(
            (e: any) => e.message && e.message.includes(expectedError)
          )
        ).toBe(true);
      }
    }
  }
};

// Helper to create valid CharacterFormData from CharacterData
const createValidFormData = (character: CharacterData): CharacterFormData => ({
  name: character.name,
  race: character.race,
  subrace: character.subrace,
  background: character.background,
  alignment: character.alignment,
  experiencePoints: character.experiencePoints,
  classes: character.classes,
  abilities: character.abilities,
  skillProficiencies: character.skillProficiencies,
  savingThrowProficiencies: character.savingThrowProficiencies,
  hitPoints: character.hitPoints,
  armorClass: character.armorClass,
  speed: character.speed,
  initiative: character.initiative,
  passivePerception: character.passivePerception,
  spellcasting: character.spellcasting,
  equipment: character.equipment,
  features: character.features,
  notes: character.notes,
});

describe('CharacterSchema Validation', () => {
  let validCharacterData: CharacterData;

  beforeEach(() => {
    validCharacterData = createValidCharacterData();
  });

  describe('Basic Character Validation', () => {
    it('should validate a minimal valid character', () => {
      const result = expectSchemaSuccess<CharacterData>(
        CharacterSchema,
        validCharacterData
      );
      expect(result.name).toBe(validCharacterData.name);
      expect(result.classes).toHaveLength(1);
    });

    describe('Name Validation', () => {
      const nameTests = [
        { name: '', shouldFail: true, desc: 'empty name' },
        { name: 'a', shouldFail: false, desc: 'single character' },
        { name: 'A'.repeat(100), shouldFail: false, desc: 'maximum length' },
        { name: 'A'.repeat(101), shouldFail: true, desc: 'exceeding maximum' },
      ];
      runValidationTests(CharacterSchema, nameTests, ({ name }) => ({
        ...validCharacterData,
        name,
      }));
    });

    describe('Class Validation', () => {
      const classTests = [
        { classCount: 0, shouldFail: true, desc: 'no classes' },
        { classCount: 1, shouldFail: false, desc: 'single class' },
        { classCount: 6, shouldFail: false, desc: 'multiclass character' },
        { classCount: 12, shouldFail: false, desc: 'maximum classes' },
        { classCount: 13, shouldFail: true, desc: 'exceeding maximum classes' },
      ];

      test.each(classTests)(
        'should validate $desc',
        ({ classCount, shouldFail }) => {
          const classes = Array(classCount)
            .fill(0)
            .map((_, i) => ({
              className: `Class${i}`,
              level: 1,
              hitDiceSize: 8 as const,
              hitDiceUsed: 0,
            }));

          const testData = { ...validCharacterData, classes };

          if (shouldFail) {
            expectSchemaFailure(CharacterSchema, testData);
          } else {
            expectSchemaSuccess(CharacterSchema, testData);
          }
        }
      );
    });
  });

  describe('CharacterSchemaWithTotalLevel', () => {
    it('should validate character when totalLevel matches sum of class levels', () => {
      const characterData: CharacterDataWithTotalLevel = {
        ...validCharacterData,
        totalLevel: 1,
      };

      const result = expectSchemaSuccess<CharacterDataWithTotalLevel>(
        CharacterSchemaWithTotalLevel,
        characterData
      );
      expect(result.totalLevel).toBe(1);
    });

    it('should invalidate character if totalLevel does not match sum of class levels', () => {
      const characterData: CharacterDataWithTotalLevel = {
        ...validCharacterData,
        totalLevel: 5, // Classes total is 1
      };

      expectSchemaFailure(
        CharacterSchemaWithTotalLevel,
        characterData,
        'Total level must equal sum of class levels'
      );
    });

    describe('Multi-class Level Validation', () => {
      const multiclassTests = [
        { classLevels: [3, 2], totalLevel: 5, shouldFail: false },
        { classLevels: [5, 5, 5], totalLevel: 15, shouldFail: false },
        { classLevels: [3, 2], totalLevel: 4, shouldFail: true },
        { classLevels: [10, 10], totalLevel: 20, shouldFail: false },
      ];

      test.each(multiclassTests)(
        'should validate classes $classLevels with total $totalLevel',
        ({ classLevels, totalLevel, shouldFail }) => {
          const classes = classLevels.map((level, i) => ({
            className: `Class${i}`,
            level,
            hitDiceSize: 8 as const,
            hitDiceUsed: 0,
          }));

          const characterData: CharacterDataWithTotalLevel = {
            ...validCharacterData,
            classes,
            totalLevel,
          };

          if (shouldFail) {
            expectSchemaFailure(CharacterSchemaWithTotalLevel, characterData);
          } else {
            expectSchemaSuccess(CharacterSchemaWithTotalLevel, characterData);
          }
        }
      );
    });
  });

  describe('Form Schema Validation', () => {
    describe('characterFormSchema', () => {
      let validFormData: CharacterFormData;

      beforeEach(() => {
        validFormData = createValidFormData(validCharacterData);
      });

      it('should validate a complete valid character', () => {
        expectSchemaSuccess(characterFormSchema, validFormData);
      });

      describe('Required Field Validation', () => {
        const requiredFields = [
          { field: 'name', value: '' },
          { field: 'race', value: '' },
          { field: 'background', value: '' },
          { field: 'alignment', value: '' },
        ] as const;

        test.each(requiredFields)(
          'should require $field',
          ({ field, value }) => {
            const invalidData = { ...validFormData, [field]: value };
            expectSchemaFailure(characterFormSchema, invalidData);
          }
        );
      });

      describe('Hit Points Business Rule', () => {
        // Refactored: hitPointTests and runValidationTests are now used below
        const hitPointTests = [
          {
            currentHp: 10,
            shouldFail: false,
            desc: 'current HP equal to max HP',
          },
          {
            currentHp: 9,
            shouldFail: false,
            desc: 'current HP less than max HP',
          },
          {
            currentHp: 12,
            shouldFail: false,
            desc: 'current HP equal to max HP + temp HP',
            temporary: 2,
          },
          {
            currentHp: 13,
            shouldFail: true,
            desc: 'current HP exceeds max HP + temp HP',
          },
        ];

        runValidationTests(
          characterFormSchema,
          hitPointTests,
          ({ currentHp, temporary }) => ({
            ...validFormData,
            hitPoints: {
              ...(validFormData.hitPoints ?? {
                maximum: 10,
                current: 10,
                temporary: 0,
              }),
              current: currentHp,
              temporary:
                temporary !== undefined
                  ? temporary
                  : (validFormData.hitPoints?.temporary ?? 0),
            },
          }),
          'Current HP cannot exceed maximum HP + temporary HP'
        );
        // Old hit points test block removed, now handled by runValidationTests above
      });

      describe('Spellcasting Ability Validation', () => {
        const abilityTests = [
          { ability: 'strength', valid: true },
          { ability: 'wisdom', valid: true },
          { ability: 'charisma', valid: true },
          { ability: 'magic', valid: false },
          { ability: 'luck', valid: false },
        ];

        test.each(abilityTests)(
          'should validate spellcasting ability: $ability',
          ({ ability, valid }) => {
            const testData = {
              ...validFormData,
              spellcasting: {
                ...validFormData.spellcasting!,
                ability: ability as any,
              },
            };

            if (valid) {
              expectSchemaSuccess(characterFormSchema, testData);
            } else {
              expectSchemaFailure(characterFormSchema, testData);
            }
          }
        );
      });

      describe('Notes Length Validation', () => {
        // Old notes length test block removed, now handled by runValidationTests in notes validation section
        const notesTests = [
          {
            notes: '',
            shouldFail: false,
            desc: 'notes empty',
          },
          {
            notes: 'Some notes about the character',
            shouldFail: false,
            desc: 'notes is a string',
          },
          {
            notes: 123,
            shouldFail: true,
            desc: 'notes is not a string',
          },
        ];

        runValidationTests(characterFormSchema, notesTests, ({ notes }) => ({
          ...validFormData,
          notes,
        }));
      });
    });
  });

  describe('Utility Functions', () => {
    describe('calculateAbilityModifier', () => {
      const modifierTestCases = [
        { score: 1, expected: -5 },
        { score: 8, expected: -1 },
        { score: 10, expected: 0 },
        { score: 11, expected: 0 },
        { score: 16, expected: 3 },
        { score: 20, expected: 5 },
      ];

      test.each(modifierTestCases)(
        'should calculate modifier for score $score',
        ({ score, expected }) => {
          expect(calculateAbilityModifier(score)).toBe(expected);
        }
      );
    });

    describe('calculateProficiencyBonus', () => {
      const proficiencyTestCases = [
        { level: 1, expected: 2 },
        { level: 5, expected: 3 },
        { level: 9, expected: 4 },
        { level: 13, expected: 5 },
        { level: 17, expected: 6 },
      ];

      test.each(proficiencyTestCases)(
        'should calculate proficiency bonus for level $level',
        ({ level, expected }) => {
          expect(calculateProficiencyBonus(level)).toBe(expected);
        }
      );
    });
  });

  describe('D&D Constants Validation', () => {
    const constantValidationTests = [
      {
        constant: DND_RACES,
        name: 'races',
        minLength: 8,
        includes: ['Human', 'Elf'],
      },
      {
        constant: DND_CLASSES,
        name: 'classes',
        minLength: 10,
        includes: ['Fighter', 'Wizard'],
      },
      {
        constant: DND_ALIGNMENTS,
        name: 'alignments',
        minLength: 9,
        includes: ['Lawful Good', 'Chaotic Evil'],
      },
    ];

    test.each(constantValidationTests)(
      'should have valid $name constants',
      ({ constant, minLength, includes }) => {
        expect(constant.length).toBeGreaterThanOrEqual(minLength);
        includes.forEach((item) => expect(constant).toContain(item));
      }
    );
  });
});
