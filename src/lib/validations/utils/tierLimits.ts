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
 * Validate usage against tier limits
 */
function validateTierLimits(data: {
  tier: keyof typeof TIER_LIMITS
  partiesCount: number
  encountersCount: number
  creaturesCount: number
}): boolean {
  const limits = TIER_LIMITS[data.tier]

  if (limits.parties !== -1 && data.partiesCount > limits.parties) {
    return false
  }
  if (limits.encounters !== -1 && data.encountersCount > limits.encounters) {
    return false
  }
  if (limits.creatures !== -1 && data.creaturesCount > limits.creatures) {
    return false
  }

  return true
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