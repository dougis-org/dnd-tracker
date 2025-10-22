'use client'

import Link from 'next/link'
import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@clerk/nextjs'

export function SiteHeader() {
  const { isSignedIn } = useAuth()

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-dragon-red" />
            <div>
              <h1 className="text-xl font-bold text-foreground">
                D&D Tracker
              </h1>
              <p className="text-xs text-muted-foreground">
                Encounter Manager
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard">
                    Dashboard
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/settings/profile">
                    Profile
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/sign-in">
                    Sign In
                  </Link>
                </Button>
                <Button variant="dragon" size="sm" asChild>
                  <Link href="/sign-up">
                    Get Started
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
