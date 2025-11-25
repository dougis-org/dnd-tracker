'use client'

/**
 * Protected Route Guard Component
 * Replaces middleware-based route protection with client-side Clerk integration
 * Redirects unauthenticated users to sign-in page
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/useAuth'

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
  const session = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (session.isLoading) return

    if (!session.isAuthenticated) {
      const redirectUrl = `/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`
      router.replace(redirectUrl)
      return
    }

    if (requiredRole) {
      console.warn('Role-based access control not yet implemented')
    }
  }, [session.isLoading, session.isAuthenticated, router, requiredRole])

  if (session.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!session.isAuthenticated) {
    return null
  }

  return <>{children}</>
}
