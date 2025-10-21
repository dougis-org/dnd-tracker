import { z } from 'zod';

/**
 * User validation schemas for authentication and user management
 * Includes D&D profile field validations
 */

// Base schemas (minimal subset needed for this feature)
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(254, 'Email address is too long');

const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters long')
  .max(30, 'Username cannot exceed 30 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, underscores, and hyphens'
  );

const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name cannot exceed 100 characters')
  .regex(
    /^[a-zA-Z\s'-]+$/,
    'Name can only contain letters, spaces, apostrophes, and hyphens'
  );

// Helper to make schemas optional
const createOptionalSchema = <T extends z.ZodTypeAny>(schema: T) =>
  schema.optional().nullable();

// Helper to preprocess empty strings/null to undefined for optional fields
const preprocessOptional = (val: unknown) => (val === '' || val === null ? undefined : val);

// Subscription tier validation
export const subscriptionTierSchema = z.enum(
  ['free', 'seasoned', 'expert', 'master', 'guild'],
  { message: 'Invalid subscription tier' }
);

// User role validation
export const userRoleSchema = z.enum(['user', 'admin'], {
  message: 'Invalid user role'
});

// User preferences schema
export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  emailNotifications: z.boolean().default(true),
  browserNotifications: z.boolean().default(false),
  timezone: z.string().default('UTC'),
  language: z.string().default('en'),
  diceRollAnimations: z.boolean().default(true),
  autoSaveEncounters: z.boolean().default(true),
});

// ========================================
// D&D Profile Field Schemas (NEW)
// ========================================

/**
 * Display name schema - optional field for user's preferred display name
 * Max 100 characters, trimmed
 */
export const displayNameSchema = z
  .string()
  .min(1, 'Display name cannot be empty')
  .max(100, 'Display name cannot exceed 100 characters')
  .trim()
  .optional()
  .nullable();

/**
 * D&D edition schema - user's preferred D&D ruleset
 * Max 50 characters, defaults to "5th Edition"
 */
export const dndEditionSchema = z
  .string()
  .min(1, 'D&D edition cannot be empty')
  .max(50, 'D&D edition cannot exceed 50 characters')
  .trim()
  .default('5th Edition');

/**
 * Experience level schema - player's experience with D&D
 * Enum: new, beginner, intermediate, experienced, veteran
 */
export const experienceLevelSchema = z.enum(
  ['new', 'beginner', 'intermediate', 'experienced', 'veteran'],
  { message: 'Invalid experience level' }
);

/**
 * Primary role schema - whether user is a DM, player, or both
 * Enum: dm, player, both
 */
export const primaryRoleSchema = z.enum(['dm', 'player', 'both'], {
  message: 'Invalid primary role'
});

// ========================================
// Profile Setup Schema (NEW)
// ========================================

/**
 * Profile setup schema for first-time user onboarding
 * All fields are optional to support skip functionality
 */
export const profileSetupSchema = z.object({
  displayName: z.preprocess(
    preprocessOptional,
    z.string().max(100, 'Display name cannot exceed 100 characters').trim().optional()
  ),
  timezone: z.string().default('UTC'),
  dndEdition: dndEditionSchema,
  experienceLevel: z.preprocess(preprocessOptional, experienceLevelSchema.optional()),
  primaryRole: z.preprocess(preprocessOptional, primaryRoleSchema.optional()),
});

// ========================================
// User Profile Update Schema (EXTENDED)
// ========================================

/**
 * User profile update schema
 * Includes base user fields + D&D profile fields
 * All fields are optional for partial updates
 */
export const userProfileUpdateSchema = z.object({
  username: createOptionalSchema(usernameSchema),
  firstName: createOptionalSchema(nameSchema),
  lastName: createOptionalSchema(nameSchema),
  email: createOptionalSchema(emailSchema),
  preferences: createOptionalSchema(userPreferencesSchema),
  // D&D profile fields
  displayName: displayNameSchema,
  timezone: createOptionalSchema(z.string()),
  dndEdition: createOptionalSchema(dndEditionSchema),
  experienceLevel: createOptionalSchema(experienceLevelSchema),
  primaryRole: createOptionalSchema(primaryRoleSchema),
});

// ========================================
// Type Exports
// ========================================

export type SubscriptionTier = z.infer<typeof subscriptionTierSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type ExperienceLevel = z.infer<typeof experienceLevelSchema>;
export type PrimaryRole = z.infer<typeof primaryRoleSchema>;
export type ProfileSetup = z.infer<typeof profileSetupSchema>;
export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>;
