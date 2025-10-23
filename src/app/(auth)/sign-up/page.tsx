import { SignUp } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function SignUpPage() {
  const { userId, sessionClaims } = await auth()

  // If user is already signed in, redirect them based on profile status
  if (userId) {
    const profileSetupCompleted =
      (sessionClaims?.publicMetadata as { profileSetupCompleted?: boolean })
        ?.profileSetupCompleted ?? false

    if (profileSetupCompleted) {
      redirect('/dashboard')
    } else {
      redirect('/profile-setup')
    }
  }

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
