import {
  getTierLimits,
  canAddCharacterToParty,
  canCreateParty,
  canShareParty,
  canAddSharedUser,
  canCreateTemplate,
  canCreateMoreTemplates,
  TIER_LIMITS,
  type SubscriptionTier,
} from '../tier-limits';

describe('tier-limits', () => {
  describe('getTierLimits', () => {
    it('should return correct limits for free tier', () => {
      const limits = getTierLimits('free');
      expect(limits).toEqual({
        maxParties: 2,
        maxCharactersPerParty: 4,
        canShare: false,
        maxSharedUsers: 0,
        canCreateTemplates: false,
        maxTemplates: 0,
      });
    });

    it('should return correct limits for seasoned tier', () => {
      const limits = getTierLimits('seasoned');
      expect(limits).toEqual({
        maxParties: 5,
        maxCharactersPerParty: 6,
        canShare: true,
        maxSharedUsers: 2,
        canCreateTemplates: true,
        maxTemplates: 3,
      });
    });

    it('should return correct limits for guild tier (unlimited)', () => {
      const limits = getTierLimits('guild');
      expect(limits).toEqual({
        maxParties: -1,
        maxCharactersPerParty: -1,
        canShare: true,
        maxSharedUsers: -1,
        canCreateTemplates: true,
        maxTemplates: -1,
      });
    });
  });

  describe('canAddCharacterToParty', () => {
    it('should allow adding character when under limit', () => {
      expect(canAddCharacterToParty('free', 3)).toBe(true);
      expect(canAddCharacterToParty('seasoned', 5)).toBe(true);
    });

    it('should reject adding character when at limit', () => {
      expect(canAddCharacterToParty('free', 4)).toBe(false);
      expect(canAddCharacterToParty('seasoned', 6)).toBe(false);
    });

    it('should allow unlimited for guild tier', () => {
      expect(canAddCharacterToParty('guild', 100)).toBe(true);
    });
  });

  describe('canCreateParty', () => {
    it('should allow creating party when under limit', () => {
      expect(canCreateParty('free', 1)).toBe(true);
      expect(canCreateParty('expert', 10)).toBe(true);
    });

    it('should reject creating party when at limit', () => {
      expect(canCreateParty('free', 2)).toBe(false);
      expect(canCreateParty('seasoned', 5)).toBe(false);
    });

    it('should allow unlimited for guild tier', () => {
      expect(canCreateParty('guild', 1000)).toBe(true);
    });
  });

  describe('canShareParty', () => {
    it('should reject sharing for free tier', () => {
      expect(canShareParty('free')).toBe(false);
    });

    it('should allow sharing for paid tiers', () => {
      expect(canShareParty('seasoned')).toBe(true);
      expect(canShareParty('expert')).toBe(true);
      expect(canShareParty('master')).toBe(true);
      expect(canShareParty('guild')).toBe(true);
    });
  });

  describe('canAddSharedUser', () => {
    it('should reject adding shared user for free tier', () => {
      expect(canAddSharedUser('free', 0)).toBe(false);
    });

    it('should allow adding shared user when under limit', () => {
      expect(canAddSharedUser('seasoned', 1)).toBe(true);
      expect(canAddSharedUser('expert', 4)).toBe(true);
    });

    it('should reject adding shared user when at limit', () => {
      expect(canAddSharedUser('seasoned', 2)).toBe(false);
      expect(canAddSharedUser('expert', 5)).toBe(false);
    });

    it('should allow unlimited shared users for guild tier', () => {
      expect(canAddSharedUser('guild', 1000)).toBe(true);
    });
  });

  describe('canCreateTemplate', () => {
    it('should reject template creation for free tier', () => {
      expect(canCreateTemplate('free')).toBe(false);
    });

    it('should allow template creation for paid tiers', () => {
      expect(canCreateTemplate('seasoned')).toBe(true);
      expect(canCreateTemplate('expert')).toBe(true);
      expect(canCreateTemplate('master')).toBe(true);
      expect(canCreateTemplate('guild')).toBe(true);
    });
  });

  describe('canCreateMoreTemplates', () => {
    it('should reject creating more templates for free tier', () => {
      expect(canCreateMoreTemplates('free', 0)).toBe(false);
    });

    it('should allow creating templates when under limit', () => {
      expect(canCreateMoreTemplates('seasoned', 2)).toBe(true);
      expect(canCreateMoreTemplates('expert', 9)).toBe(true);
    });

    it('should reject creating templates when at limit', () => {
      expect(canCreateMoreTemplates('seasoned', 3)).toBe(false);
      expect(canCreateMoreTemplates('expert', 10)).toBe(false);
    });

    it('should allow unlimited templates for guild tier', () => {
      expect(canCreateMoreTemplates('guild', 1000)).toBe(true);
    });
  });

  describe('TIER_LIMITS constant', () => {
    it('should have all required tiers', () => {
      const expectedTiers: SubscriptionTier[] = ['free', 'seasoned', 'expert', 'master', 'guild'];
      expectedTiers.forEach((tier) => {
        expect(TIER_LIMITS[tier]).toBeDefined();
      });
    });

    it('should have all required properties for each tier', () => {
      Object.values(TIER_LIMITS).forEach((limits) => {
        expect(limits).toHaveProperty('maxParties');
        expect(limits).toHaveProperty('maxCharactersPerParty');
        expect(limits).toHaveProperty('canShare');
        expect(limits).toHaveProperty('maxSharedUsers');
        expect(limits).toHaveProperty('canCreateTemplates');
        expect(limits).toHaveProperty('maxTemplates');
      });
    });

    it('should have progressive limits from free to guild', () => {
      expect(TIER_LIMITS.free.maxParties).toBeLessThan(TIER_LIMITS.seasoned.maxParties);
      expect(TIER_LIMITS.seasoned.maxParties).toBeLessThan(TIER_LIMITS.expert.maxParties);
      expect(TIER_LIMITS.expert.maxParties).toBeLessThan(TIER_LIMITS.master.maxParties);
      
      expect(TIER_LIMITS.free.maxCharactersPerParty).toBeLessThan(TIER_LIMITS.seasoned.maxCharactersPerParty);
      expect(TIER_LIMITS.seasoned.maxCharactersPerParty).toBeLessThan(TIER_LIMITS.expert.maxCharactersPerParty);
      
      // Guild tier should have unlimited (-1) for certain limits
      expect(TIER_LIMITS.guild.maxParties).toBe(-1);
      expect(TIER_LIMITS.guild.maxCharactersPerParty).toBe(-1);
      expect(TIER_LIMITS.guild.maxSharedUsers).toBe(-1);
      expect(TIER_LIMITS.guild.maxTemplates).toBe(-1);
    });
  });
});