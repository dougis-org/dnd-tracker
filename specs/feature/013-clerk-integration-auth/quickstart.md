# Quickstart: Clerk Integration & Auth Flow (Feature 013)

**Date**: 2025-11-17 | **Phase**: 1 (Design) | **Status**: Complete

Developer guide for setting up Clerk authentication locally and running the auth flow end-to-end.

---

## Prerequisites

- Node.js 25.1.0+
- npm 9.0+
- Clerk account (free tier: <https://clerk.com>)
- Git SSH configured for repo access

---

## Step 1: Create Clerk Account & Project

### 1.1 Sign Up for Clerk

1. Navigate to [https://clerk.com](https://clerk.com) and sign up with GitHub
2. Create new organization (or use existing if migrating)
3. Create new project: "dnd-tracker"

### 1.2 Choose Authentication Configuration

In Clerk dashboard:

- Select "Email and Password" as primary authentication method
- Enable social providers:
  - **Google OAuth** (recommended for MVP)
  - **GitHub OAuth**
  - **Discord OAuth**

### 1.3 Retrieve API Keys

Navigate to **Clerk Dashboard → API Keys**:

1. Copy **Publishable Key** (starts with `pk_test_` in dev, `pk_live_` in production)
2. Copy **Secret Key** (starts with `sk_test_` in dev, `sk_live_` in production)

Store these securely. You'll use them in Step 3.

---

## Step 2: Configure OAuth Providers

### 2.1 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project (or select existing)
3. Enable OAuth 2.0:
   - Navigate to **APIs & Services → Credentials**
   - Create **OAuth 2.0 Client ID** (Application type: Web application)
   - Add authorized redirect URIs (Clerk will provide these)
4. Copy **Client ID** and **Client Secret**
5. In Clerk dashboard:
   - **Connections → Social → Google**
   - Paste Client ID and Secret
   - Test the connection

**Alternative**: Use Clerk's built-in Google provider (simpler, but less control)

### 2.2 GitHub OAuth Setup

1. Go to [GitHub Settings → Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Create **New OAuth App**:
   - Application name: "dnd-tracker"
   - Authorization callback URL: `https://[your-clerk-domain].clerk.accounts.com/oauth/callback` (provided by Clerk)
3. Copy **Client ID** and **Client Secret**
4. In Clerk dashboard:
   - **Connections → Social → GitHub**
   - Paste Client ID and Secret
   - Test the connection

### 2.3 Discord OAuth Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create **New Application**: "dnd-tracker"
3. Navigate to **OAuth2**:
   - Copy **Client ID**
   - Generate **Client Secret**
   - Add redirect URIs (provided by Clerk)
4. In Clerk dashboard:
   - **Connections → Social → Discord**
   - Paste Client ID and Secret
   - Test the connection

---

## Step 3: Add Clerk to Repository

### 3.1 Install Clerk Dependencies

```bash
cd /path/to/dnd-tracker
npm install @clerk/nextjs @clerk/react
```

### 3.2 Create `.env.local` File

Create `.env.local` in repository root:

```bash
# Clerk API keys (from Step 1.3)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

### 3.3 Update `.env.example` File

Add Clerk keys to `.env.example` (for other developers):

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_[your-test-key]
CLERK_SECRET_KEY=sk_test_[your-test-key]
```

---

## Step 4: Initialize Clerk in Next.js

### 4.1 Create Middleware

Create `src/app/middleware.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/characters(.*)',
  '/parties(.*)',
  '/settings(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|static|public|favicon.ico).*)',
    '/api/(.*)',
  ],
};
```

### 4.2 Update Root Layout

Update `src/app/layout.tsx` to add `ClerkProvider`:

```typescript
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html>
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

---

## Step 5: Create Sign-In & Sign-Up Pages

### 5.1 Create Auth Layout

Create `src/app/(auth)/layout.tsx`:

```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
```

### 5.2 Create Sign-In Page

Create `src/app/(auth)/sign-in/page.tsx`:

```typescript
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <SignIn
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
        },
      }}
      signUpUrl="/sign-up"
    />
  );
}
```

### 5.3 Create Sign-Up Page

Create `src/app/(auth)/sign-up/page.tsx`:

```typescript
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
        },
      }}
      signInUrl="/sign-in"
    />
  );
}
```

---

## Step 6: Create Protected Pages

### 6.1 Create Profile Page

Create `src/app/profile/page.tsx`:

```typescript
import { UserProfile } from '@clerk/nextjs';

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      <UserProfile />
    </div>
  );
}
```

Alternatively, use custom layout:

```typescript
import { currentUser } from '@clerk/nextjs/server';

export default async function ProfilePage() {
  const user = await currentUser();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome, {user?.firstName}</h1>
      <p>Email: {user?.emailAddresses[0].emailAddress}</p>
      <p>Avatar: <img src={user?.imageUrl} alt="Avatar" className="w-16 h-16 rounded-full" /></p>
    </div>
  );
}
```

---

## Step 7: Run Locally

### 7.1 Start Development Server

```bash
npm run dev
```

Server starts at `http://localhost:3000`

### 7.2 Test Sign-Up Flow

1. Navigate to `http://localhost:3000/sign-up`
2. Click **Email & Password** (test email/password first)
3. Create account:
   - Email: `test@example.com`
   - Password: `TestPass123!`
4. After sign-up, redirected to `/profile`
5. Verify: You see your email and avatar

### 7.3 Test Sign-In Flow

1. Sign out (click user menu → Sign out)
2. Navigate to `http://localhost:3000/sign-in`
3. Enter credentials and sign in
4. Redirected to `/profile`

### 7.4 Test Social Sign-In

1. Navigate to `/sign-up`
2. Click **Continue with Google** (or GitHub/Discord)
3. Complete OAuth flow
4. Redirected to `/profile`
5. Verify: User created with Google/GitHub/Discord email

### 7.5 Test Protected Routes

1. Sign out
2. Navigate to `http://localhost:3000/profile`
3. Redirected to `/sign-in`
4. After sign-in, redirected back to `/profile`

### 7.6 Test Session Persistence

1. Sign in
2. Refresh page (`Cmd+R` or `Ctrl+R`)
3. Still authenticated (session persisted)
4. Check browser cookies: `__session` cookie present

---

## Step 8: Create useAuth Hook

Create `src/components/auth/useAuth.ts`:

```typescript
import { useUser } from '@clerk/nextjs';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  createdAt: Date;
  lastSignInAt: Date | null;
}

export interface AuthSession {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
}

export const useAuth = (): AuthSession => {
  const { user, isLoaded } = useUser();

  return {
    isAuthenticated: !!user && isLoaded,
    user: user
      ? {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          imageUrl: user.imageUrl || '',
          createdAt: user.createdAt || new Date(),
          lastSignInAt: user.lastSignInAt || null,
        }
      : null,
    isLoading: !isLoaded,
  };
};
```

**Usage**:

```typescript
import { useAuth } from '@/components/auth/useAuth';

const MyComponent = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return <p>Loading...</p>;
  if (!isAuthenticated) return <p>Not signed in</p>;

  return <p>Welcome, {user?.firstName}</p>;
};
```

---

## Step 9: Update Navigation

Update `src/components/GlobalNav.tsx` to show auth state:

```typescript
import { useAuth } from '@/components/auth/useAuth';
import { SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';

export const GlobalNav = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto flex justify-between items-center py-4">
        <Link href="/" className="text-2xl font-bold">
          D&D Tracker
        </Link>

        <div className="flex gap-4">
          {isLoading ? (
            <p>...</p>
          ) : isAuthenticated ? (
            <>
              <span>Welcome, {user?.firstName}</span>
              <SignOutButton>
                <button className="px-4 py-2 bg-red-600 text-white rounded">
                  Sign Out
                </button>
              </SignOutButton>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="px-4 py-2 bg-blue-600 text-white rounded">
                Sign In
              </Link>
              <Link href="/sign-up" className="px-4 py-2 bg-green-600 text-white rounded">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
```

---

## Step 10: Add Auth API Endpoints

### 10.1 GET /api/auth/session

Create `src/app/api/auth/session/route.ts`:

```typescript
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const user = await currentUser();

  return NextResponse.json({
    user: user
      ? {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          createdAt: user.createdAt,
          lastSignInAt: user.lastSignInAt,
        }
      : null,
    isAuthenticated: !!user,
  });
}
```

**Test**:

```bash
curl http://localhost:3000/api/auth/session
# Response when signed in: { "user": { ... }, "isAuthenticated": true }
# Response when signed out: { "user": null, "isAuthenticated": false }
```

### 10.2 POST /api/auth/sign-out

Create `src/app/api/auth/sign-out/route.ts`:

```typescript
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const { sessionId } = auth();

  if (!sessionId) {
    return NextResponse.json(
      { code: 'unauthorized', message: 'Not signed in' },
      { status: 401 }
    );
  }

  // Clerk SDK handles sign-out; this endpoint confirms it
  return NextResponse.json({
    success: true,
    redirectUrl: '/sign-in',
  });
}
```

---

## Troubleshooting

### Issue: "Clerk API keys not found"

**Solution**: Ensure `.env.local` has correct keys:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_yyy
```

Restart dev server: `npm run dev`

### Issue: "Sign-in page shows blank"

**Solution**: Clerk component not loading. Check:

1. ClerkProvider wraps app (in layout.tsx)
2. API keys are correct
3. Clerk dashboard shows "Test Mode" (not production)
4. Check browser console for errors

### Issue: "Middleware not protecting routes"

**Solution**: Verify middleware.ts:

1. `isProtectedRoute` matcher includes all protected routes
2. `auth().protect()` is called
3. Middleware matcher config includes protected routes
4. Try clearing `.next` build cache: `rm -rf .next && npm run dev`

### Issue: "OAuth provider not showing"

**Solution**: Provider not enabled in Clerk dashboard:

1. Go to Clerk Dashboard → Connections → Social
2. Enable provider (toggle on)
3. Add Client ID and Secret
4. Test connection
5. Refresh sign-up/sign-in page

### Issue: "Session doesn't persist after refresh"

**Solution**: HTTP-only cookie not being set:

1. Check browser DevTools → Application → Cookies
2. `__session` cookie should exist after sign-in
3. If missing, check Clerk SDK version (must be latest)
4. Restart dev server

---

## Next Steps

After verifying the auth flow works locally:

1. **Run tests**: `npm run test` (unit and E2E tests in Feature 013 PR)
2. **Build for production**: `npm run build`
3. **Deploy to staging**: `flyctl deploy --app dnd-tracker-staging`
4. **Test on staging**: Repeat Steps 7.2-7.6 on staging URL
5. **Deploy to production**: After staging verification, merge PR and deploy to production

---

## References

- [Clerk Next.js Documentation](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk React Components](https://clerk.com/docs/components/overview)
- [Clerk Middleware API](https://clerk.com/docs/references/nextjs/auth-middleware)
- [Next.js App Router](https://nextjs.org/docs/app)

---

## Support

For issues during setup:

1. Check Clerk dashboard logs (Dashboard → Logs)
2. Review Clerk documentation links above
3. Check browser console for JavaScript errors
4. Ensure `.env.local` has correct keys (verify in Clerk dashboard)
5. Test with Clerk's test credentials first (before production setup)
