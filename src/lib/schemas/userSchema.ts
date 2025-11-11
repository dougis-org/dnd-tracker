import { z } from 'zod';

/**
 * User Profile Schema
 * Validates core user account information
 */
export const userProfileSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  email: z.string().email('Invalid email address'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

/**
 * User Preferences Schema
 * Validates D&D preference fields
 */
export const userPreferencesSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  experienceLevel: z.enum(['Novice', 'Intermediate', 'Advanced']),
  preferredRole: z.enum(['DM', 'Player', 'Both']),
  ruleset: z.enum(['5e', '3.5e', 'PF2e']),
  updatedAt: z.coerce.date(),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

/**
 * Notification Settings Schema
 * Validates notification preference toggles
 */
export const notificationSettingsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  emailNotifications: z.boolean(),
  partyUpdates: z.boolean(),
  encounterReminders: z.boolean(),
  updatedAt: z.coerce.date(),
});

export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;

/**
 * Partial Update Schemas
 * For PUT requests where fields are optional and id/userId cannot be updated
 */
export const updateUserProfileSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less').optional(),
    email: z.string().email('Invalid email address').optional(),
  })
  .strict();

export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;

export const updateUserPreferencesSchema = z
  .object({
    experienceLevel: z.enum(['Novice', 'Intermediate', 'Advanced']).optional(),
    preferredRole: z.enum(['DM', 'Player', 'Both']).optional(),
    ruleset: z.enum(['5e', '3.5e', 'PF2e']).optional(),
  })
  .strict();

export type UpdateUserPreferences = z.infer<typeof updateUserPreferencesSchema>;

export const updateNotificationSettingsSchema = z
  .object({
    emailNotifications: z.boolean().optional(),
    partyUpdates: z.boolean().optional(),
    encounterReminders: z.boolean().optional(),
  })
  .strict();

export type UpdateNotificationSettings = z.infer<typeof updateNotificationSettingsSchema>;
