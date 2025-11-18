'use client'

/**
 * Sign-In Page
 * Powered by Clerk's prebuilt SignIn component
 * Users can sign in with email/password or social providers
 */

import { SignIn } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('return_to')

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
          redirectUrl={returnTo || '/'}
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  )
}
