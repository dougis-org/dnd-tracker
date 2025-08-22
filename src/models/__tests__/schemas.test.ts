// Mock mongoose before importing
jest.mock('mongoose', () => ({
  Schema: jest.fn().mockImplementation(() => ({})),
  models: {},
  model: jest.fn().mockImplementation((name: string) => ({
    modelName: name,
  })),
  connection: {
    readyState: 0,
  },
}));

import mongoose from 'mongoose';
import { CharacterModel, UserModel, validateCharacter, validateUser } from '../schemas';

describe('MongoDB Schemas', () => {

  describe('Character Schema', () => {
    describe('CharacterModel', () => {
      it('should be defined', () => {
        expect(CharacterModel).toBeDefined();
      });

      it('should have correct schema name', () => {
        expect(CharacterModel.modelName).toBe('Character');
      });
    });

    describe('Character validation', () => {
      it('should validate a valid character object', () => {
        const validCharacter = {
          name: 'Aragorn',
          level: 5,
          hitPoints: 45,
          armorClass: 16,
        };

        const result = validateCharacter(validCharacter);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should reject character with empty name', () => {
        const invalidCharacter = {
          name: '',
          level: 5,
          hitPoints: 45,
          armorClass: 16,
        };

        const result = validateCharacter(invalidCharacter);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Name is required');
      });

      it('should reject character with invalid level', () => {
        const invalidCharacter = {
          name: 'Aragorn',
          level: 0,
          hitPoints: 45,
          armorClass: 16,
        };

        const result = validateCharacter(invalidCharacter);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Level must be between 1 and 20');
      });

      it('should reject character with level above 20', () => {
        const invalidCharacter = {
          name: 'Aragorn',
          level: 25,
          hitPoints: 45,
          armorClass: 16,
        };

        const result = validateCharacter(invalidCharacter);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Level must be between 1 and 20');
      });

      it('should reject character with negative hit points', () => {
        const invalidCharacter = {
          name: 'Aragorn',
          level: 5,
          hitPoints: -5,
          armorClass: 16,
        };

        const result = validateCharacter(invalidCharacter);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Hit points cannot be negative');
      });

      it('should reject character with invalid armor class', () => {
        const invalidCharacter = {
          name: 'Aragorn',
          level: 5,
          hitPoints: 45,
          armorClass: -2,
        };

        const result = validateCharacter(invalidCharacter);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Armor class must be between 0 and 30');
      });

      it('should sanitize character name by trimming whitespace', () => {
        const characterWithWhitespace = {
          name: '  Aragorn  ',
          level: 5,
          hitPoints: 45,
          armorClass: 16,
        };

        const result = validateCharacter(characterWithWhitespace);
        expect(result.sanitizedData?.name).toBe('Aragorn');
      });

      it('should handle missing required fields', () => {
        const incompleteCharacter = {
          name: 'Aragorn',
          // Missing level, hitPoints, armorClass
        };

        const result = validateCharacter(incompleteCharacter);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Level is required');
        expect(result.errors).toContain('Hit points is required');
        expect(result.errors).toContain('Armor class is required');
      });
    });
  });

  describe('User Schema', () => {
    describe('UserModel', () => {
      it('should be defined', () => {
        expect(UserModel).toBeDefined();
      });

      it('should have correct schema name', () => {
        expect(UserModel.modelName).toBe('User');
      });
    });

    describe('User validation', () => {
      it('should validate a valid user object', () => {
        const validUser = {
          clerkId: 'user_12345',
          email: 'test@example.com',
          username: 'testuser',
        };

        const result = validateUser(validUser);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should reject user with empty clerkId', () => {
        const invalidUser = {
          clerkId: '',
          email: 'test@example.com',
          username: 'testuser',
        };

        const result = validateUser(invalidUser);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Clerk ID is required');
      });

      it('should reject user with invalid email format', () => {
        const invalidUser = {
          clerkId: 'user_12345',
          email: 'invalid-email',
          username: 'testuser',
        };

        const result = validateUser(invalidUser);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid email format');
      });

      it('should reject user with invalid username', () => {
        const invalidUser = {
          clerkId: 'user_12345',
          email: 'test@example.com',
          username: 'a', // Too short
        };

        const result = validateUser(invalidUser);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Username must be between 2 and 30 characters');
      });

      it('should sanitize user email by converting to lowercase', () => {
        const userWithUppercaseEmail = {
          clerkId: 'user_12345',
          email: 'TEST@EXAMPLE.COM',
          username: 'testuser',
        };

        const result = validateUser(userWithUppercaseEmail);
        expect(result.sanitizedData?.email).toBe('test@example.com');
      });

      it('should sanitize username by trimming whitespace', () => {
        const userWithWhitespace = {
          clerkId: 'user_12345',
          email: 'test@example.com',
          username: '  testuser  ',
        };

        const result = validateUser(userWithWhitespace);
        expect(result.sanitizedData?.username).toBe('testuser');
      });
    });
  });

  describe('Schema Integration', () => {
    it('should create models without errors', () => {
      expect(() => {
        mongoose.model('Character');
        mongoose.model('User');
      }).not.toThrow();
    });

    it('should handle validation errors gracefully in production', () => {
      const invalidData = { name: null, level: 'invalid' };
      
      const result = validateCharacter(invalidData);
      expect(result.isValid).toBe(false);
      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});