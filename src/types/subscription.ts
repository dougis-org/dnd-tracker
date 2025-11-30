/**
 * Subscription Tier Constants and Types
 *
 * Central source of truth for subscription tier definitions and limits.
 * Used by both Feature 012 (Subscription Billing API) and Feature 016 (Dashboard).
 *
 * Source: docs/Product-Requirements.md section 3.1
 */

/**
 * Subscription tier enumeration
 * Represents all available DM subscription tiers
 */
export type SubscriptionTier =
  | 'free_adventurer'
  | 'seasoned_adventurer'
  | 'expert_dungeon_master'
  | 'master_of_dungeons'
  | 'guild_master';

/**
 * Resource limits structure
 * Defines party, character, and encounter limits for a subscription tier
 */
export interface ResourceLimits {
  parties: number;
  characters: number;
  encounters: number;
}

/**
 * Tier Limits: Hardcoded resource limits per subscription tier
 *
 * Each tier defines maximum allowed resources for:
 * - parties: Number of party groups
 * - characters: Number of player characters
 * - encounters: Number of prepared encounters
 *
 * Guild Master tier has unlimited resources (Infinity).
 *
 * Important: Tier limits are business rules and require code release to change.
 * They are not user-configurable and do not change during a session.
 *
 * @see docs/Product-Requirements.md for detailed tier definitions
 */
export const TierLimits = {
  free_adventurer: {
    parties: 1,
    characters: 3,
    encounters: 5,
  },
  seasoned_adventurer: {
    parties: 3,
    characters: 10,
    encounters: 20,
  },
  expert_dungeon_master: {
    parties: 5,
    characters: 20,
    encounters: 50,
  },
  master_of_dungeons: {
    parties: 10,
    characters: 50,
    encounters: 100,
  },
  guild_master: {
    parties: Number.POSITIVE_INFINITY,
    characters: Number.POSITIVE_INFINITY,
    encounters: Number.POSITIVE_INFINITY,
  },
} as const;

/**
 * Helper function to get limits for a specific tier
 * @param tier - The subscription tier
 * @returns Limits object for the tier
 * @throws Error if tier is invalid
 */
export function getLimitsForTier(tier: SubscriptionTier) {
  const limits = TierLimits[tier];
  if (!limits) {
    throw new Error(`Invalid subscription tier: ${tier}`);
  }
  return limits;
}

/**
 * Helper function to check if a tier is valid
 * @param tier - Value to check
 * @returns True if tier is a valid SubscriptionTier
 */
export function isValidTier(tier: unknown): tier is SubscriptionTier {
  return typeof tier === 'string' && Object.keys(TierLimits).includes(tier);
}
