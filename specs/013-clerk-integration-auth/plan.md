# Summary

Add Clerk-based authentication and session management to the app. Deliver a developer-friendly auth quickstart, a working sign-in/sign-up flow, server and client helpers for protected routes, and tests that validate common auth flows (sign-in, sign-out, session persistence, and protected-route redirects).

This plan consolidates the decisions and execution steps from the previous planning artifacts into a single, actionable implementation plan organized by phase.

## Assumptions & Open Questions

- Assumptions
  - The project remains Next.js 16 with App Router and React 19.
- Open Questions (implementer should resolve before Phase 2 execution)
  1. Scope decision: Clerk protection will be enabled only for a small set of protected routes initially: `/dashboard`, `/subscription`, and `/profile`. Other routes remain public by default.
  2. Do we prefer server session endpoints (e.g., `/api/auth/session`) that mirror Clerk data, or rely exclusively on Clerk SDK calls in the client? Recommended: provide a minimal server endpoint for server-rendered pages and integration tests.
  3. E2E test runner: use existing Playwright config — confirm service worker or other test-time interceptors won't block Clerk flows.

  - Add Clerk dependencies and environment variables; add quickstart docs.

  - Implement auth helper utilities (middleware helpers, validation schemas, types, `useAuth` hook), and the two API routes for session/sign-out.

## Acceptance Criteria (Normalized & Testable)

- US1: Sign up / Sign in pages + wiring to `GlobalNav` and unit tests.

1. Developer can follow `specs/013-clerk-integration-auth/quickstart.md` to run locally and authenticate using Clerk test keys.
2. Sign-in and sign-up pages (routes) render Clerk components and complete a user sign-in flow in E2E tests.

   - Docs, developer checklist, Codacy run and fixes.
3. `useAuth` client hook exposes `isAuthenticated`, `user`, and `isLoading` and is unit-tested (mockable) and covered by unit tests.
4. Protected server-side middleware redirects unauthenticated users to sign-in, preserving return path.
5. `GET /api/auth/session` returns the authenticated user's minimal profile when called with a valid session; `POST /api/auth/sign-out` invalidates the session server-side.
6. Sign-out UI clears client state and server session (integration/E2E tested).
7. Codacy analysis returns no blocking issues for newly added files.

Provide both client helpers (for UI) and server utilities (for middleware and API routes) so tests and SSR pages can use auth safely.

TDD-first where practical: unit test hooks and utilities, add integration/E2E for full flows.

### Observability / Telemetry

Observability and telemetry requirements (structured events for login-success, login-failure, signout, middleware-deny) are acknowledged but will be deferred to a follow-up work item to avoid scope creep for the initial rollout. A placeholder task is added to `tasks.md` to track the deferral and create a follow-up issue.
3. Phase 3 — User Stories

- US1: Sign up / Sign in pages + wiring to `GlobalNav` and unit tests.
- US2: Protected routes & middleware behavior + integration tests for redirects.

## Step-by-Step Implementation Plan (TDD-first)

- T003: Wrap the app with Clerk provider in `src/app/layout.tsx`.
- T004: Add `specs/013-clerk-integration-auth/quickstart.md` with local dev steps.
- T006: `src/lib/auth/validation.ts` — Zod schemas for any auth-related server payloads.
- T007: `src/types/auth.ts` — `UserProfile`, `Session` types.

Phase 3 — User Stories

- T013: `src/app/(auth)/sign-up/page.tsx` — sign-up page using Clerk components.
- T014: Unit tests for `useAuth` (mock Clerk) at `tests/unit/useAuth.test.tsx`.
- T015: E2E test for sign-up → sign-in → profile at `tests/e2e/auth-flow.spec.ts`.
- T016: Wire `GlobalNav` to show authenticated state when `useAuth` reports a user.

# Implementation Plan: Clerk Integration & Auth Flow (Feature 013)

**Branch**: `feature/013-clerk-integration-auth` | **Date**: 2025-11-17 | **Spec**: `specs/013-clerk-integration-auth/spec.md`

**Maintainer**: @doug

---

## Summary

Add Clerk-based authentication and session management to the app. Deliver a developer-friendly auth quickstart, a working sign-in/sign-up flow, server and client helpers for protected routes, and tests that validate common auth flows (sign-in, sign-out, session persistence, and protected-route redirects).

This plan consolidates the decisions and execution steps from the previous planning artifacts into a single, actionable implementation plan organized by phase.

## Assumptions & Open Questions

Assumptions

- The project remains Next.js 16 with App Router and React 19.
- Clerk will be used in dev with mock/local credentials; production keys stored via environment variables.
- A mix of client-side and server-side protections is acceptable (middleware for server routes and client hooks for UI wiring).

Open Questions (implementer should resolve before Phase 2 execution)

1. Scope decision (duplicate): Clerk protection will be enabled only for `/dashboard`, `/subscription`, and `/profile` initially.
2. Do we prefer server session endpoints (e.g., `/api/auth/session`) that mirror Clerk data, or rely exclusively on Clerk SDK calls in the client? Recommended: provide a minimal server endpoint for server-rendered pages and integration tests.
3. E2E test runner: use existing Playwright config — confirm service worker or other test-time interceptors won't block Clerk flows.

## Acceptance Criteria (Normalized & Testable)

1. Developer can follow `specs/013-clerk-integration-auth/quickstart.md` to run locally and authenticate using Clerk test keys.
2. Sign-in and sign-up pages (routes) render Clerk components and complete a user sign-in flow in E2E tests.
3. `useAuth` client hook exposes `isAuthenticated`, `user`, and `isLoading` and is unit-tested (mockable) and covered by unit tests.
4. Protected server-side middleware redirects unauthenticated users to sign-in, preserving return path.
5. `GET /api/auth/session` returns the authenticated user's minimal profile when called with a valid session; `POST /api/auth/sign-out` invalidates the session server-side.
6. Sign-out UI clears client state and server session (integration/E2E tested).
7. Codacy analysis returns no blocking issues for newly added files.

## Approach & Design Brief

Design principles:

- Keep Clerk SDK usage centralized: root-level provider + small wrapper utilities/hooks.

- Provide both client helpers (for UI) and server utilities (for middleware and API routes) so tests and SSR pages can use auth safely.

- TDD-first where practical: unit test hooks and utilities, add integration/E2E for full flows.

Work Breakdown (recommended slices)

1. Phase 1 — Setup (small, low-risk)

- Add Clerk dependencies and environment variables; add quickstart docs.

2. Phase 2 — Foundational (blocking)

- Implement auth helper utilities (middleware helpers, validation schemas, types, `useAuth` hook), and the two API routes for session/sign-out.

3. Phase 3 — User Stories

- US1: Sign up / Sign in pages + wiring to `GlobalNav` and unit tests.

4. Final Phase — Polish

- Docs, developer checklist, Codacy run and fixes.

- `.env.example` (env vars)

- `src/app/layout.tsx` (Clerk provider)

- `specs/013-clerk-integration-auth/quickstart.md` (docs)

- `src/lib/auth/middleware.ts` (helpers)

- `src/lib/auth/validation.ts` (Zod schemas)

- `src/types/auth.ts` (types)

- `src/components/auth/useAuth.ts` (client hook)

- `src/app/api/auth/session/route.ts`

- `src/app/api/auth/sign-out/route.ts`

- `src/app/(auth)/sign-in/page.tsx`

- `src/app/(auth)/sign-up/page.tsx`

- `src/components/auth/SignOutButton.tsx`

- Tests: `tests/unit/useAuth.test.tsx`, `tests/integration/auth-middleware.test.ts`, `tests/e2e/auth-flow.spec.ts`, `tests/e2e/session.spec.ts`

## Test Plan

- Unit tests

  - `useAuth` hook (mock Clerk SDK)

  - Middleware helpers (redirect logic, return path preservation)

- Integration tests

  - Middleware redirect behavior

  - API endpoints (`GET /api/auth/session`, `POST /api/auth/sign-out`)

- E2E tests (Playwright)

  - Sign-up → Sign-in → profile flow

  - Session persistence across refresh and sign-out

Test strategy: TDD-first for core utilities; wire real Clerk components in E2E but mock or use test keys where possible.

## Rollout & Monitoring Plan

- Deploy to a staging environment with Clerk test keys before production.

- Monitor authentication errors via server logs and Sentry (if configured).

## Handoff Package

Deliver to reviewers:

- This `plan.md` and `specs/013-clerk-integration-auth/quickstart.md` (developer setup)

- PRs per phase with tests passing

- QA checklist for auth flows and environment variables

---

Generated by consolidation on 2025-11-17. For edits, update `specs/013-clerk-integration-auth/plan.md` or the original planning artifacts.
