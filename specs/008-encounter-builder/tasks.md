---
description: "Generated task list for Encounter Builder feature"
---

# Tasks: Encounter Builder

**Input**: Design documents from `/specs/008-encounter-builder/` (spec.md, plan.md, data-model.md, contracts/encounters.yaml)

**Maintainer**: @doug

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Create Next.js route directory for encounters: `src/app/encounters` (create `page.tsx` and route folder)
- [ ] T002 Create Encounters list component shell: `src/components/encounters/EncountersList.tsx`
- [ ] T003 Create New Encounter page route: `src/app/encounters/new/page.tsx`
- [ ] T004 Create basic Encounter UI components folder: `src/components/encounters/ParticipantForm.tsx`, `src/components/encounters/TemplateSelector.tsx`
- [ ] T005 Add TypeScript types for Encounter & Participant: `src/types/encounter.ts`

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T006 Implement Encounter Mongoose model and server-side type mapping: `src/lib/models/encounter.ts`
- [ ] T007 [P] Implement Zod validation schema for Encounter payloads: `src/lib/schemas/encounter.ts`
- [ ] T008 [P] Create API adapter for encounters (client-facing): `src/lib/api/encounters.ts`
- [ ] T009 Implement localStorage fallback adapter for MVP (used when API not available): `src/lib/storage/local-encounters.ts`
- [ ] T010 [P] Add Next.js API route skeleton for encounters: `src/app/api/encounters/route.ts`
- [ ] T011 Add unit test harness and folder for encounter unit tests: `tests/unit/encounter/` (create placeholder `tests/unit/encounter/encounter.model.test.ts`)

<!-- TDD-first additions: explicit failing-test tasks BEFORE implementation to comply with constitution -->
- [ ] T012 Add failing unit tests for Encounter model (red): `tests/unit/encounter/encounter.model.test.ts`
- [ ] T013 Add failing unit tests for Encounter Zod schema (red): `tests/unit/encounter/encounter.schema.test.ts`
- [ ] T014 Add failing unit tests for Encounters API adapter (red): `tests/unit/encounter/encounters.api.test.ts`
- [ ] T015 Add failing integration test for API route skeleton (red): `tests/integration/api/encounters.route.test.ts`

<!-- Authorization tests should be present early (foundational) per constitution -->
- [ ] T016 Add authorization tests to ensure owner_id matching on create/update/delete: `tests/integration/encounter-auth.test.ts`

## Phase 3: User Story 1 - Create encounter from scratch (Priority: P1) MVP

**Goal**: Allow an authenticated GM to create a new encounter (name + ≥1 participant), save it, and see it in the encounters list.

**Independent Test**: Playwright E2E test that opens `/encounters/new`, adds a participant, saves, then asserts the encounter appears on `/encounters`.

- [ ] T017 [US1] Add E2E test for create/save flow: `tests/e2e/encounter-create.spec.ts`

- [ ] T018 [US1] Implement New Encounter page UI: `src/app/encounters/new/page.tsx` (depends on T003, T004)
- [ ] T019 [US1] Implement Participant form component: `src/components/encounters/ParticipantForm.tsx` (depends on T004)
- [ ] T020 [US1] Wire save flow to API adapter / local fallback: `src/lib/api/encounters.ts` (depends on T008, T009)
- [ ] T021 [US1] Implement Encounters list view and ensure saved items appear: `src/app/encounters/page.tsx` (depends on T002, T020)

## Phase 4: User Story 2 - Build encounter from a party or saved template (Priority: P2)

**Goal**: Allow importing participants from a party or saved template to pre-populate the New Encounter form.

**Independent Test**: Integration test that imports a party/template into the New Encounter page and saves a new encounter.

- [ ] T022 [US2] Write failing integration test for import-and-save (failing): `tests/integration/encounter-import.test.ts` (place before implementation tasks T023..T025)
- [ ] T023 [P] [US2] Implement party/template import UI component: `src/components/encounters/ImportFromParty.tsx`
- [ ] T024 [US2] Implement service to fetch parties and templates: `src/lib/api/parties.ts` and `src/lib/api/templates.ts`
- [ ] T025 [US2] Add Template flag behavior to save flow (allow saving with `template_flag=true`): update `src/lib/api/encounters.ts`
- [ ] T026 [US2] Add integration test for import-and-save: `tests/integration/encounter-import.test.ts`

## Phase 5: User Story 3 - Edit encounter and adjust initiative/HP during planning (Priority: P3)

**Goal**: Allow editing a saved encounter (change initiative, HP, participants) and persist changes.

**Independent Test**: Integration test that opens a saved encounter, modifies fields, saves, and verifies updates.

- [ ] T027 [US3] Write failing integration test for edit/save (failing): `tests/integration/encounter-edit.test.ts` (place before implementation tasks T028..T029)
- [ ] T028 [US3] Implement Encounter edit page route: `src/app/encounters/[id]/page.tsx`
- [ ] T029 [US3] Implement update API route for encounter: `src/app/api/encounters/[id]/route.ts`
- [ ] T030 [US3] Add unit/integration tests for edit/save flow: `tests/integration/encounter-edit.test.ts`

## Phase N: Polish & Cross-Cutting Concerns

- [ ] T031 [P] Add pagination and search to Encounters list: update `src/components/encounters/EncountersList.tsx` and `src/app/encounters/page.tsx`
- [ ] T032 [P] Ensure accessibility labels and keyboard focus for all new form controls: update `src/components/encounters/*.tsx`
- [ ] T033 [P] Add documentation / quickstart for the Encounter Builder: `specs/008-encounter-builder/quickstart.md`
- [ ] T034 Update `package.json` scripts to include encounter e2e and integration commands: `package.json`
- [ ] T035 [P] Run TypeScript typecheck and ESLint around touched files: `tsconfig.json` / `eslint.config.mjs`
- [ ] T036 [P] Run Codacy analysis on modified files as required by repo policy: use `codacy_cli_analyze` (one-per-file analysis after edits)
- [ ] T037 [P] If adding dependencies, run security scan via Codacy Trivy: `codacy_cli_analyze` with `tool=trivy`
- [ ] T038 [P] Add structured logging and telemetry hooks for create/update/delete in encounters API routes: `src/app/api/encounters/*.ts`
- [ ] T039 [P] Add performance test for save-to-list latency (SC-002): `tests/e2e/encounter-save-latency.spec.ts`
- [ ] T040 [P] Add performance test for UI responsiveness with 100 participants (SC-004): `tests/perf/encounter-100participants.spec.ts`

## Dependencies & Execution Order

- Setup tasks T001..T005: start immediately
- Foundational tasks T006..T011: BLOCK user stories; must finish before T012..T021 (foundational tests + US1)
- User stories (US1..US3) can proceed after foundational completion. Within a story: tests → models → schemas → UI → API wiring
- Polish tasks T031..T035: final cross-cutting work

## Parallel Opportunities

- Tasks marked `[P]` can run in parallel (e.g., T007, T008, T009, T019)
- Different user story phases (US1, US2, US3) can be implemented in parallel after foundational tasks complete

## Implementation strategy (MVP-first)

1. Finish Phase 1 + Phase 2.
2. Implement Phase 3 (User Story 1) end-to-end and validate with the E2E test (T017).
3. Deliver P2 and P3 in subsequent iterations, running tests and small demos after each story completes.

---

**Notes & Assumptions**

- Assumption: Project uses Next.js app router; pages placed under `src/app/` and components under `src/components/` (adjust paths if your project layout differs).
- Assumption: Backend persistence follows existing Mongoose conventions; `src/lib/models/` is the right place for models and `src/app/api/` contains API routes.
- If any of the inferred paths conflict with repository conventions, update the file paths before implementing.
