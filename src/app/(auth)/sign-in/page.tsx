import { SignIn } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function SignInPage() {
  const { userId } = await auth()

  // Redirect signed-in users to dashboard
  if (userId) {
    redirect('/dashboard')
  }

  return (
    <div className="flex items-center justify-center">
      <SignIn />
    </div>
  )
}
