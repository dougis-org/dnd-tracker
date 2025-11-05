---
title: F002 Tasks
---

## Summary

Task list for feature: F002 - Navigation & Not Implemented Page

All tasks are grouped by user story and follow the required checklist format so an LLM or developer can implement them directly.

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Create component directory `src/components/navigation/` and `src/components/layouts/` if missing (paths: `src/components/navigation/`, `src/components/layouts/`)
- [X] T002 Create test directories `tests/unit/` and `tests/e2e/` if missing (paths: `tests/unit/`, `tests/e2e/`)
- [X] T003 [P] Add placeholder exports file `src/components/index.ts` that re-exports new components (path: `src/components/index.ts`)
- [X] T051 Create `specs/002-navigation-not-implemented-page/contracts/openapi.yml` with roadmap routes as placeholder endpoints (path: `specs/002-navigation-not-implemented-page/contracts/openapi.yml`)

---

## Phase 2: Foundational (Blocking Prerequisites)

Purpose: core UI wiring that must be in place before user stories can be implemented.

- [X] T004 Implement `src/components/NotImplementedPage.tsx` with accessible message and CTA (path: `src/components/NotImplementedPage.tsx`)
- [X] T005 [P] Create `src/components/Footer.tsx` with legal/social links (path: `src/components/Footer.tsx`)
- [X] T006 Implement `src/components/navigation/GlobalNav.tsx` (desktop variant only) and export it (path: `src/components/navigation/GlobalNav.tsx`)
- [X] T007 Implement `src/components/navigation/GlobalNav.mobile.tsx` (mobile/hamburger variant) and export it (path: `src/components/navigation/GlobalNav.mobile.tsx`)
- [X] T008 Implement `src/components/Breadcrumb.tsx` which derives segments from path and maps to labels via `src/lib/navigation.ts` (paths: `src/components/Breadcrumb.tsx`, `src/lib/navigation.ts`)
- [X] T009 Wire the GlobalNav and Footer into the app layout by updating `src/app/layout.tsx` to include `<GlobalNav />` in the header and `<Footer />` in the page footer (path: `src/app/layout.tsx`)

---

## Phase 2a: Route stubs (from roadmap)

Purpose: Create routing skeleton files for every roadmap entry so each route renders `NotImplementedPage` per FR-006.

- [ ] T028 Create route `src/app/page.tsx` that renders `<NotImplementedPage />`
- [ ] T029 Create route `src/app/dashboard/page.tsx` that renders `<NotImplementedPage />`
- [ ] T030 Create route `src/app/characters/page.tsx` that renders `<NotImplementedPage />`
- [ ] T031 Create route `src/app/characters/new/page.tsx` that renders `<NotImplementedPage />`
- [ ] T032 Create route `src/app/characters/[id]/page.tsx` that renders `<NotImplementedPage />`
- [ ] T033 Create route `src/app/parties/page.tsx` that renders `<NotImplementedPage />`
- [ ] T034 Create route `src/app/parties/new/page.tsx` that renders `<NotImplementedPage />`
- [ ] T035 Create route `src/app/parties/[id]/page.tsx` that renders `<NotImplementedPage />`
- [ ] T036 Create route `src/app/encounters/page.tsx` that renders `<NotImplementedPage />`
- [ ] T037 Create route `src/app/encounters/new/page.tsx` that renders `<NotImplementedPage />`
- [ ] T038 Create route `src/app/encounters/[id]/page.tsx` that renders `<NotImplementedPage />`
- [ ] T039 Create route `src/app/monsters/page.tsx` that renders `<NotImplementedPage />`
- [ ] T040 Create route `src/app/monsters/new/page.tsx` that renders `<NotImplementedPage />`
- [ ] T041 Create route `src/app/monsters/[id]/page.tsx` that renders `<NotImplementedPage />`
- [ ] T042 Create route `src/app/items/page.tsx` that renders `<NotImplementedPage />`
- [ ] T043 Create route `src/app/items/new/page.tsx` that renders `<NotImplementedPage />`
- [ ] T044 Create route `src/app/items/[id]/page.tsx` that renders `<NotImplementedPage />`
- [ ] T045 Create route `src/app/combat/page.tsx` that renders `<NotImplementedPage />`
- [ ] T046 Create route `src/app/combat/[sessionId]/page.tsx` that renders `<NotImplementedPage />`
- [ ] T047 Create route `src/app/profile/page.tsx` that renders `<NotImplementedPage />`
- [ ] T048 Create route `src/app/settings/page.tsx` that renders `<NotImplementedPage />`
- [ ] T049 Create route `src/app/subscription/page.tsx` that renders `<NotImplementedPage />`
- [ ] T050 Create route `src/app/pricing/page.tsx` that renders `<NotImplementedPage />`
- [ ] T100 Create route `src/app/help/page.tsx` that renders `<NotImplementedPage />`

## Phase 2b: Navigation Refinement & Help Route Addendum (Plan Update Response)

Purpose: Align navigation structure, tests, and documentation with the refined menu layout from `docs/plan/issues/333-plan.md`.

### Tests (TDD-first)

- [x] T101 Add unit tests in `tests/unit/lib/navigation.spec.ts` (or extend existing layout spec) to assert grouped navigation data and inclusion of the Help entry (path: `tests/unit/lib/navigation.spec.ts`)
- [x] T102 Update `tests/unit/components/navigation/GlobalNav.spec.tsx` to verify left/right group rendering, "User" label, and Help link visibility (path: `tests/unit/components/navigation/GlobalNav.spec.tsx`)
- [x] T103 Update `tests/unit/components/navigation/GlobalNav.mobile.spec.tsx` to ensure mobile ordering: Dashboard → Collections → Combat → User → Pricing → Help with nested children preserved (path: `tests/unit/components/navigation/GlobalNav.mobile.spec.tsx`)
- [x] T104 Extend `tests/unit/app/layout.spec.tsx` (or add new spec) to confirm `/help` route renders `NotImplementedPage` and breadcrumb segments include Help (path: `tests/unit/app/layout.spec.tsx`)
- [x] T111 Extend Playwright smoke coverage in `tests/e2e/navigation.spec.ts` to navigate to `/help` and assert NotImplemented content (path: `tests/e2e/navigation.spec.ts`)

### Implementation

- [x] T105 Update `src/lib/navigation.ts` to introduce grouped navigation metadata, include Help route definitions, and keep breadcrumb mappings consistent (path: `src/lib/navigation.ts`)
- [x] T106 Refactor `src/components/navigation/GlobalNav.tsx` to render grouped left/right clusters using the "User" text label and accessible submenu triggers (path: `src/components/navigation/GlobalNav.tsx`)
- [x] T107 Update `src/components/navigation/GlobalNav.mobile.tsx` to flatten grouped data into the specified mobile ordering while preserving accessibility (path: `src/components/navigation/GlobalNav.mobile.tsx`)
- [x] T108 Ensure breadcrumbs surface Help correctly by updating relevant helpers/tests (paths: `src/lib/navigation.ts`, `src/components/Breadcrumb.tsx`)
- [x] T109 Update documentation artifacts, including `specs/002-navigation-not-implemented-page/contracts/openapi.yml`, `specs/002-navigation-not-implemented-page/spec.md`, and any nav description in `docs/Feature-Roadmap.md` to reflect the Help route and grouping (paths: listed)
- [x] T110 Run linting (`npm run lint`, `npm run lint:markdown:fix`) and targeted test suites (`npm run test -- navigation`, `npm run test:ci:parallel`) capturing evidence for the PR (no code path)

## Phase 3: User Story 1 - Navigate to Dashboard (Priority: P1) 🎯 MVP

Goal: From any page the user can click the Dashboard link and see the NotImplemented placeholder for `/dashboard`.

Independent Test: Unit test for link presence + Playwright smoke test for navigation to `/dashboard`.

### Tests (TDD-first) — US1

- [ ] T010 [P] [US1] Add unit test `tests/unit/global-nav.spec.tsx` that asserts the Dashboard link exists and is keyboard-focusable (path: `tests/unit/global-nav.spec.tsx`)
- [ ] T011 [P] [US1] Add Playwright smoke test `tests/e2e/navigation.spec.ts` that opens the site, clicks or keyboard-activates Dashboard, and asserts NotImplementedPage content for `/dashboard` (path: `tests/e2e/navigation.spec.ts`)

### Implementation — US1

- [ ] T012 [US1] Verify the `/dashboard` stub created in Phase 2a (T029) renders `NotImplementedPage` and is reachable via navigation flows (no new file)
- [ ] T013 [US1] Ensure `src/components/navigation/GlobalNav.tsx` contains a link to `/dashboard` (path: `src/components/navigation/GlobalNav.tsx`)
- [ ] T014 [US1] Run unit tests and make `tests/unit/global-nav.spec.tsx` pass (command: `pnpm test -w tests/unit/global-nav.spec.tsx` - document for developer) (no code path)

---

## Phase 4: User Story 2 - Mobile Navigation (Priority: P2)

Goal: Mobile users can open a hamburger menu and navigate to top-level pages such as `/characters`.

Independent Test: Playwright mobile viewport test and unit test for mobile nav behavior.

### Tests (TDD-first) — US2

- [ ] T015 [P] [US2] Add unit test `tests/unit/global-nav.mobile.spec.tsx` asserting the hamburger button toggles the menu and that links are present (path: `tests/unit/global-nav.mobile.spec.tsx`)
- [ ] T016 [P] [US2] Add Playwright test (same file `tests/e2e/navigation.spec.ts`) that emulates a mobile viewport, opens the hamburger, clicks `Characters`, and verifies `/characters` shows NotImplemented content (path: `tests/e2e/navigation.spec.ts`)

### Implementation — US2

- [ ] T017 [US2] Confirm the `/characters` stub from Phase 2a (T030) renders `NotImplementedPage` and remains wired into navigation flows (no new file)
- [ ] T018 [US2] Implement hamburger toggle behavior in `src/components/navigation/GlobalNav.mobile.tsx` and ensure links navigate to their routes (path: `src/components/navigation/GlobalNav.mobile.tsx`)
- [ ] T019 [US2] Run unit tests and make `tests/unit/global-nav.mobile.spec.tsx` pass (no code path)

---

## Phase 5: User Story 3 - Breadcrumbs reflect path (Priority: P3)

Goal: Breadcrumb shows Home / Characters / [ID] on `/characters/123` and parent segments link to their NotImplemented pages.

Independent Test: Unit test for Breadcrumb rendering and link behavior.

### Tests (TDD-first) — US3

- [X] T020 [P] [US3] Add unit test `tests/unit/breadcrumb.spec.tsx` that renders `/characters/123` route context and asserts breadcrumb segments and links (path: `tests/unit/breadcrumb.spec.tsx`)

### Breadcrumb truncation (edge case)

- [ ] T052 Ensure breadcrumb truncation for long route segments with a tooltip exposing the full segment and add unit tests `tests/unit/breadcrumb.truncation.spec.tsx` (paths: `src/components/Breadcrumb.tsx`, `tests/unit/breadcrumb.truncation.spec.tsx`)

### Implementation — US3

- [ ] T021 [US3] Confirm the `/characters/[id]` stub from Phase 2a (T032) renders `NotImplementedPage` and exposes breadcrumb metadata (no new file)
- [ ] T022 [US3] Ensure `src/components/Breadcrumb.tsx` maps route segments to labels using `src/lib/navigation.ts` and that parent segments are links (paths: `src/components/Breadcrumb.tsx`, `src/lib/navigation.ts`)
- [ ] T023 [US3] Run unit tests and make `tests/unit/breadcrumb.spec.tsx` pass (no code path)

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T024 [P] Update docs/Feature-Roadmap.md to reflect implemented placeholder routes and navigation (path: `docs/Feature-Roadmap.md`)
- [ ] T025 [P] Accessibility audit: add axe checks or manual checklist in `tests/unit/accessibility.md` (path: `tests/unit/accessibility.md`)
- [ ] T026 [P] Add Storybook/visual snapshot (optional) for `GlobalNav` and `Breadcrumb` components (paths: `.storybook/`, `stories/`) - only if project uses Storybook
- [ ] T027 Release checklist: create PR, include test results and accessibility notes (no code path)

---

## Dependencies & Execution Order

- Setup (Phase 1) must run first (T001-T003)
- Foundational (Phase 2) must complete before User Stories (T004-T009)
- User Stories (Phases 3-5) can run in priority order; tests are written first (T010-T011, T015-T016, T020)
- Polish can run in parallel after stories complete (T024-T027)

## Summary Metrics

- Total tasks: 63
- Tasks by story: US1: 5 (T010-T014), US2: 5 (T015-T019), US3: 4 (T020-T023)
- Additional plan-addendum tasks: T100-T110 focus on navigation refinement and Help route integration
- Parallelizable tasks identified (marked [P]): T003, T005, T006, T007, T015, T016, T020, T024, T025, T026
- Suggested MVP: Complete Phase 1 + Phase 2 + Phase 3 (T001-T014)

## How to use

1. Start with Phase 1 tasks to prepare the repo.
2. Complete Foundational Phase (T004-T009).
3. Execute US1 TDD steps: add tests (T010-T011), implement routes/components (T012-T013), run tests (T014).
4. Repeat for US2 and US3.

---

```
