---
description: "Task list for Character Management Pages"
---

# Tasks: Character Management Pages

**Input**: Design documents from `/specs/005-character-management-pages/`
**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories)

**Maintainer**: @doug

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directories and basic scaffolding needed before implementation.

- [x] T001 Create `specs/005-character-management-pages/tasks.md` (this file) at `specs/005-character-management-pages/tasks.md`
- [x] T002 [P] Create directory `src/components/characters/` and add `.gitkeep` placeholder at `src/components/characters/.gitkeep`
- [x] T003 [P] Create directory `src/lib/mock/` and add `.gitkeep` placeholder at `src/lib/mock/.gitkeep`
- [x] T004 [P] Ensure unit test directory exists: create `tests/unit/components/characters/` and `.gitkeep` at `tests/unit/components/characters/.gitkeep`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core in-memory data and types that all stories depend on. These MUST be completed before story implementation.

- [x] T005 Create seed mock data `src/lib/mock/characters.ts` (≥5 characters) — seed data file used by all components
- [x] T006 Create TypeScript character types `types/character.ts` and `specs/005-character-management-pages/data-model.md` defining the canonical `Character` shape used across the feature (canonical field: `className`)
- [x] T007 Create `src/lib/characterStore.ts` — React context + reducer + hooks implementing in-memory CRUD and Undo (create, read, update, delete, undo) with clear function signatures
- [x] T008 [P] Add unit test scaffold for store at `tests/unit/lib/characterStore.spec.ts` (TDD-first: tests should be written to fail before implementation)
- [x] T009 [P] Create or update barrel exports at `src/lib/index.ts` to export `characterStore` utilities (explicit: create file if it doesn't exist)

---

## Phase 3: User Story 1 - Browse Characters (Priority: P1) MVP

**Goal**: Provide `/characters` page showing a list/grid of characters with search and filters.

**Independent Test**: Visit `/characters` and confirm at least 5 mock characters render with name, class, level, HP and AC; search filters results.

### Tests (TDD - write first)

- [x] T010 [P] [US1] Add unit test `tests/unit/components/characters/CharacterList.spec.tsx` for list rendering and search/filter behavior
- [x] T011 [P] [US1] Add unit test `tests/unit/components/characters/CharacterCard.spec.tsx` for card display (name, class, level, HP, AC)

### Implementation

- [x] T012 [P] [US1] Implement `src/components/characters/CharacterCard.tsx` (card UI showing name, class, level, HP, AC)
- [x] T013 [P] [US1] Implement `src/components/characters/CharacterList.tsx` (list with search box and class/level filters; consumes `characterStore`)
- [x] T014 [US1] Add page `src/app/characters/page.tsx` wiring `CharacterList` and server/client rendering mode as appropriate
- [x] T015 [US1] Add accessibility and empty-state behavior in `src/components/characters/CharacterList.tsx` linking to `/characters/new`

---

## Phase 4: User Story 2 - View Character Details (Priority: P1)

**Goal**: Provide `/characters/:id` detail page showing full stat block and actions (Edit/Delete).

**Independent Test**: Visit `/characters/:id` and verify stat block renders (HP, AC, abilities, equipment, class, race, level).

### Tests

- [x] T016 [P] [US2] Add unit test `tests/unit/components/characters/CharacterDetail.spec.tsx` for detail rendering and invalid-id empty state

### Implementation

- [ ] T017 [US2] Implement `src/components/characters/CharacterDetail.tsx` (stat block UI, Edit/Delete buttons)
- [ ] T018 [US2] Add page `src/app/characters/[id]/page.tsx` wiring `CharacterDetail` and handling invalid id empty state (link back to `/characters`)
- [ ] T019 [US2] Add client-side navigation from `CharacterCard` to `/characters/:id` (update `CharacterCard.tsx` and `CharacterList.tsx`)

---

## Phase 5: User Story 3 - Create New Character (Priority: P2)

**Goal**: Provide `/characters/new` create form with required fields and client-side validation.

**Independent Test**: Visit `/characters/new` and verify form fields exist and required validation prevents submission when empty.

### Tests

- [x] T020 [P] [US3] Add unit test `tests/unit/components/characters/CharacterForm.spec.tsx` for validation rules and submit behavior (UI-only)

### Implementation

- [x] T021 [US3] Implement `src/components/characters/CharacterForm.tsx` (create/edit form with name, class, race, level, HP, AC, abilities; validates required fields)
- [x] T022 [US3] Add page `src/app/characters/new/page.tsx` that mounts `CharacterForm` for creation and uses `characterStore` to add new item (mock behavior)
- [x] T023 [US3] Navigate to `/characters/:id` mock detail after creation (deterministic behavior for tests) (implement in `src/app/characters/new/page.tsx`)

---

## Phase 6: User Story 4 - Edit Character (Priority: P2)

**Goal**: Allow editing an existing character from the detail page using the same form UI (prefilled values).

**Independent Test**: From `/characters/:id` open Edit, modify fields, Save, and observe updated values in UI (mock behavior).

### Tests

- [ ] T024 [P] [US4] Add unit test `tests/unit/components/characters/EditCharacterFlow.spec.tsx` for prefilling and save behavior

### Implementation

- [x] T025 [US4] Wire Edit button in `src/components/characters/CharacterDetail.tsx` to open `CharacterForm` prefilled (reuse `src/components/characters/CharacterForm.tsx`)
- [x] T026 [US4] Implement update flow in `src/lib/characterStore.ts` (update action) and ensure components react to store changes

---

## Phase 7: User Story 5 - Delete Character (Priority: P3)

**Goal**: Provide Delete confirmation modal and transient Undo support when deleting a character.

**Independent Test**: From `/characters/:id` click Delete, confirm in modal, verify item removed from list and Undo restores it within ~5s.

### Tests

- [x] T027 [P] [US5] Add unit test `tests/unit/components/characters/DeleteCharacterModal.spec.tsx` for confirm/undo behavior

### Implementation

- [x] T028 [US5] Implement `src/components/characters/DeleteCharacterModal.tsx` (confirm modal UI)
- [x] T029 [US5] Implement Undo support in `src/lib/characterStore.ts` and add UI toast at `src/components/characters/DeleteCharacterModal.tsx` (or reuse existing toast component)
- [x] T030 [US5] Ensure delete navigates to `/characters` after successful confirm and removal

---

## Phase 8: Integration, E2E & Polish (Cross-cutting Concerns)

- [x] T031 [P] Add integration tests for page flows: `tests/integration/characters-flow.spec.tsx` (list, detail, create flows with shared CharacterProvider)
- [x] T032 Add Playwright E2E test `tests/e2e/characters.spec.ts` covering basic navigation to `/characters`, `/characters/new`, `/characters/:id`
- [x] T033 [P] Add documentation updates in `specs/005-character-management-pages/README.md` describing how to run the feature locally and run tests
- [x] T034 [P] Accessibility and responsive polish: review `src/components/characters/*` for mobile layout and ARIA attributes
- [x] T035 Run lint/format and ensure no TypeScript `any` types introduced in `src/components/characters/*` and `src/lib/characterStore.tsx` (completed - all passing)
- [x] T036 [P] Add security check task to run Trivy/Codacy scan when dependencies are added; document required command in `specs/005-character-management-pages/README.md`
- [x] T037 [P] [US1] Add perf-smoke unit test `tests/unit/perf/characters-filter-smoke.spec.ts` to assert client-side filter completes within a small budget (e.g., 200ms) on a dev machine (configurable)

---

## Dependencies & Execution Order

- Setup (Phase 1) tasks T002-T004 can run immediately and in parallel
- Foundational (Phase 2) tasks T005-T009 MUST complete before any User Story implementation (Phases 3+)
- User Stories P1 (US1, US2) are high priority and should be implemented first for MVP
- US3 and US4 (P2) follow and can run after P1 stories are independently validated
- US5 (P3) is lower priority and can be implemented after core CRUD flows

## Parallel execution examples

- While T005 (seed data) and T006 (types) are independent, they can be worked on in parallel: T005 [P], T006 [P]
- Tests for a user story are parallelizable with model/component creation: e.g., T010 [P] and T011 [P] can be created while T012 and T013 are implemented

## Implementation Strategy (MVP-first)

1. Complete Phase 1 (scaffolding) and Phase 2 (character store + seed data). This unlocks all user stories.
2. Implement User Story 1 (Browse Characters) completely (tests first), verify it independently (MVP).
3. Implement User Story 2 (View Details) to complement MVP and validate navigation flows.
4. Add Create/Edit/Delete (US3-US5) iteratively, each with tests first.

---

## Final Notes & Acceptance

- All tasks above follow the required checklist format: checkbox, TaskID, optional [P], optional [USx], and exact file path in the description.
- Suggested MVP: complete Phases 1-3 (Setup, Foundational, and US1) and validate with unit + simple E2E checks.
