'use client'

/**
 * Sign-In Page
 * Powered by Clerk's prebuilt SignIn component
 * Users can sign in with email/password or social providers
 */

import { SignIn } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { mockAuthEnabledClient } from '@/lib/auth/authConfig'
import { setMockAuthState } from '@/lib/auth/mockAuthClient'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const redirectUrl =
    searchParams.get('redirect_url') || searchParams.get('return_to') || '/'

  if (mockAuthEnabledClient) {
    const handleMockSignIn = () => {
      setMockAuthState('signed-in')
      router.push(redirectUrl)
      router.refresh()
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-4 rounded-lg border border-border bg-card p-6 shadow-lg">
          <h1 className="text-center text-3xl font-bold">Mock Sign In</h1>
          <p className="text-center text-muted-foreground">
            Mock authentication is enabled. Continue as the default demo user to
            explore protected areas of the app.
          </p>
          <Button
            className="w-full"
            size="lg"
            data-testid="mock-sign-in-button"
            onClick={handleMockSignIn}
          >
            Continue as Mock User
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            You&apos;ll be redirected to {redirectUrl}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-3xl font-bold">Sign In</h1>
        <SignIn
          appearance={{
            baseTheme: undefined,
            elements: {
              rootBox: 'w-full',
              card: 'shadow-lg rounded-lg border border-border',
              socialButtonsBlockButton:
                'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border',
              dividerLine: 'bg-border',
              dividerText: 'text-muted-foreground',
              formButtonPrimary:
                'bg-primary text-primary-foreground hover:bg-primary/90 h-10',
              footerActionLink: 'text-primary hover:text-primary/80',
              headerTitle: 'text-foreground',
              headerSubtitle: 'text-muted-foreground',
              formFieldInput:
                'bg-background border border-input text-foreground rounded-md',
              formFieldLabel: 'text-foreground',
              formFieldWarningText: 'text-destructive',
              identifierInputField:
                'bg-background border border-input text-foreground rounded-md',
              passwordInputField:
                'bg-background border border-input text-foreground rounded-md',
              socialProvider:
                'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            },
          }}
          redirectUrl={redirectUrl}
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  )
}
