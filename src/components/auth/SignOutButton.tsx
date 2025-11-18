'use client'

/**
 * SignOutButton Component
 * Provides a button to sign out the authenticated user
 * Calls both client-side Clerk sign-out and server-side session clear
 */

import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface SignOutButtonProps {
  className?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function SignOutButton({
  className,
  variant = 'ghost',
  size = 'sm',
}: SignOutButtonProps) {
  const { signOut } = useClerk()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsLoading(true)

      // Call server-side sign-out endpoint to clear session
      try {
        await fetch('/api/auth/sign-out', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      } catch (error) {
        console.error('Error calling server sign-out endpoint:', error)
        // Continue with client-side sign-out even if server call fails
      }

      // Sign out using Clerk client SDK
      await signOut({ redirectUrl: '/' })

      // Ensure we redirect to home page
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSignOut}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </Button>
  )
}
