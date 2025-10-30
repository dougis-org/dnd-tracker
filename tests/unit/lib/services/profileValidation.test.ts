import {
  validateProfileUpdate,
  verifyUserAuth,
  checkUserAuthorization,
  sanitizeUserResponse,
  MAX_DISPLAY_NAME_LENGTH,
} from '@/lib/services/profileValidation';
import type { IUser } from '@/lib/db/models/User';

describe('profileValidation - Coverage', () => {
  describe('validateProfileUpdate', () => {
    it('returns empty errors array for valid profile update', () => {
      const result = validateProfileUpdate({
        displayName: 'New Name',
        dndRuleset: '5e',
        experienceLevel: 'beginner',
        role: 'player',
      });
      expect(result).toEqual([]);
    });

    it('returns empty errors array for empty object', () => {
      const result = validateProfileUpdate({});
      expect(result).toEqual([]);
    });

    it('validates displayName length', () => {
      const result = validateProfileUpdate({
        displayName: 'a'.repeat(MAX_DISPLAY_NAME_LENGTH + 1),
      });
      expect(result).toHaveLength(1);
      expect(result[0].field).toBe('displayName');
      expect(result[0].message).toContain('cannot exceed');
    });

    it('allows displayName at max length', () => {
      const result = validateProfileUpdate({
        displayName: 'a'.repeat(MAX_DISPLAY_NAME_LENGTH),
      });
      expect(result).toEqual([]);
    });

    it('validates dndRuleset', () => {
      const result = validateProfileUpdate({
        dndRuleset: 'invalid' as never,
      });
      expect(result).toHaveLength(1);
      expect(result[0].field).toBe('dndRuleset');
    });

    it('allows all valid rulesets', () => {
      const validRulesets = ['5e', '3.5e', 'pf1', 'pf2'] as const;
      for (const ruleset of validRulesets) {
        const result = validateProfileUpdate({ dndRuleset: ruleset });
        expect(result).toEqual([]);
      }
    });

    it('validates experienceLevel', () => {
      const result = validateProfileUpdate({
        experienceLevel: 'invalid' as never,
      });
      expect(result).toHaveLength(1);
      expect(result[0].field).toBe('experienceLevel');
    });

    it('allows all valid experience levels', () => {
      const validLevels = ['beginner', 'intermediate', 'expert'] as const;
      for (const level of validLevels) {
        const result = validateProfileUpdate({ experienceLevel: level });
        expect(result).toEqual([]);
      }
    });

    it('validates role', () => {
      const result = validateProfileUpdate({
        role: 'invalid' as never,
      });
      expect(result).toHaveLength(1);
      expect(result[0].field).toBe('role');
    });

    it('allows all valid roles', () => {
      const validRoles = ['player', 'dm', 'both'] as const;
      for (const role of validRoles) {
        const result = validateProfileUpdate({ role });
        expect(result).toEqual([]);
      }
    });

    it('returns multiple errors for multiple invalid fields', () => {
      const result = validateProfileUpdate({
        displayName: 'a'.repeat(MAX_DISPLAY_NAME_LENGTH + 1),
        dndRuleset: 'invalid' as never,
        experienceLevel: 'invalid' as never,
        role: 'invalid' as never,
      });
      expect(result.length).toBe(4);
    });
  });

  describe('verifyUserAuth', () => {
    it('returns clerkUserId when authenticated', async () => {
      const mockAuth = { userId: 'user-123' };
      const result = await verifyUserAuth(
        { params: { id: 'id' } },
        () => Promise.resolve(mockAuth)
      );
      expect(result.clerkUserId).toBe('user-123');
      expect(result.error).toBeUndefined();
    });

    it('returns null clerkUserId and 401 error when not authenticated', async () => {
      const result = await verifyUserAuth(
        { params: { id: 'id' } },
        () => Promise.resolve(null)
      );
      expect(result.clerkUserId).toBeNull();
      expect(result.error).toEqual({
        message: 'Unauthorized',
        status: 401,
      });
    });

    it('uses auth from context if provided', async () => {
      const mockAuth = { userId: 'from-context' };
      const result = await verifyUserAuth(
        { params: { id: 'id' }, auth: mockAuth },
        () => Promise.reject(new Error('Should not be called'))
      );
      expect(result.clerkUserId).toBe('from-context');
    });

    it('falls back to authFn if context auth not provided', async () => {
      const result = await verifyUserAuth(
        { params: { id: 'id' }, auth: undefined },
        () => Promise.resolve({ userId: 'from-fn' })
      );
      expect(result.clerkUserId).toBe('from-fn');
    });
  });

  describe('checkUserAuthorization', () => {
    const mockUser: IUser = {
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      profile: {
        displayName: '',
        dndRuleset: '5e',
        experienceLevel: 'beginner',
        role: 'player',
      },
      subscription: {
        tier: 'free',
      },
      usage: {
        sessionsCount: 0,
        charactersCreatedCount: 0,
        campaignsCreatedCount: 0,
        metricsLastUpdated: new Date(),
      },
      preferences: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;

    it('returns no error when user matches clerkUserId', () => {
      const result = checkUserAuthorization(mockUser, 'user-123');
      expect(result.error).toBeUndefined();
    });

    it('returns 404 error when user is null', () => {
      const result = checkUserAuthorization(null, 'user-123');
      expect(result.error).toEqual({
        message: 'User not found',
        status: 404,
      });
    });

    it('returns 403 error when user does not match clerkUserId', () => {
      const result = checkUserAuthorization(mockUser, 'different-user');
      expect(result.error).toEqual({
        message: 'Forbidden',
        status: 403,
      });
    });
  });

  describe('sanitizeUserResponse', () => {
    const mockUser: IUser = {
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      profile: {
        displayName: 'Test Display',
        dndRuleset: '5e',
        experienceLevel: 'intermediate',
        role: 'dm',
      },
      subscription: {
        tier: 'seasoned',
      },
      usage: {
        sessionsCount: 5,
        charactersCreatedCount: 3,
        campaignsCreatedCount: 1,
        metricsLastUpdated: new Date(),
      },
      preferences: {
        theme: 'dark',
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
    } as any;

    it('includes safe user fields', () => {
      const result = sanitizeUserResponse(mockUser);
      expect(result).toEqual({
        id: expect.any(String),
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        profile: mockUser.profile,
        subscription: mockUser.subscription,
        usage: mockUser.usage,
        preferences: mockUser.preferences,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('converts _id to string id', () => {
      const result = sanitizeUserResponse(mockUser);
      expect(typeof result.id).toBe('string');
    });

    it('handles missing optional fields gracefully', () => {
      const minimalUser = {
        _id: 'user-456',
        email: 'minimal@example.com',
      } as IUser;

      const result = sanitizeUserResponse(minimalUser);
      expect(result.email).toBe('minimal@example.com');
      expect(result.id).toBe('user-456');
    });
  });
});
