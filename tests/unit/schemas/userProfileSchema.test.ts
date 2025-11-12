import { userProfileSchema } from '@/lib/schemas/userSchema';
import { validUserProfile, validEmails, invalidEmails, validNames, invalidNames } from '../../fixtures/userSchemaFixtures';

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
