import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import clerkConfig from '@/lib/auth/clerk-config'
import './globals.css'

export const metadata: Metadata = {
  title: 'D&D Encounter Tracker',
  description: 'MVP D&D Encounter Tracker for managing combat sessions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // dynamic prop: Clerk v6 defaults to static rendering; this enables runtime auth
    // Required for middleware-based authentication and session checks to work properly
    <ClerkProvider publishableKey={clerkConfig.publishableKey} dynamic>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}