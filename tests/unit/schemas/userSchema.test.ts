import {
  userProfileSchema,
  userPreferencesSchema,
  notificationSettingsSchema,
  updateUserProfileSchema,
  updateUserPreferencesSchema,
  updateNotificationSettingsSchema,
} from '@/lib/schemas/userSchema';

/**
 * UserProfile Schema Tests
 * Validates all user profile fields (id, name, email, timestamps)
 */
describe('userProfileSchema', () => {
  describe('valid data', () => {
    it('should accept a valid user profile', () => {
      const data = {
        id: 'user-123',
        name: 'Alice Adventurer',
        email: 'alice@example.com',
        createdAt: new Date('2025-10-01T00:00:00Z'),
        updatedAt: new Date('2025-11-11T19:00:00Z'),
      };
      const result = userProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Alice Adventurer');
        expect(result.data.email).toBe('alice@example.com');
      }
    });

    it('should accept name with Unicode characters', () => {
      const data = {
        id: 'user-123',
        name: '艾莉丝 冒险家',
        email: 'alice@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = userProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept minimum-length name (1 char)', () => {
      const data = {
        id: 'user-123',
        name: 'A',
        email: 'alice@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = userProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept maximum-length name (100 chars)', () => {
      const data = {
        id: 'user-123',
        name: 'A'.repeat(100),
        email: 'alice@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = userProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept various valid email formats', () => {
      const validEmails = [
        'simple@example.com',
        'user.name+tag@example.co.uk',
        'user_name@example.org',
        'user123@subdomain.example.com',
      ];

      validEmails.forEach((email) => {
        const data = {
          id: 'user-123',
          name: 'Alice',
          email,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const result = userProfileSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('invalid data', () => {
    it('should reject missing id', () => {
      const data = {
        name: 'Alice',
        email: 'alice@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = userProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const data = {
        id: 'user-123',
        name: '',
        email: 'alice@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = userProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject name exceeding 100 characters', () => {
      const data = {
        id: 'user-123',
        name: 'A'.repeat(101),
        email: 'alice@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = userProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email format', () => {
      const invalidEmails = ['not-an-email', 'alice@', '@example.com', 'alice@.com', 'alice@example'];

      invalidEmails.forEach((email) => {
        const data = {
          id: 'user-123',
          name: 'Alice',
          email,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const result = userProfileSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    it('should reject missing email', () => {
      const data = {
        id: 'user-123',
        name: 'Alice',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = userProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

/**
 * UserPreferences Schema Tests
 * Validates D&D preference fields (experience level, role, ruleset)
 */
describe('userPreferencesSchema', () => {
  describe('valid data', () => {
    it('should accept valid preferences', () => {
      const data = {
        userId: 'user-123',
        experienceLevel: 'Intermediate',
        preferredRole: 'Player',
        ruleset: '5e',
        updatedAt: new Date(),
      };
      const result = userPreferencesSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept all valid experience levels', () => {
      const levels = ['Novice', 'Intermediate', 'Advanced'];
      levels.forEach((level) => {
        const data = {
          userId: 'user-123',
          experienceLevel: level,
          preferredRole: 'Player',
          ruleset: '5e',
          updatedAt: new Date(),
        };
        const result = userPreferencesSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should accept all valid preferred roles', () => {
      const roles = ['DM', 'Player', 'Both'];
      roles.forEach((role) => {
        const data = {
          userId: 'user-123',
          experienceLevel: 'Intermediate',
          preferredRole: role,
          ruleset: '5e',
          updatedAt: new Date(),
        };
        const result = userPreferencesSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should accept all valid rulesets', () => {
      const rulesets = ['5e', '3.5e', 'PF2e'];
      rulesets.forEach((ruleset) => {
        const data = {
          userId: 'user-123',
          experienceLevel: 'Intermediate',
          preferredRole: 'Player',
          ruleset,
          updatedAt: new Date(),
        };
        const result = userPreferencesSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('invalid data', () => {
    it('should reject invalid experience level', () => {
      const data = {
        userId: 'user-123',
        experienceLevel: 'Expert',
        preferredRole: 'Player',
        ruleset: '5e',
        updatedAt: new Date(),
      };
      const result = userPreferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid preferred role', () => {
      const data = {
        userId: 'user-123',
        experienceLevel: 'Intermediate',
        preferredRole: 'Referee',
        ruleset: '5e',
        updatedAt: new Date(),
      };
      const result = userPreferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid ruleset', () => {
      const data = {
        userId: 'user-123',
        experienceLevel: 'Intermediate',
        preferredRole: 'Player',
        ruleset: '4e',
        updatedAt: new Date(),
      };
      const result = userPreferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject missing userId', () => {
      const data = {
        experienceLevel: 'Intermediate',
        preferredRole: 'Player',
        ruleset: '5e',
        updatedAt: new Date(),
      };
      const result = userPreferencesSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

/**
 * NotificationSettings Schema Tests
 * Validates notification preference fields (boolean toggles)
 */
describe('notificationSettingsSchema', () => {
  describe('valid data', () => {
    it('should accept valid notification settings', () => {
      const data = {
        userId: 'user-123',
        emailNotifications: true,
        partyUpdates: false,
        encounterReminders: true,
        updatedAt: new Date(),
      };
      const result = notificationSettingsSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept all boolean combinations', () => {
      const combinations = [
        { emailNotifications: true, partyUpdates: true, encounterReminders: true },
        { emailNotifications: false, partyUpdates: false, encounterReminders: false },
        { emailNotifications: true, partyUpdates: false, encounterReminders: false },
      ];

      combinations.forEach((combo) => {
        const data = {
          userId: 'user-123',
          ...combo,
          updatedAt: new Date(),
        };
        const result = notificationSettingsSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('invalid data', () => {
    it('should reject non-boolean notification values', () => {
      const data = {
        userId: 'user-123',
        emailNotifications: 'yes',
        partyUpdates: false,
        encounterReminders: true,
        updatedAt: new Date(),
      };
      const result = notificationSettingsSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject missing userId', () => {
      const data = {
        emailNotifications: true,
        partyUpdates: false,
        encounterReminders: true,
        updatedAt: new Date(),
      };
      const result = notificationSettingsSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject missing notification fields', () => {
      const data = {
        userId: 'user-123',
        emailNotifications: true,
        updatedAt: new Date(),
      };
      const result = notificationSettingsSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

/**
 * Update Schemas Tests
 * Validates partial update objects (all fields optional, immutable fields rejected)
 */
describe('updateUserProfileSchema', () => {
  it('should accept partial updates', () => {
    const data = {
      name: 'New Name',
    };
    const result = updateUserProfileSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept empty object', () => {
    const data = {};
    const result = updateUserProfileSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject id in update', () => {
    const data = {
      id: 'new-id',
      name: 'New Name',
    };
    const result = updateUserProfileSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('updateUserPreferencesSchema', () => {
  it('should accept partial preference updates', () => {
    const data = {
      experienceLevel: 'Advanced',
    };
    const result = updateUserPreferencesSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept empty object', () => {
    const data = {};
    const result = updateUserPreferencesSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject userId in update', () => {
    const data = {
      userId: 'new-user',
      experienceLevel: 'Advanced',
    };
    const result = updateUserPreferencesSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('updateNotificationSettingsSchema', () => {
  it('should accept partial notification updates', () => {
    const data = {
      emailNotifications: false,
    };
    const result = updateNotificationSettingsSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept empty object', () => {
    const data = {};
    const result = updateNotificationSettingsSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject userId in update', () => {
    const data = {
      userId: 'new-user',
      emailNotifications: false,
    };
    const result = updateNotificationSettingsSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
