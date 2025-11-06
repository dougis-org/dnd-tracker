---
title: Research - Navigation & Not Implemented Page (Phase 0)
generated: 2025-11-05
---

## Summary

This document collects Phase 0 research decisions and remaining research tasks for Feature F002 (Navigation & Not Implemented Page). It consolidates technical choices derived from the repository's canonical docs and enumerates open questions (NEEDS CLARIFICATION) that require short research tasks before Phase 1 design can proceed.

## Decisions (derived from repo docs)

- Decision: Runtime & Framework
  - Chosen: Node.js 25.1.0, Next.js 16.0+ (App Router), TypeScript 5.9.2
  - Source: `docs/Tech-Stack.md`
  - Rationale: Feature implementations rely on the established project stack; aligning with repo versions avoids compatibility issues.
  - Alternatives considered: Use LTS Node.js (e.g., 24.x) for broader compatibility; rejected because repo explicitly documents Node 25.1.0.

- Decision: UI stack
  - Chosen: React 19.2.0, Tailwind CSS 4.x, shadcn/ui for components
  - Source: `docs/Tech-Stack.md`

- Decision: Storage & Data
  - Chosen: MongoDB (8.0+) with Mongoose (8.19.1) for data models where applicable
  - Source: `docs/Tech-Stack.md` and `docs/design/dnd-tracker-database-design.md`

- Decision: Testing
  - Chosen: Jest for unit tests; Playwright for E2E/smoke tests per project standards
  - Source: `docs/Tech-Stack.md` and feature spec `spec.md` test plan

- Decision: Auth & Third-party
  - Chosen integrations: Clerk for auth, Stripe for billing (if applicable later)
  - Source: `docs/Tech-Stack.md`

## Unresolved / NEEDS CLARIFICATION (from `plan.md` Technical Context)

These items were left as placeholders (`NEEDS CLARIFICATION`) in the implementation plan template and require quick research or decisions:

1. Performance Goals — measurable targets (e.g., p95 navigation load time, bundle size targets)
2. Constraints — specific runtime constraints (p95 latency target, memory/cpu limits for Fly.io), offline support expectations for navigation components
3. Scale/Scope — expected concurrent users, dataset sizes for route lists or nav items
4. Project Type field confirmation — although Tech-Stack implies a web app, explicitly confirm 'web (Next.js)'

## Research Tasks (Phase 0)

For each unresolved item above, create a short research task (owner: @doug by default unless assigned):

- Research-1: "Research performance goals for navigation UX" — Identify acceptable p95 page load and interaction times for primary nav flows (desktop/mobile), and target bundle sizes for First Contentful Paint under 2s on 3G emulation.

- Research-2: "Enumerate runtime constraints and Fly.io limits" — Determine acceptable CPU/memory, container size, and p95 API latency targets for Next.js frontends on Fly.io for the dashboard. Record conservative defaults to use for design decisions.

- Research-3: "Confirm scale expectations" — Ask stakeholders or product (or infer from roadmap) expected concurrent users or active sessions for Dashboard in early phases (to size caches & prefetching strategy).

- Research-4: "Project type confirmation" — Confirm that the project type is 'web application (Next.js app router)'; derive any mobile/PWA constraints from Product Roadmap.

- Research-5: "Accessibility checklist for navigation" — Collect best-practice checklist items (keyboard nav, focus management, aria attributes) to incorporate into component contracts and tests.

- Research-6: "Breadcrumb UX edge-cases" — Decide truncation rules and tooltip behavior for long segments; confirm tooltip approach across small screens.

## Consolidated Findings (initial)

- Many technical context fields are already specified in `docs/Tech-Stack.md` and design docs. Those fields will be used when generating Phase 1 artifacts.
- Remaining unknowns are operational/performance/scale related and do not block creating component contracts, but they should be resolved before finalizing performance-related acceptance criteria.

## Next Steps / Verification

1. Complete the Research tasks above (deliverable: `specs/002-navigation-not-implemented-page/research.md` updated with findings).
2. Confirm that all `NEEDS CLARIFICATION` entries in `specs/002-navigation-not-implemented-page/plan.md` are either filled or have a linked research task.
3. When Research tasks are completed, mark Phase 0 done and proceed to Phase 1: produce `data-model.md`, `/contracts/*`, and `quickstart.md` as per IMPL_PLAN.

## Appendices

- Source references:
  - `docs/Tech-Stack.md`
  - `docs/Feature-Roadmap.md`
  - `docs/design/dnd-tracker-technical-design.md`
  - `specs/002-navigation-not-implemented-page/spec.md`
# Research: F002 - Navigation & Not Implemented Page

## Unknowns / NEEDS CLARIFICATION (extracted from plan)

1. Constitution gating: the constitution file is a template — what governance items must be explicitly enforced for this feature? (tests, approval gates)
2. Exact route-to-label mapping: roadmapped routes exist, but human-readable labels and any exceptions must be confirmed (e.g., `combat/:sessionId` label)
3. Breadcrumb UX for very long segments: truncation behavior and tooltip expectations

## Research Tasks & Findings

### 1) Constitution gating (decision)

- Decision: For Phase 1, require Test-First rule enforcement: unit tests + one Playwright smoke test must pass in CI for merge. Document this as a proposed constitution amendment in the plan and request ratification.
- Rationale: Keeps parity with project standards (TDD-first) and avoids incomplete UI merges.
- Alternatives considered: Allow exceptions for purely documentation changes. Rejected because navigation touches UI and tests are fast to add.

### 2) Route-to-label mapping

- Decision: Use canonical labels derived from the roadmap with minor humanization: `/characters` -> "Characters", `/characters/:id` -> "Character", `/dashboard` -> "Dashboard".
- Rationale: Matches product expectations and keeps breadcrumbs concise.
- Implementation note: Provide a `routeMeta` table in `src/lib/navigation.ts` mapping path patterns to titles; fallback to capitalized segment.

### 3) Breadcrumb truncation

- Decision: Truncate long segments at ~24 chars with tooltip showing full text. Use CSS ellipsis + title attribute for tooltip. For accessibility, ensure tooltip content is available to screen readers (aria-describedby).
- Rationale: Preserves readable UI on small screens while retaining full path information.

## Accessibility Patterns (research)

- Mobile menu: use button with `aria-controls` and `aria-expanded`. Use focus trap when menu is open to keep keyboard focus inside.
- Desktop menu: keyboard navigation with roving tabindex or roving focus management; `aria-haspopup` and `aria-expanded` on parent menu items when children present.
- Breadcrumbs: links for parent segments and `aria-current="page"` for current segment.

## Testing & Automation

- Unit tests: Jest + React Testing Library for component rendering and keyboard interactions.
- Playwright: smoke test that toggles mobile viewport, opens hamburger menu, navigates to `/dashboard`, and asserts `NotImplementedPage` visible.

## Decisions (consolidated)

- Use Next.js (App Router) + TypeScript + shadcn/ui for UI components.
- Use a route metadata table to supply labels and breadcrumb titles.
- Implement accessible mobile & desktop navigation patterns per WAI-ARIA guidance.
- Add a short ratification note for constitution amendments and attach to PR.

```
