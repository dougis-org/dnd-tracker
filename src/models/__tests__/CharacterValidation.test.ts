import { CharacterSchema, CharacterSchemaWithTotalLevel, basicInfoSchema, classesSchema, abilitiesSchema, characterFormSchema, DND_RACES, DND_CLASSES, DND_ALIGNMENTS, calculateAbilityModifier, calculateProficiencyBonus } from '../../lib/validations/character';
import { z } from 'zod';

describe('CharacterSchema Validation', () => {
  // Define a valid character data object for reuse in tests
  const validCharacterData = {
    userId: 'user123',
    name: 'Test Character',
    race: 'Human',
    background: 'Soldier',
    alignment: 'Lawful Good',
    experiencePoints: 0,
    classes: [{
      className: 'Fighter',
      level: 1,
      hitDiceSize: 10,
      hitDiceUsed: 0,
    }],
    abilities: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
  };

  console.log('validCharacterData.classes[0].hitDiceSize:', validCharacterData.classes[0].hitDiceSize);

  it('should invalidate character with name exceeding 100 characters', () => {
    const invalidCharacterData = {
      ...validCharacterData,
      name: 'a'.repeat(101), // Name too long
    };

    const result = CharacterSchema.safeParse(invalidCharacterData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Name cannot exceed 100 characters');
    }
  });

  it('should invalidate character if totalLevel does not match sum of class levels', () => {
    const invalidCharacterData = {
      ...validCharacterData,
      totalLevel: 2, // Incorrect total level
    };

    const result = CharacterSchemaWithTotalLevel.safeParse(invalidCharacterData);
    expect(result.success).toBe(false);
    if (!result.success) {
      console.log('totalLevel error message:', result.error.issues[0].message);
      expect(result.error.issues[0].message).toBe('Total level must equal sum of class levels');
    }
  });

  it('should validate a minimal valid character', () => {
    const result = CharacterSchema.safeParse(validCharacterData);
    console.log('Minimal valid character result.success:', result.success);
    if (!result.success) {
      console.log('Minimal valid character errors:', result.error.issues);
    }
    expect(result.success).toBe(true);
  });

  describe('characterFormSchema', () => {
    it('should validate a complete valid character', () => {
      expect(() => characterFormSchema.parse(validCharacterData)).not.toThrow();
    });

    it('should require name', () => {
      const invalidData = { ...validCharacterData, name: '' };
      expect(() => characterFormSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('should limit name length', () => {
      const invalidData = { ...validCharacterData, name: 'a'.repeat(101) };
      expect(() => characterFormSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('should require at least one class', () => {
      const invalidData = { ...validCharacterData, classes: [] };
      expect(() => characterFormSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('should limit number of classes', () => {
      const manyClasses = Array.from({ length: 15 }, (_, i) => ({
        className: `Class${i + 1}`,
        level: 1,
        hitDiceSize: 6,
        hitDiceUsed: 0,
      }));
      const invalidData = { ...validCharacterData, classes: manyClasses };
      expect(() => characterFormSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('should validate ability score ranges', () => {
      const invalidData = {
        ...validCharacterData,
        abilities: { ...validCharacterData.abilities, strength: 0 } 
      };
      expect(() => characterFormSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('should validate ability score maximum', () => {
      const invalidData = {
        ...validCharacterData,
        abilities: { ...validCharacterData.abilities, strength: 31 } 
      };
      expect(() => characterFormSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('should validate hit points constraints', () => {
      const invalidData = {
        ...validCharacterData,
        hitPoints: {
          maximum: -1,
        }
      };
      expect(() => characterFormSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('should allow current HP to equal maximum + temporary', () => {
      const validData = {
        ...validCharacterData,
        hitPoints: {
          maximum: 100,
          current: 110,
          temporary: 10,
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
          hitDiceSize: 5, // Invalid hit dice size
          hitDiceUsed: 0,
        }]
      };
      expect(() => characterFormSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('should validate spellcasting ability', () => {
      const invalidData = {
        ...validCharacterData,
        spellcasting: {
          ability: 'InvalidAbility',
        }
      };
      expect(() => characterFormSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('should limit notes length', () => {
      const invalidData = {
        ...validCharacterData,
        notes: 'a'.repeat(2001) 
      };
      expect(() => characterFormSchema.parse(invalidData)).toThrow(z.ZodError);
    });
  });

  describe('basicInfoSchema', () => {
    const validBasicInfo = {
      name: 'Test Name',
      race: 'Human',
      background: 'Acolyte',
      alignment: 'Lawful Good',
      experiencePoints: 100,
    };

    it('should validate basic character info', () => {
      expect(() => basicInfoSchema.parse(validBasicInfo)).not.toThrow();
    });

    it('should require name, race, background, and alignment', () => {
      const requiredFields = ['name', 'race', 'background', 'alignment'];
      requiredFields.forEach(field => {
        const invalidData = { ...validBasicInfo, [field]: '' };
        expect(() => basicInfoSchema.parse(invalidData)).toThrow(z.ZodError);
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
    const validData = {
      classes: [{
        className: 'Fighter',
        level: 1,
        subclass: 'Battle Master',
        hitDiceSize: 10,
        hitDiceUsed: 0,
      }],
    };

    it('should validate single class', () => {
      expect(() => classesSchema.parse(validData)).not.toThrow();
    });

    it('should validate multiclass characters', () => {
      const validData = {
        classes: [
          {
            className: 'Fighter',
            level: 5,
            hitDiceSize: 10,
            hitDiceUsed: 0,
          },
          {
            className: 'Wizard',
            level: 3,
            hitDiceSize: 6,
            hitDiceUsed: 0,
          },
        ]
      };
      expect(() => classesSchema.parse(validData)).not.toThrow();
    });

    it('should validate class level bounds', () => {
      const invalidData = {
        classes: [{
          className: 'Fighter',
          level: 0, // Invalid level
          hitDiceSize: 10,
          hitDiceUsed: 0,
        }]
      };
      expect(() => classesSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('should make subclass optional', () => {
      const dataWithoutSubclass = {
        classes: [{
          className: 'Fighter',
          level: 1,
          hitDiceSize: 10,
          hitDiceUsed: 0,
        }],
      };
      expect(() => classesSchema.parse(dataWithoutSubclass)).not.toThrow();
    });
  });

  describe('abilitiesSchema', () => {
    const validData = {
      abilities: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      },
    };

    it('should validate all six ability scores', () => {
      expect(() => abilitiesSchema.parse(validData)).not.toThrow();
    });

    it('should require all ability scores', () => {
      const abilityNames = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
      abilityNames.forEach(ability => {
        const invalidData = {
          abilities: { ...validData.abilities },
        };
        delete (invalidData.abilities as any)[ability];
        expect(() => abilitiesSchema.parse(invalidData)).toThrow(z.ZodError);
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
      })).not.toThrow();

      expect(() => classesSchema.parse({
        classes: [{
          className: 'Barbarian',
          level: 1,
          hitDiceSize: 12,
          hitDiceUsed: 0,
        }],
        totalLevel: 1,
      })).not.toThrow();

      expect(() => abilitiesSchema.parse({
        abilities: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
        },
      })).not.toThrow();
    });

    it('should compose into full character schema', () => {
      const basicInfo = {
        name: 'Test Character',
        race: 'Human',
        background: 'Soldier',
        alignment: 'Lawful Good',
        experiencePoints: 0,
      };

      const classes = {
        classes: [{
          className: 'Fighter',
          level: 1,
          hitDiceSize: 10,
          hitDiceUsed: 0,
        }],
        totalLevel: 1,
      };

      const abilities = {
        abilities: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
        },
      };

      const combinedData = { userId: 'user123', ...basicInfo, ...classes, ...abilities };
      expect(() => CharacterSchema.parse(combinedData)).not.toThrow();
    });
  });
});