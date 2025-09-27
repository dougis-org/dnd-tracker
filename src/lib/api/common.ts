/**
 * Common API utilities to reduce code duplication
 */
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { connectToDatabase } from '@/lib/db/connection'

/**
 * Standard API error responses
 */
export const ApiErrors = {
  unauthorized: () => NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  ),

  badRequest: (message: string) => NextResponse.json(
    { error: message },
    { status: 400 }
  ),

  notFound: (message: string) => NextResponse.json(
    { error: message },
    { status: 404 }
  ),

  internalError: (message = 'Internal server error') => NextResponse.json(
    { error: message },
    { status: 500 }
  ),

  validationError: (message: string) => NextResponse.json(
    { error: `Validation error: ${message}` },
    { status: 400 }
  ),

  methodNotAllowed: () => NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

/**
 * Common authentication and database setup
 */
export async function withAuthAndDb<T>(
  handler: (userId: string) => Promise<T>
): Promise<T | NextResponse> {
  try {
    // Authenticate user
    const { userId } = await auth()

    if (!userId) {
      return ApiErrors.unauthorized()
    }

    // Connect to database
    await connectToDatabase()

    return handler(userId)
  } catch (error) {
    console.error('API Error:', error)
    return ApiErrors.internalError()
  }
}

/**
 * Standard user profile response format
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatUserProfile(user: any) {
  return {
    id: user.id,
    email: user.email,
    profile: user.profile,
    subscription: user.subscription,
    usage: user.usage,
    preferences: user.preferences,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

/**
 * Helper to build update object for profile updates
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildProfileUpdateObject(validatedData: any) {
  const updateObject: Record<string, unknown> = {}
  const { profile, preferences } = validatedData

  if (profile) {
    Object.keys(profile).forEach((key) => {
      const typedKey = key as keyof typeof profile
      if (profile[typedKey] !== undefined) {
        updateObject[`profile.${key}`] = profile[typedKey]
      }
    })
  }

  if (preferences) {
    Object.keys(preferences).forEach((key) => {
      const typedKey = key as keyof typeof preferences
      if (preferences[typedKey] !== undefined) {
        updateObject[`preferences.${key}`] = preferences[typedKey]
      }
    })
  }

  return updateObject
}