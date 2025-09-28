/**
 * Zod validation schemas for auth requests
 * Validation: Match contracts/auth-api.yaml schema constraints
 * Enums: dndRuleset, experienceLevel, role, theme, tier, status
 */
import { TIER_LIMITS } from '@/lib/constants/tierLimits'

// Re-export schemas from organized modules
export {
  DndRulesetSchema,
  ExperienceLevelSchema,
  UserRoleSchema,
  ThemeSchema,
  InitiativeTypeSchema,
  SubscriptionTierSchema,
  SubscriptionStatusSchema,
  type DndRuleset,
  type ExperienceLevel,
  type UserRole,
  type Theme,
  type InitiativeType,
  type SubscriptionTier,
  type SubscriptionStatus,
} from './schemas/enums'

export {
  ProfileSchema,
  PreferencesSchema,
  ProfileUpdateSchema,
  type Profile,
  type Preferences,
  type ProfileUpdate,
} from './schemas/profile'

export {
  SessionTokenSchema,
  UserCreationSchema,
  UserResponseSchema,
  type UserCreation,
  type UserResponse,
} from './schemas/user'

export {
  UsageLimitSchema,
  checkTierLimitAllowed,
} from './utils/tierLimits'

export {
  validateSessionToken,
  validateProfileUpdate,
  validateUserCreation,
  validateUsageLimits,
} from './utils/validators'

// Export TIER_LIMITS for backward compatibility
export { TIER_LIMITS }