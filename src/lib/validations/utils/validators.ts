/**
 * Validation utility functions with error handling
 * Extracted from auth.ts to reduce complexity
 */
import { z } from 'zod'
import { SessionTokenSchema } from '../schemas/user'
import { ProfileUpdateSchema } from '../schemas/profile'
import { UserCreationSchema } from '../schemas/user'
import { UsageLimitSchema } from './tierLimits'

/**
 * Generic validation result type
 */
type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: z.ZodError }

/**
 * Generic validation function to reduce code duplication
 */
function validateWithSchema<T extends z.ZodType>(schema: T, data: unknown): ValidationResult<z.infer<T>> {
  try {
    return {
      success: true as const,
      data: schema.parse(data),
    }
  } catch (error) {
    return {
      success: false as const,
      error: error as z.ZodError,
    }
  }
}

/**
 * Validate session token data
 */
export function validateSessionToken(data: unknown): ValidationResult<z.infer<typeof SessionTokenSchema>> {
  return validateWithSchema(SessionTokenSchema, data)
}

/**
 * Validate profile update data
 */
export function validateProfileUpdate(data: unknown): ValidationResult<z.infer<typeof ProfileUpdateSchema>> {
  return validateWithSchema(ProfileUpdateSchema, data)
}

/**
 * Validate user creation data
 */
export function validateUserCreation(data: unknown): ValidationResult<z.infer<typeof UserCreationSchema>> {
  return validateWithSchema(UserCreationSchema, data)
}

/**
 * Validate usage limits data
 */
export function validateUsageLimits(data: unknown): ValidationResult<z.infer<typeof UsageLimitSchema>> {
  return validateWithSchema(UsageLimitSchema, data)
}