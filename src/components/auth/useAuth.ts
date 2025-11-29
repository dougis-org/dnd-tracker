'use client'

/**
 * useAuth client-side hook
 * Provides access to the authenticated user's session and auth state
 * Built on Clerk's useAuth() hook with additional helpers
 */

import { useEffect, useState } from 'react'
import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs'
import { mockAuthEnabledClient, MOCK_AUTH_EVENT_NAME } from '@/lib/auth/authConfig'
import { readMockSessionFromStorage } from '@/lib/auth/mockSession'
import type { Session, UserProfile } from '@/types/auth'

/**
 * Transform Clerk user to UserProfile type
 */
function transformClerkUserToProfile(clerkUser: ReturnType<typeof useUser>['user']): UserProfile | null {
  if (!clerkUser) return null

  return {
    clerkId: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
    name: clerkUser.fullName || null,
    avatarUrl: clerkUser.imageUrl || null,
    firstName: clerkUser.firstName || null,
    lastName: clerkUser.lastName || null,
  }
}

function useMockAuthSession(): Session {
  const [session, setSession] = useState<Session>(() => readMockSessionFromStorage())

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleChange = () => {
      setSession(readMockSessionFromStorage())
    }

    window.addEventListener('storage', handleChange)
    window.addEventListener(MOCK_AUTH_EVENT_NAME, handleChange)

    // Sync state immediately in case storage was updated during component mount
    handleChange()

    return () => {
      window.removeEventListener('storage', handleChange)
      window.removeEventListener(MOCK_AUTH_EVENT_NAME, handleChange)
    }
  }, [])

  return session
}

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
  if (mockAuthEnabledClient) {
    return useMockAuthSession()
  }

  const clerkAuth = useClerkAuth()
  const { user: clerkUser, isLoaded } = useUser()

  return {
    isAuthenticated: !!clerkAuth?.userId,
    user: clerkAuth?.userId ? transformClerkUserToProfile(clerkUser) : null,
    isLoading: !isLoaded,
  }
}

/**
 * Hook to check if the user is authenticated (simpler alternative to useAuth)
 * @returns {boolean} true if the user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth()
  return isAuthenticated
}

/**
 * Hook to get the current authenticated user (simpler alternative to useAuth)
 * @returns {UserProfile | null} The current user profile or null if not authenticated
 */
export function useCurrentUser(): UserProfile | null {
  const { user } = useAuth()
  return user
}
