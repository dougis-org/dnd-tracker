# Implementation Plan: Feature 007 — Monster / NPC Management

**Branch**: `feature/007-monster-management` | **Date**: 2025-11-08 | **Spec**: `specs/007-monster-management/spec.md`
**Input**: Feature specification from `specs/007-monster-management/spec.md`

**Maintainer**: @doug

**Note**: This plan is the implementer's guide for the UI-first MVP of the Monster/NPC Management feature. It summarizes the technical approach, constraints, and the vertical slices to implement (list/detail → create/edit → templates → encounter integration). Follow the TDD-first workflow mandated by the project constitution: write failing tests first, implement, then refactor.

## Summary

Deliver a UI-first Monster/NPC management feature using mock adapters and local persistence for the MVP. Prioritize the list/detail workflow (US1) to enable encounter integration. After the MVP, implement create/edit (US2), templates (FR-006), and filter/search (US3). Ensure TDD-first, accessibility, and Codacy quality gates are satisfied before PR merge.

Performance benchmark: Follow the Performance benchmark in `specs/007-monster-management/spec.md` (representative dataset = 200 items). Implement Task `T033` (Playwright perf smoke test) to record `search-latency-ms` and publish results as CI artifacts for trend analysis.

## Technical Context

**Language/Version**: TypeScript 5.9 (repository `package.json`)  
**Primary Dependencies**: Next.js 16, React 19, Zod (validation), Tailwind CSS, Mongoose (present in repo but backend work out of scope for frontend MVP)  
**Storage**: UI-first: mock adapters (in-memory/localStorage). Backend persistence: planned for follow-up (MongoDB / Mongoose indicated by repo deps).  
**Testing**: Jest + Testing Library for unit/component tests; Playwright for E2E; axe-playwright for accessibility assertions.  
**Target Platform**: Web (Next.js frontend, server-side rendering where applicable).  
**Project Type**: Web application (frontend-first feature implemented inside `src/app` / `src/components`).  
**Performance Goals**: UI responsiveness: filter/search actions return visible results within 1s on a typical developer machine (see SC-002 in spec).  
**Constraints**: Must follow constitution (TDD-first, file/function size limits), accessible by keyboard and screen readers, mobile-responsive.  
**Scale/Scope**: Feature MVP targets single-user developer flows; production scale TBD with backend API story.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

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

**Structure Decision**: Web application, frontend-only for this feature MVP.

- The feature will live in the existing frontend layout under `src/app` and `src/components`.
- No backend changes are required for the UI-first iteration; adapters and stubs should be added under `src/lib/services` and `src/lib/mocks`.
- Tests: unit/component tests under `tests/unit` and `tests/integration`; Playwright E2E under `tests/e2e`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
