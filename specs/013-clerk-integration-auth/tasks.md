# Tasks for Feature 013 — Clerk Integration & Auth Flow

This file is generated from `spec.md` and `plan.md`. Tasks are organized by phase and by user story (priority order). Each task is immediately actionable and includes the repository-relative file path.

## Phase 1 — Setup

- [x] T001 Update `package.json` to add `@clerk/nextjs` and `@clerk/react` dependencies (file: `package.json`)
- [x] T002 [P] Add environment variables to `.env.example`: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` (file: `.env.example`)
- [x] T003 Add Clerk provider and root-level setup to `src/app/layout.tsx` (wrap app with Clerk provider) (file: `src/app/layout.tsx`)
- [x] T004 Create `specs/013-clerk-integration-auth/quickstart.md` with local setup and Clerk dashboard steps (file: `specs/013-clerk-integration-auth/quickstart.md`)

## Phase 2 — Foundational (blocking prerequisites)

- [x] T011 Add unit test skeletons for auth utilities in `tests/unit/` (file: `tests/unit/useAuth.test.tsx`)
- [x] T014 [P] [US1] Add unit tests for `useAuth` (mock Clerk) at `tests/unit/useAuth.test.tsx` (file: `tests/unit/useAuth.test.tsx`)
- [x] T005 Create `src/lib/auth/middleware.ts` with helper functions for route matching and session checks (file: `src/lib/auth/middleware.ts`)
- [x] T006 Create `src/lib/auth/validation.ts` with Zod schemas for auth forms (file: `src/lib/auth/validation.ts`)
- [x] T007 Create `src/types/auth.ts` with `UserProfile` and `Session` TypeScript types (file: `src/types/auth.ts`)
- [x] T008 Create client-side hook `src/components/auth/useAuth.ts` that exposes `isAuthenticated`, `user`, `isLoading` (file: `src/components/auth/useAuth.ts`)
- [x] T009 Implement `GET /api/auth/session` route that returns the authenticated user's profile (file: `src/app/api/auth/session/route.ts`)
- [x] T010 Implement `POST /api/auth/sign-out` route that clears Clerk session server-side (file: `src/app/api/auth/sign-out/route.ts`)

## Phase 3 — User Stories (Priority order)

### User Story 1 — Sign up and Sign in (Priority: P1)

- [x] T012 [US1] Create sign-in page using Clerk components at `src/app/(auth)/sign-in/page.tsx` (file: `src/app/(auth)/sign-in/page.tsx`)
- [x] T013 [US1] Create sign-up page using Clerk components at `src/app/(auth)/sign-up/page.tsx` (file: `src/app/(auth)/sign-up/page.tsx`)
- [x] T014 [P] [US1] Add unit tests for `useAuth` (mock Clerk) at `tests/unit/useAuth.test.tsx` (file: `tests/unit/useAuth.test.tsx`)
- [x] T015 [US1] Add E2E test for sign-up → sign-in → profile flow at `tests/e2e/auth-flow.spec.ts` (file: `tests/e2e/auth-flow.spec.ts`)
- [x] T016 [US1] Wire `GlobalNav` to show authenticated state when `useAuth` reports a user (file: `src/components/GlobalNav.tsx`)

### User Story 2 — Protected Routes & Redirects (Priority: P2)

- [x] T019 [P] [US2] Add integration test for middleware redirect behavior at `tests/integration/auth-middleware.test.ts` (file: `tests/integration/auth-middleware.test.ts`)
- [x] T017 [US2] Implement server-side protection in `src/middleware.ts` to enforce protected routes (`/dashboard`, `/subscription`, `/profile`) (file: `src/middleware.ts`)
- [x] T018 [US2] Create protected profile page at `src/app/profile/page.tsx` that requires auth and displays profile (file: `src/app/profile/page.tsx`)
- [x] T020 [US2] Implement post-auth redirect handling (preserve return path) in middleware and sign-in flow (file: `src/lib/auth/middleware.ts`)

### User Story 3 — Session Persistence & Sign Out (Priority: P3)

- [x] T023 [P] [US3] Add E2E test for session persistence across refresh and sign-out at `tests/e2e/session.spec.ts` (file: `tests/e2e/session.spec.ts`)
- [x] T021 [US3] Implement `SignOutButton` component and handler at `src/components/auth/SignOutButton.tsx` (file: `src/components/auth/SignOutButton.tsx`)
- [x] T022 [US3] Ensure sign-out triggers server-side session clear by calling `POST /api/auth/sign-out` (file: `src/components/auth/SignOutButton.tsx`)

## Final Phase — Polish & Cross-Cutting Concerns

- [x] T024 Update `README.md` with feature-specific deployment notes for Clerk (file: `README.md`)
- [x] T025 Add developer checklist `specs/013-clerk-integration-auth/checklists/developer-checklist.md` (file: `specs/013-clerk-integration-auth/checklists/developer-checklist.md`)
- [ ] T026 Run Codacy analysis for any newly added files and address issues (note: repository Codacy CLI step) (file: `specs/013-clerk-integration-auth/checklists/codacy-note.md`)
- [ ] T027 Defer observability & telemetry instrumentation for auth flows (create follow-up issue and checklist) (file: `specs/013-clerk-integration-auth/checklists/codacy-note.md`)

---

## Dependencies (story completion order)

- `Phase 1` tasks (T001–T004) must be complete before `Phase 2` tasks (T005–T011).
- `Phase 2` foundational tasks must be complete (or at least `T005`, `T008`, `T009`, `T010`) before `US1` (T012–T016) and `US2` (T017–T020) work proceeds.
- `US3` (T021–T023) depends on `T010` (sign-out route) and `T008` (useAuth hook).

## Parallel execution examples

- While `T005` (`src/lib/auth/middleware.ts`) is implemented, a different engineer can implement `T012`/`T013` (sign-in/sign-up pages) in parallel because the Clerk SDK components are independent of middleware wiring. Marked `[P]` tasks are safe to run in parallel.
- Unit tests for `useAuth` (T014) and component `SignOutButton` (T021) can be developed in parallel before final wiring.

## Validation checklist (format rules)

- Total tasks: 26
- Tasks per story: US1=5 (T012–T016), US2=4 (T017–T020), US3=3 (T021–T023)
- All tasks use the required checklist format `- [ ] T### [P?] [US#?] Description (file: \
  path)`

## Suggested MVP

- Implement Phase 1 (T001–T004), key foundational tasks (T005, T008, T009, T010), and User Story 1 (T012–T016). That yields a minimal, testable sign-up/sign-in flow.

---

Generated on 2025-11-17 by automation (speckit.tasks). If you want me to create the test stubs or implement the highest-priority tasks now, tell me which task ID to start with.
