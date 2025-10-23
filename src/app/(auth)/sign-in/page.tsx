import { SignIn } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function SignInPage() {
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
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  )
}
