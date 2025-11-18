# Clerk Integration & Auth Flow — Developer Quickstart

This guide helps developers set up Clerk authentication for local development and understand the auth flow implementation.

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Git branch: `feature/013-clerk-integration-auth`

## Local Setup Steps

### Step 1: Create a Clerk Account & Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Sign in with your preferred method (GitHub, email, etc.)
3. Create a new application:
   - Click "Create Application"
   - Enter application name (e.g., "dnd-tracker-dev")
   - Select authentication method (Email/Password + Social providers recommended)

### Step 2: Configure Social Providers (Optional but Recommended)

In your Clerk Dashboard, enable social sign-in providers:

1. Go to **Authenticators** → **Social Connections**
2. Enable the following providers:
   - **Google**: Follow Clerk's guide to create OAuth credentials
   - **GitHub**: Follow Clerk's guide to authorize GitHub OAuth
   - **Discord** (optional): Add if needed for your use case

### Step 3: Get Your API Keys

1. In Clerk Dashboard, go to **API Keys** (or **Credentials**)
2. Copy the following values:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (public key, safe for client-side)
   - `CLERK_SECRET_KEY` (secret key, server-side only)

### Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in the Clerk keys in `.env.local`:

   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
   CLERK_SECRET_KEY=sk_test_YOUR_SECRET_HERE
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   ```

3. Optional: Set other environment variables (MongoDB, etc.)

### Step 5: Install Dependencies

If not already done, install Clerk packages:

```bash
npm install @clerk/nextjs @clerk/react
```

### Step 6: Run the Development Server

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

## Testing the Authentication Flow

### Manual Testing

1. **Sign Up**:
   - Visit `http://localhost:3000`
   - Look for a "Sign Up" link in the navigation (powered by Clerk component)
   - Enter an email and password, or use a social provider
   - Complete the sign-up flow

2. **After Sign-Up**:
   - You should be redirected to `/dashboard`
   - The GlobalNav should show your authenticated state (username, avatar)

3. **Sign Out**:
   - Click the sign-out button in the navigation
   - Verify you are redirected to the landing page
   - Confirm the unauthenticated UI is shown

4. **Protected Routes**:
   - While signed out, try accessing `/profile`
   - Confirm you are redirected to `/sign-in`
   - After signing in, confirm you are returned to `/profile`

### Automated Testing

Run the test suite:

```bash
# Unit tests
npm run test

# E2E tests with Playwright
npm run test:e2e

# View E2E tests in UI mode (helpful for debugging)
npm run test:e2e:ui
```

## Implementation Architecture

### Client-Side (React Components)

- **`useAuth` Hook** (`src/components/auth/useAuth.ts`):
  - Exposes `isAuthenticated`, `user`, `isLoading`
  - Built on Clerk's `useAuth()` hook

- **Sign-In Page** (`src/app/(auth)/sign-in/page.tsx`):
  - Uses Clerk's prebuilt `SignIn` component
  - Customizable UI and redirect behavior

- **Sign-Up Page** (`src/app/(auth)/sign-up/page.tsx`):
  - Uses Clerk's prebuilt `SignUp` component
  - Customizable UI and redirect behavior

- **Sign-Out Button** (`src/components/auth/SignOutButton.tsx`):
  - Calls `signOut()` from Clerk
  - Optionally calls server-side `/api/auth/sign-out` for additional cleanup

### Server-Side (Next.js)

- **Middleware** (`src/middleware.ts`):
  - Enforces protected routes (`/dashboard`, `/subscription`, `/profile`)
  - Redirects unauthenticated users to `/sign-in`
  - Preserves return path for post-sign-in redirect

- **Session Endpoint** (`src/app/api/auth/session/route.ts`):
  - `GET /api/auth/session` returns authenticated user's profile
  - Useful for server-rendered pages and integration tests

- **Sign-Out Endpoint** (`src/app/api/auth/sign-out/route.ts`):
  - `POST /api/auth/sign-out` clears server-side session state
  - Called by client-side sign-out flow

### Type Safety

- **Auth Types** (`src/types/auth.ts`):
  - `UserProfile`: Represents authenticated user (id, email, name, avatar)
  - `Session`: Lightweight session representation

- **Validation Schemas** (`src/lib/auth/validation.ts`):
  - Zod schemas for auth-related server payloads

## Clerk SDK Features Used

- **`ClerkProvider`**: Root-level provider wrapping the app in `src/app/layout.tsx`
- **`useAuth()`**: Client-side hook to check authentication state
- **`useUser()`**: Client-side hook to fetch user profile
- **`useSignUp()` / `useSignIn()`**: Hooks for custom sign-up/sign-in flows (if needed)
- **`Auth()` server function**: Server-side authentication check (Next.js 16 supported)
- **Prebuilt Components**: `<SignIn>`, `<SignUp>`, `<UserButton>` for rapid UI deployment

## Deployment Considerations

### Environment Variables

Before deploying, ensure all Clerk keys are set in your deployment platform:

- **Vercel**: Add secrets via project settings
- **Fly.io**: Add secrets via `flyctl secrets set`
- **Other platforms**: Follow platform-specific secret management

### Production Clerk Keys

1. Create a separate Clerk application for production
2. Get production API keys from Clerk Dashboard
3. Update environment variables before deploying

### Redirect URLs (CORS & CORS-like)

Update Clerk Dashboard with your production domain:

- **Allowed redirect URIs**: `https://yourdomain.com/sign-in`, `https://yourdomain.com/sign-up`
- **Allowed Origins**: `https://yourdomain.com`

## Troubleshooting

### Issue: "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" error

**Solution**: Ensure `.env.local` exists with the correct key set.

### Issue: Social login not working

**Solution**:

1. Verify OAuth credentials are set in Clerk Dashboard
2. Confirm redirect URIs match your app's domain
3. Check browser console for Clerk SDK errors

### Issue: "Session not persisting" after refresh

**Solution**:

1. Verify cookies are not blocked in browser settings
2. Check that `ClerkProvider` wraps the entire app in `layout.tsx`
3. Confirm Clerk SDK scripts load without errors (check Network tab)

### Issue: "Failed to sign out" or sign-out loop

**Solution**:

1. Verify `/api/auth/sign-out` endpoint exists and is working
2. Check browser console for JavaScript errors
3. Confirm CORS/cookie settings allow cross-origin requests if needed

## Next Steps

1. Implement missing auth pages/components (if not already done)
2. Wire protected route middleware for additional app routes
3. Add telemetry/observability for auth events (follow-up feature work)
4. Run Codacy analysis and address any linting/security issues

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js Integration](https://clerk.com/docs/references/nextjs/overview)
- [Clerk API Reference](https://clerk.com/docs/reference/backend-api)
- [Project Specification](../spec.md)
- [Implementation Plan](../plan.md)

---

**Last Updated**: 2025-11-17
**Maintainer**: @doug
