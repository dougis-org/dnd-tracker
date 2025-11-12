import {
  updateUserProfileSchema,
  updateUserPreferencesSchema,
  updateNotificationSettingsSchema,
} from '@/lib/schemas/userSchema';

/**
 * Update Schemas Tests
 *
 * Tests for schema validation when updating user data.
 * Each schema should accept partial updates and validate only provided fields.
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
