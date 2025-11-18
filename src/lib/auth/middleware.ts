/**
 * Authentication middleware utilities
 * Helper functions for route protection, session checks, and redirect logic
 */

import { auth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import type { ProtectedRouteConfig } from '@/types/auth'

/**
 * List of routes that require authentication
 * Can be customized per environment or feature flag
 */
export const protectedRoutes: ProtectedRouteConfig = {
  protectedRoutes: ['/dashboard', '/subscription', '/profile'],
  signInUrl: '/sign-in',
  afterSignInUrl: '/dashboard',
}

/**
 * Checks if a given pathname requires authentication
 * @param pathname - The request path to check
 * @returns true if the route is protected
 */
export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.protectedRoutes.some((route) =>
    pathname.startsWith(route),
  )
}

/**
 * Extracts and validates a return URL from query parameters
 * Ensures the URL is safe and doesn't create redirect loops
 * @param returnUrl - The return URL to validate
 * @returns The validated return URL, or null if invalid
 */
export function validateReturnUrl(returnUrl?: string | null): string | null {
  if (!returnUrl) return null

  // Reject absolute URLs to other domains
  if (returnUrl.startsWith('http://') || returnUrl.startsWith('https://')) {
    return null
  }

  // Reject sign-in/sign-up URLs to prevent loops
  if (
    returnUrl.startsWith('/sign-in') ||
    returnUrl.startsWith('/sign-up') ||
    returnUrl === '/'
  ) {
    return null
  }

  // Ensure the URL is a valid path
  if (!returnUrl.startsWith('/')) {
    return null
  }

  return returnUrl
}

/**
 * Builds a redirect URL to the sign-in page with optional return path
 * @param returnUrl - The URL to return to after sign-in (optional)
 * @returns The full sign-in redirect URL
 */
export function buildSignInRedirect(returnUrl?: string | null): string {
  const validatedReturnUrl = validateReturnUrl(returnUrl)
  const base = protectedRoutes.signInUrl

  if (validatedReturnUrl) {
    return `${base}?return_to=${encodeURIComponent(validatedReturnUrl)}`
  }

  return base
}

/**
 * Extracts the authenticated user session from the request
 * Server-side function using Clerk's auth() API
 * @returns User session or null if not authenticated
 */
export async function getAuthSession() {
  try {
    const session = await auth()
    return session
  } catch (error) {
    console.error('Error getting auth session:', error)
    return null
  }
}

/**
 * Checks if a request is authenticated
 * Useful in middleware or API route context
 * @returns true if the user is authenticated
 */
export async function isRequestAuthenticated(): Promise<boolean> {
  try {
    const session = await auth()
    return !!session?.userId
  } catch {
    return false
  }
}

/**
 * Gets the current user's ID from the request
 * @returns The Clerk user ID or null if not authenticated
 */
export async function getUserIdFromRequest(): Promise<string | null> {
  try {
    const session = await auth()
    return session?.userId || null
  } catch {
    return null
  }
}
