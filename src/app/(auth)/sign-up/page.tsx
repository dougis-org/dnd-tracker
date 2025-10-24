import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  // Note: Authenticated user redirects are handled in middleware (src/middleware.ts:34-42)
  // to prevent the Clerk component from rendering for authenticated users

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
