# Implementation Plan: Clerk Integration & Auth Flow (Feature 013)

**Branch**: `feature/013-clerk-integration-auth` | **Date**: 2025-11-17 | **Spec**: [013 Clerk Integration & Auth](../013-clerk-integration-auth/spec.md)

**Maintainer**: @doug

**Note**: This implementation plan outlines the complete approach for Clerk integration including sign-up, sign-in, protected routes, and session management for the dnd-tracker application.

## Summary

Feature 013 introduces Clerk-powered authentication to the dnd-tracker application, enabling users to create accounts and sign in securely. The implementation provides:

- **Clerk integration** for email/password and social sign-in (Google, GitHub, Discord)
- **Server-side middleware** to enforce protected routes (Next.js Middleware)
- **Secure session management** using Clerk-managed HTTP-only cookies
- **Client-side auth context** for components to read user profile without exposing tokens
- **Sign-out capability** with complete session clearing

The approach prioritizes security (server-side enforcement) and UX (seamless redirects, persistent sessions) while maintaining compliance with the project's architecture standards (TypeScript strict mode, 80%+ test coverage, TDD-first).

## Technical Context

**Language/Version**: TypeScript 5.9.2, Next.js 16.0+, React 19.0+

**Primary Dependencies**:

- `@clerk/nextjs` (latest stable) — Clerk SDK for Next.js
- `@clerk/react` — React hooks and components
- `zod` 3.23.8 — Validation (already in project for API contracts)
- `next-themes` 0.4.4 — Theme management (already in project)

**Storage**: MongoDB via Mongoose (for future user profile enrichment; initial auth is Clerk-managed)

**Testing**: Jest 30.2.0+, Playwright 1.56.1+ (existing test frameworks)

**Target Platform**: Web (Next.js full-stack on Fly.io)

**Project Type**: Web application (Next.js App Router)

**Performance Goals**: Auth operations <500ms p95 (Clerk managed), session checks <50ms (middleware)

**Constraints**:

- No session tokens in localStorage (HTTP-only cookies only)
- Protected routes enforced server-side (middleware, not client-side guard alone)
- Social providers: Google, GitHub, Discord (per spec clarifications)

**Scale/Scope**: MVP authentication covering 3 user stories (P1: sign-up/sign-in, P2: protected routes, P3: sign-out + session persistence)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Alignment with Constitution (`.specify/memory/constitution.md`)

✅ **Quality & Ownership**: TDD approach applied to all components and middleware.

✅ **Test-First (TDD)**: Tests written first for auth context, middleware, protected routes, and edge cases.

✅ **Simplicity & Composability**: Auth logic separated into:

- Middleware (route protection)
- Hooks (client-side user state)
- API utilities (session validation)
- Components (sign-in/sign-up forms)

✅ **Observability & Security**:

- Middleware logs failed auth attempts at INFO level
- Error messages do not leak tokens or sensitive details
- HTTP-only cookies enforced by Clerk SDK

✅ **Versioning & Governance**: Tracked as Feature 013 in Feature-Roadmap.md; changes to auth flow require new feature issues or amendments to this spec.

### Post-ratification checklist

- [x] Constitution file referenced in feature spec ✅
- [x] Constitution compliance confirmed above ✅
- [ ] Codacy analysis on new files (after Phase 1 implementation)
- [ ] Templates reviewed and compatible ✅

## Project Structure

### Documentation (this feature)

```text
specs/013-clerk-integration-auth/
├── spec.md              # Feature specification (user stories, requirements)
├── plan.md              # This file (implementation strategy)
├── research.md          # Phase 0: Research findings (auth patterns, Clerk setup)
├── data-model.md        # Phase 1: Auth entities, session state, types
├── quickstart.md        # Phase 1: Developer onboarding for auth setup
├── contracts/           # Phase 1: API contracts for auth endpoints
│   └── auth-endpoints.yaml
└── tasks.md             # Phase 2: Executable task checklist (TDD-first)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (auth)/              # Auth-specific pages (sign-in, sign-up)
│   │   ├── sign-in/
│   │   │   └── page.tsx     # Sign-in form + Clerk component
│   │   ├── sign-up/
│   │   │   └── page.tsx     # Sign-up form + Clerk component
│   │   └── layout.tsx       # Auth layout (public, no nav)
│   ├── middleware.ts        # Server-side route protection
│   ├── profile/
│   │   ├── page.tsx         # Protected user profile page (tests auth)
│   │   └── layout.tsx
│   ├── api/
│   │   └── auth/
│   │       ├── session/
│   │       │   └── route.ts # GET /api/auth/session (returns user profile)
│   │       └── sign-out/
│   │           └── route.ts # POST /api/auth/sign-out (clears session)
│   └── layout.tsx           # Root layout with Clerk provider
├── components/
│   ├── auth/
│   │   ├── useAuth.ts       # Custom hook (reads Clerk session, no tokens)
│   │   ├── ProtectedRoute.tsx  # Client-side route guard (UX polish)
│   │   └── SignOutButton.tsx   # Sign-out button + handler
│   ├── GlobalNav.tsx        # Updated to show auth state
│   └── [other existing components]
├── lib/
│   ├── auth/
│   │   ├── middleware.ts    # Middleware utilities (route matchers)
│   │   ├── validation.ts    # Zod schemas for auth forms
│   │   └── constants.ts     # AUTH_PROTECTED_ROUTES, PUBLIC_ROUTES
│   └── [other existing utilities]
└── types/
    ├── auth.ts              # Auth types: User profile, Session, etc.
    └── [other existing types]

tests/
├── e2e/
│   ├── auth-flow.spec.ts    # E2E: sign-up → sign-in → protected route
│   └── session.spec.ts      # E2E: session persistence, sign-out
├── integration/
│   ├── auth-middleware.test.ts    # Middleware route matching
│   └── auth-session-api.test.ts   # /api/auth/session endpoint
└── unit/
    ├── useAuth.test.tsx     # Custom hook behavior
    ├── validation.test.ts   # Zod schema validation
    └── SignOutButton.test.tsx   # Component rendering + handlers
```

**Structure Decision**: Web application (Next.js App Router) with auth-specific pages, middleware for server-side enforcement, and custom hooks for client-side state. Auth logic isolated in `src/lib/auth/` and `src/components/auth/` for maintainability and composability.

## Complexity Tracking

No constitution violations identified. Auth integration aligns with:

- Simplicity principle (small, focused modules)
- Composability (hooks, middleware, components separated)
- Security (server-side enforcement, HTTP-only cookies)
- TDD approach (all behavior testable before implementation)

---

## Phase 0: Research & Clarifications

### Research Questions Resolved

1. **Clerk SDK Integration for Next.js**
   - **Decision**: Use `@clerk/nextjs` with built-in middleware for route protection
   - **Rationale**: Official SDK provides server-side middleware, React hooks, and secure session management out-of-the-box
   - **Alternatives Considered**: Auth0, Firebase Auth, Supabase Auth — Clerk chosen for simplicity (no additional DB setup for auth), strong Next.js integration, and webhook support for user lifecycle

2. **Session Storage & Security**
   - **Decision**: Clerk-managed HTTP-only cookies (no localStorage)
   - **Rationale**: HTTP-only cookies are immune to XSS attacks; Clerk SDK handles renewal and secure storage
   - **Alternatives Considered**: JWT in localStorage (security risk), localStorage + refresh tokens (less secure) — HTTP-only cookies + server middleware is industry standard

3. **Protected Route Enforcement**
   - **Decision**: Server-side middleware (Next.js Middleware) as primary, client-side guards for UX polish
   - **Rationale**: Middleware runs at edge before rendering, prevents unauthorized content leaks; client-side guards improve UX without replacing server-side security
   - **Alternatives Considered**: Client-side route guards only (security risk), API-level checks only (slower UX) — Middleware first is best practice

4. **Social Providers**
   - **Decision**: Google, GitHub, Discord (per spec clarifications)
   - **Rationale**: Covers majority of developer audiences; easy to configure in Clerk dashboard
   - **Alternatives Considered**: Adding LinkedIn, Microsoft later as Feature 013-extended (deferred)

5. **Auth Form Validation**
   - **Decision**: Zod schemas (already in project) for email/password validation
   - **Rationale**: Reusable, type-safe, consistent with project conventions
   - **Alternatives Considered**: Manual regex (error-prone), yup (unnecessary new dep) — Zod already used in project

### Technical Research Output

See `research.md` (Phase 0 deliverable) for detailed findings on:

- Clerk SDK capabilities and Next.js integration
- Next.js Middleware patterns
- Secure session lifecycle
- Social provider setup
- Error handling and edge cases

---

## Phase 1: Design & Contracts

### 1. Data Model & Entities

**User (Auth Profile)**

- `clerkId` (string, external identifier from Clerk)
- `email` (string)
- `firstName` (string)
- `lastName` (string)
- `imageUrl` (string, avatar)
- `lastSignInAt` (Date)
- `createdAt` (Date)

**Session (Client-side Context)**

- `isAuthenticated` (boolean)
- `user` (User profile, or null)
- `isLoading` (boolean, for async session check)

**Auth State (Middleware)**

- `redirectTo` (path, for post-sign-in redirect)

### 2. API Contracts

See `contracts/auth-endpoints.yaml` (Phase 1 deliverable):

- `GET /api/auth/session` → Returns authenticated user profile or null
- `POST /api/auth/sign-out` → Clears Clerk session and redirects to sign-in
- `GET /sign-in` → Clerk-hosted sign-in page (via `@clerk/nextjs/sign-in`)
- `GET /sign-up` → Clerk-hosted sign-up page (via `@clerk/nextjs/sign-up`)

### 3. Quickstart for Developers

See `quickstart.md` (Phase 1 deliverable):

- Clerk account setup and API key retrieval
- Environment variables (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY)
- Running the auth flow locally
- Adding protected routes

---

## Step-by-Step Implementation Plan (TDD-First)

### Phase 2A: Test Suite & Auth Hooks (TDD)

**T001: Write failing tests for useAuth hook**

- Test: `useAuth()` returns `{ isAuthenticated: false, user: null }` when no session
- Test: `useAuth()` returns authenticated user from Clerk when session exists
- Test: `useAuth()` returns `isLoading: true` while fetching session
- Test: Hook handles session refresh on mount

**T002: Write failing tests for middleware**

- Test: Middleware redirects unauthenticated requests to `/sign-in`
- Test: Middleware allows authenticated requests through
- Test: Middleware preserves query params in redirect (for post-sign-in redirect)
- Test: Middleware skips public routes (/, /sign-in, /sign-up)

**T003: Write failing tests for protected /profile page**

- Test: Unauthenticated users redirected to /sign-in
- Test: Authenticated users can access /profile
- Test: /profile shows user email and sign-out button

**T004: Write failing E2E tests**

- Test: User can sign up via Clerk form and see authenticated UI
- Test: User can sign in via Clerk form and access /profile
- Test: User can sign out and return to sign-in page
- Test: User session persists across page refreshes

### Phase 2B: Implementation (Red → Green → Refactor)

**I001: Implement Clerk setup & provider**

- Add `@clerk/nextjs` to package.json
- Configure Clerk environment variables in `.env.local`
- Add `<ClerkProvider>` to root layout

**I002: Implement middleware for route protection**

- Create `src/app/middleware.ts` with Clerk middleware
- Define public routes (/, /sign-in, /sign-up, /sign-up/*, /sign-in/*)
- Define protected routes (/profile, /characters, /parties, etc.)
- Test: Middleware tests pass

**I003: Implement useAuth hook**

- Create `src/components/auth/useAuth.ts`
- Hook reads Clerk session and user object
- Returns `{ isAuthenticated, user, isLoading }`
- Test: useAuth tests pass

**I004: Implement sign-in & sign-up pages**

- Create `src/app/(auth)/sign-in/page.tsx` (Clerk sign-in component)
- Create `src/app/(auth)/sign-up/page.tsx` (Clerk sign-up component)
- Create `src/app/(auth)/layout.tsx` (public layout, no nav)
- Test: Sign-up/sign-in forms render correctly

**I005: Implement protected /profile page (test harness)**

- Create `src/app/profile/page.tsx` (displays authenticated user email)
- Create `src/app/profile/layout.tsx` (protected)
- Middleware automatically protects via public/private route config
- Test: Unauthenticated users redirected; authenticated users see profile

**I006: Implement sign-out**

- Create `src/components/auth/SignOutButton.tsx`
- Calls Clerk's `signOut()` and redirects to /sign-in
- Test: Sign-out button works, session cleared

**I007: Update GlobalNav to show auth state**

- Use `useAuth()` hook in GlobalNav
- Show user email + sign-out button when authenticated
- Show sign-in/sign-up links when unauthenticated
- Test: GlobalNav renders correct auth UI

**I008: Implement /api/auth/session endpoint**

- GET /api/auth/session returns `{ user: Profile | null }`
- Used by frontend for session validation
- Test: Endpoint returns correct user or null

**I009: Implement /api/auth/sign-out endpoint**

- POST /api/auth/sign-out calls Clerk's sign-out
- Returns redirect URL
- Test: Endpoint clears session and returns redirect

### Phase 2C: Refinement & Documentation

**R001: Extract shared form validation**

- Create `src/lib/auth/validation.ts` with Zod schemas
- Email, password validation shared across sign-in/sign-up
- Test: Validation schemas cover all edge cases (empty, invalid email, weak password)

**R002: Add error handling & logging**

- Middleware logs failed redirects at INFO level
- API endpoints return meaningful error messages (no token leaks)
- Test: Error scenarios logged correctly

**R003: Add accessibility**

- Sign-in/sign-up pages fully keyboard navigable
- ARIA labels on forms and buttons
- Test: Axe accessibility scan passes

**R004: Update documentation**

- `.env.example` includes CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- docs/Auth-Setup.md (new) with Clerk setup guide
- Update README.md with auth feature

---

## Effort, Risks, and Mitigations

### Effort Estimate

| Phase | Tasks | Estimated Effort |
|-------|-------|------------------|
| Phase 0 (Research) | Clerk SDK deep-dive, middleware patterns, social provider setup | 4-6 hours |
| Phase 1 (Design) | Data model, contracts, quickstart | 2-3 hours |
| Phase 2A (Tests) | useAuth, middleware, E2E tests | 6-8 hours |
| Phase 2B (Implementation) | Clerk setup, middleware, pages, endpoints | 8-10 hours |
| Phase 2C (Refinement) | Refactoring, error handling, accessibility, docs | 4-5 hours |
| **Total** | | **24-32 hours** |

**Per PR Scope**: Recommend 1-2 PRs to avoid oversized changes:

- PR1: Clerk setup + middleware + useAuth hook + sign-in/sign-up pages (12-14 hours)
- PR2: Protected routes test, sign-out, GlobalNav update, API endpoints, refinement (12-14 hours)

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| Clerk API rate limits during development | Low | Medium | Use Clerk test keys during dev; staging setup before production |
| Session state desync between client and server | Medium | High | E2E tests verify session persistence across refreshes; middleware validates on every request |
| Social provider setup incomplete (missing credentials) | Low | Medium | Quickstart.md includes step-by-step provider setup; support for adding providers incrementally |
| Protected routes too strict (breaking legitimate flows) | Medium | High | Comprehensive E2E test suite; gradual rollout (profile first, then other pages) |
| Token exposure in logs or errors | Low | Critical | Code review for sensitive data; sanitize error messages before returning to client |
| Type safety gaps in auth context | Low | Medium | Strict TypeScript mode enforced; auth types in `src/types/auth.ts` reviewed in PR |

### Mitigations

1. **Comprehensive test coverage** (80%+) ensures auth flows work correctly
2. **Server-side middleware** as primary security boundary (not relying on client-side guards)
3. **Incremental rollout** (start with /profile, expand to other pages)
4. **Security review** during PR: code review checklist includes token handling, error messages, logging
5. **Clerk docs & SDK tests** used as reference during implementation

---

## File-Level Change List

### New Files

| File | Purpose | Lines | Type |
|------|---------|-------|------|
| `src/app/middleware.ts` | Route protection middleware | 40-50 | Middleware |
| `src/app/(auth)/layout.tsx` | Public auth layout | 15-20 | Layout |
| `src/app/(auth)/sign-in/page.tsx` | Sign-in page (Clerk component) | 20-30 | Page |
| `src/app/(auth)/sign-up/page.tsx` | Sign-up page (Clerk component) | 20-30 | Page |
| `src/app/profile/layout.tsx` | Protected profile layout | 15-20 | Layout |
| `src/app/profile/page.tsx` | Profile page (test harness) | 30-40 | Page |
| `src/app/api/auth/session/route.ts` | Session endpoint | 15-20 | API Route |
| `src/app/api/auth/sign-out/route.ts` | Sign-out endpoint | 15-20 | API Route |
| `src/components/auth/useAuth.ts` | Auth hook | 25-35 | Hook |
| `src/components/auth/SignOutButton.tsx` | Sign-out button | 15-20 | Component |
| `src/lib/auth/middleware.ts` | Middleware utilities | 30-40 | Utility |
| `src/lib/auth/validation.ts` | Zod schemas | 25-35 | Utility |
| `src/lib/auth/constants.ts` | Auth constants | 10-15 | Config |
| `src/types/auth.ts` | Auth types | 20-25 | Types |
| `tests/e2e/auth-flow.spec.ts` | E2E auth tests | 60-80 | E2E Test |
| `tests/integration/auth-middleware.test.ts` | Middleware tests | 40-60 | Integration Test |
| `tests/unit/useAuth.test.tsx` | Hook tests | 40-60 | Unit Test |
| `.env.example` | Updated with Clerk keys | +2 lines | Config |
| `docs/Auth-Setup.md` | Clerk setup guide | 60-80 | Documentation |

### Modified Files

| File | Change | Impact |
|------|--------|--------|
| `src/app/layout.tsx` | Add `<ClerkProvider>` wrapper | Small |
| `src/components/GlobalNav.tsx` | Show auth state using `useAuth()` | Medium |
| `package.json` | Add `@clerk/nextjs`, `@clerk/react` | Small |
| `README.md` | Add auth feature description | Small |

### Deleted Files

None (no legacy auth to remove in this MVP)

---

## Test Plan

### Unit Tests (Jest)

**Auth Hook (`useAuth.ts`)**

- Returns `{ isAuthenticated: false, user: null }` when no session
- Returns user object when authenticated
- Handles loading state during fetch
- Refreshes session on component mount

**Validation Schemas (`validation.ts`)**

- Email validation: rejects invalid formats, accepts valid emails
- Password validation: enforces minimum length (8 chars), special char requirement
- Zod schemas throw clear validation errors

**Components (`SignOutButton.tsx`)**

- Renders sign-out button with correct label
- Calls Clerk's `signOut()` on click
- Disables button while signing out
- Navigates to sign-in after sign-out

### Integration Tests (Jest + Testing Library)

**Middleware (`auth-middleware.test.ts`)**

- Public routes (/sign-in, /sign-up) allowed without auth
- Protected routes (/profile, /characters) redirect to /sign-in when unauthenticated
- Protected routes allowed with valid session
- Query params preserved in redirect (e.g., `?from=/profile`)

**API Endpoints**

- `GET /api/auth/session` returns user object when authenticated
- `GET /api/auth/session` returns null when unauthenticated
- `POST /api/auth/sign-out` clears session and returns redirect URL
- API endpoints validate Clerk session server-side

### E2E Tests (Playwright)

**Sign-Up Flow**

- User navigates to /sign-up
- Completes Clerk sign-up form (email, password, name)
- Redirected to /profile after successful sign-up
- User email visible in GlobalNav

**Sign-In Flow**

- User navigates to /sign-in
- Completes Clerk sign-in form (email, password)
- Redirected to /profile after successful sign-in
- User profile shows email

**Protected Route**

- Unauthenticated user navigates to /profile
- Redirected to /sign-in
- After sign-in, navigated back to /profile
- URL is preserved (post-sign-in redirect works)

**Session Persistence**

- User signs in
- Refreshes page
- Still authenticated (session persists)
- Can access /profile

**Sign-Out Flow**

- Authenticated user clicks sign-out button
- Session cleared
- Redirected to /sign-in
- Unauthenticated UI shown

**Error Handling**

- Invalid credentials on sign-in show error message
- Network error during sign-in handled gracefully
- Session corruption clears auth state

### Coverage Target

- Unit tests: 80%+ coverage for hooks, validation, utility functions
- Integration tests: 100% coverage of middleware route logic
- E2E tests: All user stories covered (sign-up, sign-in, protected routes, sign-out, session persistence)
- Overall: 80%+ coverage on touched code (per project standard)

---

## Rollout & Monitoring Plan

### Rollout Strategy

**Phase 1: Internal Testing (1-2 days)**

- Test auth flow locally with Clerk test keys
- Verify middleware protects routes correctly
- Test session persistence across refreshes

**Phase 2: Staging Deployment (1-2 days)**

- Deploy to Fly.io staging environment
- Configure Clerk staging keys
- Run E2E test suite against staging
- Invite team to test sign-up/sign-in

**Phase 3: Production Rollout (1 day)**

- Merge to `main` after PR approval
- Deploy to production Fly.io
- Configure production Clerk keys
- Monitor error rate and session metrics

### Monitoring & Observability

**Metrics to Track**

- Sign-up success rate (SC-001: target 90%+)
- Sign-in success rate (SC-004: target 99%)
- Protected route redirect latency (SC-002: target <1s)
- Session persistence rate (SC-003: target 95%+)
- Error rate on /api/auth endpoints (<1%)

**Logging**

- Middleware logs redirect events at INFO level (no PII)
- API endpoints log errors with request context (no tokens)
- Clerk webhook events logged for user lifecycle tracking

**Alerts**

- Alert if sign-in error rate > 5%
- Alert if session endpoint latency > 500ms
- Alert if middleware redirect loops detected

### Kill Switch / Rollback Plan

- If critical auth bugs detected:
  1. Disable social login (redirect to email-only)
  2. If middleware broken, comment out middleware.ts temporarily
  3. Revert PR if necessary
  4. Open issue to track fix

---

## Handoff Package

### Artifacts Delivered (End of Phase 0-1)

1. **research.md** — Clerk SDK findings, middleware patterns, security best practices
2. **data-model.md** — Auth entities, session state, types
3. **quickstart.md** — Developer onboarding for local Clerk setup
4. **contracts/auth-endpoints.yaml** — API contracts for auth endpoints
5. **tasks.md** — Executable TDD-first task checklist

### Artifacts Delivered (After Phase 2 Implementation)

1. **Pull Request #1**: Clerk setup + middleware + hooks + sign-in/sign-up pages
   - Code: middleware.ts, useAuth.ts, sign-in/sign-up pages, ClerkProvider setup
   - Tests: Middleware tests, useAuth tests, component tests
   - Docs: Updated .env.example, code comments

2. **Pull Request #2**: Protected routes + sign-out + API endpoints + refinement
   - Code: profile page, sign-out button, API endpoints, GlobalNav update
   - Tests: Protected route tests, API endpoint tests, E2E tests
   - Docs: Auth-Setup.md, updated README.md

### Review Checklist (PR Requirements)

- [ ] All 80%+ test coverage target met
- [ ] TypeScript strict mode: no `any` types
- [ ] Codacy analysis: no duplication, complexity OK, no security issues
- [ ] Clerk SDK security best practices followed (no tokens in localStorage, HTTP-only cookies)
- [ ] Middleware correctly protects routes (verified by middleware tests)
- [ ] Error messages sanitized (no token leaks)
- [ ] Accessibility: forms keyboard-navigable, ARIA labels present
- [ ] Documentation updated (.env.example, Auth-Setup.md, README.md)

### Next Steps After Merge

1. **Feature 014** (User Profile Enrichment): Extend auth to include MongoDB user profiles with avatar, preferences, etc.
2. **Feature 015** (Webhook Handlers): Add Clerk webhooks for user creation/deletion events
3. **Feature 016** (Two-Factor Auth): Add optional 2FA via Clerk MFA
4. **Monitoring**: Set up Datadog/CloudWatch for auth metrics

---

## Notes for Implementation

- **Branch**: Ensure feature branch matches spec: `feature/013-clerk-integration-auth`
- **Clerk Setup**: Retrieve API keys from Clerk dashboard (not yet in secrets; add during Phase 2B)
- **Testing**: Start with E2E tests first to establish user flows, then unit tests for hooks/validation
- **Security Review**: Code review should specifically check for token handling and error message sanitization
- **Accessibility**: Use Axe accessibility scanner on sign-in/sign-up forms during refinement phase
