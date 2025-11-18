/**
 * Authentication validation schemas
 * Zod schemas for type-safe validation of auth-related data
 */

import { z } from 'zod'

/**
 * Schema for sign-in form submission
 */
export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type SignInFormData = z.infer<typeof signInSchema>

/**
 * Schema for sign-up form submission
 */
export const signUpSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type SignUpFormData = z.infer<typeof signUpSchema>

/**
 * Schema for the API response from GET /api/auth/session
 */
export const sessionResponseSchema = z.object({
  isAuthenticated: z.boolean(),
  user: z
    .object({
      clerkId: z.string(),
      email: z.string(),
      name: z.string().nullable(),
      avatarUrl: z.string().nullable(),
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
    })
    .nullable(),
})

export type SessionResponse = z.infer<typeof sessionResponseSchema>

/**
 * Schema for the API response from POST /api/auth/sign-out
 */
export const signOutResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
})

export type SignOutResponse = z.infer<typeof signOutResponseSchema>

/**
 * Schema for auth error responses
 */
export const authErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  message: z.string().optional(),
})

export type AuthErrorResponse = z.infer<typeof authErrorSchema>
