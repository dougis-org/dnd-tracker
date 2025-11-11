import {
  userProfileSchema,
  userPreferencesSchema,
  notificationSettingsSchema,
  updateUserProfileSchema,
  updateUserPreferencesSchema,
  updateNotificationSettingsSchema,
} from '@/lib/schemas/userSchema';
import {
  validUserProfile,
  validUserPreferences,
  validNotifications,
  validEmails,
  invalidEmails,
  validNames,
  invalidNames,
  experienceLevels,
  preferredRoles,
  rulesets,
} from '../../fixtures/userSchemaFixtures';

/**
 * UserProfile Schema Tests
 * Validates all user profile fields (id, name, email, timestamps)
 */
describe('userProfileSchema', () => {
  describe('valid data', () => {
    it('should accept a valid user profile', () => {
      const result = userProfileSchema.safeParse(validUserProfile);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe(validUserProfile.name);
        expect(result.data.email).toBe(validUserProfile.email);
      }
    });

    it('should accept all valid name lengths', () => {
      validNames.forEach((name) => {
        const data = { ...validUserProfile, name };
        const result = userProfileSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it.each(validEmails)('should accept valid email: %s', (email) => {
      const data = { ...validUserProfile, email };
      const result = userProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid data', () => {
    it('should reject missing id', () => {
      const { id, ...data } = validUserProfile;
      const result = userProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid names', () => {
      invalidNames.forEach((name) => {
        const data = { ...validUserProfile, name };
        const result = userProfileSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    it.each(invalidEmails)('should reject invalid email: %s', (email) => {
      const data = { ...validUserProfile, email };
      const result = userProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject missing email', () => {
      const { email, ...data } = validUserProfile;
      const result = userProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject missing createdAt', () => {
      const { createdAt, ...data } = validUserProfile;
      const result = userProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject missing updatedAt', () => {
      const { updatedAt, ...data } = validUserProfile;
      const result = userProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

/**
 * UserPreferences Schema Tests
 */
describe('userPreferencesSchema', () => {
  describe('valid data', () => {
    it('should accept valid preferences', () => {
      const result = userPreferencesSchema.safeParse(validUserPreferences);
      expect(result.success).toBe(true);
    });

    it.each(experienceLevels)('should accept experience level: %s', (level) => {
      const data = { ...validUserPreferences, experienceLevel: level };
      const result = userPreferencesSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it.each(preferredRoles)('should accept preferred role: %s', (role) => {
      const data = { ...validUserPreferences, preferredRole: role };
      const result = userPreferencesSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it.each(rulesets)('should accept ruleset: %s', (ruleset) => {
      const data = { ...validUserPreferences, ruleset };
      const result = userPreferencesSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid data', () => {
    it('should reject invalid experience level', () => {
      const data = { ...validUserPreferences, experienceLevel: 'InvalidLevel' };
      const result = userPreferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid preferred role', () => {
      const data = { ...validUserPreferences, preferredRole: 'InvalidRole' };
      const result = userPreferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid ruleset', () => {
      const data = { ...validUserPreferences, ruleset: 'InvalidRuleset' };
      const result = userPreferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject missing userId', () => {
      const { userId, ...data } = validUserPreferences;
      const result = userPreferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

/**
 * NotificationSettings Schema Tests
 */
describe('notificationSettingsSchema', () => {
  describe('valid data', () => {
    it('should accept valid notification settings', () => {
      const result = notificationSettingsSchema.safeParse(validNotifications);
      expect(result.success).toBe(true);
    });

    it('should accept all boolean combinations', () => {
      const boolCombos = [
        [true, true, true],
        [false, false, false],
        [true, false, true],
        [false, true, false],
      ];

      boolCombos.forEach(([email, party, encounter]) => {
        const data = {
          ...validNotifications,
          emailNotifications: email,
          partyUpdates: party,
          encounterReminders: encounter,
        };
        const result = notificationSettingsSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('invalid data', () => {
    it('should reject non-boolean values', () => {
      const invalidValues = ['yes', 1, null, undefined];
      invalidValues.forEach((val) => {
        const data = { ...validNotifications, emailNotifications: val };
        const result = notificationSettingsSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    it('should reject missing userId', () => {
      const { userId, ...data } = validNotifications;
      const result = notificationSettingsSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

/**
 * Update Schemas Tests
 */
describe('updateUserProfileSchema', () => {
  it('should accept partial profile updates', () => {
    const updates = { name: 'New Name', email: 'new@example.com' };
    const result = updateUserProfileSchema.safeParse(updates);
    expect(result.success).toBe(true);
  });

  it('should accept empty update', () => {
    const result = updateUserProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should reject invalid email in update', () => {
    const result = updateUserProfileSchema.safeParse({ email: 'invalid-email' });
    expect(result.success).toBe(false);
  });

  it('should reject empty name in update', () => {
    const result = updateUserProfileSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });
});

describe('updateUserPreferencesSchema', () => {
  it('should accept partial preferences updates', () => {
    const updates = { experienceLevel: 'Advanced' };
    const result = updateUserPreferencesSchema.safeParse(updates);
    expect(result.success).toBe(true);
  });

  it('should reject invalid enum value', () => {
    const result = updateUserPreferencesSchema.safeParse({
      experienceLevel: 'InvalidLevel',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateNotificationSettingsSchema', () => {
  it('should accept partial notification updates', () => {
    const updates = { emailNotifications: false };
    const result = updateNotificationSettingsSchema.safeParse(updates);
    expect(result.success).toBe(true);
  });

  it('should reject non-boolean value', () => {
    const result = updateNotificationSettingsSchema.safeParse({
      emailNotifications: 'yes',
    });
    expect(result.success).toBe(false);
  });
});
