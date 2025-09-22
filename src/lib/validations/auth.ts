/**
 * Zod validation schemas for auth requests
 * Validation: Match contracts/auth-api.yaml schema constraints
 * Enums: dndRuleset, experienceLevel, role, theme, tier, status
 */
import { z } from 'zod'

// Enum schemas matching data model and API contracts
const DndRulesetSchema = z.enum(['5e', '3.5e', 'pf1', 'pf2'])

const ExperienceLevelSchema = z.enum(['beginner', 'intermediate', 'expert'])

const UserRoleSchema = z.enum(['player', 'dm', 'both'])

const ThemeSchema = z.enum(['light', 'dark', 'auto'])

const InitiativeTypeSchema = z.enum(['manual', 'auto'])

const SubscriptionTierSchema = z.enum(['free', 'seasoned', 'expert', 'master', 'guild'])
const SubscriptionStatusSchema = z.enum(['active', 'cancelled', 'trial'])

// Profile schemas
const ProfileSchema = z.object({
  displayName: z.string()
    .min(1, 'Display name is required')
    .max(100, 'Display name must be 100 characters or less')
    .trim()
    .optional(),

  dndRuleset: DndRulesetSchema.optional(),

  experienceLevel: ExperienceLevelSchema.optional(),

  role: UserRoleSchema.optional(),
})

const PreferencesSchema = z.object({
  theme: ThemeSchema.optional(),

  defaultInitiativeType: InitiativeTypeSchema.optional(),

  autoAdvanceRounds: z.boolean().optional(),
})

// Session validation schema
export const SessionTokenSchema = z.object({
  sessionToken: z.string().min(1),
})

// Profile update schema for PUT /api/users/profile
export const ProfileUpdateSchema = z.object({
  profile: ProfileSchema.optional(),
  preferences: PreferencesSchema.optional(),
}).refine(
  (data) => data.profile || data.preferences,
  {
    message: 'At least one of profile or preferences must be provided',
    path: [],
  }
)

// User creation schema (internal use)
export const UserCreationSchema = z.object({
  id: z.string().min(1, 'Clerk user ID is required'),

  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .trim(),

  profile: z.object({
    displayName: z.string()
      .min(1, 'Display name is required')
      .max(100, 'Display name must be 100 characters or less')
      .trim(),

    dndRuleset: DndRulesetSchema,
    experienceLevel: ExperienceLevelSchema,
    role: UserRoleSchema,
  }),

  subscription: z.object({
    tier: SubscriptionTierSchema,
    status: SubscriptionStatusSchema,
    currentPeriodEnd: z.date(),
  }),

  usage: z.object({
    partiesCount: z.number().int().min(0),
    encountersCount: z.number().int().min(0),
    creaturesCount: z.number().int().min(0),
  }),

  preferences: z.object({
    theme: ThemeSchema,
    defaultInitiativeType: InitiativeTypeSchema,
    autoAdvanceRounds: z.boolean(),
  }),
})

// User response schema (for API responses)
export const UserResponseSchema = UserCreationSchema.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Usage limit validation
const TIER_LIMITS = {
  free: { parties: 1, encounters: 3, creatures: 10, maxParticipants: 6 },
  seasoned: { parties: 5, encounters: 15, creatures: 50, maxParticipants: 12 },
  expert: { parties: 25, encounters: 100, creatures: 250, maxParticipants: 20 },
  master: { parties: -1, encounters: -1, creatures: -1, maxParticipants: -1 },
  guild: { parties: -1, encounters: -1, creatures: -1, maxParticipants: -1 },
} as const

export const UsageLimitSchema = z.object({
  tier: SubscriptionTierSchema,
  partiesCount: z.number().int().min(0),
  encountersCount: z.number().int().min(0),
  creaturesCount: z.number().int().min(0),
}).refine((data) => {
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
}, {
  message: 'Usage exceeds tier limits',
})

// Validation functions with proper error handling
export function validateSessionToken(data: unknown) {
  try {
    return {
      success: true as const,
      data: SessionTokenSchema.parse(data),
    }
  } catch (error) {
    return {
      success: false as const,
      error: error as z.ZodError,
    }
  }
}

export function validateProfileUpdate(data: unknown) {
  try {
    return {
      success: true as const,
      data: ProfileUpdateSchema.parse(data),
    }
  } catch (error) {
    return {
      success: false as const,
      error: error as z.ZodError,
    }
  }
}

export function validateUserCreation(data: unknown) {
  try {
    return {
      success: true as const,
      data: UserCreationSchema.parse(data),
    }
  } catch (error) {
    return {
      success: false as const,
      error: error as z.ZodError,
    }
  }
}

export function validateUsageLimits(data: unknown) {
  try {
    return {
      success: true as const,
      data: UsageLimitSchema.parse(data),
    }
  } catch (error) {
    return {
      success: false as const,
      error: error as z.ZodError,
    }
  }
}

// Helper function to check if action is allowed based on tier limits
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

// Export schemas for external use
export {
  DndRulesetSchema,
  ExperienceLevelSchema,
  UserRoleSchema,
  ThemeSchema,
  InitiativeTypeSchema,
  SubscriptionTierSchema,
  SubscriptionStatusSchema,
  ProfileSchema,
  PreferencesSchema,
  TIER_LIMITS,
}

// Type exports for TypeScript
export type DndRuleset = z.infer<typeof DndRulesetSchema>
export type ExperienceLevel = z.infer<typeof ExperienceLevelSchema>
export type UserRole = z.infer<typeof UserRoleSchema>
export type Theme = z.infer<typeof ThemeSchema>
export type InitiativeType = z.infer<typeof InitiativeTypeSchema>
export type SubscriptionTier = z.infer<typeof SubscriptionTierSchema>
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>
export type Profile = z.infer<typeof ProfileSchema>
export type Preferences = z.infer<typeof PreferencesSchema>
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>
export type UserCreation = z.infer<typeof UserCreationSchema>
export type UserResponse = z.infer<typeof UserResponseSchema>