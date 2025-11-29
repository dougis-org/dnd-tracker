/**
 * Wizard Validation Schemas - Unit Tests
 *
 * TDD-FIRST: These tests specify validation behavior for:
 * - Display name validation (1-50 chars)
 * - Avatar size limits
 * - Preferences enums (theme, notifications)
 * - Full profile setup schema validation
 */

import {
  displayNameSchema,
  preferencesSchema,
  profileSetupSchema,
  wizardValidationError,
} from '@/lib/wizards/wizardValidation';
import type { UserPreferences, ProfileSetup } from '@/types/wizard';

describe('Wizard Validation - wizardValidation.ts', () => {
  describe('Display Name Validation', () => {
    // Test 1: Accept valid display names
    test('T005.1 should accept valid display names (1-50 chars)', () => {
      // Arrange
      const validNames = [
        'A', // 1 char (minimum)
        'Bob', // 3 chars
        'Aragorn the Ranger', // 19 chars
        'A very long display name with spaces and numbers 1234', // 50 chars
      ];

      // Act & Assert
      validNames.forEach((name) => {
        const result = displayNameSchema.safeParse(name);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(name);
        }
      });
    });

    // Test 2: Reject empty/whitespace-only names
    test('T005.2 should reject empty or whitespace-only names', () => {
      // Arrange
      const invalidNames = ['', '   ', '\t', '\n'];

      // Act & Assert
      invalidNames.forEach((name) => {
        const result = displayNameSchema.safeParse(name);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.length).toBeGreaterThan(0);
        }
      });
    });

    // Test 3: Reject names exceeding 50 characters
    test('T005.3 should reject names exceeding 50 characters', () => {
      // Arrange
      const tooLongName = 'A'.repeat(51); // 51 chars

      // Act
      const result = displayNameSchema.safeParse(tooLongName);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('50');
      }
    });

    // Test 4: Trim whitespace from display names
    test('T005.4 should trim leading/trailing whitespace', () => {
      // Arrange
      const nameWithWhitespace = '  Bob Smith  ';

      // Act
      const result = displayNameSchema.safeParse(nameWithWhitespace);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('Bob Smith');
      }
    });
  });

  describe('Preferences Validation', () => {
    // Test 5: Accept valid theme values
    test('T005.5 should accept valid theme values (light|dark)', () => {
      // Arrange
      const validPreferences: UserPreferences[] = [
        { theme: 'light', notifications: true },
        { theme: 'dark', notifications: false },
        { theme: 'light', notifications: false },
      ];

      // Act & Assert
      validPreferences.forEach((prefs) => {
        const result = preferencesSchema.safeParse(prefs);
        expect(result.success).toBe(true);
      });
    });

    // Test 6: Reject invalid theme values
    test('T005.6 should reject invalid theme values', () => {
      // Arrange
      const invalidPreferences = [
        { theme: 'blue', notifications: true }, // Invalid theme
        { theme: 'LIGHT', notifications: true }, // Case sensitive
        { theme: '', notifications: true }, // Empty
      ];

      // Act & Assert
      invalidPreferences.forEach((prefs) => {
        // @ts-ignore - intentionally passing invalid data
        const result = preferencesSchema.safeParse(prefs);
        expect(result.success).toBe(false);
      });
    });

    // Test 7: Enforce notifications as boolean
    test('T005.7 should enforce notifications as boolean', () => {
      // Arrange
      const invalidPreferences = [
        { theme: 'light', notifications: 'true' }, // String instead of boolean
        { theme: 'light', notifications: 1 }, // Number instead of boolean
        { theme: 'light', notifications: null }, // Null instead of boolean
      ];

      // Act & Assert
      invalidPreferences.forEach((prefs) => {
        // @ts-ignore - intentionally passing invalid data
        const result = preferencesSchema.safeParse(prefs);
        expect(result.success).toBe(false);
      });
    });

    // Test 8: Accept both true and false for notifications
    test('T005.8 should accept both true and false for notifications', () => {
      // Arrange
      const validPreferences = [
        { theme: 'light', notifications: true },
        { theme: 'dark', notifications: false },
      ];

      // Act & Assert
      validPreferences.forEach((prefs) => {
        const result = preferencesSchema.safeParse(prefs);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(typeof result.data.notifications).toBe('boolean');
        }
      });
    });
  });

  describe('Full Profile Setup Schema', () => {
    // Test 9: Accept valid complete profile setup
    test('T005.9 should accept valid complete profile setup', () => {
      // Arrange
      const validProfile: ProfileSetup = {
        displayName: 'Aragorn',
        avatar: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABA...',
        preferences: {
          theme: 'dark',
          notifications: true,
        },
        completedSetup: true,
      };

      // Act
      const result = profileSetupSchema.safeParse(validProfile);

      // Assert
      expect(result.success).toBe(true);
    });

    // Test 10: Accept profile without optional avatar
    test('T005.10 should accept profile without optional avatar field', () => {
      // Arrange
      const profileWithoutAvatar: Partial<ProfileSetup> = {
        displayName: 'Legolas',
        preferences: {
          theme: 'light',
          notifications: false,
        },
        completedSetup: false,
      };

      // Act
      const result = profileSetupSchema.safeParse(profileWithoutAvatar);

      // Assert
      expect(result.success).toBe(true);
    });

    // Test 11: Reject profile missing required fields
    test('T005.11 should reject profile missing required fields', () => {
      // Arrange
      const incompleteProfile = {
        displayName: 'Gimli',
        // Missing preferences and completedSetup
      };

      // Act
      // @ts-ignore - intentionally passing incomplete data
      const result = profileSetupSchema.safeParse(incompleteProfile);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });

    // Test 12: Validate avatar size when provided
    test('T005.12 should validate avatar base64 size (max 250KB)', () => {
      // Arrange: Create a base64 string that's > 250KB
      const oversizeBase64 = 'A'.repeat(250 * 1024 * 1.5); // > 250KB
      const largeBase64 = `data:image/jpeg;base64,${oversizeBase64}`;

      const profileWithLargeAvatar: ProfileSetup = {
        displayName: 'Boromir',
        avatar: largeBase64,
        preferences: {
          theme: 'light',
          notifications: true,
        },
        completedSetup: true,
      };

      // Act
      const result = profileSetupSchema.safeParse(profileWithLargeAvatar);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('Validation Error Handling', () => {
    // Test 13: Return structured validation errors
    test('T005.13 should return structured error information', () => {
      // Arrange
      const invalidProfile = {
        displayName: '', // Empty
        preferences: { theme: 'invalid', notifications: 'yes' }, // Invalid
        completedSetup: 'maybe', // Should be boolean
      };

      // Act
      // @ts-ignore - intentionally passing invalid data
      const result = profileSetupSchema.safeParse(invalidProfile);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toBeDefined();
        expect(result.error.issues.length).toBeGreaterThan(0);
        // Each issue should have path, code, message
        result.error.issues.forEach((issue: unknown) => {
          const issue_typed = issue as Record<string, unknown>;
          expect(issue_typed.path).toBeDefined();
          expect(issue_typed.code).toBeDefined();
          expect(issue_typed.message).toBeDefined();
        });
      }
    });

    // Test 14: Support graceful error message formatting
    test('T005.14 should format validation errors for user display', () => {
      // Arrange
      const invalidProfile = {
        displayName: 'A'.repeat(100), // Too long
      };

      // Act
      // @ts-ignore - intentionally passing invalid data
      const result = profileSetupSchema.safeParse(invalidProfile);
      const errorMessage = wizardValidationError(result.error);

      // Assert
      expect(result.success).toBe(false);
      expect(errorMessage).toBeDefined();
      expect(typeof errorMessage).toBe('string');
      expect(errorMessage.length).toBeGreaterThan(0);
    });
  });
});
