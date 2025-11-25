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
import { mockAuthEnabledClient } from '@/lib/auth/authConfig'
import { setMockAuthState } from '@/lib/auth/mockAuthClient'

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
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  if (mockAuthEnabledClient) {
    const handleMockSignOut = async () => {
      setIsLoading(true)
      setMockAuthState('signed-out')
      router.push('/sign-in')
      router.refresh()
      setIsLoading(false)
    }

    return (
      <Button
        onClick={handleMockSignOut}
        disabled={isLoading}
        variant={variant}
        size={size}
        className={className}
      >
        {isLoading ? 'Signing out...' : 'Sign Out'}
      </Button>
    )
  }

  const { signOut } = useClerk()

  const handleSignOut = async () => {
    try {
      setIsLoading(true)

      try {
        await fetch('/api/auth/sign-out', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      } catch (error) {
        console.error('Error calling server sign-out endpoint:', error)
      }

      await signOut({ redirectUrl: '/' })

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
