import { SignUp } from '@clerk/nextjs'
import { handleAuthenticatedUserRedirect } from '@/lib/auth/utils'

export default async function SignUpPage() {
  // Redirect authenticated users based on profile status
  await handleAuthenticatedUserRedirect()

  return (
    <div className="flex items-center justify-center">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/profile-setup"
      />
    </div>
  )
}
