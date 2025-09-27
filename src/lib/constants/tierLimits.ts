/**
 * Shared tier limits constants for D&D Encounter Tracker
 * Used across auth validation and User model
 */

export const TIER_LIMITS = {
  free: { parties: 1, encounters: 3, creatures: 10, maxParticipants: 6 },
  seasoned: { parties: 5, encounters: 15, creatures: 50, maxParticipants: 12 },
  expert: { parties: 25, encounters: 100, creatures: 250, maxParticipants: 20 },
  master: { parties: -1, encounters: -1, creatures: -1, maxParticipants: -1 }, // Unlimited
  guild: { parties: -1, encounters: -1, creatures: -1, maxParticipants: -1 }, // Unlimited
} as const

export type TierLimits = typeof TIER_LIMITS
export type SubscriptionTier = keyof TierLimits