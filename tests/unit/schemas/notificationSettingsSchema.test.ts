import { notificationSettingsSchema } from '@/lib/schemas/userSchema';
import { validNotifications } from '../../fixtures/userSchemaFixtures';

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
