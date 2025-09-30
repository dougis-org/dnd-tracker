/**
 * Validation utility functions with error handling
 * Simple validation functions with minimal complexity
 */
import { z } from 'zod'
import { SessionTokenSchema } from '../schemas/user'
import { ProfileUpdateSchema } from '../schemas/profile'
import { UserCreationSchema } from '../schemas/user'
import { UsageLimitSchema } from './tierLimits'

/**
 * Generic validation result type
 * Simple result type for validation functions
 */
type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: z.ZodError }

/**
 * Generic validation function
 * Simple wrapper to reduce code duplication
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
 * Simple session token validation
 */
export function validateSessionToken(data: unknown): ValidationResult<z.infer<typeof SessionTokenSchema>> {
  return validateWithSchema(SessionTokenSchema, data)
}

/**
 * Validate profile update data
 * Simple profile update validation
 */
export function validateProfileUpdate(data: unknown): ValidationResult<z.infer<typeof ProfileUpdateSchema>> {
  return validateWithSchema(ProfileUpdateSchema, data)
}

/**
 * Validate user creation data
 * Simple user creation validation
 */
export function validateUserCreation(data: unknown): ValidationResult<z.infer<typeof UserCreationSchema>> {
  return validateWithSchema(UserCreationSchema, data)
}

/**
 * Validate usage limits data
 * Simple usage limits validation
 */
export function validateUsageLimits(data: unknown): ValidationResult<z.infer<typeof UsageLimitSchema>> {
  return validateWithSchema(UsageLimitSchema, data)
}