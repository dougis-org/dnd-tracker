/**
 * Form Helper Utilities
 * Provides optimistic update logic, error handling, and form state management
 * Used by ProfileForm and settings components
 */

/**
 * Apply optimistic update to form data
 * Updates a field immediately without waiting for server confirmation
 */
export function applyOptimisticUpdate<T extends Record<string, unknown>>(
  state: T,
  field: keyof T,
  value: unknown
): T {
  return {
    ...state,
    [field]: value,
  };
}

/**
 * Revert optimistic update when save fails
 * Restores form to previous state
 */
export function revertOptimisticUpdate<T extends Record<string, unknown>>(
  currentState: T,
  previousState: T
): T {
  return previousState;
}

/**
 * Format error messages for display
 * Handles both Zod validation errors and simple error strings
 */
export function formatErrorMessage(error: unknown): Record<string, string> | string {
  // If it's a simple string error
  if (typeof error === 'string') {
    return error;
  }

  // If it's a Zod flattened error with fieldErrors
  if (error && typeof error === 'object' && 'fieldErrors' in error) {
    const errorObj = error as Record<string, unknown>;
    const formatted: Record<string, string> = {};

    if (typeof errorObj.fieldErrors === 'object' && errorObj.fieldErrors !== null) {
      Object.entries(errorObj.fieldErrors).forEach(([field, messages]) => {
        if (Array.isArray(messages) && messages.length > 0 && typeof messages[0] === 'string') {
          formatted[field] = messages[0]; // Take first error message
        }
      });
    }

    return formatted;
  }

  // Fallback
  return { general: 'An error occurred' };
}

/**
 * Form state tracking
 * Tracks dirty state, saving state, and error state
 */
export interface FormState<T> {
  data: T;
  isDirty: boolean;
  isSaving: boolean;
  error: string | null;
}

/**
 * Create initial form state
 */
export function createFormState<T extends Record<string, unknown>>(data: T): FormState<T> {
  return {
    data,
    isDirty: false,
    isSaving: false,
    error: null,
  };
}

/**
 * Update form field and mark as dirty
 */
export function updateFormField<T extends Record<string, unknown>>(
  state: FormState<T>,
  field: keyof T,
  value: unknown
): FormState<T> {
  return {
    ...state,
    data: {
      ...state.data,
      [field]: value,
    },
    isDirty: true, // Mark form as changed
  };
}

/**
 * Mark form as saving
 */
export function markSaving<T>(state: FormState<T>): FormState<T> {
  return {
    ...state,
    isSaving: true,
    error: null, // Clear previous errors
  };
}

/**
 * Mark save as successful
 */
export function markSaveSuccess<T extends Record<string, unknown>>(
  state: FormState<T>,
  newData: T
): FormState<T> {
  return {
    ...state,
    data: newData,
    isDirty: false,
    isSaving: false,
    error: null,
  };
}

/**
 * Mark save as failed with error message
 */
export function markSaveError<T extends Record<string, unknown>>(
  state: FormState<T>,
  error: string,
  revertTo?: T
): FormState<T> {
  return {
    ...state,
    data: revertTo || state.data, // Optionally revert form data
    isSaving: false,
    error,
  };
}

/**
 * Reset form to initial state
 */
export function resetForm<T extends Record<string, unknown>>(
  state: FormState<T>,
  originalData: T
): FormState<T> {
  return {
    data: originalData,
    isDirty: false,
    isSaving: false,
    error: null,
  };
}

/**
 * Extract field errors for specific field
 */
export function getFieldError(
  errors: Record<string, string> | string | null,
  field: string
): string | null {
  if (!errors) return null;
  if (typeof errors === 'string') return null;
  return errors[field] || null;
}

/**
 * Check if form is ready to save
 * Valid if no errors and has changed
 */
export function isFormValid<T>(state: FormState<T>, errors: Record<string, unknown>): boolean {
  if (state.isSaving || !state.isDirty) return false;

  // Check if there are any errors
  const hasErrors =
    typeof errors === 'object' &&
    Object.keys(errors).length > 0 &&
    Object.values(errors).some((err) => err !== null && err !== undefined);

  return !hasErrors;
}

/**
 * Get all validation errors from form state
 * Useful for displaying error summary
 */
export function getValidationSummary(errors: Record<string, string> | string): string {
  if (typeof errors === 'string') return errors;

  const errorList = Object.values(errors).filter((err) => err !== null && err !== undefined);

  return errorList.length > 0 ? errorList[0] : 'Please fix the errors above';
}
