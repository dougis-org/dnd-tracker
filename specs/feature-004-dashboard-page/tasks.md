
# Tasks: Dashboard Page (Feature 004)

## Overview

This tasks file is authorative for implementing Feature 004 (Dashboard). Tasks follow TDD-first ordering: tests before implementation where applicable.

## Phases

### Setup

- T001: Create mock fixtures under `tests/unit/fixtures/dashboard/` (`widgets.json`, `activity.json`)

### Tests (fail-first)

- T002: Unit tests for `StatCard` (`tests/unit/components/dashboard/statcard.test.tsx`)
- T003: Unit tests for `QuickActions` (`tests/unit/components/dashboard/quickactions.test.tsx`)
- T004: Unit tests for `ActivityFeed` (`tests/unit/components/dashboard/activityfeed.test.tsx`)

### Core Implementation

- T010: Implement `StatCard` component (`src/components/dashboard/StatCard.tsx`)
- T011: Implement `QuickActions` component (`src/components/dashboard/QuickActions.tsx`)
- T012: Implement `ActivityFeed` component (`src/components/dashboard/ActivityFeed.tsx`)
- T013: Page assembly `app/dashboard/page.tsx`

### Integration & E2E

- T020: Playwright E2E `tests/e2e/dashboard.spec.ts` (happy path + mobile viewport)
- T021: Accessibility `axe` checks in E2E

### Polish

- T030: Documentation updates (`implementation/quickstart.md`) and checklist sign-off

---

**Notes**: Follow conventional commits when committing task work. Update this file marking completed tasks with `[X]` as you finish them.
