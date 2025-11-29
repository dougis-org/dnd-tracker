'use client'

/**
 * Sign-Up Page
 * Powered by Clerk's prebuilt SignUp component
 * Users can create a new account with email/password or social providers
 */

import { SignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { mockAuthEnabledClient } from '@/lib/auth/authConfig'
import { setMockAuthState } from '@/lib/auth/mockAuthClient'

export default function SignUpPage() {
  const router = useRouter()

  if (mockAuthEnabledClient) {
    const handleMockSignUp = () => {
      setMockAuthState('signed-in')
      router.push('/')
      router.refresh()
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-4 rounded-lg border border-border bg-card p-6 shadow-lg">
          <h1 className="text-center text-3xl font-bold">Create Mock Account</h1>
          <p className="text-center text-muted-foreground">
            Skip the hosted auth provider and explore the app with a demo user.
          </p>
          <Button
            className="w-full"
            size="lg"
            data-testid="mock-sign-up-button"
            onClick={handleMockSignUp}
          >
            Continue to App
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            You can switch back to the real provider by disabling mock auth.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-3xl font-bold">Create Account</h1>
        <SignUp
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
          redirectUrl="/"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  )
}
