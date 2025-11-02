```markdown
---
title: F002 Tasks
---

## Summary

Task list for feature: F002 — Navigation & Not Implemented Page

All tasks are grouped by user story and follow the required checklist format so an LLM or developer can implement them directly.

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Create component directory `src/components/navigation/` and `src/components/layouts/` if missing (paths: `src/components/navigation/`, `src/components/layouts/`)
- [ ] T002 Create test directories `tests/unit/` and `tests/e2e/` if missing (paths: `tests/unit/`, `tests/e2e/`)
- [ ] T003 [P] Add placeholder exports file `src/components/index.ts` that re-exports new components (path: `src/components/index.ts`)

---

## Phase 2: Foundational (Blocking Prerequisites)

Purpose: core UI wiring that must be in place before user stories can be implemented.

- [ ] T004 Implement `src/components/NotImplementedPage.tsx` with accessible message and CTA (path: `src/components/NotImplementedPage.tsx`)
- [ ] T005 [P] Create `src/components/Footer.tsx` with legal/social links (path: `src/components/Footer.tsx`)
- [ ] T006 Implement `src/components/navigation/GlobalNav.tsx` (desktop variant only) and export it (path: `src/components/navigation/GlobalNav.tsx`)
- [ ] T007 Implement `src/components/navigation/GlobalNav.mobile.tsx` (mobile/hamburger variant) and export it (path: `src/components/navigation/GlobalNav.mobile.tsx`)
- [ ] T008 Implement `src/components/Breadcrumb.tsx` which derives segments from path and maps to labels via `src/lib/navigation.ts` (paths: `src/components/Breadcrumb.tsx`, `src/lib/navigation.ts`)
- [ ] T009 Wire the GlobalNav and Footer into the app layout by updating `src/app/layout.tsx` to include `<GlobalNav />` in the header and `<Footer />` in the page footer (path: `src/app/layout.tsx`)

---

## Phase 3: User Story 1 - Navigate to Dashboard (Priority: P1) 🎯 MVP

Goal: From any page the user can click the Dashboard link and see the NotImplemented placeholder for `/dashboard`.

Independent Test: Unit test for link presence + Playwright smoke test for navigation to `/dashboard`.

### Tests (TDD-first)

- [ ] T010 [P] [US1] Add unit test `tests/unit/global-nav.spec.tsx` that asserts the Dashboard link exists and is keyboard-focusable (path: `tests/unit/global-nav.spec.tsx`)
- [ ] T011 [P] [US1] Add Playwright smoke test `tests/e2e/navigation.spec.ts` that opens the site, clicks or keyboard-activates Dashboard, and asserts NotImplementedPage content for `/dashboard` (path: `tests/e2e/navigation.spec.ts`)

### Implementation

- [ ] T012 [US1] Add route file `src/app/dashboard/page.tsx` that renders `<NotImplementedPage />` (path: `src/app/dashboard/page.tsx`)
- [ ] T013 [US1] Ensure `src/components/navigation/GlobalNav.tsx` contains a link to `/dashboard` (path: `src/components/navigation/GlobalNav.tsx`)
- [ ] T014 [US1] Run unit tests and make `tests/unit/global-nav.spec.tsx` pass (command: `pnpm test -w tests/unit/global-nav.spec.tsx` — document for developer) (no code path)

---

## Phase 4: User Story 2 - Mobile Navigation (Priority: P2)

Goal: Mobile users can open a hamburger menu and navigate to top-level pages such as `/characters`.

Independent Test: Playwright mobile viewport test and unit test for mobile nav behavior.

### Tests (TDD-first)

- [ ] T015 [P] [US2] Add unit test `tests/unit/global-nav.mobile.spec.tsx` asserting the hamburger button toggles the menu and that links are present (path: `tests/unit/global-nav.mobile.spec.tsx`)
- [ ] T016 [P] [US2] Add Playwright test (same file `tests/e2e/navigation.spec.ts`) that emulates a mobile viewport, opens the hamburger, clicks `Characters`, and verifies `/characters` shows NotImplemented content (path: `tests/e2e/navigation.spec.ts`)

### Implementation

- [ ] T017 [US2] Add route file `src/app/characters/page.tsx` that renders `<NotImplementedPage />` (path: `src/app/characters/page.tsx`)
- [ ] T018 [US2] Implement hamburger toggle behavior in `src/components/navigation/GlobalNav.mobile.tsx` and ensure links navigate to their routes (path: `src/components/navigation/GlobalNav.mobile.tsx`)
- [ ] T019 [US2] Run unit tests and make `tests/unit/global-nav.mobile.spec.tsx` pass (no code path)

---

## Phase 5: User Story 3 - Breadcrumbs reflect path (Priority: P3)

Goal: Breadcrumb shows Home / Characters / [ID] on `/characters/123` and parent segments link to their NotImplemented pages.

Independent Test: Unit test for Breadcrumb rendering and link behavior.

### Tests (TDD-first)

- [ ] T020 [P] [US3] Add unit test `tests/unit/breadcrumb.spec.tsx` that renders `/characters/123` route context and asserts breadcrumb segments and links (path: `tests/unit/breadcrumb.spec.tsx`)

### Implementation

- [ ] T021 [US3] Add route file `src/app/characters/[id]/page.tsx` that renders `<NotImplementedPage />` (path: `src/app/characters/[id]/page.tsx`)
- [ ] T022 [US3] Ensure `src/components/Breadcrumb.tsx` maps route segments to labels using `src/lib/navigation.ts` and that parent segments are links (paths: `src/components/Breadcrumb.tsx`, `src/lib/navigation.ts`)
- [ ] T023 [US3] Run unit tests and make `tests/unit/breadcrumb.spec.tsx` pass (no code path)

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T024 [P] Update docs/Feature-Roadmap.md to reflect implemented placeholder routes and navigation (path: `docs/Feature-Roadmap.md`)
- [ ] T025 [P] Accessibility audit: add axe checks or manual checklist in `tests/unit/accessibility.md` (path: `tests/unit/accessibility.md`)
- [ ] T026 [P] Add Storybook/visual snapshot (optional) for `GlobalNav` and `Breadcrumb` components (paths: `.storybook/`, `stories/`) — only if project uses Storybook
- [ ] T027 Release checklist: create PR, include test results and accessibility notes (no code path)

---

## Dependencies & Execution Order

- Setup (Phase 1) must run first (T001-T003)
- Foundational (Phase 2) must complete before User Stories (T004-T009)
- User Stories (Phases 3-5) can run in priority order; tests are written first (T010-T011, T015-T016, T020)
- Polish can run in parallel after stories complete (T024-T027)

## Summary Metrics

- Total tasks: 27
- Tasks by story: US1: 5 (T010-T014), US2: 5 (T015-T019), US3: 4 (T020-T023)
- Parallelizable tasks identified (marked [P]): T003, T005, T006, T007, T015, T016, T020, T024, T025, T026
- Suggested MVP: Complete Phase 1 + Phase 2 + Phase 3 (T001-T014)

## How to use

1. Start with Phase 1 tasks to prepare the repo.
2. Complete Foundational Phase (T004-T009).
3. Execute US1 TDD steps: add tests (T010-T011), implement routes/components (T012-T013), run tests (T014).
4. Repeat for US2 and US3.

---

```
