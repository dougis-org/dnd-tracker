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

  const performSignOut = async (callback?: () => Promise<void>) => {
    try {
      setIsLoading(true)
      if (callback) {
        await callback()
      }
      router.push('/sign-in')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMockSignOut = () => performSignOut(() => Promise.resolve(setMockAuthState('signed-out')))

  const handleClerkSignOut = async () => {
    const { signOut } = useClerk()
    await performSignOut(async () => {
      try {
        await fetch('/api/auth/sign-out', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      } catch (error) {
        console.error('Error calling server sign-out endpoint:', error)
      }
      await signOut({ redirectUrl: '/' })
    })
  }

  const handleClick = mockAuthEnabledClient ? handleMockSignOut : handleClerkSignOut

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </Button>
  )
}
