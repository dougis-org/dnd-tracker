import { SignIn } from '@clerk/nextjs'
import { handleAuthenticatedUserRedirect } from '@/lib/auth/utils'

export default async function SignInPage() {
  // Redirect authenticated users based on profile status
  await handleAuthenticatedUserRedirect()

  return (
    <div className="flex items-center justify-center">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  )
}
