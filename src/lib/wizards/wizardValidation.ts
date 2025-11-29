/**
 * Wizard Validation Schemas
 *
 * Zod schema definitions for wizard form validation.
 * Used to validate user input at both client and server side.
 */

import { z } from 'zod';
import { DISPLAY_NAME_CONSTRAINTS, AVATAR_CONSTRAINTS } from './constants';

/**
 * Display name validation schema
 * - Required, non-empty after trim
 * - 1-50 characters
 */
export const displayNameSchema = z
  .string()
  .min(1, { message: 'Display name is required' })
  .max(DISPLAY_NAME_CONSTRAINTS.MAX_LENGTH, {
    message: `Display name must be ${DISPLAY_NAME_CONSTRAINTS.MAX_LENGTH} characters or less`,
  })
  .trim();

/**
 * Theme preference validation schema
 * - Required
 * - Must be 'light' or 'dark'
 */
export const themeSchema = z.enum(['light', 'dark']);

/**
 * Preferences validation schema
 * - theme: enum (light|dark)
 * - notifications: boolean
 */
export const preferencesSchema = z.object({
  theme: themeSchema,
  notifications: z.boolean({
    message: 'Notifications preference must be a boolean',
  }),
});

/**
 * Avatar base64 validation schema
 * - Optional
 * - Must start with 'data:image/'
 * - Max size: 250KB (enforced via length)
 */
export const avatarSchema = z
  .string()
  .startsWith('data:image/', {
    message: 'Avatar must be a valid base64-encoded image',
  })
  .refine(
    (avatar) => {
      // Calculate base64 size in bytes
      const base64Part = avatar.split(',')[1] || '';
      const sizeBytes = Math.ceil((base64Part.length * 3) / 4);
      return sizeBytes <= AVATAR_CONSTRAINTS.MAX_BASE64_SIZE_BYTES;
    },
    {
      message: `Avatar base64 must be ${AVATAR_CONSTRAINTS.MAX_BASE64_SIZE_KB}KB or less`,
    }
  )
  .optional();

/**
 * Profile setup form validation schema
 * - displayName: required, 1-50 chars
 * - avatar: optional, base64 image, ≤250KB
 * - preferences: required, theme + notifications
 * - completedSetup: required, boolean
 */
export const profileSetupSchema = z.object({
  displayName: displayNameSchema,
  avatar: avatarSchema,
  preferences: preferencesSchema,
  completedSetup: z.boolean({
    message: 'Setup completion status must be a boolean',
  }),
});

/**
 * Partial profile update schema (for intermediate saves)
 * - All fields optional
 */
export const profileUpdateSchema = profileSetupSchema.partial();

/**
 * Format validation errors for user display
 *
 * @param error - Zod validation error
 * @returns Human-readable error message
 */
export function wizardValidationError(error: z.ZodError | undefined): string {
  if (!error) return 'Validation error';

  const issues = error.issues;
  if (issues.length === 0) return 'Validation error';

  // Get first error for display
  const firstError = issues[0];
  const field = firstError.path.join('.');
  
  // Prefer custom message if available
  if (firstError.message) {
    return firstError.message;
  }

  // Fall back to generic message with field name
  return `Invalid ${field}`;
}

/**
 * Validate display name
 *
 * @param name - Display name to validate
 * @returns Validation result with error if invalid
 */
export function validateDisplayName(name: string): { isValid: boolean; error?: string } {
  const result = displayNameSchema.safeParse(name);
  if (result.success) {
    return { isValid: true };
  }
  return {
    isValid: false,
    error: wizardValidationError(result.error),
  };
}

/**
 * Validate preferences
 *
 * @param preferences - Preferences object to validate
 * @returns Validation result with error if invalid
 */
export function validatePreferences(preferences: unknown): { isValid: boolean; error?: string } {
  const result = preferencesSchema.safeParse(preferences);
  if (result.success) {
    return { isValid: true };
  }
  return {
    isValid: false,
    error: wizardValidationError(result.error),
  };
}

/**
 * Validate avatar
 *
 * @param avatar - Base64 avatar string to validate
 * @returns Validation result with error if invalid
 */
export function validateAvatar(avatar: string | undefined): { isValid: boolean; error?: string } {
  if (!avatar) {
    return { isValid: true }; // Avatar is optional
  }

  const result = avatarSchema.safeParse(avatar);
  if (result.success) {
    return { isValid: true };
  }
  return {
    isValid: false,
    error: wizardValidationError(result.error),
  };
}

/**
 * Validate complete profile setup
 *
 * @param profile - Profile setup data to validate
 * @returns Validation result with full error details
 */
export function validateProfileSetup(profile: unknown):
  | { isValid: true; data: z.infer<typeof profileSetupSchema> }
  | { isValid: false; error: string; issues: z.ZodIssue[] } {
  const result = profileSetupSchema.safeParse(profile);

  if (result.success) {
    return { isValid: true, data: result.data };
  }

  return {
    isValid: false,
    error: wizardValidationError(result.error),
    issues: result.error.issues,
  };
}

/**
 * Type exports for runtime validation
 */
export type ValidatedProfile = z.infer<typeof profileSetupSchema>;
export type ValidatedPreferences = z.infer<typeof preferencesSchema>;
export type ValidatedTheme = z.infer<typeof themeSchema>;
