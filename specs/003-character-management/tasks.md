# Tasks: Character Management System (Feature 003)

**Input**: Design documents from `specs/003-character-management/`  
**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/characters-api.yaml ✅  
**Test Approach**: TDD-First (tests written before implementation)  
**Organization**: Tasks grouped by user story (P1, P2) for independent implementation  

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, independent)
- **[Story]**: User story label (US1, US2, US3, US4, US5, US6)
- **File paths**: Exact locations for implementation

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, database connection, system entity seeding

### Setup Tasks

- [x] T001 Initialize feature branch `feature/003-character-management` and update docs/Feature-Roadmap.md
- [x] T002 Create MongoDB/Mongoose Race model in `src/lib/db/models/CharacterRace.ts` with schema (9 races: Human, Elf, Dwarf, Halfling, Dragonborn, Gnome, Half-Elf, Half-Orc, Tiefling)
- [x] T003 [P] Create MongoDB/Mongoose Class model in `src/lib/db/models/CharacterClass.ts` with schema (12 classes: Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard)
- [x] T004 [P] Seed Race system entities (9 races with ability bonuses, traits, descriptions) in database initialization
- [x] T005 [P] Seed Class system entities (12 classes with hit dice, proficiencies, spellcasting info) in database initialization
- [x] T006 Create Character Zod validation schemas in `src/lib/validations/character.ts`: 1) name (required, 1-255 chars), 2) ability scores (each 1-20), 3) level (1-20 per class, total ≤ 20), 4) race (valid PHB race), 5) class (valid PHB class), 6) multiclass (max 3 classes per PHB, at least 1 class)
- [x] T007 Export all models from `src/lib/db/models/index.ts` for easy imports
- [x] T008 Create database index helpers in `src/lib/db/indexes.ts` for Character collection (userId+deletedAt, userId+name text, userId+createdAt, deletedAt)
- [x] T009 Add indexes to Character collection (via database initialization or migration)
- [x] T009.5 Document soft delete grace period (30 days) and cleanup job timeline: Add code comment and README note explaining soft delete behavior, grace period, and that hard-delete cleanup job is deferred to Feature 004

**Checkpoint**: Models, validation schemas, and system entities ready. Database seeding complete.

---

## Phase 2: Foundational (Blocking Prerequisites for All Stories)

**Purpose**: Core business logic and API infrastructure that enables all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Foundational Tests (Red Phase)

- [x] T010 [P] Write failing unit test for D&D 5e ability modifier calculation in `tests/unit/character-calculations.test.ts` (verify formula: mod = floor((score - 10) / 2); test range -4 to +4)
- [x] T011 [P] Write failing unit test for proficiency bonus calculation in `tests/unit/character-calculations.test.ts` (verify formula: ceil(totalLevel / 4) + 1; ranges 2-6 for levels 1-20)
- [x] T012 [P] Write failing unit test for derived stats in `tests/unit/character-calculations.test.ts` (AC = 10 + DEX modifier, initiative = DEX modifier, HP = class hit die + CON modifier per level)
- [x] T013 [P] Write failing unit test for multiclass level tracking in `tests/unit/character-model.test.ts` (total level = sum of class levels)
- [x] T014 [P] Write failing unit test for tier limit validation in `tests/unit/character-validation.test.ts` (Free=10, Seasoned=50, Expert=250)
- [x] T015 [P] Write failing contract test for POST /api/characters endpoint in `tests/contract/characters-api.test.ts`
- [x] T016 [P] Write failing contract test for GET /api/characters endpoint in `tests/contract/characters-api.test.ts`
- [x] T017 [P] Write failing contract test for GET /api/characters/:id endpoint in `tests/contract/characters-api.test.ts`
- [x] T018 [P] Write failing contract test for PUT /api/characters/:id endpoint in `tests/contract/characters-api.test.ts`
- [x] T019 [P] Write failing contract test for DELETE /api/characters/:id endpoint in `tests/contract/characters-api.test.ts`
- [x] T020 [P] Write failing contract test for POST /api/characters/:id/duplicate endpoint in `tests/contract/characters-api.test.ts`

### Foundational Implementation (Green Phase)

- [ ] T021 [P] Implement D&D 5e calculation utilities in `src/lib/services/dnd5e-calculations.ts` per D&D 5e SRD: ability modifiers, proficiency bonus, AC, initiative, HP, all 18 skills (with proficiency), and all 6 saving throws (with class proficiencies). Reference spec.md FR-004 and References section for formulas and class proficiencies.
- [ ] T022 [P] Create Character Mongoose model in `src/lib/db/models/Character.ts` with schema (userId, name, raceId, abilityScores, classes array, hitPoints, maxHitPoints, AC, initiative, cachedStats, timestamps, soft delete)
- [ ] T023 [P] Implement static methods on Character model: `calculateDerivedStats()`, `getDerivedStats()`, `fromUserQuery()` for non-deleted characters
- [ ] T024 [P] Create CharacterService in `src/lib/services/characterService.ts` with methods: checkTierLimit(), createCharacter(), getCharacter(), listCharacters(), updateCharacter(), deleteCharacter(), duplicateCharacter()
- [ ] T025 Implement tier limit checking in CharacterService (query User.subscription.tier, count active characters, compare to limits)
- [ ] T026 Implement Clerk authentication middleware in `src/app/api/characters/middleware.ts` (verify JWT, extract userId, attach to request context)
- [ ] T027 Create Character API route handlers in `src/app/api/characters/route.ts` (POST create, GET list with pagination/search/filters)
- [ ] T028 Create Character detail API route handlers in `src/app/api/characters/[id]/route.ts` (GET detail, PUT update, DELETE soft-delete)
- [ ] T029 Create Character duplicate API route handler in `src/app/api/characters/[id]/duplicate/route.ts` (POST duplicate with name transformation)
- [ ] T030 Implement error handling and response formatting for all API endpoints (400 validation errors, 401 auth, 403 tier limits, 404 not found, 500 server error)

### Foundational Refactor (Green → Refactor)

- [ ] T031 [P] Extract DRY validation logic: Create `src/lib/validations/character-validators.ts` with reusable validators (abilityScores, classes, name, etc.)
- [ ] T032 [P] Extract DRY error responses: Create `src/lib/api/character-responses.ts` with standardized response helpers
- [ ] T033 Verify all tests pass: `npm run test:ci` for unit/contract tests

**Checkpoint**: All foundational infrastructure ready. Tier limit enforcement, D&D 5e calculations, API routes, and Character model complete. User story implementation can now proceed in parallel.

---

## Phase 3: User Story 1 - Create a New Character (Priority: P1) 🎯 MVP

**Goal**: Users can create new characters with D&D 5e stats, multiclass support, validation, and tier limit enforcement

**Independent Test**: Create character via form → verify saves to database → verify appears in list with correct stats → verify tier limit warning/upgrade prompt at boundaries

### Tests for US1 (Red Phase - Write FIRST)

- [ ] T034 [US1] Write failing integration test for "Create valid single-class character" in `tests/integration/create-character.test.ts`
- [ ] T035 [US1] Write failing integration test for "Create valid multiclass character" in `tests/integration/create-character.test.ts`
- [ ] T036 [US1] Write failing integration test for "Reject invalid ability scores" in `tests/integration/create-character.test.ts`
- [ ] T037 [US1] Write failing integration test for "Reject character at tier limit" with upgrade prompt in `tests/integration/create-character.test.ts`
- [ ] T038 [US1] Write failing component test for CharacterForm in `tests/components/CharacterForm.test.tsx` (render, multiclass selection, submission)
- [ ] T039 [US1] Write failing E2E test for "Create character workflow" in `tests/e2e/create-character.spec.ts` (form → submit → verify in list)

### Implementation for US1 (Green Phase)

- [ ] T040 [P] [US1] Create Zod schema for CreateCharacterRequest in `src/lib/validations/character.ts`
- [ ] T041 [P] [US1] Create CharacterForm component in `src/components/characters/CharacterForm.tsx` (name, race select, class multi-select with levels, ability scores input, form validation)
- [ ] T042 [P] [US1] Create AbilityScoreInput component in `src/components/characters/AbilityScoreInput.tsx` (6 inputs for STR/DEX/CON/INT/WIS/CHA with 1-20 validation)
- [ ] T043 [P] [US1] Create ClassLevelSelector component in `src/components/characters/ClassLevelSelector.tsx` (multiclass level assignment with total level display)
- [ ] T044 [US1] Implement POST /api/characters endpoint handler (authenticate, validate via Zod, check tier limit, create character, return 201 + CharacterResponse) - already started in T027
- [ ] T045 [US1] Create character creation page in `src/app/dashboard/characters/page.tsx` with CharacterForm component
- [ ] T046 [US1] Add success toast notification on character creation (shadcn/ui toast)
- [ ] T047 [US1] Add tier limit warning message display (at 80% of limit) on character list page
- [ ] T048 [US1] Add tier limit upgrade prompt when user at limit (show upgrade CTA instead of form)

### Refactor for US1

- [ ] T049 [US1] Extract form field reusable component if used in multiple places
- [ ] T050 [US1] Verify test coverage ≥ 80% for character creation flow

**Checkpoint**: User Story 1 complete and independently testable. Users can create characters with validation and tier limit enforcement.

---

## Phase 4: User Story 2 - View and Search Characters (Priority: P1)

**Goal**: Users can view paginated character list with search by name and filtering by class/race/level

**Independent Test**: Create 5+ characters → view list → search for specific name → filter by class/race → verify pagination → verify all required fields displayed (name, race, class, level, AC)

### Tests for US2 (Red Phase)

- [ ] T051 [US2] Write failing integration test for "List characters with pagination" in `tests/integration/list-characters.test.ts`
- [ ] T052 [US2] Write failing integration test for "Search characters by name" in `tests/integration/list-characters.test.ts`
- [ ] T053 [US2] Write failing integration test for "Filter characters by class" in `tests/integration/list-characters.test.ts`
- [ ] T054 [US2] Write failing integration test for "Filter characters by race" in `tests/integration/list-characters.test.ts`
- [ ] T055 [US2] Write failing integration test for "Filter characters by level range (total character level)" in `tests/integration/list-characters.test.ts` - Verify that Fighter 5/Wizard 3 (total level 8) appears in filter for "level 6-10"
- [ ] T056 [US2] Write failing component test for CharacterList in `tests/components/CharacterList.test.tsx` (render list, pagination controls, search input, filter UI)
- [ ] T057 [US2] Write failing E2E test for "Search and filter workflow" in `tests/e2e/search-characters.spec.ts` (create characters → search → filter → verify results)

### Implementation for US2 (Green Phase)

- [ ] T058 [P] [US2] Create Zod schema for ListCharactersQuery in `src/lib/validations/character.ts` (page, pageSize, search, class, race, minLevel, maxLevel)
- [ ] T059 [P] [US2] Create CharacterCard component in `src/components/characters/CharacterCard.tsx` (displays name, race, class, level, AC, HP; click to view detail)
- [ ] T060 [P] [US2] Create CharacterList component in `src/components/characters/CharacterList.tsx` (grid/list of CharacterCards, pagination controls, sort options)
- [ ] T061 [P] [US2] Create SearchBar component for characters in `src/components/characters/CharacterSearchBar.tsx` (search input, class/race/level filter dropdowns)
- [ ] T062 [US2] Implement GET /api/characters endpoint handler with pagination (page, pageSize), search (MongoDB text search by name), filters (class, race, minLevel, maxLevel), sorting - already started in T027
- [ ] T063 [US2] Create character list page in `src/app/dashboard/characters/page.tsx` with CharacterList, SearchBar, and create button
- [ ] T064 [US2] Implement MongoDB text index query for name search in CharacterService.listCharacters()
- [ ] T065 [US2] Add "No characters" empty state when list is empty
- [ ] T066 [US2] Add pagination info display ("Showing X-Y of Z characters")

### Refactor for US2

- [ ] T067 [US2] Extract filter query builder to `src/lib/services/character-query-builder.ts` for reusability
- [ ] T068 [US2] Verify test coverage ≥ 80% for character list/search/filter

**Checkpoint**: User Story 2 complete. Users can view, search, and filter characters. All required fields displayed.

---

## Phase 5: User Story 3 - Update Character Details (Priority: P1)

**Goal**: Users can edit character attributes (name, race, class, levels, ability scores) with validation and derived stats recalculation

**Independent Test**: Create character → edit level 1→5 → verify total level updates → verify in list shows new stats → verify edit timestamp updates

### Tests for US3 (Red Phase)

- [ ] T069 [US3] Write failing integration test for "Update single attribute" in `tests/integration/update-character.test.ts`
- [ ] T070 [US3] Write failing integration test for "Update multiclass levels" with total level recalculation in `tests/integration/update-character.test.ts`
- [ ] T071 [US3] Write failing integration test for "Reject invalid level 0" in `tests/integration/update-character.test.ts`
- [ ] T072 [US3] Write failing integration test for "Recalculate derived stats on update" in `tests/integration/update-character.test.ts`
- [ ] T073 [US3] Write failing component test for CharacterEditForm in `tests/components/CharacterEditForm.test.tsx`
- [ ] T074 [US3] Write failing E2E test for "Update character workflow" in `tests/e2e/update-character.spec.ts`

### Implementation for US3 (Green Phase)

- [ ] T075 [P] [US3] Create Zod schema for UpdateCharacterRequest in `src/lib/validations/character.ts`
- [ ] T076 [P] [US3] Create CharacterEditForm component in `src/components/characters/CharacterEditForm.tsx` (pre-populate with existing data, allow editing name/race/classes/ability scores)
- [ ] T077 [US3] Implement GET /api/characters/:id endpoint handler (fetch character, return full stat block) - already started in T028
- [ ] T078 [US3] Implement PUT /api/characters/:id endpoint handler (authenticate ownership, validate, update character, recalculate derived stats, return updated character) - already started in T028
- [ ] T079 [US3] Implement CharacterService.updateCharacter() (validate inputs, update fields, recalculate cachedStats, update timestamp)
- [ ] T080 [US3] Create character detail page in `src/app/dashboard/characters/[id]/page.tsx` with CharacterEditForm and stat block display
- [ ] T081 [US3] Add success notification on character update
- [ ] T082 [US3] Display edit history timestamp (updatedAt) on detail page

### Refactor for US3

- [ ] T083 [US3] Extract stat recalculation logic if duplicated (should use existing dnd5e-calculations utilities)
- [ ] T084 [US3] Verify test coverage ≥ 80% for character update

**Checkpoint**: User Story 3 complete. Users can update characters with validation and automatic derived stat recalculation.

---

## Phase 6: User Story 4 - Delete Characters (Priority: P1)

**Goal**: Users can soft-delete characters (30-day grace period) and see confirmation of impact

**Independent Test**: Create character → delete → verify not in list → verify soft delete marker in database → verify can still query within 30 days if needed

### Tests for US4 (Red Phase)

- [ ] T085 [US4] Write failing integration test for "Soft delete character" in `tests/integration/delete-character.test.ts`
- [ ] T086 [US4] Write failing integration test for "Character not in list after soft delete" in `tests/integration/delete-character.test.ts`
- [ ] T087 [US4] Write failing integration test for "Delete confirmation warns of orphaned relationships" in `tests/integration/delete-character.test.ts`
- [ ] T088 [US4] Write failing component test for delete confirmation dialog in `tests/components/DeleteCharacterDialog.test.tsx`
- [ ] T089 [US4] Write failing E2E test for "Delete character workflow" in `tests/e2e/delete-character.spec.ts`

### Implementation for US4 (Green Phase)

- [ ] T090 [P] [US4] Create DeleteCharacterDialog component in `src/components/characters/DeleteCharacterDialog.tsx` (confirmation, warning about orphaned relationships)
- [ ] T091 [US4] Implement DELETE /api/characters/:id endpoint handler (soft delete by setting deletedAt, update tier usage, return success) - already started in T028
- [ ] T092 [US4] Implement CharacterService.deleteCharacter() (set deletedAt timestamp, don't actually delete from DB)
- [ ] T093 [US4] Update CharacterService.listCharacters() to exclude soft-deleted (WHERE deletedAt IS NULL)
- [ ] T094 [US4] Add delete button to character detail page and character card
- [ ] T095 [US4] Add delete success notification (character removed)
- [ ] T096 [US4] Update tier usage display after deletion (show recalculated usage)

### Refactor for US4

- [ ] T097 [US4] Verify soft delete filter is applied consistently in all queries
- [ ] T098 [US4] Verify test coverage ≥ 80% for character deletion

**Checkpoint**: User Story 4 complete. Users can delete characters with soft-delete. All queries exclude deleted characters.

---

## Phase 7: User Story 5 - Duplicate Characters as Templates (Priority: P2)

**Goal**: Users can duplicate existing characters to quickly create similar characters (e.g., multiple goblin warriors)

**Independent Test**: Create character → duplicate → verify new character has same stats but different ID and name "Copy of [Original]" → edit duplicate independently → verify original unchanged

### Tests for US5 (Red Phase)

- [ ] T099 [US5] Write failing integration test for "Duplicate single-class character" in `tests/integration/duplicate-character.test.ts`
- [ ] T100 [US5] Write failing integration test for "Duplicate multiclass character" in `tests/integration/duplicate-character.test.ts`
- [ ] T101 [US5] Write failing integration test for "Duplicated character is independent copy" in `tests/integration/duplicate-character.test.ts`
- [ ] T102 [US5] Write failing integration test for "Duplicate respects tier limit" in `tests/integration/duplicate-character.test.ts`
- [ ] T103 [US5] Write failing E2E test for "Duplicate workflow" in `tests/e2e/duplicate-character.spec.ts`

### Implementation for US5 (Green Phase)

- [ ] T104 [US5] Implement POST /api/characters/:id/duplicate endpoint handler (fetch source character, check tier limit, create copy with name "Copy of [Original]", return new character)
- [ ] T105 [US5] Implement CharacterService.duplicateCharacter() (deep copy all attributes, generate new ID, transform name, calculate new derived stats)
- [ ] T106 [US5] Add duplicate button to character detail page and character card
- [ ] T107 [US5] Add duplicate success notification (show new character name and allow quick navigation to edit)

### Refactor for US5

- [ ] T108 [US5] Verify duplication creates true independent copy (no shared references in multiclass arrays, ability scores, etc.)
- [ ] T109 [US5] Verify test coverage ≥ 80% for character duplication

**Checkpoint**: User Story 5 complete. Users can duplicate characters as templates.

---

## Phase 8: User Story 6 - D&D 5e Stat Block Display (Priority: P2)

**Goal**: Users can view complete D&D 5e stat block with all derived values (modifiers, saves, skills, AC, initiative, HP)

**Independent Test**: Create character with known ability scores → view detail page → verify all derived values match D&D 5e formulas → verify skills show with proficiency bonuses

### Tests for US6 (Red Phase)

- [ ] T110 [US6] Write failing component test for StatBlock component in `tests/components/StatBlock.test.tsx` (render all derived values, verify calculations)
- [ ] T111 [US6] Write failing E2E test for "View stat block" in `tests/e2e/stat-block.spec.ts`

### Implementation for US6 (Green Phase)

- [ ] T112 [P] [US6] Create StatBlock component in `src/components/characters/StatBlock.tsx` (displays ability scores, modifiers, saving throws, skills, proficiency bonus, AC, initiative, HP)
- [ ] T113 [P] [US6] Create SkillsList component in `src/components/characters/SkillsList.tsx` (all 18 D&D 5e skills from spec.md with ability associations, proficiency indicators, calculated bonuses). Reference FR-004 for complete skills list.
- [ ] T114 [P] [US6] Create AbilityScoresDisplay component in `src/components/characters/AbilityScoresDisplay.tsx` (shows 6 ability scores and calculated modifiers)
- [ ] T115 [US6] Add StatBlock to character detail page layout
- [ ] T116 [US6] Ensure CharacterResponse API includes all cachedStats fields (ability modifiers, proficiency bonus, skills, saving throws)
- [ ] T117 [US6] Format stat block for printing/export (optional: add print styles or export button)

### Refactor for US6

- [ ] T118 [US6] Extract stat formatting utilities to `src/lib/utils/stat-formatting.ts` (format modifiers with +/- sign, format skill names, etc.)
- [ ] T119 [US6] Verify test coverage ≥ 80% for stat block display

**Checkpoint**: User Story 6 complete. Users can view full D&D 5e stat blocks with all derived values.

---

## Phase 9: Cross-Cutting Concerns & Polish

**Purpose**: Final quality checks, cleanup, optimization, and edge case handling

### Final Tests

- [ ] T120 [P] Write E2E test for "Complete user workflow: Create → Search → Edit → Duplicate → Delete" in `tests/e2e/complete-workflow.spec.ts`
- [ ] T121 [P] Write performance test for character list load with 100+ characters in `tests/performance/list-characters.test.ts` (target < 1s)
- [ ] T122 [P] Write performance test for search across 200+ characters in `tests/performance/search-characters.test.ts` (target < 500ms)

### Quality & Cleanup

- [ ] T123 [P] Run full test suite: `npm run test:ci` - ensure 80%+ coverage across all modified files
- [ ] T124 [P] Run TypeScript check: `npm run type-check` - verify strict mode compliance, no `any` types
- [ ] T125 [P] Run ESLint: `npm run lint` - fix all warnings and errors
- [ ] T126 [P] Run Markdownlint: `npm run lint:markdown:fix` - fix documentation formatting
- [ ] T127 Run code review checklist:
  - [ ] All files ≤ 450 lines
  - [ ] All functions ≤ 50 lines
  - [ ] No `any` types without justification
  - [ ] DRY: no code duplication (extract utilities)
  - [ ] Clear variable/function naming
  - [ ] JSDoc comments on exports

### Documentation & Commits

- [ ] T128 [P] Update `.env.example` with any new environment variables (if added)
- [ ] T129 [P] Add JSDoc comments to exported functions in all new files
- [ ] T130 Update main README.md or feature documentation with character management overview (optional)
- [ ] T131 Squash commits into logical units following conventional commits:
  - `feat(characters): add character creation with validation`
  - `feat(characters): add character list with search/filter`
  - `feat(characters): add character update/delete`
  - etc.

### Deployment & Monitoring

- [ ] T132 [P] Verify build completes: `npm run build` - no errors or warnings
- [ ] T133 [P] Verify all tests pass in CI environment: GitHub Actions / CI runner
- [ ] T134 [P] Create PR with detailed description linking to spec and plan

### Optional Optimizations

- [ ] T135 [P] Add character search response caching (optional, if performance needs it)
- [ ] T136 [P] Add database query optimization: verify indexes are hit (use MongoDB explain plan)
- [ ] T137 [P] Add UI performance optimizations: React.memo, useMemo for derived stats

**Checkpoint**: All stories complete. Tests passing. Code quality gates met. Ready for PR and code review.

---

## Dependencies & Execution Order

### Critical Path (Must Complete Sequentially)

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phases 3-8 (User Stories, can run in parallel)
```

### Detailed Dependency Graph

```
T001-T009 (Setup, Seeding)
    ↓
T010-T033 (Foundational: tests + implementation)
    ↓
T034-T050 (US1: Create) ─────────┐
T051-T068 (US2: List/Search)    ├─→ Can run in parallel
T069-T084 (US3: Update)         │
T085-T098 (US4: Delete)         │
T099-T109 (US5: Duplicate)      │
T110-T119 (US6: Stat Block)     ┘
    ↓
T120-T134 (Polish & Quality)
```

### Parallel Opportunities

**During Phase 1** (Setup):

- T002-T005: Create Race/Class models and seeding tasks
- T006-T009: Create Character model and validation schemas

**During Phase 2** (Foundational):

- T010-T020: All failing tests can be written in parallel
- T021-T029: Model, service, and API implementation can be done in parallel (once tests define interfaces)

**During Phases 3-8** (User Stories):

- Each user story can be implemented in parallel by different developers
- US1 (Create) → US2 (List) → US3 (Update) → US4 (Delete) are independent
- US5 (Duplicate) and US6 (Stat Block) can start once foundational is complete

**During Phase 9** (Polish):

- All quality checks and tests can run in parallel

---

## Implementation Strategy & MVP Scope

### MVP Definition (Minimum Viable Product)

**Scope**: User Stories 1-4 (P1 priority)

- Create characters with validation
- View, search, and filter characters
- Update characters with derived stat recalculation
- Delete characters with soft delete

**Timeline**: 4-5 days for MVP (Phases 1-6)

**Not in MVP** (Phase 2 deliverable):

- User Story 5 (Duplicate) - can be added incrementally
- User Story 6 (Stat Block) - can be added incrementally
- Performance optimizations - add if needed

### Full Feature Timeline

**Timeline**: 6-7 days for complete feature (all phases)

**Delivery Schedule**:

- Day 1-2: Phase 1 + Phase 2 (Setup + Foundational)
- Day 3: Phase 3 (Create - US1)
- Day 3-4: Phase 4 + Phase 5 (List + Update - US2 + US3)
- Day 4-5: Phase 6 (Delete - US4)
- Day 5-6: Phases 7-8 (Duplicate + Stat Block - US5 + US6)
- Day 6-7: Phase 9 (Quality + Polish)

---

## Test Summary

### Test Coverage by Type

| Test Type | Files | Count | Target |
|-----------|-------|-------|--------|
| Unit Tests | `tests/unit/` | 14 | 80%+ coverage |
| Contract Tests | `tests/contract/` | 6 | All endpoints |
| Integration Tests | `tests/integration/` | 18+ | All workflows |
| Component Tests | `tests/components/` | 9+ | All UI components |
| E2E Tests | `tests/e2e/` | 7+ | Main user journeys |
| **Total** | | **54+** | **80%+ overall** |

### TDD Workflow (for each task)

1. **Red**: Write failing test (e.g., T034 tests character creation)
2. **Green**: Implement minimal code to pass test (e.g., T044 implements POST endpoint)
3. **Refactor**: Improve code while tests still pass (e.g., T049 extracts reusable components)

### Running Tests

```bash
# All tests
npm run test:ci

# Specific test file
npm run test -- tests/unit/character-calculations.test.ts

# With coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# Watch mode (development)
npm run test -- --watch
```

---

## Success Criteria Checklist

Before submitting PR:

- [ ] All 54+ tasks completed ✓
- [ ] All tests passing: `npm run test:ci` ✓
- [ ] TypeScript strict mode: `npm run type-check` ✓
- [ ] ESLint passes: `npm run lint` ✓
- [ ] Markdownlint passes: `npm run lint:markdown` ✓
- [ ] Build succeeds: `npm run build` ✓
- [ ] 80%+ test coverage on all modified files ✓
- [ ] No `any` types in code ✓
- [ ] All files ≤ 450 lines ✓
- [ ] All functions ≤ 50 lines ✓
- [ ] No console.log or debug code in production ✓
- [ ] JSDoc comments on all exports ✓
- [ ] Feature branch updated to latest main ✓
- [ ] PR description complete with references ✓

---

## Notes & Considerations

### D&D 5e Calculations

All D&D 5e formulas are documented in `data-model.md` and must be implemented exactly per D&D 5e SRD:

- Ability Modifier: `floor((score - 10) / 2)`
- Proficiency Bonus: `ceil(totalLevel / 4) + 1`
- AC: `10 + DEX modifier`
- Initiative: `DEX modifier`
- Saving Throws: `ability modifier + [proficiency bonus if proficient]`
- Skills: `ability modifier + [proficiency bonus if proficient]`

### Multiclass Complexity

Multiclass characters require:

- Independent class level tracking (array of {classId, level})
- Total level calculation (sum of all levels)
- Proficiency bonus based on total level (not per-class)
- Hit points cumulative (each level adds: hit die + CON modifier)

### Tier Limit Enforcement

Character creation must:

1. Query `User.subscription.tier` to get limit (Free=10, Seasoned=50, Expert=250)
2. Count characters where `userId = current user` AND `deletedAt IS NULL`
3. Reject creation with 403 + upgrade prompt if count >= limit
4. Show warning if count >= 80% of limit

### Performance Targets

Tests must verify:

- Character list (50 items) loads in < 1 second
- Search across 200+ characters returns in < 500ms
- Create new character completes in < 2 seconds

### Soft Delete (30-Day Grace Period)

- Set `deletedAt` timestamp on delete (don't remove from DB)
- All queries filter `WHERE deletedAt IS NULL`
- Hard-delete cleanup job scheduled for future phase (after Feature 003)

---

**Task Generation Status**: ✅ COMPLETE  
**Total Tasks**: 134  
**MVP Tasks (US1-4)**: 72  
**Optional/Enhanced (US5-6)**: 20  
**Quality/Polish**: 42  
**Estimated Duration**: 6-7 working days (MVP: 4-5 days)

