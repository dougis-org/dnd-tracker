/**
 * Authentication type definitions
 * Provides TypeScript interfaces for user profiles, sessions, and auth state
 */

/**
 * UserProfile represents a Clerk-authenticated user's public profile
 */
export interface UserProfile {
  /** Unique Clerk user ID */
  clerkId: string
  /** User's email address */
  email: string
  /** User's full name (if provided) */
  name: string | null
  /** User's avatar/profile picture URL */
  avatarUrl: string | null
  /** User's first name */
  firstName: string | null
  /** User's last name */
  lastName: string | null
}

/**
 * Session represents a lightweight authenticated session
 * This is distinct from secure HTTP-only cookies managed by Clerk
 */
export interface Session {
  /** Whether the user is currently authenticated */
  isAuthenticated: boolean
  /** The authenticated user's profile (null if not authenticated) */
  user: UserProfile | null
  /** Whether the session is loading */
  isLoading: boolean
}

/**
 * AuthError represents an authentication-related error
 */
export interface AuthError {
  /** Error code (e.g., 'invalid_credentials', 'session_expired') */
  code: string
  /** Human-readable error message */
  message: string
}

/**
 * ProtectedRouteConfig defines which routes require authentication
 */
export interface ProtectedRouteConfig {
  /** Array of route patterns that require authentication */
  protectedRoutes: string[]
  /** URL to redirect unauthenticated users to */
  signInUrl: string
  /** URL to redirect to after successful sign-in (can be overridden by return path) */
  afterSignInUrl: string
}
