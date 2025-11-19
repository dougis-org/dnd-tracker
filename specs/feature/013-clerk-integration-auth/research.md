# Research: Clerk Integration & Auth Flow (Feature 013)

**Date**: 2025-11-17 | **Phase**: 0 (Research & Clarifications) | **Status**: Complete

This document consolidates research findings on Clerk SDK integration, Next.js middleware patterns, secure session management, and social provider setup for Feature 013.

---

## 1. Clerk SDK for Next.js: Capabilities & Integration

### Decision: Use `@clerk/nextjs` with built-in middleware

**Why Chosen**: Official Clerk SDK provides:

- **Server-side middleware** out-of-the-box for route protection
- **React hooks** (`useUser`, `useAuth`, `useSession`) for client-side session reads
- **Pre-built UI components** (sign-in, sign-up, user profile)
- **Automatic session management** via HTTP-only cookies
- **Webhook support** for user lifecycle events (sign-up, sign-in, deletion)
- **TypeScript support** with strong type definitions

**Key Features**:

- `auth()` middleware helper: Protects routes server-side
- `ClerkProvider` wrapper: Wraps React tree for session context
- `useUser()` hook: Returns Clerk user object (no tokens exposed)
- `signOut()` method: Clears session and redirects
- Social provider integration: Google, GitHub, Discord, LinkedIn, Microsoft (configure via Clerk dashboard)

**Setup Cost**: Minimal (npm install + 2 env vars + ClerkProvider wrapper)

---

### Alternatives Considered & Rejected

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|-------------|
| **Auth0** | Mature, multi-tenant | Higher cost, slower setup, requires separate DB | Overkill for MVP; more expensive |
| **Firebase Auth** | Google-backed, good docs | Requires Firebase project, less Next.js integration | Good option but Clerk simpler for Next.js |
| **Supabase Auth** | Built-in DB, PostgreSQL | Requires Supabase project; auth is secondary feature | Adds DB dependency; Clerk more focused |
| **Custom JWT** | Full control, no vendor lock | Security risk (XSS via localStorage), complex session mgmt | Security vulnerability for sensitive app |
| **NextAuth.js** | Open-source, flexible | Requires custom provider setup, session DB | More setup than Clerk; Clerk simpler for this use case |

**Conclusion**: Clerk is ideal for Next.js with built-in middleware, minimal setup, and strong security defaults.

---

## 2. Session Storage & Security: HTTP-Only Cookies

### Decision: Clerk-managed HTTP-only cookies (no localStorage)

**Why Chosen**:

- **XSS-resistant**: HTTP-only flag prevents JavaScript access; immune to `localStorage` theft via XSS
- **CSRF-protected**: Clerk SDK handles CSRF token rotation
- **Automatic renewal**: Clerk refreshes tokens server-side without client intervention
- **Secure flag**: Cookies sent over HTTPS only (enforced in production)
- **SameSite attribute**: Prevents cross-site request forgery

**Implementation**:

```typescript
// ✅ Correct: Use Clerk's useUser() hook (no token exposure)
const { user } = useUser();

// ❌ WRONG: Never store tokens in localStorage
localStorage.setItem('token', jwtToken); // XSS vulnerability!

// ❌ WRONG: Never pass tokens in fetch headers (client-side)
fetch('/api/data', {
  headers: { 'Authorization': `Bearer ${token}` } // Can be stolen!
});
```

**Client-Side Session Check**:

```typescript
// In components, use useAuth() hook (managed by Clerk)
const useAuth = () => {
  const { user, isLoaded } = useUser();
  return {
    isAuthenticated: !!user,
    user,
    isLoading: !isLoaded,
  };
};
```

---

### Security Best Practices

1. **Never expose tokens to JavaScript**:
   - Use HTTP-only cookies for session tokens
   - Never store JWTs in localStorage or sessionStorage
   - Never pass tokens in request headers from client code

2. **Server-side session validation**:
   - Middleware validates session before rendering protected routes
   - API endpoints call `auth()` to get authenticated session
   - Invalid sessions redirected to sign-in (no error messages leaking user existence)

3. **Error messages**:
   - Don't leak whether an email exists (prevents account enumeration)
   - Return generic "Invalid credentials" or "Please try again"
   - Log detailed errors server-side for monitoring

4. **Token rotation**:
   - Clerk automatically rotates tokens on every request
   - No manual refresh token logic needed
   - Backend validates freshness via Clerk API if needed

---

## 3. Protected Routes: Server-Side Middleware vs. Client-Side Guards

### Decision: Server-side middleware (Next.js Middleware) as primary, client-side guards for UX

**Why Chosen**:

- **Security boundary**: Middleware runs at edge before rendering; prevents unauthorized content leaks
- **Performance**: Redirects happen at edge (no wasted client-side rendering)
- **Compliance**: Industry standard for protected routes
- **Fallback UX**: Client-side guards catch edge cases and improve UX

**Architecture**:

```
1. User requests /profile (protected)
   ↓
2. Next.js Middleware intercepts (runs at edge)
   ↓
3. Middleware checks Clerk session
   ├─ If authenticated → Allow request
   └─ If not authenticated → Redirect to /sign-in
   ↓
4. After redirect + sign-in, user returned to /profile
```

**Implementation Pattern**:

```typescript
// middleware.ts (runs at edge before rendering)
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

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
```

**Client-Side Guard (UX enhancement, not security)**:

```typescript
// ProfilePage component
const ProfilePage = () => {
  const { user, isLoading } = useUser();

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/sign-in" />; // Shouldn't happen due to middleware, but good UX

  return <div>Welcome, {user.email}</div>;
};
```

---

### Why NOT Client-Side Only

❌ **Client-side guards alone are insufficient because**:

- HTML for protected page is still sent to browser (leaked to attacker)
- Attacker can inspect DOM/CSS to find protected content structure
- Race condition: page might flash protected content before guard redirects
- Search engine crawlers can index protected content

✅ **Middleware as primary ensures**:

- Protected content never sent to unauthorized users
- Middleware runs at edge before rendering
- Complies with NIST/OWASP security guidelines

---

## 4. Social Providers Setup: Google, GitHub, Discord

### Decision: Support Google, GitHub, and Discord (per spec)

**Why These Providers**:

- **Coverage**: Covers ~80% of developer audience (GitHub), tech professionals (Google), gaming/hobby communities (Discord)
- **Easy setup**: Minimal OAuth app configuration
- **No additional costs**: All free tier supported
- **User familiarity**: Most users have accounts with at least one provider

**Setup Process**:

1. Create OAuth app in each provider's developer console
2. Retrieve Client ID and Client Secret
3. Add to Clerk dashboard (Dashboard > Connections)
4. Configure redirect URIs (Clerk provides exact URLs)
5. Test in Clerk preview

**Implementation**:

- Clerk handles all OAuth flow (auth code, token exchange)
- No manual OAuth implementation needed
- Sign-up/sign-in forms automatically show provider buttons

**Future Extensibility**:

- LinkedIn, Microsoft, Apple can be added as Feature 013-extended
- Requires only adding new provider in Clerk dashboard
- No code changes needed (Clerk handles dynamically)

**Alternatives for MVP**:

- Email-only sign-up (simpler, but lower conversion)
- One provider (e.g., GitHub only, but excludes other users)
- Chosen: All three for maximum user accessibility

---

## 5. Session Persistence: Surviving Page Refreshes

### Decision: Use Clerk-managed cookies for persistence

**Requirement**: User signs in, refreshes page, remains authenticated.

**Implementation**:

- Clerk SDK automatically saves session cookie (HTTP-only)
- On page refresh, Next.js rehydrates from cookie
- Middleware validates cookie on every request
- Minimal client-side handling needed

**Lifecycle**:

1. User signs in → Clerk issues HTTP-only session cookie
2. User refreshes page → Browser sends cookie with request
3. Middleware receives request with cookie → Validates with Clerk API
4. Session confirmed → Render protected page
5. Component mounts → `useUser()` reads session context (already loaded by middleware)

**No Action Needed from Developer**:

- Clerk SDK handles cookie management
- No manual localStorage/sessionStorage logic
- Middleware + SSR handle rehydration automatically

---

## 6. Auth Form Validation & Error Handling

### Decision: Zod schemas for email/password validation

**Why Chosen**:

- **Type-safe**: Generates TypeScript types from schemas
- **Reusable**: Same schema in frontend and backend (contract)
- **Already in project**: Zod 3.23.8 already a dependency
- **Clear errors**: Zod provides structured error messages

**Validation Rules**:

```typescript
const EmailSchema = z.string().email('Invalid email address');

const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character');

const SignUpSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
});
```

**Error Handling**:

- Validation errors shown inline on forms (field-level)
- Clerk API errors shown as toasts (non-intrusive)
- Never expose whether email exists (account enumeration prevention)
- Log errors server-side for monitoring

---

## 7. Edge Cases & Error Scenarios

### Critical Scenarios to Handle

| Scenario | Handling | Impact |
|----------|----------|--------|
| **Network error during sign-in** | Show "Please check your connection" toast | User can retry |
| **Clerk API outage** | Render fallback message + retry button | Users can't sign in (acceptable for outage) |
| **Invalid/expired session token** | Redirect to sign-in + show message | User re-authenticates |
| **Session cookie deleted (cleared cache)** | User sees unauthenticated UI | User signs in again |
| **Concurrent sign-in attempts** | Clerk handles deduplication | No state corruption |
| **Sign-out takes 3+ seconds** | Show loading state on button | Good UX feedback |
| **User deletes account via Clerk** | Session invalidated on next request | User redirected to sign-in |
| **Email already exists on sign-up** | Clerk returns error; show "Email in use" | User tries different email or sign-in |

### Prevention Strategies

1. **Timeouts**: Set 10s timeout on auth requests (show spinner after 2s)
2. **Retry logic**: Auto-retry failed requests with exponential backoff
3. **Fallback UI**: Show sign-in form even if session context loading
4. **Logging**: Log all errors server-side (no tokens) for monitoring
5. **Graceful degradation**: If Clerk unavailable, show "Maintenance" message

---

## 8. Next.js Middleware Patterns & Best Practices

### Middleware Execution Context

- **Runs at**: Vercel Edge Functions (or Node.js in development)
- **Access**: Request headers, cookies, URL params
- **Limitations**: No direct database access (use API calls if needed)
- **Performance**: Must complete in <30s (usually <100ms)

### Route Matching Strategy

```typescript
// Recommended: Explicit route lists (easy to reason about)
const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/characters(.*)',
  '/parties(.*)',
]);

// Alternative: Regex patterns (less readable)
const isProtectedRoute = (req) => /^\/(profile|characters|parties)/.test(req.nextUrl.pathname);
```

### Preserving URL for Post-Sign-In Redirect

```typescript
// Middleware
export default clerkMiddleware((auth, req) => {
  if (!auth().userId && isProtectedRoute(req)) {
    // Preserve original URL for post-sign-in redirect
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }
});

// Sign-in page
const SignInPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/profile';

  const handleSignInComplete = () => {
    router.push(redirectUrl); // Redirect to original URL
  };

  return (
    <SignIn 
      signUpUrl="/sign-up" 
      afterSignInUrl={redirectUrl}
    />
  );
};
```

---

## 9. TypeScript Types for Auth Context

### Recommended Type Definitions

```typescript
// src/types/auth.ts
export interface AuthUser {
  id: string; // Clerk user ID
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

export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

### Hook Type Definition

```typescript
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

---

## 10. Testing Strategy: Mocking Clerk in Tests

### Unit Tests: Mock Clerk Hooks

```typescript
// __mocks__/@clerk/react.ts
export const useUser = jest.fn(() => ({
  user: null,
  isLoaded: true,
}));

export const useAuth = jest.fn(() => ({
  userId: null,
  sessionId: null,
}));

// In test file
jest.mock('@clerk/react');
import { useUser } from '@clerk/react';

describe('useAuth hook', () => {
  it('returns null when user not authenticated', () => {
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      isLoaded: true,
    });

    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

### E2E Tests: Use Clerk Test API Keys

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    ...devices['Desktop Chrome'],
    // Use Clerk test environment
    CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_TEST,
  },
});

// auth.spec.ts
test('user can sign up', async ({ page }) => {
  await page.goto('/sign-up');
  await page.fill('[name="emailAddress"]', 'test@example.com');
  await page.fill('[name="password"]', 'TestPass123!');
  await page.click('button[type="submit"]');

  await page.waitForNavigation();
  await expect(page).toHaveURL('/profile');
});
```

---

## 11. Monitoring & Observability

### Metrics to Collect

- **Sign-up success rate**: (successful_signups / attempts) × 100
- **Sign-in latency**: Time from form submit to redirect (target: <500ms)
- **Session persistence**: Percentage of page refreshes maintaining auth
- **Error rate**: Failed auth requests / total requests (target: <1%)

### Logging Strategy

```typescript
// ✅ Good: Log without sensitive data
logger.info('Sign-in attempt', { email_domain: extractDomain(email), provider });

// ❌ Bad: Never log tokens or passwords
logger.info('Sign-in', { email, password }); // SECURITY RISK!

// ✅ Good: Log errors with context
logger.error('Sign-in failed', { error_code, provider, timestamp });
```

### Sample Datadog Integration

```typescript
import { datadog } from '@datadog/browser-rum';

datadog.init({
  applicationId: process.env.NEXT_PUBLIC_DATADOG_APP_ID,
  clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
  site: 'datadoghq.com',
  service: 'dnd-tracker',
  env: process.env.NODE_ENV,
});

// Track auth events
datadog.addUserAction('sign_in_success', { provider });
datadog.addUserAction('sign_in_failure', { error_code });
```

---

## 12. Deployment Considerations

### Environment Variables (Clerk)

```env
# .env.local (development)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_yyy

# Production (Fly.io secrets)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_yyy
```

### Fly.io Deployment Steps

```bash
# Set secrets on Fly.io
flyctl secrets set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
flyctl secrets set CLERK_SECRET_KEY=sk_live_yyy

# Deploy
flyctl deploy
```

### Clerk Webhook Setup

- Configure webhook in Clerk dashboard → Webhooks
- Endpoint: `https://dnd-tracker.fly.dev/api/webhooks/clerk`
- Events: user.created, user.updated, user.deleted
- (Webhook handlers in Feature 014)

---

## 13. References & Further Reading

### Clerk Official Resources

- [Clerk Next.js Documentation](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Middleware Guide](https://clerk.com/docs/references/nextjs/auth-middleware)
- [Clerk React Hooks Reference](https://clerk.com/docs/references/react/use-user)
- [Clerk Social Provider Setup](https://clerk.com/docs/authentication/social-connections)

### Next.js & Security Resources

- [Next.js Middleware Documentation](https://nextjs.org/docs/advanced-features/middleware)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [HTTP-Only Cookies Best Practices](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)

### Testing Resources

- [Jest Testing React Hooks](https://jestjs.io/docs/tutorial-react-hooks)
- [Playwright Authentication](https://playwright.dev/docs/auth)

---

## Summary

This research confirms that **Clerk integration with Next.js middleware is the optimal approach** for Feature 013. The implementation leverages industry best practices (HTTP-only cookies, server-side enforcement, secure session management) while maintaining simplicity (minimal setup, pre-built components, no manual OAuth flow).

**Next Step**: Proceed to Phase 1 (Design & Contracts) to define data models, API contracts, and quickstart documentation.
