# Data Model: Clerk Integration & Auth Flow (Feature 013)

**Date**: 2025-11-17 | **Phase**: 1 (Design) | **Status**: Complete

This document defines the data models, entities, and state structures for Feature 013 auth implementation.

---

## 1. Core Entities

### User (Clerk Auth Profile)

**Source**: Clerk external identity service (webhook-driven sync to MongoDB in Feature 014)

**Properties**:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `clerkId` | `string` (UUID) | ✅ Yes | Clerk's external user ID (immutable) |
| `email` | `string` | ✅ Yes | Primary email address |
| `firstName` | `string \| null` | No | First name (provided at sign-up) |
| `lastName` | `string \| null` | No | Last name (provided at sign-up) |
| `imageUrl` | `string` | No | Avatar URL (from provider or gravatar) |
| `createdAt` | `Date` | ✅ Yes | Account creation timestamp |
| `lastSignInAt` | `Date \| null` | No | Last successful sign-in |

**Example**:

```typescript
const user: AuthUser = {
  clerkId: 'user_abc123def456',
  email: 'player@example.com',
  firstName: 'Alice',
  lastName: 'Player',
  imageUrl: 'https://api.clerk.com/avatars/user_abc123.jpg',
  createdAt: new Date('2025-11-17T10:00:00Z'),
  lastSignInAt: new Date('2025-11-17T15:30:00Z'),
};
```

**Validation Rules**:

- `clerkId`: Must be valid Clerk format (starts with `user_`)
- `email`: Must be valid email format (RFC 5322 subset)
- `firstName`, `lastName`: Max 50 characters each
- `createdAt`, `lastSignInAt`: Must be valid ISO 8601 dates

**Lifecycle**:

- Created: When user completes Clerk sign-up
- Updated: Whenever user updates profile (via Clerk dashboard or API)
- Deleted: When user deletes account (Clerk webhook → delete from MongoDB in Feature 014)

---

### Session (Client-Side Context)

**Source**: Derived from Clerk middleware and useUser hook

**Properties**:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `isAuthenticated` | `boolean` | ✅ Yes | True if user logged in |
| `user` | `AuthUser \| null` | ✅ Yes | Current user or null |
| `isLoading` | `boolean` | ✅ Yes | True while fetching session |

**Example**:

```typescript
// Authenticated state
const session: AuthSession = {
  isAuthenticated: true,
  user: {
    clerkId: 'user_abc123',
    email: 'player@example.com',
    firstName: 'Alice',
    lastName: 'Player',
    imageUrl: 'https://...',
    createdAt: new Date(),
    lastSignInAt: new Date(),
  },
  isLoading: false,
};

// Unauthenticated state
const session: AuthSession = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
};

// Loading state
const session: AuthSession = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
};
```

**Lifecycle**:

- Created: On app load, Clerk middleware initializes session from HTTP-only cookie
- Updated: On every page refresh or Clerk session refresh (automatic)
- Cleared: On sign-out (cookie deleted)
- Invalidated: On session expiry or security breach (user redirected to sign-in)

---

## 2. State Models

### Authentication State (Middleware)

**Location**: Clerk middleware (`src/app/middleware.ts`)

**State Machine**:

```
START
  ├─ No cookie → [UNAUTHENTICATED]
  │   ├─ User navigates to /sign-in → [SIGNING_IN]
  │   │   └─ Complete form → Clerk API → [AUTHENTICATED]
  │   └─ User navigates to /profile → [REDIRECT_TO_SIGN_IN]
  │       └─ Redirect middleware → /sign-in → [UNAUTHENTICATED]
  │
  └─ Valid cookie → [AUTHENTICATED]
      ├─ User navigates anywhere → [ALLOWED]
      ├─ User signs out → [SIGNING_OUT]
      │   └─ Clerk clears cookie → [UNAUTHENTICATED]
      └─ Session expired → [SESSION_EXPIRED]
          └─ Redirect to sign-in → [UNAUTHENTICATED]
```

**Transitions**:

- `UNAUTHENTICATED` → `SIGNING_IN`: User submits sign-in form
- `SIGNING_IN` → `AUTHENTICATED`: Clerk validates credentials
- `AUTHENTICATED` → `SIGNING_OUT`: User clicks sign-out
- `SIGNING_OUT` → `UNAUTHENTICATED`: Clerk clears session
- `AUTHENTICATED` → `SESSION_EXPIRED`: Session token expires or is invalidated
- Any state → `ERROR`: Network error or API failure

---

### Session Persistence (Client-Side)

**Storage**: Clerk-managed HTTP-only cookies (not localStorage)

**Persistence Lifecycle**:

1. **Sign-In** (User submits credentials):

   ```
   Form Submit → Clerk API validates → Clerk issues HTTP-only cookie → Redirect to /profile
   ```

2. **Page Refresh** (User refreshes page):

   ```
   Browser sends cookie with request → Middleware validates cookie with Clerk → Session restored
   ```

3. **Tab Switch** (User switches browser tabs):

   ```
   Both tabs share same HTTP-only cookie → Session state consistent across tabs
   ```

4. **Sign-Out** (User clicks sign-out):

   ```
   Click → POST /api/auth/sign-out → Clerk clears cookie → Redirect to /sign-in
   ```

**Duration**: 24 hours (Clerk default; can be configured)

**Security**: HTTP-only flag prevents JavaScript access; HTTPS-only in production

---

## 3. Validation & Constraints

### Email Validation

```typescript
const EmailSchema = z
  .string()
  .email('Invalid email address')
  .max(254, 'Email too long');

// Examples
EmailSchema.parse('user@example.com'); // ✅ Valid
EmailSchema.parse('user+tag@example.co.uk'); // ✅ Valid
EmailSchema.parse('user@invalid'); // ❌ Invalid
EmailSchema.parse(''); // ❌ Invalid
```

### Password Validation (Sign-Up Only)

```typescript
const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain digit')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character');

// Examples
PasswordSchema.parse('SecurePass1!'); // ✅ Valid
PasswordSchema.parse('password'); // ❌ Invalid (no uppercase, no digit, no special)
PasswordSchema.parse('Pass123'); // ❌ Invalid (no special character)
```

### Name Validation

```typescript
const NameSchema = z
  .string()
  .min(1, 'Name required')
  .max(50, 'Name too long')
  .trim();

// Examples
NameSchema.parse('Alice'); // ✅ Valid
NameSchema.parse(''); // ❌ Invalid
NameSchema.parse('Name123'); // ✅ Valid (numbers allowed)
```

### Session State Constraints

- `isAuthenticated` must match `user !== null`
- `isLoading` is true only during initial fetch
- `user` is null when not authenticated
- `user.clerkId` must be non-empty string

---

## 4. Type Definitions

### TypeScript Interfaces

```typescript
// src/types/auth.ts

/**
 * Authenticated user profile (from Clerk)
 * Immutable: Do not modify directly; sync from Clerk webhooks
 */
export interface AuthUser {
  // Clerk identifiers
  clerkId: string; // Unique Clerk user ID (e.g., user_abc123)
  email: string;
  
  // Profile info
  firstName: string | null;
  lastName: string | null;
  imageUrl: string; // Avatar or gravatar
  
  // Timestamps
  createdAt: Date; // Account creation date
  lastSignInAt: Date | null; // Last successful sign-in (or null if never signed in)
}

/**
 * Client-side session state
 * Derived from Clerk middleware and useUser hook
 */
export interface AuthSession {
  isAuthenticated: boolean; // True if user logged in
  user: AuthUser | null; // Current user or null
  isLoading: boolean; // True while fetching session
}

/**
 * Auth error response
 * Returned by API endpoints on error
 */
export interface AuthError {
  code: string; // Error code (e.g., "invalid_credentials", "user_already_exists")
  message: string; // User-friendly message (no sensitive details)
  details?: Record<string, unknown>; // Additional context (server-side only)
}

/**
 * Sign-up form data
 * User input, not persisted (sent to Clerk API)
 */
export interface SignUpInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * Sign-in form data
 * User input, not persisted (sent to Clerk API)
 */
export interface SignInInput {
  email: string;
  password: string;
}

/**
 * Session API response
 * Returned by GET /api/auth/session
 */
export interface SessionResponse {
  user: AuthUser | null; // Current user or null
  isAuthenticated: boolean; // Convenience flag
}

/**
 * Sign-out API response
 * Returned by POST /api/auth/sign-out
 */
export interface SignOutResponse {
  success: boolean;
  redirectUrl: string; // URL to redirect to (/sign-in)
}
```

---

## 5. API Request/Response Types

### GET /api/auth/session

**Request**: None (authentication via cookie)

**Response Success** (200 OK):

```typescript
{
  user: {
    clerkId: "user_abc123",
    email: "player@example.com",
    firstName: "Alice",
    lastName: "Player",
    imageUrl: "https://...",
    createdAt: "2025-11-17T10:00:00Z",
    lastSignInAt: "2025-11-17T15:30:00Z"
  },
  isAuthenticated: true
}
```

**Response Unauthenticated** (401 Unauthorized):

```typescript
{
  user: null,
  isAuthenticated: false
}
```

---

### POST /api/auth/sign-out

**Request**: None (authentication via cookie)

**Response** (200 OK):

```typescript
{
  success: true,
  redirectUrl: "/sign-in"
}
```

**Error** (401 Unauthorized):

```typescript
{
  code: "unauthorized",
  message: "Not signed in"
}
```

---

## 6. Middleware State

### Protected Routes List

Routes requiring authentication (enforced by middleware):

```typescript
const PROTECTED_ROUTES = [
  '/profile',
  '/characters',
  '/characters/:id',
  '/parties',
  '/parties/:id',
  '/settings',
];
```

### Public Routes List

Routes accessible without authentication:

```typescript
const PUBLIC_ROUTES = [
  '/',
  '/sign-in',
  '/sign-in/*',
  '/sign-up',
  '/sign-up/*',
  '/landing', // Static landing page
];
```

### Middleware Logic

```typescript
export default clerkMiddleware((auth, req) => {
  const { userId } = auth();
  const path = req.nextUrl.pathname;

  // If accessing protected route without auth, redirect to sign-in
  if (isProtectedRoute(path) && !userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Allow all other requests
  return NextResponse.next();
});
```

---

## 7. Component State

### useAuth Hook State

```typescript
export const useAuth = (): AuthSession => {
  const { user, isLoaded } = useUser();

  return {
    isAuthenticated: !!user && isLoaded,
    user: user ? mapClerkUserToAuthUser(user) : null,
    isLoading: !isLoaded,
  };
};

// Usage in component
const MyComponent = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/sign-in" />;

  return <div>Welcome, {user?.firstName}</div>;
};
```

---

## 8. Error States

### Sign-Up Error Cases

| Error | User Message | Handling |
|-------|--------------|----------|
| Email already exists | "Email already in use. Please sign in or try another email." | Show form error, suggest sign-in |
| Password too weak | "Password must contain uppercase, lowercase, digit, and special character." | Show validation error |
| Invalid email | "Please enter a valid email address." | Show validation error |
| Network error | "Connection error. Please try again." | Show toast, auto-retry |
| Clerk API outage | "Service temporarily unavailable. Try again in a few minutes." | Show banner, disable form |

### Sign-In Error Cases

| Error | User Message | Handling |
|-------|--------------|----------|
| Invalid credentials | "Email or password incorrect. Please try again." | Show form error (no account enumeration) |
| Account locked | "Too many failed attempts. Try again later or reset password." | Show message, suggest password reset |
| Email not verified | "Please verify your email before signing in." | Show message, resend verification |
| Network error | "Connection error. Please try again." | Show toast, auto-retry |

### Session Error Cases

| Error | User Message | Handling |
|-------|--------------|----------|
| Session expired | "Your session expired. Please sign in again." | Redirect to /sign-in, show message |
| Invalid session | "Session is invalid. Please sign in again." | Redirect to /sign-in, clear cache |
| CSRF attack detected | "Security check failed. Please refresh and try again." | Redirect to /sign-in, log incident |

---

## 9. Clerk Webhook Events (Future: Feature 014)

These events are handled by Clerk webhooks (out of scope for Feature 013, but listed for context):

### user.created

Fired when user completes sign-up.

**Payload**:

```json
{
  "data": {
    "id": "user_abc123",
    "email_addresses": [
      {
        "email_address": "player@example.com"
      }
    ],
    "first_name": "Alice",
    "last_name": "Player",
    "image_url": "https://..."
  }
}
```

**Action** (Feature 014): Create corresponding MongoDB user record

### user.updated

Fired when user updates profile.

**Action** (Feature 014): Update corresponding MongoDB user record

### user.deleted

Fired when user deletes account.

**Action** (Feature 014): Delete corresponding MongoDB user record

---

## 10. Relationships

### User → AuthSession (1:1)

- Each authenticated user has exactly one active session per browser
- Multiple sessions (different browsers) allowed
- Relationships:
  - User.email → Session.user.email
  - User.clerkId → Session.user.clerkId

### Session → HTTP-Only Cookie (1:1)

- Each session backed by one HTTP-only cookie
- Cookie contains encoded session identifier (managed by Clerk)
- Relationships:
  - Session.isAuthenticated → Cookie exists and is valid
  - Session.user → Decoded from cookie by middleware

### Protected Route → AuthSession

- Protected routes require Session.isAuthenticated === true
- Middleware enforces relationship
- Violated relationships:
  - User navigates to /profile and isAuthenticated === false → Redirect to /sign-in

---

## Summary

This data model provides a complete picture of authentication entities, state machines, and API contracts for Feature 013. The model emphasizes:

1. **Security**: HTTP-only cookies, server-side enforcement, no token leaks
2. **Simplicity**: Lean data structures, clear state transitions
3. **Extensibility**: Webhook hooks for MongoDB sync (Feature 014)
4. **Type Safety**: Full TypeScript definitions for all structures

**Next Step**: Phase 1 deliverable → `quickstart.md` and API contracts (`contracts/auth-endpoints.yaml`)
