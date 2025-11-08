# Tasks: Party Management Pages (F006)

**Feature**: Party Management Pages  
**Issue**: #006  
**Status**: Ready for Execution  
**Branch**: `feature/006-party-management-pages`  
**Estimated Duration**: 10-11 hours  
**Last Updated**: 2025-11-07

---

## Overview

Party Management Pages provides DMs with a complete UI for viewing, creating, editing, and deleting parties—groups of adventurers for D&D campaigns. All pages use mock data during this phase (F006) and will integrate with backend in F014+.

### Execution Strategy

**Phase Structure**: Tests → Implementation → Refactoring → Documentation

This document follows **Test-Driven Development (TDD)**:

1. Write failing tests first (Red phase)
2. Implement to pass tests (Green phase)
3. Refactor and extract duplication (Blue phase)
4. Commit and quality check

**Task Organization**: Grouped by user story priority (P1 > P2) with parallel opportunities marked `[P]`.

### Key Metrics

- **Total Tasks**: 47
- **Setup/Foundation**: 8 tasks
- **User Story 1 (View All Parties - P1)**: 8 tasks
- **User Story 2 (View Party Details - P1)**: 9 tasks
- **User Story 3 (Create New Party - P1)**: 9 tasks
- **User Story 4 (Edit Party Details - P2)**: 7 tasks
- **User Story 5 (Delete Party - P2)**: 3 tasks
- **Polish & Cross-Cutting**: 3 tasks

### Parallel Execution Opportunities

**Independent components can be built concurrently:**

- MemberCard, RoleSelector (no dependencies on other components)
- PartyCard can start after types/mock data
- MemberForm depends on RoleSelector completion
- All unit tests can run in parallel with integration tests

---

## Dependencies & Story Completion Order

```
Setup/Foundation (MUST complete first)
│
├── US1: View All Parties (P1) → depends on types, mock data
├── US2: View Party Details (P1) → depends on US1 components
├── US3: Create New Party (P1) → depends on all components
├── US4: Edit Party Details (P2) → depends on US3
└── US5: Delete Party (P2) → depends on US2/US4
```

**MVP Scope**: User Stories 1-3 (P1 priority). US4-5 (P2) are valuable but deferrable.

**Minimum Viable Feature**: Complete all P1 stories = users can view, create, and navigate parties.

---

## Phase 1: Setup & Foundation (Morning - 1.5 hours)

Setup tasks prepare the codebase for feature implementation. Must complete before any component work.

- [ ] T001 Create TypeScript type definitions in `src/types/party.ts` with Party, PartyMember, DnDClass, DnDRace, PartyRole interfaces and validation rules

- [ ] T002 Create mock data module `src/lib/mockData/parties.ts` with MOCK_PARTIES array (2 complete party examples) and factory functions for test data generation

- [ ] T003 Create party utility functions in `src/lib/utils/partyHelpers.ts` with: getPartyComposition(), getAverageLevel(), getPartyTier(), getLevelRange()

- [ ] T004 Create component index file `src/components/parties/index.ts` that exports all party components (needed for clean imports)

- [ ] T005 Run type check `npm run type-check` and verify no errors in new types

- [ ] T006 Run lint fix `npm run lint:fix` on new utility files

- [ ] T007 Create test helpers `tests/test-helpers/partyFactories.ts` with factory functions for creating mock parties/members in tests

- [ ] T008 Add `.env.example` entry for any environment variables needed (currently none for F006 mock-only phase)

---

## Phase 2: Foundational Components (Late Morning - 2 hours)

Foundational components have no dependencies on other components. Build these first for parallel work.

### MemberCard Component

- [ ] T009 [P] Write unit tests `tests/unit/components/MemberCard.test.tsx` covering: render with member data, all variants (detail/edit/preview), role badge colors, HP bar display, remove button callback, accessibility

- [ ] T010 [P] Implement `src/components/parties/MemberCard.tsx` (100-120 LOC) with variant prop for context-specific rendering (detail/edit/preview variants)

- [ ] T011 [P] Run `npm run test:ci` for MemberCard tests and verify passing

### RoleSelector Component

- [ ] T012 [P] Write unit tests `tests/unit/components/RoleSelector.test.tsx` covering: all role options render, onChange callback, value prop selection, keyboard navigation

- [ ] T013 [P] Implement `src/components/parties/RoleSelector.tsx` (40-60 LOC) using shadcn/ui Select component with color-coded role options

- [ ] T014 [P] Run `npm run test:ci` for RoleSelector tests and verify passing

### PartyCompositionSummary Component

- [ ] T015 [P] Write unit tests `tests/unit/components/PartyCompositionSummary.test.tsx` covering: stat calculations (member count, avg level, tier), role distribution accuracy, compact vs. full variants

- [ ] T016 [P] Implement `src/components/parties/PartyCompositionSummary.tsx` (60-80 LOC) displaying party stats, role distribution, and tier indicator

- [ ] T017 [P] Run `npm run test:ci` for PartyCompositionSummary tests and verify passing

---

## Phase 3: Secondary Components (Early Afternoon - 2.5 hours)

Secondary components depend on foundational components. Start after T017 or in parallel with independent components.

### PartyCard Component

- [ ] T018 [P] Write unit tests `tests/unit/components/PartyCard.test.tsx` covering: render party name/description, role composition display, click navigation, hover states, responsive layout

- [ ] T019 [P] Implement `src/components/parties/PartyCard.tsx` (90-120 LOC) displaying party summary with composition badges and click handler

- [ ] T020 [P] Run `npm run test:ci` for PartyCard tests and verify passing

### DeleteConfirmModal Component

- [ ] T021 [P] Write unit tests `tests/unit/components/DeleteConfirmModal.test.tsx` covering: modal display when open, buttons call callbacks, escape key closes, focus trap

- [ ] T022 [P] Implement `src/components/parties/DeleteConfirmModal.tsx` (50-70 LOC) using shadcn/ui Dialog component with confirmation buttons

- [ ] T023 [P] Run `npm run test:ci` for DeleteConfirmModal tests and verify passing

### MemberForm Component

- [ ] T024 Write unit tests `tests/unit/components/MemberForm.test.tsx` covering: all form fields render, validation rules, onSubmit callback, pre-population in edit mode, accessibility

- [ ] T025 Implement `src/components/parties/MemberForm.tsx` (120-150 LOC) using React Hook Form + shadcn/ui Form components for member input

- [ ] T026 Run `npm run test:ci` for MemberForm tests and verify passing

### PartyDetail Component

- [ ] T027 Write unit tests `tests/unit/components/PartyDetail.test.tsx` covering: render party name/description, composition summary display, member list, action buttons (edit variant), member sorting by role

- [ ] T028 Implement `src/components/parties/PartyDetail.tsx` (100-120 LOC) composing PartyCompositionSummary, MemberCard components for detail view

- [ ] T029 Run `npm run test:ci` for PartyDetail tests and verify passing

---

## Phase 4: Form Component (Afternoon - 1.5 hours)

Most complex component; depends on MemberForm, RoleSelector, DeleteConfirmModal.

- [ ] T030 Write unit tests `tests/unit/components/PartyForm.test.tsx` covering: form field validation, member add/remove, onSubmit callback, pre-population in edit mode, "Not Implemented" message display, accessibility

- [ ] T031 Implement `src/components/parties/PartyForm.tsx` (150-180 LOC) using React Hook Form + shadcn/ui Form with nested MemberForm component for member management

- [ ] T032 Run `npm run test:ci` for PartyForm tests and verify passing

- [ ] T033 Run linting and format: `npm run lint:fix` on all component files

- [ ] T034 Run type check: `npm run type-check` on all component files

---

## Phase 5: Page Integration - Party List (Late Afternoon - 1 hour)

- [ ] T035 [US1] Write integration tests `tests/integration/parties/party-list.test.tsx` covering: page renders list of parties, PartyCard components display correct data, grid layout responsive (1-2-3 columns), click navigation to detail page, empty state

- [ ] T036 [US1] Implement `src/app/parties/page.tsx` (60-80 LOC) rendering party list with PartyCard components in responsive grid, mock data source

- [ ] T037 [US1] Run `npm run test:ci:parallel` for party-list integration tests and verify passing

---

## Phase 6: Page Integration - Party Detail (Afternoon - 1 hour)

- [ ] T038 [US2] Write integration tests `tests/integration/parties/party-detail.test.tsx` covering: page renders with correct party data, PartyDetail component displays members, back/edit/delete buttons present, error handling for invalid :id

- [ ] T039 [US2] Implement `src/app/parties/[id]/page.tsx` (70-90 LOC) rendering party detail using PartyDetail component, mock data lookup, error states

- [ ] T040 [US2] Run `npm run test:ci:parallel` for party-detail integration tests and verify passing

---

## Phase 7: Page Integration - Party Create & Edit (Late Afternoon - 1 hour)

- [ ] T041 [US3] Write integration tests `tests/integration/parties/party-create.test.tsx` covering: form renders empty, member add/remove works, form submission shows "Not Implemented", cancel navigates back, back button works

- [ ] T042 [US3] Implement `src/app/parties/new/page.tsx` (40-50 LOC) rendering PartyForm component in create mode with mock data submission handler

- [ ] T043 [US3] Run `npm run test:ci:parallel` for party-create integration tests and verify passing

- [ ] T044 [US4] Write integration tests `tests/integration/parties/party-edit.test.tsx` covering: form pre-populates with party data, member edit/remove works, submit shows "Not Implemented", delete button opens modal, cancel navigates back

- [ ] T045 [US4] Implement `src/app/parties/[id]/edit/page.tsx` (50-70 LOC) rendering PartyForm in edit mode with PartyDetail pre-population, DeleteConfirmModal integration

- [ ] T046 [US4] Run `npm run test:ci:parallel` for party-edit integration tests and verify passing

---

## Phase 8: E2E Testing & Cross-Cutting Concerns (Final Hour - 1 hour)

- [ ] T047 [US1] Write E2E tests `tests/e2e/party-management.spec.ts` (200-250 LOC) covering critical user flows: view party list → click party → view detail → click edit → modify form → cancel to detail → back to list

- [ ] T048 Run full test suite: `npm run test:ci:parallel` and verify all tests passing (unit + integration + E2E)

- [ ] T049 Run type check: `npm run type-check` and verify no errors

- [ ] T050 Run linting: `npm run lint` and verify all issues resolved

- [ ] T051 Run Codacy analysis: `codacy_cli_analyze` and address any critical issues

- [ ] T052 Run build: `npm run build` and verify successful completion

- [ ] T053 Verify test coverage: `npm run test:ci:parallel -- --coverage` shows 80%+ on touched code

---

## Phase 9: Documentation & Polish (Final Tasks)

- [ ] T054 Update `README.md` with Party Management feature overview and link to `/parties` route

- [ ] T055 Update `.env.example` with any new environment variables (none for F006)

- [ ] T056 Add JSDoc comments to complex utility functions in `partyHelpers.ts`

- [ ] T057 Final verification: All ESLint warnings cleared, no console errors in dev mode, responsive design verified at 375px/768px/1024px breakpoints

---

## Quality Gates (Must Pass Before PR)

- [ ] All 53 tasks completed and committed
- [ ] `npm run test:ci:parallel` passes (100% of tests)
- [ ] `npm run type-check` passes (zero errors)
- [ ] `npm run lint` passes (zero errors)
- [ ] `npm run lint:markdown:fix` passes (zero errors)
- [ ] `npm run build` succeeds
- [ ] `codacy_cli_analyze` passes (no critical issues)
- [ ] Test coverage ≥80% on all touched code
- [ ] All files <450 lines (uncommented)
- [ ] All functions <50 lines
- [ ] No code duplication (utilities extracted)
- [ ] No hardcoded data in components (uses props/mock data)
- [ ] All interactive elements keyboard accessible
- [ ] Responsive design works at 3 breakpoints (375px, 768px, 1024px+)

---

## Commit Strategy

**Follow conventional commits and atomic commits (one logical change per commit):**

1. After T008: `chore: setup types and mock data for party management`
2. After T029: `feat: implement foundational party components (MemberCard, RoleSelector, etc.)`
3. After T034: `refactor: extract party utilities and improve component organization`
4. After T040: `feat: implement party detail page with composition display`
5. After T046: `feat: implement party create/edit pages with form submission UI`
6. After T047: `test: add E2E tests for party management workflows`
7. After T057: `docs: update README and add JSDoc for party management`

---

## Time Budget Breakdown

| Phase | Task Range | Est. Time | Activity |
|-------|-----------|-----------|----------|
| 1 | T001-T008 | 1.5 hrs | Setup types, mock data, utilities |
| 2 | T009-T017 | 2.0 hrs | Foundational components (MemberCard, RoleSelector, Summary) |
| 3 | T018-T029 | 2.5 hrs | Secondary components (PartyCard, MemberForm, PartyDetail, etc.) |
| 4 | T030-T034 | 1.5 hrs | PartyForm component (most complex) |
| 5 | T035-T037 | 1.0 hr | Party list page |
| 6 | T038-T040 | 1.0 hr | Party detail page |
| 7 | T041-T046 | 1.5 hrs | Create/edit pages |
| 8 | T047-T053 | 1.5 hrs | E2E tests, quality checks |
| 9 | T054-T057 | 0.5 hrs | Documentation & polish |
| **Total** | **T001-T057** | **~13 hrs** | Complete implementation |

**Actual execution typically 10-11 hours** with parallel component work and efficient testing.

---

## Success Criteria

✅ All pages render without errors  
✅ All 2 mock parties display on list page  
✅ Party detail shows all members with correct stats  
✅ Create/edit forms display and show "Not Implemented" on submit  
✅ Delete modal appears when delete button clicked  
✅ Responsive layout verified at mobile/tablet/desktop  
✅ All tests passing (100% of unit, integration, E2E)  
✅ 80%+ test coverage on all touched code  
✅ ESLint, TypeScript, Codacy all clean  
✅ Build succeeds  
✅ No code duplication or overly complex functions  
✅ All components <450 lines, functions <50 lines  
✅ Keyboard navigation works on all interactive elements  
✅ ARIA labels present on buttons/form fields

---

## Notes for Execution

- **Use the quickstart.md** (in specs/006-party-management-pages/quickstart.md) as implementation guide for component order
- **Follow TDD strictly**: Write tests first, implement second, refactor third
- **Extract test utilities early** to avoid duplication across 15+ test files
- **Run linting after each file**: `npm run lint:fix` keeps issues from accumulating
- **Verify mock data** is used throughout—no hardcoding
- **Test accessibility**: Keyboard nav + ARIA labels required for all components
- **Responsive design**: Test at 375px, 768px, 1024px+ during implementation

---

## Created Date: 2025-11-07 | Ready for Execution ✓
