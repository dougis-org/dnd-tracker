# Clerk Authentication Integration

## Objective

Implement complete authentication system using Clerk.

## Tasks

- [ ] Create Clerk account and application
- [ ] Install Clerk dependencies
- [ ] Configure middleware.ts
- [ ] Set up ClerkProvider in layout.tsx
- [ ] Create sign-in and sign-up pages
- [ ] Implement UserButton component
- [ ] Configure webhook endpoint for user sync
- [ ] Set up environment variables
- [ ] Test authentication flow

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

- Users can sign up and sign in using Clerk
- Authentication state is available throughout the app
- Sign-in and sign-up pages are accessible and styled
- UserButton is visible when authenticated
- Webhook endpoint is functional for user sync
- Environment variables are loaded from .env
- Authentication flow is tested and works end-to-end

        </html>
      </ClerkProvider>

  )
  }

```

```
