import { z } from 'zod';
import {
  updateUserProfileSchema,
  updateUserPreferencesSchema,
  updateNotificationSettingsSchema,
} from '@/lib/schemas/userSchema';
import { formatErrorMessage } from '@/lib/utils/profileFormHelpers';

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
 * Uses updateUserPreferencesSchema to ensure consistency with base schema
 */
export function validatePreferences(prefs: {
  experienceLevel: string;
  preferredRole: string;
  ruleset: string;
}) {
  const result = updateUserPreferencesSchema.safeParse(prefs);

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
 * Uses updateNotificationSettingsSchema to ensure consistency with base schema
 */
export function validateNotifications(settings: Record<string, unknown>) {
  const result = updateNotificationSettingsSchema.safeParse(settings);

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
 * Wrapper around formatErrorMessage from profileFormHelpers for backward compatibility
 * Converts Zod error details to user-friendly field error messages
 */
export function formatValidationErrors(error: unknown): Record<string, string> {
  const formatted = formatErrorMessage(error);

  // formatErrorMessage returns string | Record<string, string>
  // formatValidationErrors expects Record<string, string>, so convert if needed
  return typeof formatted === 'string' ? {} : formatted;
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
