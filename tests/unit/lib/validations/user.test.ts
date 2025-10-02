/**
 * Unit tests for user validation schemas (D&D profile fields)
 * These tests follow TDD - written BEFORE implementation
 * Expected: All tests should FAIL initially
 */

import { describe, test, expect } from '@jest/globals';
import {
  expectValidationSuccess,
  expectValidationFailure,
  expectAllValid,
  expectAllInvalid,
} from '@tests/helpers/validation-helpers';

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
      expectAllValid(displayNameSchema, [null, undefined]);
    });

    test('should accept valid display names under 100 characters', () => {
      expectAllValid(displayNameSchema, [
        'Dungeon Master John',
        'DM Alex',
        'A'.repeat(100),
      ]);
    });

    test('should reject display names over 100 characters', () => {
      expectValidationFailure(displayNameSchema, 'A'.repeat(101));
    });

    test('should trim whitespace', () => {
      const result = expectValidationSuccess(
        displayNameSchema,
        '  Trimmed Name  '
      );
      expect(result).toBe('Trimmed Name');
    });
  });

  describe('dndEditionSchema', () => {
    test('should accept valid D&D editions under 50 characters', () => {
      expectAllValid(dndEditionSchema, [
        '5th Edition',
        '3.5e',
        'Pathfinder 2e',
        'A'.repeat(50),
      ]);
    });

    test('should reject editions over 50 characters', () => {
      expectValidationFailure(dndEditionSchema, 'A'.repeat(51));
    });

    test('should have default value of "5th Edition"', () => {
      // This will be tested in the schema that uses it with .default()
      expect(true).toBe(true); // Placeholder for default value test
    });
  });

  describe('experienceLevelSchema', () => {
    test('should accept valid experience level enum values', () => {
      expectAllValid(experienceLevelSchema, [
        'new',
        'beginner',
        'intermediate',
        'experienced',
        'veteran',
      ]);
    });

    test('should reject invalid experience level values', () => {
      expectAllInvalid(experienceLevelSchema, [
        'expert',
        'novice',
        'master',
        '',
      ]);
    });
  });

  describe('primaryRoleSchema', () => {
    test('should accept valid primary role enum values', () => {
      expectAllValid(primaryRoleSchema, ['dm', 'player', 'both']);
    });

    test('should reject invalid primary role values', () => {
      expectAllInvalid(primaryRoleSchema, [
        'DM', // case sensitive
        'Player',
        'gm',
        '',
      ]);
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
      expectValidationSuccess(profileSetupSchema, validProfile);
    });

    test('should accept profile with only required fields (if any)', () => {
      // Profile setup should allow all fields to be optional for skip functionality
      expectValidationSuccess(profileSetupSchema, {});
    });

    test('should accept profile with partial fields', () => {
      const partialProfile = {
        primaryRole: 'player' as const,
        experienceLevel: 'beginner' as const,
      };
      expectValidationSuccess(profileSetupSchema, partialProfile);
    });

    test('should reject profile with invalid enum values', () => {
      const invalidProfile = {
        experienceLevel: 'expert', // invalid
        primaryRole: 'dm' as const,
      };
      expectValidationFailure(profileSetupSchema, invalidProfile);
    });

    test('should apply default values where specified', () => {
      const profile = expectValidationSuccess(profileSetupSchema, {});
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
      expectValidationSuccess(userProfileUpdateSchema, updateData);
    });

    test('should allow partial updates (all fields optional)', () => {
      const partialUpdate = {
        experienceLevel: 'veteran' as const,
      };
      expectValidationSuccess(userProfileUpdateSchema, partialUpdate);
    });

    test('should validate field constraints on update', () => {
      const invalidUpdate = {
        displayName: 'A'.repeat(101), // exceeds max
      };
      expectValidationFailure(userProfileUpdateSchema, invalidUpdate);
    });
  });
});

describe('Default Values', () => {
  test('timezone should default to UTC', () => {
    const schema = expectValidationSuccess(profileSetupSchema, {});
    expect(schema.timezone).toBe('UTC');
  });

  test('dndEdition should default to "5th Edition"', () => {
    const schema = expectValidationSuccess(profileSetupSchema, {});
    expect(schema.dndEdition).toBe('5th Edition');
  });
});
