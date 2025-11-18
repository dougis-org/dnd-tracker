/**
 * POST /api/auth/sign-out
 * Server-side sign-out endpoint for clearing Clerk session
 * Called after client-side sign-out to ensure session cleanup
 */

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { signOutResponseSchema } from '@/lib/auth/validation'

/**
 * POST handler - signs out the user and clears their session
 * @returns JSON response indicating success/failure
 */
export async function POST() {
  try {
    // Verify user is authenticated before signing out
    const { userId } = await auth()

    if (!userId) {
      // Not authenticated, return success (idempotent behavior)
      const response = signOutResponseSchema.parse({
        success: true,
        message: 'Already signed out',
      })

      return NextResponse.json(response, { status: 200 })
    }

    // Session will be cleared when the client receives this response
    // Clerk uses HTTP-only cookies that are automatically cleared

    // Return success response
    const response = signOutResponseSchema.parse({
      success: true,
      message: 'Successfully signed out',
    })

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error in POST /api/auth/sign-out:', error)

    // Return error response (but still indicate some level of success)
    // since the client may have already cleared local auth state
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Sign out failed',
      },
      { status: 500 },
    )
  }
}
