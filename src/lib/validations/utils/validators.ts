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
 * Validate session token data
 */
export function validateSessionToken(data: unknown): ValidationResult<z.infer<typeof SessionTokenSchema>> {
  try {
    return {
      success: true as const,
      data: SessionTokenSchema.parse(data),
    }
  } catch (error) {
    return {
      success: false as const,
      error: error as z.ZodError,
    }
  }
}

/**
 * Validate profile update data
 */
export function validateProfileUpdate(data: unknown): ValidationResult<z.infer<typeof ProfileUpdateSchema>> {
  try {
    return {
      success: true as const,
      data: ProfileUpdateSchema.parse(data),
    }
  } catch (error) {
    return {
      success: false as const,
      error: error as z.ZodError,
    }
  }
}

/**
 * Validate user creation data
 */
export function validateUserCreation(data: unknown): ValidationResult<z.infer<typeof UserCreationSchema>> {
  try {
    return {
      success: true as const,
      data: UserCreationSchema.parse(data),
    }
  } catch (error) {
    return {
      success: false as const,
      error: error as z.ZodError,
    }
  }
}

/**
 * Validate usage limits data
 */
export function validateUsageLimits(data: unknown): ValidationResult<z.infer<typeof UsageLimitSchema>> {
  try {
    return {
      success: true as const,
      data: UsageLimitSchema.parse(data),
    }
  } catch (error) {
    return {
      success: false as const,
      error: error as z.ZodError,
    }
  }
}