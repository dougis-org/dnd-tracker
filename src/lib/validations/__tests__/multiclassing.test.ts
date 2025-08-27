import { describe, it, expect } from '@jest/globals';
import { 
  CharacterSchema, 
  ClassSchema, 
  CharacterSchemaWithTotalLevel,
  DND_CLASSES
} from '../character';

describe('Multiclassing Schema Validation', () => {
  describe('ClassSchema', () => {
    it('should fail validation for empty class name', () => {
      const result = ClassSchema.safeParse({
        className: '',
        level: 1,
        hitDiceSize: 8,
        hitDiceUsed: 0
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required');
      }
    });

    it('should fail validation for invalid level range', () => {
      const invalidLevels = [0, 21, -1];
      
      invalidLevels.forEach(level => {
        const result = ClassSchema.safeParse({
          className: 'Fighter',
          level,
          hitDiceSize: 10,
          hitDiceUsed: 0
        });
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('between 1 and 20');
        }
      });
    });

    it('should fail validation for invalid hit dice size', () => {
      const invalidHitDice = [4, 20, 0];
      
      invalidHitDice.forEach(hitDiceSize => {
        const result = ClassSchema.safeParse({
          className: 'Wizard',
          level: 1,
          hitDiceSize,
          hitDiceUsed: 0
        });
        
        expect(result.success).toBe(false);
      });
    });

    it('should pass validation for valid single class', () => {
      const result = ClassSchema.safeParse({
        className: 'Paladin',
        level: 5,
        subclass: 'Oath of Devotion',
        hitDiceSize: 10,
        hitDiceUsed: 2
      });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.className).toBe('Paladin');
        expect(result.data.level).toBe(5);
        expect(result.data.subclass).toBe('Oath of Devotion');
        expect(result.data.hitDiceSize).toBe(10);
        expect(result.data.hitDiceUsed).toBe(2);
      }
    });
  });

  describe('CharacterSchema multiclassing', () => {
    const basicCharacterData = {
      userId: 'user_123',
      name: 'Test Character',
      race: 'Human',
      background: 'Folk Hero',
      alignment: 'Lawful Good',
      experiencePoints: 0,
      abilities: {
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8
      }
    };

    it('should fail validation when no classes provided', () => {
      const result = CharacterSchema.safeParse({
        ...basicCharacterData,
        classes: []
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('At least one class is required');
      }
    });

    it('should pass validation for single class character', () => {
      const result = CharacterSchema.safeParse({
        ...basicCharacterData,
        classes: [{
          className: 'Fighter',
          level: 3,
          hitDiceSize: 10,
          hitDiceUsed: 0
        }]
      });
      
      expect(result.success).toBe(true);
    });

    it('should pass validation for multiclass character', () => {
      const result = CharacterSchema.safeParse({
        ...basicCharacterData,
        classes: [
          {
            className: 'Fighter',
            level: 5,
            hitDiceSize: 10,
            hitDiceUsed: 1
          },
          {
            className: 'Rogue',
            level: 3,
            hitDiceSize: 8,
            hitDiceUsed: 0
          }
        ]
      });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.classes).toHaveLength(2);
        expect(result.data.classes[0].className).toBe('Fighter');
        expect(result.data.classes[1].className).toBe('Rogue');
      }
    });

    it('should fail validation for too many classes', () => {
      // Create 13 classes to exceed the limit of 12
      const manyClasses = Array.from({ length: 13 }, (_, index) => ({
        className: DND_CLASSES[index % DND_CLASSES.length],
        level: 1,
        hitDiceSize: 8 as const,
        hitDiceUsed: 0
      }));
      
      const result = CharacterSchema.safeParse({
        ...basicCharacterData,
        classes: manyClasses
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('cannot have more than 12 classes');
      }
    });
  });

  describe('CharacterSchemaWithTotalLevel', () => {
    const baseData = {
      userId: 'user_123',
      name: 'Test Character',
      race: 'Human',
      background: 'Folk Hero',
      alignment: 'Lawful Good',
      experiencePoints: 0,
      abilities: {
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8
      }
    };

    it('should fail validation when totalLevel doesnt match sum of class levels', () => {
      const result = CharacterSchemaWithTotalLevel.safeParse({
        ...baseData,
        classes: [
          { className: 'Fighter', level: 5, hitDiceSize: 10, hitDiceUsed: 0 },
          { className: 'Rogue', level: 3, hitDiceSize: 8, hitDiceUsed: 0 }
        ],
        totalLevel: 10 // Should be 8 (5+3)
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Total level must equal sum of class levels');
      }
    });

    it('should pass validation when totalLevel matches sum of class levels', () => {
      const result = CharacterSchemaWithTotalLevel.safeParse({
        ...baseData,
        classes: [
          { className: 'Fighter', level: 5, hitDiceSize: 10, hitDiceUsed: 0 },
          { className: 'Rogue', level: 3, hitDiceSize: 8, hitDiceUsed: 0 }
        ],
        totalLevel: 8 // Correct sum (5+3)
      });
      
      expect(result.success).toBe(true);
    });

    it('should fail validation for totalLevel exceeding 20', () => {
      const result = CharacterSchemaWithTotalLevel.safeParse({
        ...baseData,
        classes: [
          { className: 'Fighter', level: 15, hitDiceSize: 10, hitDiceUsed: 0 },
          { className: 'Rogue', level: 10, hitDiceSize: 8, hitDiceUsed: 0 }
        ],
        totalLevel: 25
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Total level must be between 1 and 20');
      }
    });
  });

  describe('Hit dice validation in multiclassing', () => {
    const baseData = {
      userId: 'user_123',
      name: 'Test Character',
      race: 'Human',
      background: 'Folk Hero',
      alignment: 'Lawful Good',
      experiencePoints: 0,
      abilities: {
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8
      }
    };

    it('should pass validation for correct hit dice sizes by class', () => {
      const validClassHitDice = [
        { className: 'Wizard', hitDiceSize: 6 }, // d6
        { className: 'Rogue', hitDiceSize: 8 },  // d8  
        { className: 'Fighter', hitDiceSize: 10 }, // d10
        { className: 'Barbarian', hitDiceSize: 12 } // d12
      ];

      validClassHitDice.forEach(({ className, hitDiceSize }) => {
        const result = CharacterSchema.safeParse({
          ...baseData,
          classes: [{
            className,
            level: 1,
            hitDiceSize: hitDiceSize as 6 | 8 | 10 | 12,
            hitDiceUsed: 0
          }]
        });
        
        expect(result.success).toBe(true);
      });
    });

    it('should fail validation when hitDiceUsed exceeds class level', () => {
      const result = ClassSchema.safeParse({
        className: 'Fighter',
        level: 3,
        hitDiceSize: 10,
        hitDiceUsed: 5 // Cannot exceed level
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Hit dice used cannot exceed class level');
      }
    });
  });
});