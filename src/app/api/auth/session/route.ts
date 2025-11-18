/**
 * GET /api/auth/session
 * Returns the authenticated user's session and profile information
 * Server-side endpoint for integration tests and SSR pages
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { sessionResponseSchema } from '@/lib/auth/validation';
import type { UserProfile } from '@/types/auth';

/**
 * GET handler - returns current user session
 * @returns JSON response with user profile and authentication status
 */
export async function GET() {
  try {
    // Get the authenticated session from Clerk
    const { userId } = await auth();

    // If not authenticated, return minimal response
    if (!userId) {
      const response = {
        isAuthenticated: false,
        user: null,
      };

      return NextResponse.json(response, { status: 200 });
    }

    // Build a minimal user profile from the auth session
    // Note: For full user details, you would need to call Clerk's API
    // For now, we provide a basic profile with the user ID
    const userProfile: UserProfile = {
      clerkId: userId,
      email: '', // Would need additional API call to get email
      name: null,
      avatarUrl: null,
      firstName: null,
      lastName: null,
    };

    // Validate response against schema
    const response = sessionResponseSchema.parse({
      isAuthenticated: true,
      user: userProfile,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/auth/session:', error);

    // Return error response
    return NextResponse.json(
      {
        error: 'Failed to retrieve session',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
