/**
 * Profile and preferences validation schemas
 * Simple schema definitions with minimal complexity
 */
import { z } from 'zod'
import {
  DndRulesetSchema,
  ExperienceLevelSchema,
  UserRoleSchema,
  ThemeSchema,
  InitiativeTypeSchema
} from './enums'

/**
 * Profile schema for user profile information
 * Simple object schema with optional fields
 */
export const ProfileSchema = z.object({
  displayName: z.string()
    .min(1, 'Display name is required')
    .max(100, 'Display name must be 100 characters or less')
    .trim()
    .optional(),
  dndRuleset: DndRulesetSchema.optional(),
  experienceLevel: ExperienceLevelSchema.optional(),
  role: UserRoleSchema.optional(),
})

/**
 * Preferences schema for user preferences
 * Simple object schema with optional fields
 */
export const PreferencesSchema = z.object({
  theme: ThemeSchema.optional(),
  defaultInitiativeType: InitiativeTypeSchema.optional(),
  autoAdvanceRounds: z.boolean().optional(),
})

/**
 * Profile update schema with validation refinement
 * Simple schema requiring at least one field
 */
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

// Type exports for TypeScript
export type Profile = z.infer<typeof ProfileSchema>
export type Preferences = z.infer<typeof PreferencesSchema>
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>