/**
 * Unit tests for user validation schemas (D&D profile fields)
 * These tests follow TDD - written BEFORE implementation
 * Expected: All tests should FAIL initially
 */

import { describe, test, expect } from '@jest/globals';

// These imports will fail initially - that's expected in TDD
import {
  displayNameSchema,
  dndEditionSchema,
  experienceLevelSchema,
  primaryRoleSchema,
  profileSetupSchema,
  userProfileUpdateSchema,
} from '@/lib/validations/user';

describe('D&D Profile Field Validations', () => {
  describe('displayNameSchema', () => {
    test('should accept null or undefined (optional field)', () => {
      expect(() => displayNameSchema.parse(null)).not.toThrow();
      expect(() => displayNameSchema.parse(undefined)).not.toThrow();
    });

    test('should accept valid display names under 100 characters', () => {
      expect(() => displayNameSchema.parse('Dungeon Master John')).not.toThrow();
      expect(() => displayNameSchema.parse('DM Alex')).not.toThrow();
      expect(() => displayNameSchema.parse('A'.repeat(100))).not.toThrow();
    });

    test('should reject display names over 100 characters', () => {
      expect(() => displayNameSchema.parse('A'.repeat(101))).toThrow();
    });

    test('should trim whitespace', () => {
      const result = displayNameSchema.parse('  Trimmed Name  ');
      expect(result).toBe('Trimmed Name');
    });
  });

  describe('dndEditionSchema', () => {
    test('should accept valid D&D editions under 50 characters', () => {
      expect(() => dndEditionSchema.parse('5th Edition')).not.toThrow();
      expect(() => dndEditionSchema.parse('3.5e')).not.toThrow();
      expect(() => dndEditionSchema.parse('Pathfinder 2e')).not.toThrow();
      expect(() => dndEditionSchema.parse('A'.repeat(50))).not.toThrow();
    });

    test('should reject editions over 50 characters', () => {
      expect(() => dndEditionSchema.parse('A'.repeat(51))).toThrow();
    });

    test('should have default value of "5th Edition"', () => {
      // This will be tested in the schema that uses it with .default()
      expect(true).toBe(true); // Placeholder for default value test
    });
  });

  describe('experienceLevelSchema', () => {
    test('should accept valid experience level enum values', () => {
      expect(() => experienceLevelSchema.parse('new')).not.toThrow();
      expect(() => experienceLevelSchema.parse('beginner')).not.toThrow();
      expect(() => experienceLevelSchema.parse('intermediate')).not.toThrow();
      expect(() => experienceLevelSchema.parse('experienced')).not.toThrow();
      expect(() => experienceLevelSchema.parse('veteran')).not.toThrow();
    });

    test('should reject invalid experience level values', () => {
      expect(() => experienceLevelSchema.parse('expert')).toThrow();
      expect(() => experienceLevelSchema.parse('novice')).toThrow();
      expect(() => experienceLevelSchema.parse('master')).toThrow();
      expect(() => experienceLevelSchema.parse('')).toThrow();
    });
  });

  describe('primaryRoleSchema', () => {
    test('should accept valid primary role enum values', () => {
      expect(() => primaryRoleSchema.parse('dm')).not.toThrow();
      expect(() => primaryRoleSchema.parse('player')).not.toThrow();
      expect(() => primaryRoleSchema.parse('both')).not.toThrow();
    });

    test('should reject invalid primary role values', () => {
      expect(() => primaryRoleSchema.parse('DM')).toThrow(); // case sensitive
      expect(() => primaryRoleSchema.parse('Player')).toThrow();
      expect(() => primaryRoleSchema.parse('gm')).toThrow();
      expect(() => primaryRoleSchema.parse('')).toThrow();
    });
  });

  describe('profileSetupSchema', () => {
    test('should accept valid profile setup with all optional fields', () => {
      const validProfile = {
        displayName: 'Dungeon Master Alex',
        timezone: 'America/New_York',
        dndEdition: '5th Edition',
        experienceLevel: 'intermediate' as const,
        primaryRole: 'dm' as const,
      };
      expect(() => profileSetupSchema.parse(validProfile)).not.toThrow();
    });

    test('should accept profile with only required fields (if any)', () => {
      // Profile setup should allow all fields to be optional for skip functionality
      const minimalProfile = {};
      expect(() => profileSetupSchema.parse(minimalProfile)).not.toThrow();
    });

    test('should accept profile with partial fields', () => {
      const partialProfile = {
        primaryRole: 'player' as const,
        experienceLevel: 'beginner' as const,
      };
      expect(() => profileSetupSchema.parse(partialProfile)).not.toThrow();
    });

    test('should reject profile with invalid enum values', () => {
      const invalidProfile = {
        experienceLevel: 'expert', // invalid
        primaryRole: 'dm' as const,
      };
      expect(() => profileSetupSchema.parse(invalidProfile)).toThrow();
    });

    test('should apply default values where specified', () => {
      const profile = profileSetupSchema.parse({});
      // Defaults should be applied: timezone='UTC', dndEdition='5th Edition'
      expect(profile).toHaveProperty('timezone');
      expect(profile).toHaveProperty('dndEdition');
    });
  });

  describe('userProfileUpdateSchema integration', () => {
    test('should include new D&D profile fields', () => {
      const updateData = {
        displayName: 'Updated DM Name',
        timezone: 'Europe/London',
        dndEdition: 'Pathfinder',
        experienceLevel: 'experienced' as const,
        primaryRole: 'both' as const,
      };
      expect(() => userProfileUpdateSchema.parse(updateData)).not.toThrow();
    });

    test('should allow partial updates (all fields optional)', () => {
      const partialUpdate = {
        experienceLevel: 'veteran' as const,
      };
      expect(() => userProfileUpdateSchema.parse(partialUpdate)).not.toThrow();
    });

    test('should validate field constraints on update', () => {
      const invalidUpdate = {
        displayName: 'A'.repeat(101), // exceeds max
      };
      expect(() => userProfileUpdateSchema.parse(invalidUpdate)).toThrow();
    });
  });
});

describe('Default Values', () => {
  test('timezone should default to UTC', () => {
    // This will be tested when schema with defaults is implemented
    const schema = profileSetupSchema.parse({});
    expect(schema.timezone).toBe('UTC');
  });

  test('dndEdition should default to "5th Edition"', () => {
    const schema = profileSetupSchema.parse({});
    expect(schema.dndEdition).toBe('5th Edition');
  });
});
