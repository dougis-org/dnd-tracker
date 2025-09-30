/**
 * Tier limit validation utilities
 * Simple tier limit checking with minimal complexity
 */
import { z } from 'zod'
import { SubscriptionTierSchema } from '../schemas/enums'
import { TIER_LIMITS } from '@/lib/constants/tierLimits'

/**
 * Check if a specific limit is exceeded
 * Simple comparison function
 */
function isLimitExceeded(limit: number, count: number): boolean {
  return limit !== -1 && count > limit
}

/**
 * Validate usage against tier limits
 * Simple validation using helper function
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
 * Usage limit validation schema
 * Simple schema with custom refinement
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
 * Check if action is allowed based on tier limits
 * Simple tier limit checking function
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
    return { allowed: true, limit: -1, wouldExceed: -1 }
  }

  const wouldExceed = currentCount + additionalCount
  const allowed = wouldExceed <= limit

  return { allowed, limit, wouldExceed }
}