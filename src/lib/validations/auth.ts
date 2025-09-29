/**
 * Main auth validation exports
 * Simple re-export module with minimal complexity
 */

// Re-export all schemas from organized modules
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
  validateSessionToken,
  validateProfileUpdate,
  validateUserCreation,
  validateUsageLimits,
} from './utils/validators'

export {
  UsageLimitSchema,
  checkTierLimitAllowed,
} from './utils/tierLimits'

// Re-export constants for convenience
export { TIER_LIMITS } from '@/lib/constants/tierLimits'