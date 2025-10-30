import {
  normaliseIdentifier,
  toPlainDocument,
  normaliseCharacterDocument,
} from '@/lib/services/characterService.helpers';
import type { CharacterDocumentLike, CharacterRecord } from '@/lib/services/characterService.helpers';
import type { CharacterDerivedStats } from '@/lib/db/models/characterDerivedStats';

describe('characterService.helpers - Branch Coverage', () => {
  describe('normaliseIdentifier', () => {
    it('returns string values as-is', () => {
      const result = normaliseIdentifier('test-id-123');
      expect(result).toBe('test-id-123');
    });

    it('handles ObjectId-like objects with toString method', () => {
      const mockObjectId = {
        toString: () => 'ObjectId("507f1f77bcf86cd799439011")',
      };
      const result = normaliseIdentifier(mockObjectId);
      expect(result).toBe('ObjectId("507f1f77bcf86cd799439011")');
    });

    it('throws TypeError for values without string representation', () => {
      expect(() => normaliseIdentifier(null)).toThrow(TypeError);
      expect(() => normaliseIdentifier(undefined)).toThrow(TypeError);
      expect(() => normaliseIdentifier(123)).toThrow(TypeError);
      // Note: {} has toString inherited from Object.prototype, so it won't throw
    });

    it('handles objects with toString method returning empty string', () => {
      const mockObject = {
        toString: () => '',
      };
      const result = normaliseIdentifier(mockObject);
      expect(result).toBe('');
    });
  });

  describe('toPlainDocument', () => {
    it('calls toObject() if method exists', () => {
      const mockDoc: CharacterDocumentLike = {
        name: 'Test Character',
        hitPoints: 10,
        abilityScores: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
        },
        classes: [],
        raceId: 'test-race',
        userId: 'test-user',
        _id: 'test-id',
        toObject: jest.fn().mockReturnValue({
          name: 'Test Character',
          hitPoints: 10,
        }),
      };

      toPlainDocument(mockDoc);
      expect(mockDoc.toObject).toHaveBeenCalled();
    });

    it('returns document as-is if toObject method does not exist', () => {
      const mockDoc: CharacterDocumentLike = {
        name: 'Test Character',
        hitPoints: 10,
        abilityScores: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
        },
        classes: [],
        raceId: 'test-race',
        userId: 'test-user',
        _id: 'test-id',
      };

      const result = toPlainDocument(mockDoc);
      expect(result).toBe(mockDoc);
    });
  });

  describe('normaliseCharacterDocument', () => {
    const baseDocument: CharacterDocumentLike = {
      name: 'Test Character',
      hitPoints: 10,
      abilityScores: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      },
      classes: [
        {
          classId: 'barbarian',
          name: 'Barbarian',
          level: 1,
          hitDie: 12,
          savingThrows: [],
        },
      ],
      raceId: 'test-race',
      userId: 'test-user',
      _id: 'test-id',
    };

    const baseDerivedStats: CharacterDerivedStats = {
      abilityModifiers: {
        strength: 0,
        dexterity: 0,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 0,
      },
      proficiencyBonus: 2,
      skills: {},
      savingThrows: {},
      maxHitPoints: 12,
      armorClass: 10,
      initiative: 0,
      totalLevel: 1,
    };

    it('creates CharacterRecord from document and derived stats', () => {
      const result = normaliseCharacterDocument(baseDocument, baseDerivedStats);

      expect(result).toMatchObject({
        name: 'Test Character',
        hitPoints: 10,
        maxHitPoints: 12,
        armorClass: 10,
        initiative: 0,
        totalLevel: 1,
        proficiencyBonus: 2,
      });
    });

    it('uses provided cachedStats if available', () => {
      const docWithCache: CharacterDocumentLike = {
        ...baseDocument,
        cachedStats: {
          abilityModifiers: { strength: 5 },
          proficiencyBonus: 3,
          skills: { acrobatics: 5 },
          savingThrows: { strength: 7 },
        },
      };

      const result = normaliseCharacterDocument(docWithCache, baseDerivedStats);
      expect(result.cachedStats).toEqual(docWithCache.cachedStats);
    });

    it('generates cachedStats from derivedStats when not provided', () => {
      const result = normaliseCharacterDocument(baseDocument, baseDerivedStats);
      expect(result.cachedStats).toEqual({
        abilityModifiers: baseDerivedStats.abilityModifiers,
        proficiencyBonus: baseDerivedStats.proficiencyBonus,
        skills: baseDerivedStats.skills,
        savingThrows: baseDerivedStats.savingThrows,
      });
    });

    it('includes createdAt and updatedAt if present on document', () => {
      const now = new Date();
      const docWithDates: CharacterDocumentLike = {
        ...baseDocument,
        createdAt: now,
        updatedAt: now,
      };

      const result = normaliseCharacterDocument(docWithDates, baseDerivedStats);
      expect(result.createdAt).toEqual(now);
      expect(result.updatedAt).toEqual(now);
    });

    it('sets deletedAt to null if not present on document', () => {
      const result = normaliseCharacterDocument(baseDocument, baseDerivedStats);
      expect(result.deletedAt).toBeNull();
    });

    it('preserves deletedAt if present on document', () => {
      const deletedDate = new Date('2024-01-01');
      const docWithDeletedAt: CharacterDocumentLike = {
        ...baseDocument,
        deletedAt: deletedDate,
      };

      const result = normaliseCharacterDocument(docWithDeletedAt, baseDerivedStats);
      expect(result.deletedAt).toEqual(deletedDate);
    });

    it('normalises ObjectId values to strings', () => {
      const docWithObjectIds: CharacterDocumentLike = {
        ...baseDocument,
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        userId: { toString: () => '507f1f77bcf86cd799439012' },
        raceId: { toString: () => '507f1f77bcf86cd799439013' },
      };

      const result = normaliseCharacterDocument(docWithObjectIds, baseDerivedStats);
      expect(typeof result.id).toBe('string');
      expect(typeof result.userId).toBe('string');
      expect(typeof result.raceId).toBe('string');
    });
  });
});
