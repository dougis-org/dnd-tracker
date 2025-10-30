import { describe, it, expect } from '@jest/globals';
import {
  CreateCharacterSchema,
  validateCreateCharacter,
  UpdateCharacterSchema,
  validateUpdateCharacter,
  ListCharactersQuerySchema,
  validateListCharactersQuery,
  DuplicateCharacterSchema,
  validateDuplicateCharacter,
} from '../../../../src/lib/validations/characters';

describe('Character Validation Schemas', () => {
  describe('CreateCharacterSchema', () => {
    const validPayload = {
      name: 'Test Character',
      raceId: '507f191e810c19729de860ea',
      abilityScores: {
        str: 15,
        dex: 14,
        con: 14,
        int: 10,
        wis: 11,
        cha: 9,
      },
      classes: [{ classId: 'fighter', level: 3 }],
      hitPoints: 32,
    };

    it('validates a correct character creation payload', () => {
      const result = validateCreateCharacter(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test Character');
        expect(result.data.abilityScores.str).toBe(15);
      }
    });

    it('rejects missing required name field', () => {
      const invalid = { ...validPayload, name: undefined };
      const result = validateCreateCharacter(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects name that is too long', () => {
      const invalid = { ...validPayload, name: 'a'.repeat(101) };
      const result = validateCreateCharacter(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects invalid raceId format', () => {
      const invalid = { ...validPayload, raceId: 'invalid-id' };
      const result = validateCreateCharacter(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects ability scores outside valid range', () => {
      const invalid = {
        ...validPayload,
        abilityScores: { ...validPayload.abilityScores, str: 21 },
      };
      const result = validateCreateCharacter(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects empty class list', () => {
      const invalid = { ...validPayload, classes: [] };
      const result = validateCreateCharacter(invalid);
      expect(result.success).toBe(false);
    });

    it('accepts optional baseArmorClass', () => {
      const withArmor = { ...validPayload, baseArmorClass: 12 };
      const result = validateCreateCharacter(withArmor);
      expect(result.success).toBe(true);
    });

    it('accepts optional proficientSkills', () => {
      const withSkills = {
        ...validPayload,
        proficientSkills: ['acrobatics', 'athletics'],
      };
      const result = validateCreateCharacter(withSkills);
      expect(result.success).toBe(true);
    });

    it('accepts optional bonusSavingThrows', () => {
      const withSaves = {
        ...validPayload,
        bonusSavingThrows: ['dex', 'con'],
      };
      const result = validateCreateCharacter(withSaves);
      expect(result.success).toBe(true);
    });

    it('validates class levels are between 1 and 20', () => {
      const invalid = {
        ...validPayload,
        classes: [{ classId: 'fighter', level: 21 }],
      };
      const result = validateCreateCharacter(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateCharacterSchema', () => {
    it('accepts update with name only', () => {
      const result = validateUpdateCharacter({ name: 'Updated' });
      expect(result.success).toBe(true);
    });

    it('accepts update with abilityScores only', () => {
      const result = validateUpdateCharacter({
        abilityScores: {
          str: 16,
          dex: 14,
          con: 14,
          int: 10,
          wis: 11,
          cha: 9,
        },
      });
      expect(result.success).toBe(true);
    });

    it('accepts update with multiple fields', () => {
      const result = validateUpdateCharacter({
        name: 'Updated',
        hitPoints: 40,
        baseArmorClass: 15,
      });
      expect(result.success).toBe(true);
    });

    it('accepts empty update object', () => {
      const result = validateUpdateCharacter({});
      expect(result.success).toBe(true);
    });

    it('rejects invalid hitPoints (negative)', () => {
      const result = validateUpdateCharacter({ hitPoints: -1 });
      expect(result.success).toBe(false);
    });

    it('rejects invalid name (empty)', () => {
      const result = validateUpdateCharacter({ name: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('ListCharactersQuerySchema', () => {
    it('accepts valid query with page and pageSize', () => {
      const result = validateListCharactersQuery({ page: 1, pageSize: 25 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(25);
      }
    });

    it('defaults page to 1', () => {
      const result = validateListCharactersQuery({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
      }
    });

    it('defaults pageSize to 25', () => {
      const result = validateListCharactersQuery({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.pageSize).toBe(25);
      }
    });

    it('defaults includeDeleted to false', () => {
      const result = validateListCharactersQuery({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.includeDeleted).toBe(false);
      }
    });

    it('rejects page < 1', () => {
      const result = validateListCharactersQuery({ page: 0 });
      expect(result.success).toBe(false);
    });

    it('rejects pageSize > 100', () => {
      const result = validateListCharactersQuery({ pageSize: 101 });
      expect(result.success).toBe(false);
    });

    it('coerces string page to number', () => {
      const result = validateListCharactersQuery({ page: '2' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
      }
    });

    it('coerces string includeDeleted to boolean', () => {
      const result = validateListCharactersQuery({ includeDeleted: 'true' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.includeDeleted).toBe(true);
      }
    });
  });

  describe('DuplicateCharacterSchema', () => {
    it('accepts duplicate with newName', () => {
      const result = validateDuplicateCharacter({ newName: 'Copy Name' });
      expect(result.success).toBe(true);
    });

    it('accepts empty duplicate object', () => {
      const result = validateDuplicateCharacter({});
      expect(result.success).toBe(true);
    });

    it('rejects empty newName', () => {
      const result = validateDuplicateCharacter({ newName: '' });
      expect(result.success).toBe(false);
    });

    it('rejects newName that is too long', () => {
      const result = validateDuplicateCharacter({ newName: 'a'.repeat(101) });
      expect(result.success).toBe(false);
    });
  });

  describe('Schema inference', () => {
    it('CreateCharacterSchema infers correct type', () => {
      const parsed = CreateCharacterSchema.parse({
        name: 'Test',
        raceId: '507f191e810c19729de860ea',
        abilityScores: {
          str: 15,
          dex: 14,
          con: 14,
          int: 10,
          wis: 11,
          cha: 9,
        },
        classes: [{ classId: 'fighter', level: 3 }],
        hitPoints: 32,
      });
      expect(parsed.name).toBe('Test');
      expect(parsed.abilityScores.str).toBe(15);
    });

    it('UpdateCharacterSchema has optional fields', () => {
      const parsed = UpdateCharacterSchema.parse({ name: 'Updated' });
      expect(parsed.name).toBe('Updated');
      expect(parsed.abilityScores).toBeUndefined();
    });

    it('ListCharactersQuerySchema has defaults', () => {
      const parsed = ListCharactersQuerySchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.pageSize).toBe(25);
      expect(parsed.includeDeleted).toBe(false);
    });
  });
});
