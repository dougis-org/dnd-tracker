# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Maintainer**: @doug

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This implementation follows the feature spec for F002: provide a global navigation (desktop + mobile), route stubs that render `NotImplementedPage`, and breadcrumbs that reflect path hierarchy. The approach uses the existing Next.js (app router) frontend, shadcn/ui and Tailwind for styling, and a TDD-first workflow per the project constitution.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Next.js 16.0.1, TypeScript 5.9.x, Node 25.x (use repo versions from `package.json`)  
**Primary Dependencies**: React, Next.js, Tailwind CSS (v4.x), shadcn/ui, Jest + Testing Library, Playwright, ESLint, markdownlint  
**Storage**: N/A for this feature (frontend-only routing skeletons).  
**Testing**: Jest + React Testing Library for unit tests; Playwright for E2E smoke tests; axe (jest-axe or Playwright accessibility checks) for accessibility assertions.  
**Target Platform**: Web (Next.js app router, browser clients).  
**Project Type**: Frontend web application (single project under `src/` using Next.js app router).  
**Performance Goals**: Keep initial navigation render lightweight; aim for <200ms client-side navigation response for local dev and 3G simulation in Playwright smoke tests (documented, not a hard SLA).  
**Constraints**: Follow repository quality gates: type-check, ESLint, markdownlint, unit tests, and Playwright smoke tests. TDD-first is required per constitution.  
**Scale/Scope**: Covers navigation surfaces and route stubs for roadmap entries; no server-side data requirements.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

This plan references the repository constitution (`.specify/memory/constitution.md`) and enforces the non-negotiable TDD-first workflow. Before implementing further work, confirm the constitution audit (see `spec.md` additions and task `T115`) is completed and documented.

### Post-ratification checklist

- [ ] Confirm `.specify/memory/constitution.md` is referenced in the feature spec
- [ ] Run Codacy analysis on any edited files (per repo rules)
- [ ] Update templates if constitution wording changes

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: Single frontend project using Next.js app router. Source layout follows the existing repository: `src/app/` for routes and `src/components/` for UI components. Tests live in `tests/unit/` and `tests/e2e/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
