/**
 * Tier limits and utility functions for subscription-based feature gating
 */

export type SubscriptionTier = 'free' | 'seasoned' | 'expert' | 'master' | 'guild';

export interface TierLimits {
  maxParties: number;
  maxCharactersPerParty: number;
  canShare: boolean;
  maxSharedUsers: number;
  canCreateTemplates: boolean;
  maxTemplates: number;
}

/**
 * Tier limits configuration
 */
export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    maxParties: 2,
    maxCharactersPerParty: 4,
    canShare: false,
    maxSharedUsers: 0,
    canCreateTemplates: false,
    maxTemplates: 0,
  },
  seasoned: {
    maxParties: 5,
    maxCharactersPerParty: 6,
    canShare: true,
    maxSharedUsers: 2,
    canCreateTemplates: true,
    maxTemplates: 3,
  },
  expert: {
    maxParties: 15,
    maxCharactersPerParty: 8,
    canShare: true,
    maxSharedUsers: 5,
    canCreateTemplates: true,
    maxTemplates: 10,
  },
  master: {
    maxParties: 50,
    maxCharactersPerParty: 12,
    canShare: true,
    maxSharedUsers: 10,
    canCreateTemplates: true,
    maxTemplates: 25,
  },
  guild: {
    maxParties: -1, // Unlimited
    maxCharactersPerParty: -1, // Unlimited
    canShare: true,
    maxSharedUsers: -1, // Unlimited
    canCreateTemplates: true,
    maxTemplates: -1, // Unlimited
  },
};

/**
 * Get tier limits for a specific subscription tier
 */
export function getTierLimits(tier: SubscriptionTier): TierLimits {
  return TIER_LIMITS[tier];
}

/**
 * Check if a user can add more characters to a party based on their tier
 */
export function canAddCharacterToParty(
  tier: SubscriptionTier,
  currentCharacterCount: number
): boolean {
  const limits = getTierLimits(tier);
  
  // -1 means unlimited
  if (limits.maxCharactersPerParty === -1) {
    return true;
  }
  
  return currentCharacterCount < limits.maxCharactersPerParty;
}

/**
 * Check if a user can create more parties based on their tier
 */
export function canCreateParty(
  tier: SubscriptionTier,
  currentPartyCount: number
): boolean {
  const limits = getTierLimits(tier);
  
  // -1 means unlimited
  if (limits.maxParties === -1) {
    return true;
  }
  
  return currentPartyCount < limits.maxParties;
}

/**
 * Check if a user can share parties based on their tier
 */
export function canShareParty(tier: SubscriptionTier): boolean {
  const limits = getTierLimits(tier);
  return limits.canShare;
}

/**
 * Check if a user can add more shared users to a party based on their tier
 */
export function canAddSharedUser(
  tier: SubscriptionTier,
  currentSharedUserCount: number
): boolean {
  const limits = getTierLimits(tier);
  
  if (!limits.canShare) {
    return false;
  }
  
  // -1 means unlimited
  if (limits.maxSharedUsers === -1) {
    return true;
  }
  
  return currentSharedUserCount < limits.maxSharedUsers;
}

/**
 * Check if a user can create templates based on their tier
 */
export function canCreateTemplate(tier: SubscriptionTier): boolean {
  const limits = getTierLimits(tier);
  return limits.canCreateTemplates;
}

/**
 * Check if a user can create more templates based on their tier
 */
export function canCreateMoreTemplates(
  tier: SubscriptionTier,
  currentTemplateCount: number
): boolean {
  const limits = getTierLimits(tier);
  
  if (!limits.canCreateTemplates) {
    return false;
  }
  
  // -1 means unlimited
  if (limits.maxTemplates === -1) {
    return true;
  }
  
  return currentTemplateCount < limits.maxTemplates;
}