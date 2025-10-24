import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  // Note: Authenticated user redirects are handled in middleware (src/middleware.ts:34-42)
  // to prevent the Clerk component from rendering for authenticated users

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
