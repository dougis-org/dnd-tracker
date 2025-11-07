# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Maintainer**: @doug

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

**Language/Version**: Next.js (React) with TypeScript; target Node 18+ for local dev/build.
**Primary Dependencies**: next, react, react-dom, tailwindcss (existing); testing: jest, @testing-library/react, playwright, @playwright/test, axe-playwright for accessibility checks.
**Storage**: N/A — UI-only feature using local/mock JSON files under `src/app/(landing)/data` for fixtures.
**Testing**: Unit tests with Jest + Testing Library; E2E and accessibility with Playwright + Axe.
**Target Platform**: Web frontend (Next.js app router under `src/app`), runs in Node for dev/build and in browsers for E2E.
**Project Type**: Web application (frontend-focused feature implemented inside the existing Next.js app).
**Performance Goals**: No additional backend throughput goals; ensure UI responsiveness and correct layout across breakpoints (375px, 768px, 1024px).
**Constraints**: No production backend changes; feature exposed only in non-production via env toggle. Any added dependencies must follow repository security rules (run Trivy via Codacy CLI as prescribed).
**Scale/Scope**: Small UI feature (hero, showcase, demo, pricing, testimonials) — low runtime impact and limited scope.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Status: PENDING — plan and tasks have been updated to explicitly enforce constitution requirements for this feature.

Decisions / enforcement:

- TDD (Test-First) is REQUIRED (non-negotiable). Tasks have been updated to add failing-test tasks that must be completed before implementing components (see `tasks.md` T007a/T008a/T009a and T013a/T014a/T015a). These are blocking steps to enforce the constitution's TDD MUST.
- Quality Gates: Codacy analysis is required (see `tasks.md` T023). Critical Codacy findings must be resolved (or an approved exception documented) before merging. If new dependencies are added, run the Trivy scan as required by repository rules.
- Branching & PR rules: Follow `CONTRIBUTING.md` (create feature branches from `main`, add `in-progress` label, include tests with PRs).

### Post-ratification checklist

- [x] Confirm `.specify/memory/constitution.md` is referenced in the feature spec
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

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
