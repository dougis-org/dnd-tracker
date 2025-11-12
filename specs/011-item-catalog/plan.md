# Implementation Plan: Feature 011 — Item Catalog Pages

**Branch**: `feature/011-item-catalog` | **Date**: 2025-11-12 | **Spec**: `specs/011-item-catalog/spec.md`  
**Input**: Feature specification from `specs/011-item-catalog/spec.md`

**Maintainer**: @doug

**Note**: This plan is the implementer's guide for the UI-first MVP of the Item Catalog Pages feature. It summarizes the technical approach, constraints, and the vertical slices to implement (list/filter/search → detail → create/edit). Follow the TDD-first workflow mandated by the project constitution: write failing tests first, implement, then refactor.

## Summary

Deliver a UI-first Item Catalog feature using mock adapters and local persistence for the MVP. Prioritize the list/filter/search workflow (US1) to enable character and encounter integration. After the MVP, implement detail views (US2), create/edit forms (US3), and multi-filter combinations (US4). Ensure TDD-first, accessibility, and Codacy quality gates are satisfied before PR merge.

Performance benchmark: Follow the Performance benchmark in `specs/011-item-catalog/spec.md` (representative dataset = 100 items). Implement performance smoke tests to record `search-latency-ms` and `filter-latency-ms` and publish results as CI artifacts for trend analysis.

## Technical Context

**Language/Version**: TypeScript 5.9.2 (Next.js 16, React 19)  
**Primary Dependencies**: Next.js 16, React 19, Zod (validation), Tailwind CSS, shadcn/ui, Mongoose (present in repo but backend work out of scope for frontend MVP)  
**Storage**: UI-first: mock adapters (in-memory/localStorage). Backend persistence: planned for follow-up Feature 030 (Item Model & API with MongoDB / Mongoose).  
**Testing**: Jest + Testing Library for unit/component tests; Playwright for E2E; axe-playwright for accessibility assertions.  
**Target Platform**: Web (Next.js frontend, server-side rendering where applicable).  
**Project Type**: Web application (frontend-first feature implemented inside `src/app` / `src/components`).  
**Performance Goals**: UI responsiveness: filter/search actions return visible results within 1s (95th percentile) on a typical developer machine (see SC-002, SC-006 in spec).  
**Constraints**: Must follow constitution (TDD-first, file/function size limits: max 450 lines per file, max 50 lines per function), accessible by keyboard and screen readers, mobile-responsive.  
**Scale/Scope**: Feature MVP targets single-user developer flows with 50-100 seed items; production scale with backend API in Feature 030.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Quality & Ownership Gates

- ✅ All tests passing (TDD-first required)
- ✅ 80%+ code coverage on touched code
- ✅ ESLint and Markdown linting clean
- ✅ TypeScript strict mode, no `any` types without justification
- ✅ Files ≤450 lines, functions ≤50 lines
- ✅ Code follows DRY principle (no duplication)
- ✅ Codacy analysis passing (no new complexity, duplication, or issues)

### Test-First (TDD) Gates

- ✅ Write failing tests before implementation
- ✅ Red → Green → Refactor cycle documented
- ✅ Unit tests for utilities, components, and logic
- ✅ Integration tests for API interactions (mock adapters)
- ✅ E2E tests for critical user workflows (browse, filter, create)
- ✅ 80%+ coverage on new/touched code

### Simplicity & Composability Gates

- ✅ Small, focused modules and components
- ✅ Composition over inheritance
- ✅ Avoid premature generalization
- ✅ Extract test helpers and shared fixtures

### Observability & Security Gates

- ✅ Structured logging for runtime operations
- ✅ Meaningful error messages
- ✅ Input validation via Zod schemas
- ✅ No secrets in code or configuration files

### Post-ratification checklist

- [x] Confirm `.specify/memory/constitution.md` is referenced in the feature spec
- [ ] Run Codacy analysis on any edited files (per repo rules)
- [ ] Update templates if constitution wording changes

## Project Structure

### Documentation (this feature)

```text
specs/011-item-catalog/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── items-api.yaml   # OpenAPI spec for Item endpoints
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**Structure Decision**: Web application, frontend-only for this feature MVP.

- The feature will live in the existing frontend layout under `src/app/items` and `src/components/items`.
- No backend changes are required for the UI-first iteration; adapters and stubs should be added under `src/lib/adapters` and `src/lib/mocks`.
- Seed data: D&D 5e SRD items (50+ items) in `src/lib/mocks/sampleItems.ts`.
- Tests: unit/component tests under `tests/unit/items` and `tests/integration/items`; Playwright E2E under `tests/e2e/items`.

```text
src/
├── app/
│   └── items/
│       ├── page.tsx              # List page
│       ├── [id]/
│       │   ├── page.tsx          # Detail page
│       │   └── edit/
│       │       └── page.tsx      # Edit page
│       └── new/
│           └── page.tsx          # Create page
├── components/
│   └── items/
│       ├── ItemCard.tsx          # Item list card component
│       ├── ItemDetailCard.tsx    # Item detail display
│       ├── ItemFilter.tsx        # Filter controls (type, rarity, weight)
│       ├── ItemSearch.tsx        # Search input component
│       └── ItemForm.tsx          # Create/edit form
├── lib/
│   ├── adapters/
│   │   └── items.ts              # Mock adapter for item CRUD
│   ├── mocks/
│   │   └── sampleItems.ts        # 50+ D&D 5e SRD seed items
│   ├── types/
│   │   └── item.ts               # TypeScript interfaces
│   └── validations/
│       └── itemSchema.ts         # Zod validation schemas

tests/
├── unit/
│   └── items/
│       ├── ItemCard.test.tsx
│       ├── ItemFilter.test.tsx
│       └── itemAdapter.test.ts
├── integration/
│   └── items/
│       └── itemWorkflow.test.ts  # List → Detail → Create flow
└── e2e/
    └── items/
        ├── browse-and-filter.spec.ts
        ├── create-custom-item.spec.ts
        └── item-detail.spec.ts
```

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations**: This feature follows the established patterns from Features 005, 006, 007, and 009. All constitution gates can be satisfied with standard Next.js/React architecture, mock adapters, and TDD workflow.

---

**Planning Status**: ✅ Phase 1 Complete — Ready for Phase 2 (task breakdown via `/speckit.tasks`)
