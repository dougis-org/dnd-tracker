import { z } from 'zod';
import {
  updateUserProfileSchema,
  updateUserPreferencesSchema,
} from '@/lib/schemas/userSchema';

/**
 * Parse and validate email address
 * - Trims whitespace
 * - Lowercases the email
 * - Validates RFC 5322 format
 */
export function parseEmail(email: string) {
  const trimmed = email.trim().toLowerCase();
  const result = z.string().email('Invalid email address').safeParse(trimmed);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: result.error.issues[0]?.message || 'Invalid email',
  };
}

/**
 * Validate user name
 * - Trims whitespace
 * - Checks 1-100 character range
 * - Allows Unicode characters
 */
export function validateName(name: string) {
  const trimmed = name.trim();
  const result = z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .safeParse(trimmed);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: result.error.issues[0]?.message || 'Invalid name',
  };
}

/**
 * Validate D&D preferences
 * - Checks all enum values are valid
 * - Validates against allowed experience levels, roles, rulesets
 */
export function validatePreferences(prefs: {
  experienceLevel: string;
  preferredRole: string;
  ruleset: string;
}) {
  const preferencesSchema = z.object({
    experienceLevel: z.enum(['Novice', 'Intermediate', 'Advanced']),
    preferredRole: z.enum(['DM', 'Player', 'Both']),
    ruleset: z.enum(['5e', '3.5e', 'PF2e']),
  });

  const result = preferencesSchema.safeParse(prefs);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Extract first error message
  const firstIssue = result.error.issues[0];
  const errorMessage = firstIssue?.message || 'Invalid preference values';

  return {
    success: false,
    error: errorMessage,
    details: result.error.flatten(),
  };
}

/**
 * Validate notification settings (all boolean values)
 */
export function validateNotifications(settings: Record<string, unknown>) {
  const schema = z.object({
    emailNotifications: z.boolean(),
    partyUpdates: z.boolean(),
    encounterReminders: z.boolean(),
  });

  const result = schema.safeParse(settings);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: 'Invalid notification settings',
    details: result.error.flatten(),
  };
}

/**
 * Format validation errors for display
 * Converts Zod error details to user-friendly field error messages
 */
export function formatValidationErrors(error: unknown): Record<string, string> {
  if (!error || typeof error !== 'object') {
    return {};
  }

  const errorObj = error as Record<string, unknown>;
  if (!errorObj.fieldErrors || typeof errorObj.fieldErrors !== 'object') {
    return {};
  }

  const formatted: Record<string, string> = {};
  Object.entries(errorObj.fieldErrors).forEach(([field, messages]) => {
    if (Array.isArray(messages) && messages.length > 0 && typeof messages[0] === 'string') {
      formatted[field] = messages[0];
    }
  });

  return formatted;
}

/**
 * Validate profile data for update
 * Used to check form data before submission
 */
export function validateProfileUpdate(data: unknown) {
  const result = updateUserProfileSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: 'Invalid profile data',
    details: result.error.flatten(),
  };
}

/**
 * Validate preferences data for update
 */
export function validatePreferencesUpdate(data: unknown) {
  const result = updateUserPreferencesSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: 'Invalid preferences data',
    details: result.error.flatten(),
  };
}
