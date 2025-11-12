/**
 * Error Formatting Utilities
 * Provides error message formatting and extraction
 * Handles Zod validation errors and custom error strings
 */

/**
 * Extract error messages from Zod fieldErrors object
 * Assumes object has fieldErrors property with Record<string, string[]> value
 */
function extractFieldErrors(fieldErrors: unknown): Record<string, string> {
  if (typeof fieldErrors !== 'object' || fieldErrors === null) {
    return {};
  }

  const result: Record<string, string> = {};

  Object.entries(fieldErrors).forEach(([field, messages]) => {
    if (Array.isArray(messages) && messages.length > 0 && typeof messages[0] === 'string') {
      result[field] = messages[0]; // Take first error message
    }
  });

  return result;
}

/**
 * Check if object has fieldErrors property
 */
function isZodFlattenedError(error: unknown): error is { fieldErrors: unknown } {
  return typeof error === 'object' && error !== null && 'fieldErrors' in error;
}

/**
 * Format error messages for display
 * Handles both Zod validation errors and simple error strings
 * Always returns Record<string, string> for consistency
 *
 * @param error - Error object or string to format
 * @returns Formatted error record - field errors or general error under 'general' key
 *
 * @example
 * // Zod error
 * formatErrorMessage({
 *   fieldErrors: {
 *     email: ['Invalid email'],
 *     name: ['Required']
 *   }
 * })
 * // Returns: { email: 'Invalid email', name: 'Required' }
 *
 * @example
 * // String error
 * formatErrorMessage('Network failed')
 * // Returns: { general: 'Network failed' }
 */
export function formatErrorMessage(error: unknown): Record<string, string> {
  // Handle simple string errors - place under 'general' key
  if (typeof error === 'string') {
    return { general: error };
  }

  // Handle Zod flattened errors
  if (isZodFlattenedError(error)) {
    return extractFieldErrors(error.fieldErrors);
  }

  // Fallback for unknown error type
  return { general: 'An error occurred' };
}

/**
 * Extract the first error message from an error object
 * Useful for displaying a single error message
 *
 * @param error - Error object or string
 * @returns First available error message or null
 */
export function getFirstErrorMessage(error: unknown): string | null {
  if (typeof error === 'string') {
    return error;
  }

  if (isZodFlattenedError(error)) {
    const fieldErrors = extractFieldErrors(error.fieldErrors);
    const messages = Object.values(fieldErrors);
    return messages.length > 0 ? messages[0] : null;
  }

  return null;
}
