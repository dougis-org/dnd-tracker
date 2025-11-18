'use client';

/**
 * useAuth client-side hook
 * Provides access to the authenticated user's session and auth state
 * Built on Clerk's useAuth() hook with additional helpers
 */

import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';
import type { Session, UserProfile } from '@/types/auth';

/**
 * Custom useAuth hook that combines Clerk's useAuth and useUser hooks
 * Returns user profile, authentication state, and loading status
 *
 * @returns {Session} Object containing isAuthenticated, user, and isLoading
 *
 * @example
 * const { isAuthenticated, user, isLoading } = useAuth()
 *
 * if (isLoading) return <LoadingSpinner />
 * if (!isAuthenticated) return <SignInPrompt />
 * return <Dashboard username={user.name} />
 */
export function useAuth(): Session {
  // Clerk's hooks are stable and safe to call
  const clerkAuth = useClerkAuth();
  const { user: clerkUser, isLoaded } = useUser();

  // Determine if user is authenticated
  const isAuthenticated = !!clerkAuth?.userId;

  // Transform Clerk user to our UserProfile type
  let userProfile: UserProfile | null = null;

  if (isAuthenticated && clerkUser) {
    userProfile = {
      clerkId: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
      name: clerkUser.fullName || null,
      avatarUrl: clerkUser.imageUrl || null,
      firstName: clerkUser.firstName || null,
      lastName: clerkUser.lastName || null,
    };
  }

  return {
    isAuthenticated,
    user: userProfile,
    isLoading: !isLoaded,
  };
}

/**
 * Hook to check if the user is authenticated (simpler alternative to useAuth)
 * @returns {boolean} true if the user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * Hook to get the current authenticated user (simpler alternative to useAuth)
 * @returns {UserProfile | null} The current user profile or null if not authenticated
 */
export function useCurrentUser(): UserProfile | null {
  const { user } = useAuth();
  return user;
}
