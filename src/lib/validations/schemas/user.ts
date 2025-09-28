/**
 * User creation and response validation schemas
 * Extracted from auth.ts to reduce complexity
 */
import { z } from 'zod'
import {
  DndRulesetSchema,
  ExperienceLevelSchema,
  UserRoleSchema,
  ThemeSchema,
  InitiativeTypeSchema,
  SubscriptionTierSchema,
  SubscriptionStatusSchema
} from './enums'

/**
 * Session token validation schema
 */
export const SessionTokenSchema = z.object({
  sessionToken: z.string().min(1),
})

/**
 * User creation schema for internal use
 */
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

/**
 * User response schema for API responses
 */
export const UserResponseSchema = UserCreationSchema.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Type exports
export type UserCreation = z.infer<typeof UserCreationSchema>
export type UserResponse = z.infer<typeof UserResponseSchema>