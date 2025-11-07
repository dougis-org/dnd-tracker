# Feature Specification: Dashboard Page (Feature 004)

**Feature Branch**: `feature/004-dashboard-page`
**Created**: 2025-11-05
**Status**: Draft
**Input**: User description: "Dashboard layout with stat cards, quick action buttons grid, recent activity feed (mock), campaign overview, usage metrics display (mock), welcome message for new users. Responsive and tested."

**Maintainer**: @doug

## Summary

The Dashboard Page gives users a single, scannable place to see their high-level account and campaign metrics, jump to common tasks, and view recent activity. This feature ships as a UI-first experience using mock data so stakeholders can review layout and flows before backend integrations.

Primary goals:

- Surface the most important usage metrics and quick actions for returning users
- Provide a responsive layout that works on mobile and desktop
- Offer a clear set of acceptance scenarios and testable requirements for handoff to engineering

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View primary metrics (Priority: P1)

As a returning user, I want to see key metrics (active parties, recent sessions, usage summary) at a glance so I can quickly understand my account state.

Why this priority: This is the primary value of the dashboard — rapid situational awareness.

Independent Test: Load `/dashboard` with mock data and verify the stat cards display expected values.

Acceptance Scenarios:

1. Given I am a signed-in user (or viewing mock), When I open `/dashboard`, Then I see stat cards for: active parties, recent combat sessions, usage (encounters used vs allowed), and a welcome message.

2. Given no data exists, When I open `/dashboard`, Then each widget renders a helpful empty state message and suggested next actions (e.g., "Create your first party").

---

### User Story 2 - Quick actions & navigation (Priority: P1)

As a user, I want a grid of quick-action buttons (new character, new encounter, view parties) so I can quickly jump into common tasks.

Why this priority: Quick actions reduce friction and improve task completion.

Independent Test: Click each quick action in the UI and confirm it triggers the configured placeholder behavior (navigates to the NotImplemented page or shows the expected mock modal).

Acceptance Scenarios:

1. Given I am on `/dashboard`, When I tap the "New Party" quick action, Then the app navigates to `/parties/new` (or the NotImplemented fallback) and shows the creation UI (mock).

---

### User Story 3 - Recent activity & campaign overview (Priority: P2)

As a user, I want to scan recent activity (combat sessions, changes to parties) to recall what I last did and resume work.

Why this priority: Helps users pick up where they left off.

Independent Test: Verify the recent activity feed lists the last 5 items with timestamps and links to the related pages.

Acceptance Scenarios:

1. Given recent sessions exist, When I open the dashboard, Then I see the 5 most recent sessions with a timestamp and a link to each session.

---

### User Story 4 - Mobile responsiveness & accessibility (Priority: P2)

As a user on a phone, I want the dashboard to be readable and usable so I can manage my campaigns on the go.

Why this priority: Many users will access the app from mobile devices; the UI must be usable.

Independent Test: Load the dashboard in mobile viewport sizes and confirm layout stacks vertically with tappable controls and accessible labels.

Acceptance Scenarios:

1. Given a screen width <= 480px, When I view the dashboard, Then stat cards stack and quick actions present as an accessible list.

---

### Edge Cases

- Very large numbers (thousands of sessions/parties) — widgets must truncate or summarize values and offer a drill-in link.
- No data — every widget must present an actionable empty state.
- Slow network — ensure skeleton loaders or placeholder content is shown while mock data resolves.
- Accessibility modes (high contrast, screen readers) — all key UI must include ARIA labels and text alternatives.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The dashboard page MUST render a set of stat cards showing at minimum: active parties count, recent combat sessions count, and usage summary (encounters used / allowed).
- **FR-002**: The dashboard MUST present a grid of quick-action buttons for common tasks: New Character, New Party, New Encounter, View Parties, View Encounters.
- **FR-003**: The dashboard MUST include a recent activity feed showing the most recent 5 items, each with a timestamp and a link to the related resource.
- **FR-004**: Every widget and quick action MUST have an accessible empty state and a primary suggested action when no data is available.
- **FR-005**: The page MUST be responsive and usable on common mobile viewports (≤ 480px) and tablet/desktop sizes.
- **FR-006**: UI interactions (click/tap quick actions) MUST navigate to the appropriate route or show the NotImplemented fallback when backend integration is missing.
- **FR-007**: The dashboard MUST include SEO-friendly meta tags in the page head (title and description) for stakeholder review.

### Key Entities *(include if feature involves data)*

- **DashboardWidget**: Represents a UI card with a label, numeric summary, optional sparkline, and link to details.
- **PartySummary**: {displayName, memberCount, id}
- **CombatSessionSummary**: {sessionId, title, round, lastUpdated}
- **ActivityItem**: {id, type, timestamp, description, targetUrl}

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of review participants see the dashboard content (stat cards, quick actions, and recent activity) fully rendered within 2 seconds on a modern broadband connection using mock data.
- **SC-002**: On mobile (≤ 480px) the primary stat cards and quick-action list are readable and the primary quick actions remain tappable; measured by manual verification across three common devices.
- **SC-003**: All P1 acceptance scenarios pass in the UI test suite (component/unit tests + a small E2E flow using mock data)
- **SC-004**: Stakeholder design review sign-off (binary: approved / requires changes) is captured in the feature checklist.

## Assumptions

- This feature uses mock data only; no production backend or persistence is required for the initial delivery.
- Authentication and user-specific data are out-of-scope for this UI mock — the dashboard shows representative mock data for now.
- Visual design follows the existing design system and global navigation patterns established in Feature 001 and 002.

## Open Questions / [NEEDS CLARIFICATION]

- None required at this time — the roadmap and specs provide sufficient context for a UI-first delivery. If developers need specific data shapes for backend integration, those will be handled in a follow-up feature.

## Next Steps

1. Add this spec to `specs/feature-004-dashboard-page/spec.md` (done)
2. Create a lightweight component smoke test and an E2E happy-path using mock data (to be done in `/feature/004-dashboard-page` branch by implementer)
3. Request stakeholder design review and capture sign-off in the feature checklist

---

**Prepared by**: agent
