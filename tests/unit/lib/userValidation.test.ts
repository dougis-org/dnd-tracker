import {
  parseEmail,
  validateName,
  validatePreferences,
  validateNotifications,
  formatValidationErrors,
  validateProfileUpdate,
  validatePreferencesUpdate,
} from '@/lib/validation/userValidation';
import { validEmails, invalidEmails, validNames, invalidNames } from '../../fixtures/userSchemaFixtures';

describe('userValidation - Email Parsing', () => {
  describe('parseEmail', () => {
    it.each(validEmails)('should parse valid email: %s', (email) => {
      const result = parseEmail(email);
      expect(result.success).toBe(true);
    });

    it.each(invalidEmails)('should reject invalid email: %s', (email) => {
      const result = parseEmail(email);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should trim whitespace', () => {
      const result = parseEmail('  alice@example.com  ');
      expect(result.success).toBe(true);
      expect(result.data).toBe('alice@example.com');
    });

    it('should lowercase email', () => {
      const result = parseEmail('ALICE@EXAMPLE.COM');
      expect(result.success).toBe(true);
      expect(result.data).toBe('alice@example.com');
    });
  });
});

describe('userValidation - Name Validation', () => {
  describe('validateName', () => {
    it.each(validNames)('should accept valid name', (name) => {
      const result = validateName(name);
      expect(result.success).toBe(true);
    });

    it.each(invalidNames)('should reject invalid name', (name) => {
      const result = validateName(name);
      expect(result.success).toBe(false);
    });

    it('should trim whitespace', () => {
      const result = validateName('  Alice Adventurer  ');
      expect(result.success).toBe(true);
    });
  });
});

describe('userValidation - Preferences Validation', () => {
  describe('validatePreferences', () => {
    it('should accept valid preferences', () => {
      const result = validatePreferences({
        experienceLevel: 'Intermediate',
        preferredRole: 'Player',
        ruleset: '5e',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid experience level', () => {
      const result = validatePreferences({
        experienceLevel: 'Expert',
        preferredRole: 'Player',
        ruleset: '5e',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid role', () => {
      const result = validatePreferences({
        experienceLevel: 'Intermediate',
        preferredRole: 'Referee',
        ruleset: '5e',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid ruleset', () => {
      const result = validatePreferences({
        experienceLevel: 'Intermediate',
        preferredRole: 'Player',
        ruleset: '4e',
      });
      expect(result.success).toBe(false);
    });

    it('should accept all valid enum combinations', () => {
      const testData = [
        { experienceLevel: 'Novice', preferredRole: 'DM', ruleset: '5e' },
        { experienceLevel: 'Intermediate', preferredRole: 'Player', ruleset: '3.5e' },
        { experienceLevel: 'Advanced', preferredRole: 'Both', ruleset: 'PF2e' },
      ];

      testData.forEach(({ experienceLevel, preferredRole, ruleset }) => {
        const result = validatePreferences({ experienceLevel, preferredRole, ruleset });
        expect(result.success).toBe(true);
      });
    });
  });
});

describe('userValidation - Notifications Validation', () => {
  describe('validateNotifications', () => {
    it('should accept valid notification settings', () => {
      const result = validateNotifications({
        emailNotifications: true,
        partyUpdates: false,
        encounterReminders: true,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid notification settings', () => {
      const result = validateNotifications({
        emailNotifications: 'yes',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('userValidation - Error Formatting', () => {
  describe('formatValidationErrors', () => {
    it('should format Zod error details to field errors', () => {
      const error = {
        fieldErrors: {
          email: ['Invalid email'],
          name: ['Name is required'],
        },
      };
      const formatted = formatValidationErrors(error);
      expect(formatted.email).toBe('Invalid email');
      expect(formatted.name).toBe('Name is required');
    });

    it('should return empty object for string errors', () => {
      const formatted = formatValidationErrors('Network error');
      expect(formatted).toEqual({});
    });
  });
});

describe('userValidation - Profile Updates', () => {
  describe('validateProfileUpdate', () => {
    it('should accept valid profile data', () => {
      const result = validateProfileUpdate({
        name: 'Alice',
        email: 'alice@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid profile data', () => {
      const result = validateProfileUpdate({
        name: '',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('userValidation - Preferences Updates', () => {
  describe('validatePreferencesUpdate', () => {
    it('should accept valid preferences data', () => {
      const result = validatePreferencesUpdate({
        experienceLevel: 'Novice',
        preferredRole: 'Player',
        ruleset: '5e',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid preferences data', () => {
      const result = validatePreferencesUpdate({
        experienceLevel: 'Unknown',
      });
      expect(result.success).toBe(false);
    });
  });
});
