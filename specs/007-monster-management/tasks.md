<!-- Auto-generated tasks for Feature 007: Monster / NPC Management -->
# Tasks for Feature 007 — Monster / NPC Management

Feature: Monster / NPC Management
Feature folder: `specs/007-monster-management`

Phase 1: Setup

- [ ] T001 Initialize TypeScript types for Monster entities in `src/types/monster.ts`
- [ ] T002 [P] Add mock adapter for monsters at `src/lib/mocks/monsterAdapter.ts` (read/write to localStorage)
- [ ] T003 Create service wrapper `src/lib/services/monsterService.ts` that uses the mock adapter and can swap to real API later
- [ ] T004 Create basic design skeleton components: `src/components/MonsterCard.tsx` and `src/components/MonsterStatBlock.tsx`
- [ ] T005 [P] Add initial sample monsters fixture `specs/007-monster-management/fixtures/sampleMonsters.ts` (200 items for perf/dev)
- [ ] T006 Add Zod validation schemas for Monster create/edit in `src/lib/validation/monsterSchema.ts` (follow `data-model.md`)
- [ ] T007 Update `specs/007-monster-management/quickstart.md` with seed/run/test instructions and TDD guidance

Phase 2: Foundational (blocking prerequisites)

- [ ] T008 Create Monsters route folder and shell pages:
  - `src/app/monsters/page.tsx` (list)
  - `src/app/monsters/[id]/page.tsx` (detail)
  - `src/app/monsters/new/page.tsx` (create)
  - `src/app/monsters/[id]/edit/page.tsx` (edit)
- [ ] T009 Add navigation entry in `src/components/GlobalNav.tsx` to include `/monsters`
- [ ] T010 Implement sampleMonsters adapter `src/lib/mocks/sampleMonsters.ts` used by `monsterAdapter` (seed 200 representative monsters)
- [ ] T011 Ensure `specs/007-monster-management/contracts/monsters.openapi.yml` matches `data-model.md` shapes and update if needed
- [ ] T012 Add basic layout/tokens used by Monster pages (tailwind/config or component styles)

Phase 3: User Story Phases (ordered by priority)

US1 — Add and reuse monsters in combat (Priority: P1)
Independent test: Add a monster to an encounter and verify participant list includes it

- [ ] T013 [US1] Write failing unit tests for the monster list UI (tests/unit/monsters/list-fail.test.tsx) — red phase for T014
- [ ] T014 [US1] Implement monster list UI in `src/app/monsters/page.tsx` using `MonsterCard` and `monsterService` to read mock data
- [ ] T015 [US1] Write failing unit tests for monster detail page rendering (tests/unit/monsters/detail-fail.test.tsx) — red phase for T016
- [ ] T016 [US1] Implement monster detail page `src/app/monsters/[id]/page.tsx` rendering `MonsterStatBlock` with required fields
- [ ] T017 [US1] Implement encounter integration stub `src/components/EncounterBuilder/MonsterPicker.tsx` and demo wiring to `src/app/monsters/page.tsx`
- [ ] T018 [US1] Add unit tests for list → detail navigation and encounter pick (tests/unit/monsters/list-detail.test.tsx)

US2 — Create and edit monsters (Priority: P2)
Independent test: Create a monster at `/monsters/new`, save (mock), and verify it appears in the list and detail page

- [ ] T019 [US2] Write failing integration tests for create → list → detail flow (tests/integration/monsters/create-edit-fail.test.tsx) — red phase for T020/T021
- [ ] T020 [US2] Implement monster creation form component `src/components/MonsterForm.tsx` (use `monsterSchema` for validation)
- [ ] T021 [US2] Implement monster creation page `src/app/monsters/new/page.tsx` using `MonsterForm` and `monsterService.create`
- [ ] T022 [US2] Implement monster edit page `src/app/monsters/[id]/edit/page.tsx` reusing `MonsterForm` and `monsterService.update`
- [ ] T023 [US2] Persist mock-created monsters in localStorage via `monsterAdapter` and add integration test `tests/integration/monsters/create-integration.test.tsx`
- [ ] T024 [US2] Add `scope` selector to `src/components/MonsterForm.tsx` (Global | Campaign | Public) and unit tests for scope behavior (tests/unit/monsters/form-scope.test.tsx)

US3 — Filter and search monsters (Priority: P3)
Independent test: Apply CR filter and search by name from `/monsters`

- [ ] T025 [US3] Write failing unit tests for filter & search behavior (tests/unit/monsters/filter-fail.test.tsx) — red phase for T026
- [ ] T026 [US3] Add filter and search UI components in `src/components/MonsterFilters.tsx` and wire to `src/app/monsters/page.tsx`
- [ ] T027 [US3] Implement filter & search logic in `monsterService` (or local hook) and unit tests in `tests/unit/monsters/filter.test.tsx`
- [ ] T028 [US3] Add E2E Playwright test scenario for search + filter in `tests/e2e/monsters/search-filter.spec.ts`

Final Phase: Polish & cross-cutting concerns

- [ ] T029 Accessibility: Run accessibility checks and fix issues for `src/app/monsters/*` pages. Checklist (record results in `specs/007-monster-management/tasks.md`):
  - keyboard navigation (tab order, focus states)
  - ARIA roles and labels for interactive controls
  - axe-playwright or axe-core audit results (no high/critical violations)
  - screen-reader spot check for detail and form pages
- [ ] T030 Documentation: Update `specs/007-monster-management/README.md` with run instructions (mock mode), test commands, and how to switch to the real API when available
- [ ] T031 Implement MonsterTemplate model & UI (`src/components/MonsterTemplateList.tsx`, `src/components/MonsterTemplateForm.tsx`) and tests (covers FR-006)
- [ ] T032 Implement mock public-transfer behavior and credited metadata display on detail page; add tests for public-readonly behavior (covers FR-010)
- [ ] T033 Add a Playwright perf smoke test for search/filter (`tests/e2e/monsters/search-filter.perf.spec.ts`) that records `search-latency-ms` (see `spec.md` benchmark)
- [ ] T034 Run Codacy / quality gate analysis on edited files and address issues (post-edit gating task)

Dependencies

- US1 depends on Phase 1 & Phase 2 tasks (T001–T012 must complete before T013–T018).
- US2 depends on Phase 1 & Phase 2 tasks (T001–T012 must complete before T019–T024).
- US3 depends on Phase 1 & Phase 2 tasks; can be worked in parallel with US2 after foundational tasks (T025–T028).

Parallel execution examples

- Frontend types (`T001`) and design skeleton (`T004`) can be implemented in parallel (`T002`, `T004` are [P]).
- Mock adapters (`T002`) and sample fixtures (`T005`, `T010`) can be worked on simultaneously by different engineers.
- Filters & search implementation (`T026`, `T027`) can be done in parallel with create/edit UI (`T020`, `T021`) once foundational mocks/service exist.

Implementation strategy (MVP first)

- MVP scope: Complete US1 (list + detail + encounter pick) in mock mode. Delivery order: T013 → T014 → T016 → T017 → T018.
- After MVP: Implement US2 (create/edit) then US3 (search/filters) iteratively.
- Keep TDD-first: failing tests tasks are required and placed before implementation tasks for each story.

Tasks count summary

- Total tasks: 34
- Tasks per story: US1:6 (T013–T018), US2:6 (T019–T024), US3:4 (T025–T028), Setup/Foundational/Final: 18

Validation note

All tasks follow the required checklist format: `- [ ] T### [P?] [US#] Description with file path`.

-- End of generated tasks --
