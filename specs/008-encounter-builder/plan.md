# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Maintainer**: @doug

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement the Encounter Builder feature as a UI-first Next.js app-router set of pages backed by a small persistence adapter that can use either MongoDB (Mongoose) or a localStorage fallback for early development and E2E stubbing. Deliver an MVP that covers create/import/edit/save flows with TDD-first tests (unit, integration, E2E) and basic observability and security checks.

## Technical Context

This section documents the concrete technical choices and goals for the feature to avoid implementation drift.

**Language/Version**: TypeScript 5.x (align with repo; current workspace uses TypeScript 5.9.x)
**Framework / Runtime**: Next.js 16 (App Router) + React 19
**Primary Dependencies**: Mongoose (MongoDB), Zod (validation), Jest (unit), Testing Library (component tests), Playwright (E2E)
**Storage**: MongoDB via Mongoose adapter; localStorage fallback adapter for UI-first development and E2E stubbing
**Testing**: Jest + Testing Library for unit/component tests; Playwright for E2E flows; integration tests via Jest with adapter mocks and optional in-memory MongoDB for DB integration
**Target Platform**: Web (modern desktop & mobile browsers)
**Project Type**: Web application (frontend in `src/app` + shared `src/lib` adapters)
**Performance Goals**: UI responsiveness for up to 100 participants (SC-004); saved items visible in list within 2s in test environments (SC-002)
**Constraints**: Keep files <450 lines and functions <50 lines; follow TDD (tests must be authored before implementation); run Codacy analysis on edits per repo policy
**Scale/Scope**: MVP scoped to per-user encounters with optional `org_id` for future sharing; do not implement live combat features in this iteration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

### Post-ratification checklist

- [ ] Confirm `.specify/memory/constitution.md` is referenced in the feature spec
- [ ] Run Codacy analysis on any edited files (per repo rules)
- [ ] Update templates if constitution wording changes

### TDD enforcement & task updates

Per the project's constitution (Test-First / TDD), the `tasks.md` for this feature has been updated to enforce tests-before-implementation ordering. Key changes applied to `specs/008-encounter-builder/tasks.md`:

- Explicit failing-test tasks were added before implementation tasks (examples: `T006a`, `T007a`, `T008a`, `T010a`, `T031`, `T032`).
- Authorization tests were moved into the Foundational phase to ensure owner/permission checks are validated early (`T036`).
- Duplicate implementation tasks were removed to avoid confusion and single-source the model/schema work.
- Performance test tasks were added to cover measurable success criteria (`T037`, `T038`).

Please ensure reviewers verify the updated `tasks.md` before implementation begins. Implementation must follow the TDD cycle: Red (failing tests) → Green (implementation) → Refactor.

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

```text
src/
├── app/
│   ├── encounters/
│   │   ├── page.tsx           # Main encounters list
│   │   └── new/
│   │       └── page.tsx       # Create new encounter form
│   └── api/encounters/
│       └── route.ts           # API endpoints (GET, POST)
├── components/encounters/
│   ├── ParticipantForm.tsx    # Individual participant input
│   └── EncountersList.tsx     # Display saved encounters
└── lib/
    ├── models/
    │   └── encounter.ts       # Mongoose schema
    ├── schemas/
    │   └── encounter.ts       # Zod validation
    └── api/
        └── encounters.ts      # Adapter with Mongoose/localStorage

tests/
├── unit/encounter/           # Unit tests
├── integration/              # Mongoose integration tests
└── e2e/                      # Playwright E2E tests
```

**Structure Decision**: Web application using `src/app/` for routes and `src/components/` for UI. Backend models/adapters live in `src/lib/` and API routes under `src/app/api/encounters`. Tests follow repo conventions: `tests/unit/`, `tests/integration/`, `tests/e2e/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
