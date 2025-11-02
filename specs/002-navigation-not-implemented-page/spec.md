```markdown
---
title: F002 — Navigation & Not Implemented Page
id: F002
branch: feature/002-navigation-not-implemented-page
created: 2025-11-02
owner: @doug
---

## Summary

Implement the global navigation, routing skeleton, and a `NotImplementedPage` placeholder used across the app. All configured routes should render the NotImplemented page until the specific feature is implemented. Mobile responsiveness and breadcrumbs must be included.

## Scope

- Global navigation component with desktop and mobile variants
- Route definitions for all primary pages, routed to NotImplementedPage
- `NotImplementedPage` component with friendly copy and an actionable CTA (report/feedback)
- Footer component with legal and social links
- Breadcrumb component that reflects the current path
- Unit tests for components and route rendering; Playwright smoke test for navigation

## Acceptance Criteria (must be testable)

- [ ] All routes listed in the roadmap render `NotImplementedPage`
- [ ] Navigation menu lists all sections and is keyboard accessible
- [ ] Mobile hamburger menu opens/closes and shows all navigation links
- [ ] Breadcrumb displays correct path segments for nested routes
- [ ] `NotImplementedPage` includes a clear message and a link to file an issue or contact support
- [ ] Unit tests for Navigation and Breadcrumb pass
- [ ] Playwright smoke test can open the mobile menu and navigate to `/dashboard`

## Deliverables

- `src/components/layouts/MainLayout.tsx` (wire navigation into layout)
- `src/components/navigation/GlobalNav.tsx` (desktop + mobile variants)
- `src/components/NotImplementedPage.tsx`
- `src/components/Breadcrumbs.tsx`
- Route entries in app router pointing to NotImplemented for each page
- Unit tests: `tests/unit/global-nav.spec.tsx`, `tests/unit/breadcrumbs.spec.tsx`
- E2E smoke test: `tests/e2e/navigation.spec.ts`

## Test Plan (TDD-first)

1. Add unit tests for Navigation and Breadcrumbs (failing)
2. Implement `NotImplementedPage` and navigation components to satisfy tests
3. Add a Playwright smoke test that verifies route responds with NotImplementedPage
4. Run test:ci and fix any lint/type issues

## Implementation notes

- Follow existing component patterns in `src/components/*` (shadcn/ui)
- Keep components small (<50 lines per function where practical)
- Use Zod for any small validation logic (breadcrumbs params)
- Accessibility: ensure nav links have aria attributes and the hamburger has aria-expanded

## Links

- Roadmap: `docs/Feature-Roadmap.md`
- Product requirements: `docs/Product-Requirements.md`

```
