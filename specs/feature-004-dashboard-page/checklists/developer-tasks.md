# Developer Task List: Dashboard Page (Feature 004)

Purpose: A TDD-first task list to implement the Dashboard Page UI using mock data. Each task is small, testable, and ordered for an efficient 1-day delivery.

Branch: `feature/004-dashboard-page`

Commit message suggestion: "F004: add dashboard page UI scaffold, fixtures, and tests (mock-first)"

PR title suggestion: "F004: Dashboard page — UI scaffold + tests (mock-first)"

## Tasks (TDD order)

1. Setup: create test fixtures
   - Files:
     - `tests/unit/fixtures/dashboard/widgets.json`
     - `tests/unit/fixtures/dashboard/activity.json`
   - Purpose: Provide deterministic input for unit and E2E tests.
   - Tests to write first: none (fixtures only).

2. Unit tests for StatCard component (fail-first)
   - Create test: `tests/unit/components/dashboard/statcard.test.tsx`
   - Expectations:
     - Renders label and value
     - Formats large numbers (k/M)
     - Shows empty state when value missing

3. Implement `StatCard` component scaffold
   - File: `src/components/dashboard/StatCard.tsx`
   - Minimal implementation to pass tests

4. Unit tests for QuickActions (fail-first)
   - Create test: `tests/unit/components/dashboard/quickactions.test.tsx`
   - Expectations:
     - Renders configured actions
     - Clicking action triggers route/navigation mock

5. Implement `QuickActions` component scaffold
   - File: `src/components/dashboard/QuickActions.tsx`

6. Unit tests for ActivityFeed
   - Create test: `tests/unit/components/dashboard/activityfeed.test.tsx`
   - Expectations:
     - Lists 5 items from fixture
     - Each item links to targetUrl

7. Implement `ActivityFeed` component scaffold
   - File: `src/components/dashboard/ActivityFeed.tsx`

8. Page assembly and route
   - Create `app/dashboard/page.tsx` composing StatCard, QuickActions, ActivityFeed using fixtures via a mock provider
   - Unit tests: snapshot test for `page.tsx` and small render assertions

9. E2E tests (Playwright)
   - Create: `tests/e2e/dashboard.spec.ts`
   - Scenarios:
     - Happy path: load `/dashboard` and assert stat card values and activity items
     - Quick action navigation: click "New Party" and assert NotImplemented page shown
     - Mobile viewport: assert stat cards stack and quick actions are tappable

10. Accessibility & meta tags

- Add ARIA labels and test with `axe` in E2E smoke
- Add unit test finding title/description meta tags in the page head

11. Documentation & checklist

- Update `specs/feature-004-dashboard-page/checklists/requirements.md` to mark tasks complete after tests pass and stakeholder sign-off

## Files to include in PR

- `src/components/dashboard/StatCard.tsx`
- `src/components/dashboard/QuickActions.tsx`
- `src/components/dashboard/ActivityFeed.tsx`
- `app/dashboard/page.tsx`
- `tests/unit/fixtures/dashboard/*`
- `tests/unit/components/dashboard/*` (tests)
- `tests/e2e/dashboard.spec.ts`

## Testing & commands

Run unit tests only:

```bash
npm run test -- tests/unit/components/dashboard --watchAll=false
```

Run E2E (Playwright):

```bash
npm run test:e2e -- --grep "dashboard"
```

---

Notes:

- This PR intentionally uses mock data fixtures and avoids backend changes. Backend integration should be done in F016 (User Dashboard with Real Data).
