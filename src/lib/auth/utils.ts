/**
 * Authentication utility functions
 * Shared helpers for auth-related operations
 */

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

/**
 * Handles redirect logic for authenticated users
 * Redirects based on profile completion status:
 * - Complete profile → /dashboard
 * - Incomplete profile → /profile-setup
 * - Unauthenticated → returns (no redirect)
 */
export async function handleAuthenticatedUserRedirect(): Promise<void> {
  const { userId, sessionClaims } = await auth()

  if (userId) {
    const profileSetupCompleted = Boolean(
      (sessionClaims?.publicMetadata as { profileSetupCompleted?: boolean })
        ?.profileSetupCompleted
    )

    if (profileSetupCompleted) {
      redirect('/dashboard')
    } else {
      redirect('/profile-setup')
    }
  }
}
