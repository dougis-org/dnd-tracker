import { parseEmail, validateName, validatePreferences } from '@/lib/validation/userValidation';

describe('userValidation utilities', () => {
  describe('parseEmail', () => {
    it('should parse valid email', () => {
      const result = parseEmail('alice@example.com');
      expect(result.success).toBe(true);
      expect(result.data).toBe('alice@example.com');
    });

    it('should reject invalid email', () => {
      const result = parseEmail('not-an-email');
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

  describe('validateName', () => {
    it('should accept valid name', () => {
      const result = validateName('Alice Adventurer');
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const result = validateName('');
      expect(result.success).toBe(false);
    });

    it('should reject name > 100 chars', () => {
      const result = validateName('A'.repeat(101));
      expect(result.success).toBe(false);
    });

    it('should accept name exactly 100 chars', () => {
      const result = validateName('A'.repeat(100));
      expect(result.success).toBe(true);
    });

    it('should trim whitespace', () => {
      const result = validateName('  Alice Adventurer  ');
      expect(result.success).toBe(true);
    });

    it('should accept Unicode characters', () => {
      const result = validateName('艾莉丝 冒险家');
      expect(result.success).toBe(true);
    });
  });

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

    it('should accept all valid enums', () => {
      const levels = ['Novice', 'Intermediate', 'Advanced'];
      const roles = ['DM', 'Player', 'Both'];
      const rulesets = ['5e', '3.5e', 'PF2e'];

      levels.forEach((level) => {
        roles.forEach((role) => {
          rulesets.forEach((ruleset) => {
            const result = validatePreferences({
              experienceLevel: level,
              preferredRole: role,
              ruleset,
            });
            expect(result.success).toBe(true);
          });
        });
      });
    });
  });
});
