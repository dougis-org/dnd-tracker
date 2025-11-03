---
title: F002 - Navigation & Not Implemented Page
id: F002
branch: feature/002-navigation-not-implemented-page
created: 2025-11-02
owner: @doug
---

## Summary

Implement the GlobalNav (global navigation component), routing skeleton, and a `NotImplementedPage` placeholder used across the app. All configured routes should render the NotImplemented page until the specific feature is implemented. Mobile responsiveness and breadcrumbs must be included.
## Clarifications

### Session 2025-11-02

 - Q: Route scope -> A: Generate route stubs for every route listed in `docs/Feature-Roadmap.md` and create a corresponding placeholder `src/app/.../page.tsx` that renders `NotImplementedPage`. This makes the roadmap the single source of truth for routes covered by this feature and prevents scope drift.
 - Q: Component naming -> A: Use `GlobalNav` as the canonical component name across spec, plan and tasks. Update source files and tests to use `GlobalNav` (aliases allowed via `src/components/navigation/index.ts` if necessary). This reduces naming drift and keeps file names explicit.

## Scope

- GlobalNav component (desktop and mobile variants)
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
- [ ] A cross-browser smoke test can open the mobile menu and navigate to `/dashboard`

## Deliverables

- Layout file that includes the `GlobalNav` component (placed under `src/components/layouts/`)
- GlobalNav component (desktop + mobile variants) under `src/components/navigation/`
- NotImplemented placeholder component under `src/components/`
- Breadcrumb component under `src/components/`
- Route entries in the app router pointing to NotImplemented for each page listed in the roadmap
- Unit tests for Navigation and Breadcrumb components
- A cross-browser smoke test that validates primary navigation flows

## Test Plan (TDD-first)

1. Add unit tests for Navigation and Breadcrumbs (failing)
2. Implement `NotImplementedPage` and navigation components to satisfy tests
3. Add a Playwright smoke test that verifies route responds with NotImplementedPage
4. Run test:ci and fix any lint/type issues

## Design considerations (non-technical)

- Follow established UI patterns used elsewhere in the app for consistency.
- Keep navigation clear and visually scannable on desktop and mobile.
- Ensure accessibility best-practices (keyboard navigation, focus states, readable labels).
- Breadcrumbs should present a clear path hierarchy and be readable on small screens.

## Links

- Roadmap: `docs/Feature-Roadmap.md`
- Product requirements: `docs/Product-Requirements.md`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate to Dashboard (Priority: P1)

As a site visitor, I want to use the main navigation to reach the Dashboard so I can see what will be implemented there.

**Why this priority**: Dashboard is a primary destination and a key verification point for global navigation.

**Independent Test**: From the landing page, open the main navigation and click the Dashboard link. The test verifies the NotImplemented placeholder is displayed.

**Acceptance Scenarios**:

1. **Given** the user is on any page, **When** they click the "Dashboard" link in the navigation, **Then** the NotImplemented page for `/dashboard` is displayed.
2. **Given** the user uses keyboard navigation (tab/enter) to focus and activate the Dashboard link, **When** they press Enter, **Then** the NotImplemented page for `/dashboard` is displayed.

---

### User Story 2 - Mobile Navigation (Priority: P2)

As a mobile user, I want a collapsible navigation menu so I can reach sections such as Characters from a small screen.

**Why this priority**: Mobile users must be able to navigate effectively; verifying the mobile menu ensures the navigation is accessible across viewports.

**Independent Test**: Simulate a small viewport, open the hamburger menu, tap the "Characters" link, and verify the NotImplemented placeholder appears for `/characters`.

**Acceptance Scenarios**:

1. **Given** the viewport is narrow, **When** the user taps the hamburger icon, **Then** the navigation panel opens showing the primary links.
2. **Given** the navigation panel is open, **When** the user taps "Characters", **Then** the NotImplemented page for `/characters` is displayed.

---

### User Story 3 - Breadcrumbs reflect path (Priority: P3)

As a user navigating to nested pages, I want to see a breadcrumb trail so I can understand where I am and navigate back to parent pages.

**Independent Test**: Navigate to `/characters/123` and verify breadcrumbs show: Home / Characters / [Character Name or ID] and that the parent segments link to the corresponding NotImplemented pages.

**Acceptance Scenarios**:

1. **Given** the user is at `/characters/123`, **When** the breadcrumb is visible, **Then** it displays links for Home and Characters and a non-link label for the current segment.

---

## Functional Requirements

- **FR-001**: All routes listed in the roadmap MUST render a NotImplemented placeholder page when visited.
- **FR-002**: The global navigation MUST list all top-level sections included in the roadmap and allow users to navigate to those routes.
- **FR-003**: Mobile navigation MUST provide a collapsed menu that reveals the same navigation links as desktop.
- **FR-004**: Breadcrumbs MUST reflect the current route hierarchy and provide links back to parent segments.
- **FR-005**: The NotImplemented placeholder MUST include a clear message, an explanation of why the page is unavailable, and a call-to-action to report or request the feature.
- **FR-006**: The authoritative list of routes for this feature is the entries in `docs/Feature-Roadmap.md`. The implementation MUST create route stubs for each roadmap entry that render the `NotImplementedPage` and include a corresponding task in `tasks.md`.

## Key Entities

- **NavigationItem**: Represents a top-level navigation entry (label, path, optional children). This is a conceptual entity for spec purposes only.

## Success Criteria *(mandatory)*

- **SC-001**: A user can reach any top-level route from the navigation within two interactions (click/tap) and see the NotImplemented placeholder.
- **SC-002**: 100% of routes listed in the roadmap render the NotImplemented placeholder when visited in an automated smoke test.
- **SC-003**: Navigation is operable by keyboard (tab/enter) for all primary links.
- **SC-004**: Breadcrumbs accurately reflect the path for at least 90% of tested nested routes in automated checks.

## Dependencies

- Depends on: Feature 001 (Project Setup & Design System) for base layouts and design tokens.


```

## Assumptions

- The app has a single global navigation visible on all primary pages.
- Routes listed in the roadmap are the authoritative list for initial routing skeleton.
- No authentication gating is required for the NotImplementedPage; protected routes will be gated later when auth is implemented.

## Edge Cases

- Deeply nested routes should show a breadcrumb trail up to the root.
- Extremely long route segments should be truncated in breadcrumbs with a tooltip showing full path.
- If navigation data fails to load, a minimal fallback list of top-level links should still be shown.

## Deliverables (files created/updated)

- `specs/002-navigation-not-implemented-page/spec.md` (this file)
- `specs/002-navigation-not-implemented-page/checklists/requirements.md` (quality checklist)

## Ready for planning

SUCCESS: Specification draft completed and quality checklist created. Ready for `/speckit.clarify` if clarifications are requested, or `/speckit.plan` to generate the implementation plan.
