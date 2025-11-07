# Implementation Plan: Dashboard Page (Feature 004)

**Paths**

- Feature dir: `specs/feature-004-dashboard-page/`
- Implementation artifacts: `specs/feature-004-dashboard-page/implementation/`

## Purpose

This document defines the Phase-0 research tasks and Phase-1 design & contracts to implement the Dashboard Page as a TDD-first UI feature (mock-first delivery). The goal is a small, test-covered, responsive dashboard UI that can later be wired to backend endpoints.

## Constraints

- This plan produces files only under the feature directory.
- Initial delivery uses mock data only; backend integration is a follow-up feature (F016).

## Phase 0 — Research (short)

Tasks:

1. Research existing design tokens and components used for stat cards and quick-actions (see `src/components/ui/*` and `specs/001-project-setup-design-system`).
2. Decide on mock-data shapes for widgets and activity items (write `data-model.md`).
3. Define minimal API contract for future integration: `GET /api/dashboard` that returns widget summaries and recent activity (write `/contracts/dashboard-api.md`).

Deliverables:

- `research.md` (decisions & rationale)
- `data-model.md` (entities & shapes)
- `/contracts/dashboard-api.md`

Success gating: all NEEDS_CLARIFICATION resolved (none in spec) and `data-model.md` created.

## Phase 1 — Design & Contracts (TDD-first)

Overview:

Implement the UI with component-level unit tests and a small E2E that verifies the P1 acceptance scenarios using mock data fixtures. Follow the repo patterns for testing (Jest for unit, Playwright for E2E).

Subtasks:

1. Create UI scaffold:
   - `app/dashboard/page.tsx` (route entry) — lightweight page that composes components; points to mock provider.
   - `components/dashboard/StatCard.tsx`, `components/dashboard/QuickActions.tsx`, `components/dashboard/ActivityFeed.tsx` (UI components)
   - Use existing `GlobalNav` and `MainLayout` for consistent layout.

2. Create mock data fixtures under `tests/unit/fixtures/dashboard/`:
   - `widgets.json`, `activity.json`, `parties.json`, `sessions.json`.

3. Tests — unit/component:
   - StatCard renders label/value and handles empty state.
   - QuickActions renders buttons and navigates to expected routes (use router mocks).
   - ActivityFeed lists 5 items and links to resources.

4. Tests — E2E (Playwright):
   - Happy path: visit `/dashboard`, assert stat cards values, click New Party quick action navigates to NotImplemented page.
   - Mobile viewport: assert stacking behavior and tappable actions.

5. Accessibility checks:
   - Include ARIA labels for key controls; run `axe` in E2E smoke test.

6. Documentation & checklist:
   - Update `implementation/quickstart.md` with brief test run commands.
   - Close out checklist item(s) in `checklists/requirements.md` after tests and visual review.

Acceptance criteria mapping (implementable):

- FR-001 → unit test verifying stat cards render counts from fixture
- FR-002 → unit test verifying quick-action buttons present and wired to routes
- FR-003 → unit test verifying ActivityFeed lists 5 items
- FR-004 → unit tests for empty states; E2E verifies displayed suggested actions when fixtures empty
- FR-005 → E2E mobile viewport tests
- FR-006 → E2E navigation tests show NotImplemented fallback
- FR-007 → Manual validation of meta tags in page head (small unit test for head tags)

Estimated effort: 1 developer-day (mock-first, focused on UI + tests)

## Outputs (files to create)

- `specs/feature-004-dashboard-page/implementation/research.md`
- `specs/feature-004-dashboard-page/implementation/data-model.md`
- `specs/feature-004-dashboard-page/implementation/contracts/dashboard-api.md`
- `specs/feature-004-dashboard-page/implementation/quickstart.md`

---

**Prepared**: agent
