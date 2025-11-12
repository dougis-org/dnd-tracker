import { userPreferencesSchema } from '@/lib/schemas/userSchema';
import { validUserPreferences, experienceLevels, preferredRoles, rulesets } from '../../fixtures/userSchemaFixtures';

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
