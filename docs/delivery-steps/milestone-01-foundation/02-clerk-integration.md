# Clerk Authentication Integration

## Objective

Implement complete authentication system using Clerk.

## Tasks

- [ ] Create Clerk account and application
- [ ] Follow [Clerk instructions](02-clerk-instructions.md)
- [ ] Install Clerk dependencies
- [ ] Configure middleware.ts
- [ ] Set up ClerkProvider in layout.tsx
- [ ] Create sign-in and sign-up pages
- [ ] Implement UserButton component
- [ ] Configure webhook endpoint for user sync
- [ ] Set up environment variables
- [ ] Write failing tests for authentication flow before implementation (TDD)
- [ ] Ensure sign-in and sign-up pages are accessible (ARIA, keyboard navigation)
- [ ] Validate and sanitize all input (e.g., webhook payloads)
- [ ] Document all new environment variables in `.env.example`
- [ ] Update documentation for authentication setup and usage

## Dependencies

```bash
pnpm add @clerk/nextjs
```

## Environment Variables

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Implementation Steps

### 1. Middleware Configuration (middleware.ts)

```typescript
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/api/webhook/clerk", "/sign-in", "/sign-up"],
  ignoredRoutes: ["/api/webhook/clerk"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### 2. Provider Setup (app/layout.tsx)

```typescript
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

## Acceptance Criteria

- Users can sign up and sign in using Clerk, and are redirected appropriately after each action
- Authentication state is available throughout the app and can be accessed in all protected routes/components
- Sign-in and sign-up pages are accessible (WCAG 2.1 AA), keyboard navigable, and styled according to design system
- UserButton is visible and functional when authenticated, and hidden when not
- Webhook endpoint is functional, secure, and synchronizes user data with no errors (including input validation and error handling)
- All environment variables are loaded from `.env` and documented in `.env.example`
- Authentication flow is covered by automated tests (unit and e2e) with at least 80% coverage
- Manual testing confirms authentication works end-to-end, including error and edge cases
- All new setup and usage steps are documented in the project README
