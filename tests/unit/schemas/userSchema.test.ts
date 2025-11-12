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
    it.each(['InvalidLevel', 'Beginner', 'Expert', ''])('should reject invalid experience level: %s', (level) => {
      const data = { ...validUserPreferences, experienceLevel: level as any }; // eslint-disable-line @typescript-eslint/no-explicit-any
      const result = userPreferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it.each(['InvalidRole', 'Dungeon Master', 'Wizard', ''])('should reject invalid preferred role: %s', (role) => {
      const data = { ...validUserPreferences, preferredRole: role as any }; // eslint-disable-line @typescript-eslint/no-explicit-any
      const result = userPreferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it.each(['InvalidRuleset', '4e', 'Pathfinder', ''])('should reject invalid ruleset: %s', (ruleset) => {
      const data = { ...validUserPreferences, ruleset: ruleset as any }; // eslint-disable-line @typescript-eslint/no-explicit-any
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

    it.each([
      [true, true, true],
      [false, false, false],
      [true, false, true],
      [false, true, false],
    ])('should accept boolean combination email=%s, party=%s, encounter=%s', (email, party, encounter) => {
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

  describe('invalid data', () => {
    it.each(['yes', 1, null, undefined])('should reject non-boolean value: %s', (val) => {
      const data = { ...validNotifications, emailNotifications: val as any }; // eslint-disable-line @typescript-eslint/no-explicit-any
      const result = notificationSettingsSchema.safeParse(data);
      expect(result.success).toBe(false);
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
  describe('valid updates', () => {
    it('should accept partial profile updates', () => {
      const updates = { name: 'New Name', email: 'new@example.com' };
      const result = updateUserProfileSchema.safeParse(updates);
      expect(result.success).toBe(true);
    });

    it('should accept empty update', () => {
      const result = updateUserProfileSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it.each([
      { name: 'New Name' },
      { email: 'new@example.com' },
      { name: 'Alice', email: 'alice@example.com' },
    ])('should accept valid partial update: %o', (updates) => {
      const result = updateUserProfileSchema.safeParse(updates);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid updates', () => {
    it.each(['invalid-email', 'not-an-email', 'spaces in@email.com'])('should reject invalid email: %s', (email) => {
      const result = updateUserProfileSchema.safeParse({ email });
      expect(result.success).toBe(false);
    });

    it('should reject empty name in update', () => {
      const result = updateUserProfileSchema.safeParse({ name: '' });
      expect(result.success).toBe(false);
    });

    it('should reject name exceeding max length', () => {
      const result = updateUserProfileSchema.safeParse({ name: 'A'.repeat(101) });
      expect(result.success).toBe(false);
    });
  });
});

describe('updateUserPreferencesSchema', () => {
  describe('valid updates', () => {
    it('should accept partial preferences updates', () => {
      const updates = { experienceLevel: 'Advanced' };
      const result = updateUserPreferencesSchema.safeParse(updates);
      expect(result.success).toBe(true);
    });

    it.each(['Novice', 'Intermediate', 'Advanced'])('should accept experience level update: %s', (level) => {
      const result = updateUserPreferencesSchema.safeParse({ experienceLevel: level });
      expect(result.success).toBe(true);
    });

    it.each(['DM', 'Player', 'Both'])('should accept preferred role update: %s', (role) => {
      const result = updateUserPreferencesSchema.safeParse({ preferredRole: role });
      expect(result.success).toBe(true);
    });

    it.each(['5e', '3.5e', 'PF2e'])('should accept ruleset update: %s', (ruleset) => {
      const result = updateUserPreferencesSchema.safeParse({ ruleset });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid updates', () => {
    it.each(['InvalidLevel', 'Beginner', 'Expert', ''])('should reject invalid experience level: %s', (level) => {
      const result = updateUserPreferencesSchema.safeParse({ experienceLevel: level as any }); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(result.success).toBe(false);
    });

    it.each(['InvalidRole', 'Dungeon Master', 'Wizard', ''])('should reject invalid preferred role: %s', (role) => {
      const result = updateUserPreferencesSchema.safeParse({ preferredRole: role as any }); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(result.success).toBe(false);
    });

    it.each(['InvalidRuleset', '4e', 'Pathfinder', ''])('should reject invalid ruleset: %s', (ruleset) => {
      const result = updateUserPreferencesSchema.safeParse({ ruleset: ruleset as any }); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(result.success).toBe(false);
    });
  });
});

describe('updateNotificationSettingsSchema', () => {
  describe('valid updates', () => {
    it('should accept partial notification updates', () => {
      const updates = { emailNotifications: false };
      const result = updateNotificationSettingsSchema.safeParse(updates);
      expect(result.success).toBe(true);
    });

    it.each([
      { emailNotifications: true },
      { emailNotifications: false },
      { partyUpdates: true },
      { encounterReminders: false },
      { emailNotifications: true, partyUpdates: false },
    ])('should accept valid notification update: %o', (updates) => {
      const result = updateNotificationSettingsSchema.safeParse(updates);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid updates', () => {
    it.each(['yes', 1, null])('should reject non-boolean emailNotifications: %s', (val) => {
      const result = updateNotificationSettingsSchema.safeParse({ emailNotifications: val as any }); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(result.success).toBe(false);
    });

    it.each(['yes', 0, null])('should reject non-boolean partyUpdates: %s', (val) => {
      const result = updateNotificationSettingsSchema.safeParse({ partyUpdates: val as any }); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(result.success).toBe(false);
    });

    it.each(['yes', 2, null])('should reject non-boolean encounterReminders: %s', (val) => {
      const result = updateNotificationSettingsSchema.safeParse({ encounterReminders: val as any }); // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(result.success).toBe(false);
    });
  });
});
