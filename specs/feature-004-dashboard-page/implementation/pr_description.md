# PR: F004 — Dashboard page UI scaffold + tests (mock-first)

## Title

F004: Dashboard page — UI scaffold + tests (mock-first)

## Summary

This PR adds a mock-first Dashboard Page UI and a test suite (unit + E2E) to validate the P1 acceptance scenarios. It includes:

- Component scaffolds: `StatCard`, `QuickActions`, `ActivityFeed`
- Route page: `app/dashboard/page.tsx` (mock provider)
- Test fixtures: deterministic JSON fixtures under `tests/unit/fixtures/dashboard/`
- Unit tests for components and a Playwright E2E spec covering the happy path and mobile layout.

This PR intentionally uses mock data; backend wiring will follow in F016 (User Dashboard with Real Data).

## Checklist (must be green before review)

- [ ] Unit tests added for `StatCard`, `QuickActions`, `ActivityFeed`
- [ ] E2E Playwright test verifying P1 scenarios (happy path + mobile stack)
- [ ] ARIA labels present and `axe` smoke passes in E2E
- [ ] Fixtures committed in `tests/unit/fixtures/dashboard/`
- [ ] README/quickstart updated with test run instructions
- [ ] Spec checklist updated: `specs/feature-004-dashboard-page/checklists/requirements.md`

## Testing notes

Run the unit and E2E tests per `specs/feature-004-dashboard-page/implementation/README-quickstart.md`.

## Commit message

F004: add dashboard page UI scaffold, fixtures, and tests (mock-first)
