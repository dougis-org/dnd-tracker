/**
 * Tier limit validation utilities
 * Extracted from auth.ts to reduce complexity
 */
import { z } from 'zod'
import { SubscriptionTierSchema } from '../schemas/enums'
import { TIER_LIMITS } from '@/lib/constants/tierLimits'

/**
 * Usage limit validation schema
 */
export const UsageLimitSchema = z.object({
  tier: SubscriptionTierSchema,
  partiesCount: z.number().int().min(0),
  encountersCount: z.number().int().min(0),
  creaturesCount: z.number().int().min(0),
}).refine((data) => {
  return validateTierLimits(data)
}, {
  message: 'Usage exceeds tier limits',
})

/**
 * Check if a specific limit is exceeded
 */
function isLimitExceeded(limit: number, count: number): boolean {
  return limit !== -1 && count > limit
}

/**
 * Validate usage against tier limits
 */
function validateTierLimits(data: {
  tier: keyof typeof TIER_LIMITS
  partiesCount: number
  encountersCount: number
  creaturesCount: number
}): boolean {
  const limits = TIER_LIMITS[data.tier]

  return !isLimitExceeded(limits.parties, data.partiesCount) &&
         !isLimitExceeded(limits.encounters, data.encountersCount) &&
         !isLimitExceeded(limits.creatures, data.creaturesCount)
}

/**
 * Check if action is allowed based on tier limits
 */
export function checkTierLimitAllowed(
  tier: keyof typeof TIER_LIMITS,
  action: 'parties' | 'encounters' | 'creatures' | 'maxParticipants',
  currentCount: number,
  additionalCount: number = 1
): { allowed: boolean; limit: number; wouldExceed: number } {
  const limits = TIER_LIMITS[tier]
  const limit = limits[action]

  if (limit === -1) {
    // Unlimited
    return { allowed: true, limit: -1, wouldExceed: -1 }
  }

  const wouldExceed = currentCount + additionalCount
  const allowed = wouldExceed <= limit

  return { allowed, limit, wouldExceed }
}