'use client'

/**
 * Protected Route Guard Component
 * Replaces middleware-based route protection with client-side Clerk integration
 * Redirects unauthenticated users to sign-in page
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

interface ProtectedRouteGuardProps {
  children: React.ReactNode
  requiredRole?: string
}

/**
 * Wraps pages that require authentication
 * Automatically redirects to /sign-in if not authenticated
 *
 * @example
 * export default function DashboardPage() {
 *   return (
 *     <ProtectedRouteGuard>
 *       <DashboardContent />
 *     </ProtectedRouteGuard>
 *   )
 * }
 */
export function ProtectedRouteGuard({
  children,
  requiredRole,
}: ProtectedRouteGuardProps) {
  const { isLoaded, userId } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait for auth to load
    if (!isLoaded) return

    // Redirect if not authenticated
    if (!userId) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    // TODO: Add role-based access control if needed
    if (requiredRole) {
      // Handle role checking if required
      console.warn('Role-based access control not yet implemented')
    }
  }, [isLoaded, userId, router, requiredRole])

  // Show loading state while auth is being checked
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Don't render children if not authenticated (prevent flash)
  if (!userId) {
    return null
  }

  return <>{children}</>
}
