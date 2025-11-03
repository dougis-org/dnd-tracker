```markdown
# Implementation Plan: F002 - Navigation & Not Implemented Page

**Branch**: `feature/002-navigation-not-implemented-page` | **Date**: 2025-11-02 | **Spec**: `specs/002-navigation-not-implemented-page/spec.md`
**Input**: Feature specification from `specs/002-navigation-not-implemented-page/spec.md`

## Summary

Implement a site-wide navigation system (desktop + mobile), routing skeleton that routes all primary pages to a `NotImplementedPage` placeholder, a Footer and Breadcrumb component. Tests are TDD-first: unit tests for navigation and breadcrumbs, plus a Playwright smoke test to validate primary navigation flows. Use existing design system from Feature 001 (shadcn/ui + Tailwind).

## Technical Context

**Language/Version**: TypeScript 5.9.2
**Primary Dependencies**: Next.js (App Router 16+), React 19+, Tailwind CSS, shadcn/ui, Jest, Playwright
**Storage**: N/A (UI / routing skeleton only)
**Testing**: Jest (unit) + Playwright (E2E)
**Target Platform**: Web (Next.js on Fly.io)
**Project Type**: Web application (frontend-first; Next.js fullstack)
**Performance Goals**: N/A for initial skeleton (keep bundle minimal; navigation should hydrate quickly)
**Constraints**: Accessibility (keyboard operable), mobile-first responsiveness, follow file/function size limits from `docs/Tech-Stack.md`
**Scale/Scope**: Site navigation and routing skeleton for first 20 routes (Phase 1)

## Constitution Check
GATE: Constitution file at `.specify/memory/constitution.md` is present in the repository and defines the project's non-negotiable principles (including Test-First/TDD and Quality Gates).

GATE STATUS: PASS → The constitution is ratified (see `.specify/memory/constitution.md`, Version 1.0.0) and requires the plan to follow TDD-first and the project's quality gates (type-check, ESLint, Codacy, tests) before merging. The earlier statement that the constitution was a template was outdated and has been corrected here.

NOTE: The plan still documents a few advisory governance clarifications (for example, additional release gating wording). Those are advisory and do not supersede the constitution. Any proposed amendment to the constitution must follow the constitution amendment procedure (PR, maintainer approval, CI/Codacy checks).

## Project Structure

Documentation (this feature)

```
specs/002-navigation-not-implemented-page/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (openapi)
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

Source Code (repository root)

```
src/
├── components/
│   ├── navigation/
│   │   ├── GlobalNav.tsx
│   │   ├── GlobalNav.mobile.tsx
│   │   └── navigation.test.tsx
│   ├── breadcrumb/
│   │   ├── Breadcrumb.tsx
│   │   └── breadcrumb.test.tsx
│   ├── NotImplementedPage.tsx
│   └── Footer.tsx
app/
├── layout.tsx           # include global navigation + footer
├── page.tsx             # landing (routes configured to NotImplemented)
└── [other route entries mapped to NotImplemented]
tests/
├── unit/
└── e2e/
```

**Structure Decision**: Use the existing Next.js App Router app/ layout and place UI components under `src/components/`. This aligns with Feature 001 and keeps components reusable across pages and tests.

## Complexity Tracking

No complexity gate violations justified at this stage. If constitution ratification requires additional architecture (e.g., separate navigation service), this section will be updated with justification.

---

## Phase 0 - Research (summary)

See `research.md` for full findings. Key outcomes:
- Confirmed technology choices (Next.js + TypeScript + shadcn/ui + Tailwind)
- Accessibility patterns selected (ARIA menu button, roving tabindex for menu items)
- Breadcrumb pattern: derive segments from path and map to labels via a route metadata table in `src/lib/navigation.ts`
- Routes list sourced from `docs/Feature-Roadmap.md` and included in `/specs/002-navigation-not-implemented-page/contracts/openapi.yml` as placeholder endpoints

---

## Phase 1 - Design & Contracts (deliverables)

Planned artifacts (created by this command):
- `data-model.md` - entities (NavigationItem) and validations
- `contracts/openapi.yml` - minimal OpenAPI defining top-level endpoints that return placeholder NotImplemented responses
- `quickstart.md` - how to run dev and tests for this feature

Agent context update: run `.specify/scripts/bash/update-agent-context.sh claude` to refresh `CLAUDE.md` (or equivalent agent files). (Script noted; this plan includes a generated `CLAUDE.md` to reflect the current plan.)

---

## Acceptance Criteria Mapping

- Map each acceptance criteria from `spec.md` to tests and tasks in `tasks.md` (task generation is Phase 2).

---

## Next Steps (Phase 0 → Phase 1)

1. Resolve constitution gaps in `research.md` and obtain ratification or documented exception.
2. Implement unit tests for Navigation and Breadcrumbs (failing tests first).
3. Implement `NotImplementedPage` component and navigation components to satisfy tests.
4. Add Playwright smoke test for mobile menu and route `/dashboard`.
5. Create `tasks.md` (Phase 2) from plan outputs and open a PR on branch `feature/002-navigation-not-implemented-page`.

---

**Plan generated by**: `/speckit.plan` (simulated). 
```markdown
---
title: F002 Implementation Plan
---

## Plan

Day 1 (TDD-first):

- Morning (2-3 hrs):
  - Add failing unit tests for `GlobalNav` and `Breadcrumbs`
  - Add Playwright skeleton test for navigation

- Midday (3-4 hrs):
  - Implement `NotImplementedPage` and `GlobalNav` (desktop + mobile)
  - Wire into `MainLayout`

- Afternoon (2-3 hrs):
  - Implement Breadcrumbs and unit tests
  - Finish Playwright smoke test and run full test:ci
  - Finalize PR checklist and open PR

Risks / Contingencies:

- If the app router structure differs (app vs pages), adapt route wiring accordingly.
- If additional accessibility fixes are required, schedule a follow-up small PR.
```
