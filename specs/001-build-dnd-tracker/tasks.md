# Tasks: MVP D&D Encounter Tracker

**Input**: Design documents from `/home/doug/dev/dnd-tracker/specs/001-read-the-prd/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → ✅ COMPLETE: Tech stack and structure extracted
2. Load design documents:
   → ✅ data-model.md: 8 core entities identified
   → ✅ contracts/: 3 API contract files (auth, characters, combat)
   → ✅ research.md: Technology decisions documented
   → ✅ quickstart.md: 6 integration test scenarios defined
3. Generate tasks by category with weekly milestones
4. Apply task rules: TDD approach, parallel execution for independent files
5. Include milestone confirmation tasks for each weekly deliverable
6. Add comprehensive integration tests for major behavior validation
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

**Web application structure** (Next.js full-stack):

```
src/
├── app/                 # Next.js App Router
├── components/          # React components
├── lib/                # Utilities and configurations
├── hooks/              # Custom React hooks
├── types/              # TypeScript definitions
└── constants/          # Application constants

tests/
├── e2e/                # Playwright E2E tests
├── integration/        # API integration tests
└── unit/              # Jest unit tests
```

---

# WEEK 1-2: FOUNDATION & AUTHENTICATION

## Phase 3.1: Project Setup

- [ ] T001 Create Next.js 15+ project structure in src/ with TypeScript strict mode configuration
- [ ] T002 Initialize package.json with dependencies: Next.js 15.5+, React 19.0+, TypeScript 5.9+, Tailwind CSS 4.0+
- [ ] T003 [P] Configure ESLint 9.0+ and Prettier 3.3+ with Next.js recommended configs in .eslintrc.js
- [ ] T004 [P] Setup Tailwind CSS 4.0+ configuration with custom theme in tailwind.config.js
- [ ] T005 [P] Configure Jest 29.7+ and React Testing Library 16.0+ in jest.config.js

## Phase 3.2: Authentication Foundation (TDD)

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T006 [P] Contract test POST /api/auth/session in tests/integration/test_auth_session.test.ts
  ↳ API Contract: contracts/auth-api.yaml:/api/auth/session (lines 8-45)
  ↳ Schema: contracts/auth-api.yaml:components.schemas.User (lines 114-172)
- [ ] T007 [P] Contract test GET /api/users/profile in tests/integration/test_users_profile.test.ts
  ↳ API Contract: contracts/auth-api.yaml:/api/users/profile GET (lines 47-61)
  ↳ Response Schema: contracts/auth-api.yaml:components.schemas.User
- [ ] T008 [P] Contract test PUT /api/users/profile in tests/integration/test_users_profile_update.test.ts
  ↳ API Contract: contracts/auth-api.yaml:/api/users/profile PUT (lines 63-110)
  ↳ Request validation: profile.dndRuleset, experienceLevel, role enums
- [ ] T009 [P] Integration test user registration flow in tests/e2e/test_user_onboarding.spec.ts
  ↳ Test Scenario: quickstart.md:Scenario 1 (lines 5-33)
  ↳ Expected Results: Free Adventurer tier, usage metrics 0/1/0/3/0/10
- [ ] T010 [P] Integration test profile management in tests/e2e/test_profile_management.spec.ts
  ↳ Test Scenario: quickstart.md:Scenario 1 profile setup (lines 14-18)
  ↳ Data Model: data-model.md:User Entity.profile (lines 13-17)

## Phase 3.3: Core Authentication Implementation

**DEPENDENCIES: Complete all Phase 3.2 tests before starting implementation**

- [ ] T011 [P] Install and configure Clerk 5.0+ in src/lib/auth/clerk-config.ts
  ↳ Reference: plan.md:Technical Research - Clerk integration (lines 154-157)
- [ ] T012 [P] Create User Mongoose schema with validation in src/lib/db/models/User.ts
  ↳ Data Model: data-model.md:User Entity (lines 5-43)
  ↳ Validation Rules: data-model.md:User validation (lines 39-42)
  ↳ Required Fields: id, email, profile, subscription, usage, preferences
- [ ] T013 [P] Setup MongoDB connection with Atlas in src/lib/db/connection.ts
  ↳ Reference: plan.md:Database Design decisions (lines 159-162)
- [ ] T014 Implement POST /api/auth/session endpoint in src/app/api/auth/session/route.ts
  ↳ API Contract: contracts/auth-api.yaml:/api/auth/session POST (lines 8-45)
  ↳ Dependencies: T012 (User schema), T013 (DB connection)
- [ ] T015 Implement GET /api/users/profile endpoint in src/app/api/users/profile/route.ts
  ↳ API Contract: contracts/auth-api.yaml:/api/users/profile GET (lines 47-61)
  ↳ Dependencies: T012 (User schema), T017 (auth middleware)
- [ ] T016 Implement PUT /api/users/profile endpoint in src/app/api/users/profile/route.ts
  ↳ API Contract: contracts/auth-api.yaml:/api/users/profile PUT (lines 63-110)
  ↳ Dependencies: T012 (User schema), T018 (validation schemas)
- [ ] T017 [P] Create authentication middleware with session validation in src/lib/auth/middleware.ts
  ↳ Security: Clerk session token validation, user context injection
- [ ] T018 [P] Setup Zod validation schemas for auth requests in src/lib/validations/auth.ts
  ↳ Validation: Match contracts/auth-api.yaml schema constraints
  ↳ Enums: dndRuleset, experienceLevel, role, theme, tier, status

## Phase 3.4: UI Foundation

- [ ] T019 [P] Install and configure shadcn/ui v3.2+ components in src/components/ui/
- [ ] T020 [P] Create authentication layout component in src/app/(auth)/layout.tsx
- [ ] T021 [P] Create dashboard layout with navigation in src/app/dashboard/layout.tsx
- [ ] T022 [P] Implement landing page with hero section in src/app/page.tsx
- [ ] T023 [P] Create user profile form component in src/components/forms/UserProfileForm.tsx

## MILESTONE 1 CONFIRMATION

- [ ] T024 **MILESTONE 1: Foundation Complete** - Run comprehensive validation in tests/milestones/test_milestone_1_foundation.spec.ts
  ↳ Validate Against: plan.md:Technical Context stack (lines 39-47)
  ↳ User Story: quickstart.md:Scenario 1 registration flow (lines 5-33)
  ↳ **Required Completions:**
  - ✅ Next.js project builds without errors (T001-T005)
  - ✅ Clerk authentication flow completes successfully (T011, T014-T016)
  - ✅ MongoDB connection established and User schema functional (T012-T013)
  - ✅ shadcn/ui components render correctly with theming (T019-T023)
  - ✅ Basic routing structure working (auth + dashboard)
  ↳ **Success Criteria:**
  - All contracts/auth-api.yaml endpoints return 200/201 responses
  - User creation follows data-model.md:User Entity exactly
  - Free tier limits display correctly (1 party, 3 encounters, 10 creatures)

---

# WEEK 3-4: CORE FEATURES

## Phase 3.5: Character Management (TDD)

**CRITICAL: Tests before implementation**
**DEPENDENCIES: User authentication system (T006-T018) must be complete**

- [ ] T025 [P] Contract test POST /api/characters in tests/integration/test_characters_create.test.ts
  ↳ API Contract: contracts/characters-api.yaml:/api/characters POST (lines 46-69)
  ↳ Schema: contracts/characters-api.yaml:components.schemas.CreateCharacter (lines 213-283)
  ↳ Tier Limit Testing: 403 response when creature limit exceeded
- [ ] T026 [P] Contract test GET /api/characters in tests/integration/test_characters_list.test.ts
  ↳ API Contract: contracts/characters-api.yaml:/api/characters GET (lines 8-44)
  ↳ Pagination: contracts/characters-api.yaml:components.schemas.Pagination (lines 345-357)
  ↳ Template Filtering: isTemplate query parameter
- [ ] T027 [P] Contract test PUT /api/characters/{id} in tests/integration/test_characters_update.test.ts
  ↳ API Contract: contracts/characters-api.yaml:/api/characters/{id} PUT (lines 95-124)
  ↳ Schema: contracts/characters-api.yaml:components.schemas.UpdateCharacter (lines 285-343)
- [ ] T028 [P] Contract test DELETE /api/characters/{id} in tests/integration/test_characters_delete.test.ts
  ↳ API Contract: contracts/characters-api.yaml:/api/characters/{id} DELETE (lines 126-143)
  ↳ Cascade Behavior: Remove from parties/encounters
- [ ] T029 [P] Integration test character CRUD flow in tests/e2e/test_character_management.spec.ts
  ↳ Test Scenario: quickstart.md:Scenario 2 (lines 34-67)
  ↳ Validation Testing: AC=0 error, HP current > max auto-adjust

## Phase 3.6: Character Implementation

**DEPENDENCIES: All Phase 3.5 tests must pass before implementation**

- [ ] T030 [P] Create Character Mongoose schema with D&D stats validation in src/lib/db/models/Character.ts
  ↳ Data Model: data-model.md:Character Entity (lines 44-83)
  ↳ Validation Rules: data-model.md:Character validation (lines 79-82)
  ↳ Relationships: userId reference to User, many-to-many with Party
  ↳ Required: name, race, classes[], stats{AC, HP, dex, initMod}
- [ ] T031 [P] Create Zod validation schemas for character data in src/lib/validations/character.ts
  ↳ API Schemas: contracts/characters-api.yaml CreateCharacter + UpdateCharacter
  ↳ Validation: HP current ≤ max, AC > 0, level 1-20, dex 1-30
- [ ] T032 Implement POST /api/characters endpoint with tier limit enforcement in src/app/api/characters/route.ts
  ↳ API Contract: contracts/characters-api.yaml:/api/characters POST
  ↳ Dependencies: T030 (schema), T031 (validation), User.usage.creaturesCount
  ↳ Tier Limits: Free tier max 10 creatures total
- [ ] T033 Implement GET /api/characters endpoint with pagination in src/app/api/characters/route.ts
  ↳ API Contract: contracts/characters-api.yaml:/api/characters GET
  ↳ Features: pagination, isTemplate filtering, user ownership
- [ ] T034 Implement PUT /api/characters/[id] endpoint in src/app/api/characters/[id]/route.ts
  ↳ API Contract: contracts/characters-api.yaml:/api/characters/{id} PUT
  ↳ Security: Verify user ownership or sharing.allowedUsers access
- [ ] T035 Implement DELETE /api/characters/[id] endpoint in src/app/api/characters/[id]/route.ts
  ↳ API Contract: contracts/characters-api.yaml:/api/characters/{id} DELETE
  ↳ Cascade: Remove from Party.members, Encounter.participants
- [ ] T036 [P] Create character service for business logic in src/lib/services/characterService.ts
  ↳ Functions: validateStats, enforceTierLimits, handleSharing, updateUsageCount
- [ ] T037 [P] Create character form component with React Hook Form in src/components/forms/CharacterForm.tsx
  ↳ UI: shadcn/ui components, real-time validation, class level management

## Phase 3.7: Party Management (TDD)

**CRITICAL: Tests before implementation**

- [ ] T038 [P] Contract test POST /api/parties in tests/integration/test_parties_create.test.ts
- [ ] T039 [P] Contract test GET /api/parties in tests/integration/test_parties_list.test.ts
- [ ] T040 [P] Integration test party creation with character assignment in tests/e2e/test_party_management.spec.ts

## Phase 3.8: Party Implementation

- [ ] T041 [P] Create Party Mongoose schema with member relationships in src/lib/db/models/Party.ts
- [ ] T042 [P] Create Monster Mongoose schema with stat blocks in src/lib/db/models/Monster.ts
- [ ] T043 Implement POST /api/parties endpoint in src/app/api/parties/route.ts
- [ ] T044 Implement GET /api/parties endpoint in src/app/api/parties/route.ts
- [ ] T045 [P] Create party service with member management in src/lib/services/partyService.ts
- [ ] T046 [P] Create party form component in src/components/forms/PartyForm.tsx

## Phase 3.9: Encounter Setup (TDD)

- [ ] T047 [P] Contract test POST /api/encounters in tests/integration/test_encounters_create.test.ts
- [ ] T048 [P] Integration test encounter builder with participants in tests/e2e/test_encounter_builder.spec.ts

## Phase 3.10: Encounter Implementation

- [ ] T049 [P] Create Encounter Mongoose schema in src/lib/db/models/Encounter.ts
- [ ] T050 Implement POST /api/encounters endpoint in src/app/api/encounters/route.ts
- [ ] T051 [P] Create encounter service with participant management in src/lib/services/encounterService.ts
- [ ] T052 [P] Create encounter builder component in src/components/encounters/EncounterBuilder.tsx

## MILESTONE 2 CONFIRMATION

- [ ] T053 **MILESTONE 2: Core Features Complete** - Run comprehensive validation in tests/milestones/test_milestone_2_core.spec.ts
  ↳ Validate Against: quickstart.md:Scenario 2 + 3 (lines 34-103)
  ↳ Data Models: data-model.md Character, Party, Monster, Encounter entities
  ↳ **Required Completions:**
  - ✅ Character CRUD operations work with validation (T025-T037)
  - ✅ Party creation with character assignment functional (T038-T046)
  - ✅ Monster/NPC creation with stat blocks working (T042)
  - ✅ Encounter builder with participant selection operational (T047-T052)
  - ✅ All tier limits enforced correctly
  ↳ **Success Criteria:**
  - All contracts/characters-api.yaml endpoints functional
  - Character validation per quickstart.md AC=0 error test
  - Party "The Crimson Blades" creation succeeds
  - Monster stat blocks follow data-model.md:Monster Entity
  - Encounter setup with 6 participants max (Free tier)

---

# WEEK 5-6: COMBAT ENGINE

## Phase 3.11: Combat Session Management (TDD)

**CRITICAL: Tests before implementation**
**DEPENDENCIES: Encounter and Character systems (T025-T052) must be complete**

- [ ] T054 [P] Contract test POST /api/combat/start in tests/integration/test_combat_start.test.ts
  ↳ API Contract: contracts/combat-api.yaml:/api/combat/start POST (lines 8-47)
  ↳ Required: encounterId, optional initiativeRolls array
  ↳ Response: CombatSession schema with initiative order
- [ ] T055 [P] Contract test GET /api/combat/{sessionId} in tests/integration/test_combat_session.test.ts
  ↳ API Contract: contracts/combat-api.yaml:/api/combat/{sessionId} GET (lines 48-68)
  ↳ Response: Full combat session state with participants
- [ ] T056 [P] Contract test PUT /api/combat/{sessionId}/initiative in tests/integration/test_combat_initiative.test.ts
  ↳ API Contract: contracts/combat-api.yaml:/api/combat/{sessionId}/initiative PUT (lines 87-100)
  ↳ Features: Manual overrides, tie-breaking with dexterity
- [ ] T057 [P] Contract test POST /api/combat/{sessionId}/turn in tests/integration/test_combat_turns.test.ts
  ↳ Turn Advancement: Round progression, current turn tracking
- [ ] T058 [P] Integration test complete combat flow in tests/e2e/test_combat_flow.spec.ts
  ↳ Test Scenario: quickstart.md:Scenario 3 + 4 (lines 69-142)
  ↳ Initiative Order: Goblin 2(20), Thorin(16), Character 2(15), etc.

## Phase 3.12: Combat Core Implementation

**DEPENDENCIES: All Phase 3.11 tests must pass before implementation**

- [ ] T059 [P] Create CombatSession Mongoose schema with state management in src/lib/db/models/CombatSession.ts
  ↳ Data Model: data-model.md:CombatSession Entity (lines 208-277)
  ↳ State Fields: status, initiative[], currentTurn, participants[], lairActions, history[]
  ↳ State Transitions: preparing → active → paused/completed (lines 273-277)
- [ ] T060 [P] Create StatusEffect Mongoose schema with duration tracking in src/lib/db/models/StatusEffect.ts
  ↳ Data Model: data-model.md:StatusEffect Entity (lines 279-320)
  ↳ Duration Types: rounds, minutes, hours, until_save, concentration, permanent
  ↳ Effect Types: modifiers[], restrictions[], source tracking
- [ ] T061 Implement POST /api/combat/start endpoint in src/app/api/combat/start/route.ts
  ↳ API Contract: contracts/combat-api.yaml:/api/combat/start POST
  ↳ Dependencies: T059 (CombatSession), T049 (Encounter), T030 (Character)
  ↳ Logic: Create session, calculate initiative, sort participants
- [ ] T062 Implement GET /api/combat/[sessionId] endpoint in src/app/api/combat/[sessionId]/route.ts
  ↳ API Contract: contracts/combat-api.yaml:/api/combat/{sessionId} GET
  ↳ Returns: Complete session state for UI rendering
- [ ] T063 Implement PUT /api/combat/[sessionId]/initiative in src/app/api/combat/[sessionId]/initiative/route.ts
  ↳ API Contract: contracts/combat-api.yaml:/api/combat/{sessionId}/initiative PUT
  ↳ Features: Manual overrides, re-sorting, tie-breaking with dexterity
- [ ] T064 [P] Create initiative calculation service with tie-breaking in src/lib/services/initiativeService.ts
  ↳ Algorithm: d20 + modifier, dexterity tie-breaking, manual overrides
  ↳ Reference: quickstart.md initiative calculation examples (lines 86-94)
- [ ] T065 [P] Create combat state management with Zustand in src/lib/stores/combatStore.ts
  ↳ State: Current session, optimistic updates, real-time sync

## Phase 3.13: HP and Status Effects (TDD)

- [ ] T066 [P] Contract test PUT /api/combat/{sessionId}/hp in tests/integration/test_combat_hp.test.ts
- [ ] T067 [P] Contract test POST /api/combat/{sessionId}/status-effects in tests/integration/test_status_effects.test.ts
- [ ] T068 [P] Integration test HP modification with undo in tests/e2e/test_hp_management.spec.ts

## Phase 3.14: HP and Status Implementation

- [ ] T069 Implement PUT /api/combat/[sessionId]/hp endpoint in src/app/api/combat/[sessionId]/hp/route.ts
- [ ] T070 Implement POST /api/combat/[sessionId]/status-effects in src/app/api/combat/[sessionId]/status-effects/route.ts
- [ ] T071 [P] Create HP management service with undo functionality in src/lib/services/hpService.ts
- [ ] T072 [P] Create status effect service with duration management in src/lib/services/statusEffectService.ts
- [ ] T073 [P] Create combat interface components in src/components/encounters/CombatTracker.tsx

## Phase 3.15: Lair Actions (TDD)

- [ ] T074 [P] Contract test POST /api/combat/{sessionId}/lair-actions in tests/integration/test_lair_actions.test.ts
- [ ] T075 [P] Integration test lair action automation in tests/e2e/test_lair_actions.spec.ts

## Phase 3.16: Lair Actions Implementation

- [ ] T076 [P] Create LairAction Mongoose schema in src/lib/db/models/LairAction.ts
- [ ] T077 Implement POST /api/combat/[sessionId]/lair-actions in src/app/api/combat/[sessionId]/lair-actions/route.ts
- [ ] T078 [P] Create lair action service with automation in src/lib/services/lairActionService.ts
- [ ] T079 [P] Create lair action components in src/components/encounters/LairActions.tsx

## MILESTONE 3 CONFIRMATION

- [ ] T080 **MILESTONE 3: Combat Engine Complete** - Run comprehensive validation in tests/milestones/test_milestone_3_combat.spec.ts
  - ✅ Combat session state management working
  - ✅ Turn progression with visual indicators functional
  - ✅ HP modification with undo functionality operational
  - ✅ Status effect application and duration tracking working
  - ✅ Lair action prompts triggered correctly on initiative count 20

---

# WEEK 7-8: POLISH & TESTING

## Phase 3.17: Tier Enforcement & Offline Support (TDD)

- [ ] T081 [P] Integration test tier limit enforcement in tests/e2e/test_tier_limits.spec.ts
- [ ] T082 [P] Integration test offline functionality in tests/e2e/test_offline_support.spec.ts
- [ ] T083 [P] Integration test data persistence across sessions in tests/e2e/test_data_persistence.spec.ts

## Phase 3.18: Final Implementation

- [ ] T084 [P] Implement IndexedDB storage for offline combat in src/lib/storage/offlineStorage.ts
- [ ] T085 [P] Create usage tracking service with real-time updates in src/lib/services/usageService.ts
- [ ] T086 [P] Implement tier enforcement middleware in src/lib/middleware/tierEnforcement.ts
- [ ] T087 [P] Create upgrade prompt components in src/components/ui/UpgradePrompt.tsx
- [ ] T088 [P] Setup error boundary components in src/components/ui/ErrorBoundary.tsx

## Phase 3.19: Performance & Monitoring

- [ ] T089 [P] Configure Playwright 1.46+ for E2E testing in playwright.config.ts
- [ ] T090 [P] Implement performance monitoring in src/lib/monitoring/performance.ts
- [ ] T091 [P] Create comprehensive unit tests for services in tests/unit/services/
- [ ] T092 [P] Setup production build optimization in next.config.js

## Phase 3.20: Final Integration Tests

- [ ] T093 [P] Run complete user journey test (Scenario 1-6) in tests/e2e/test_complete_user_journey.spec.ts
- [ ] T094 [P] Performance validation tests (<3s load, <100ms interactions) in tests/performance/
- [ ] T095 [P] Cross-browser compatibility tests in tests/e2e/test_browser_compatibility.spec.ts
- [ ] T096 [P] Security validation tests (XSS, CSRF, auth) in tests/security/

## MILESTONE 4 CONFIRMATION

- [ ] T097 **MILESTONE 4: MVP Complete** - Run final validation in tests/milestones/test_milestone_4_mvp.spec.ts
  ↳ Validate Against: Complete quickstart.md Scenarios 1-6 (lines 5-205)
  ↳ Performance: quickstart.md Performance Requirements (lines 207-226)
  ↳ **Required Completions:**
  - ✅ Free tier limits enforced across all features (T084-T087)
  - ✅ Offline functionality for combat sessions working (T084)
  - ✅ Comprehensive test coverage achieved (80%+ unit, E2E scenarios)
  - ✅ Performance metrics met (<3s load, <100ms interactions)
  - ✅ All quickstart scenarios pass end-to-end
  ↳ **Success Criteria:**
  - Scenario 6 tier limit testing fully functional
  - Scenario 5 session recovery works after browser restart
  - Scenario 4 combat flow with HP/status effects operational
  - All data-model.md entities correctly implemented
  - All contracts/*.yaml APIs return proper responses
  - plan.md:Constitution Check requirements satisfied

---

## Dependencies

### Critical Path Dependencies

**FOUNDATION LAYER** (Must complete first):

- T001-T005 (Project setup) → Blocks ALL other tasks
- T011-T013 (Clerk + DB + User schema) → Required for ALL entity creation

**ENTITY LAYER** (Sequential dependencies):

- T012 (User schema) → T030 (Character schema) → T041 (Party schema)
- T042 (Monster schema) → T049 (Encounter schema) → T059 (CombatSession schema)
- T060 (StatusEffect) + T076 (LairAction) → Depend on T059 (CombatSession)

**TEST-DRIVEN DEVELOPMENT** (TDD Requirements):

- T006-T010 (Auth tests) → T014-T016 (Auth API implementation)
- T025-T029 (Character tests) → T032-T035 (Character API implementation)
- T054-T058 (Combat tests) → T061-T070 (Combat API implementation)

**CROSS-CUTTING DEPENDENCIES**:

- T017 (Auth middleware) → Required for ALL authenticated endpoints
- T018 (Validation schemas) → Required for ALL POST/PUT endpoints
- All entity schemas → Required before their respective API implementations

### Parallel Execution Opportunities

**Week 1-2 Parallel Groups**:

```bash
# Group A: Configuration
Task: "Configure ESLint and Prettier with Next.js configs"
Task: "Setup Tailwind CSS configuration with custom theme"
Task: "Configure Jest and React Testing Library"

# Group B: Authentication Tests
Task: "Contract test POST /api/auth/session"
Task: "Contract test GET /api/users/profile"
Task: "Integration test user registration flow"
```

**Week 3-4 Parallel Groups**:

```bash
# Group A: Character Tests
Task: "Contract test POST /api/characters"
Task: "Contract test GET /api/characters"
Task: "Integration test character CRUD flow"

# Group B: Data Models
Task: "Create Character Mongoose schema"
Task: "Create Party Mongoose schema"
Task: "Create Monster Mongoose schema"
```

**Week 5-6 Parallel Groups**:

```bash
# Group A: Combat Tests
Task: "Contract test POST /api/combat/start"
Task: "Contract test PUT /api/combat/initiative"
Task: "Integration test complete combat flow"

# Group B: Combat Models
Task: "Create CombatSession Mongoose schema"
Task: "Create StatusEffect Mongoose schema"
Task: "Create LairAction Mongoose schema"
```

## Validation Checklist

*GATE: Checked before marking tasks complete*

### Weekly Milestone Validations

- [ ] **Week 1-2**: All foundation tests pass, authentication flow complete
- [ ] **Week 3-4**: Character/party CRUD operational, encounter builder functional
- [ ] **Week 5-6**: Combat engine working, all D&D mechanics implemented
- [ ] **Week 7-8**: Performance optimized, comprehensive testing complete

### Technical Completeness - Documentation Cross-Reference Validation

**API Contract Coverage:**

- [ ] contracts/auth-api.yaml: 3 endpoints → T006-T008, T014-T016 ✓
- [ ] contracts/characters-api.yaml: 5 endpoints → T025-T028, T032-T035 ✓
- [ ] contracts/combat-api.yaml: 8+ endpoints → T054-T057, T061-T070 ✓

**Data Model Implementation:**

- [ ] data-model.md:User Entity → T012 (User schema) ✓
- [ ] data-model.md:Character Entity → T030 (Character schema) ✓
- [ ] data-model.md:Monster Entity → T042 (Monster schema) ✓
- [ ] data-model.md:Party Entity → T041 (Party schema) ✓
- [ ] data-model.md:Encounter Entity → T049 (Encounter schema) ✓
- [ ] data-model.md:CombatSession Entity → T059 (CombatSession schema) ✓
- [ ] data-model.md:StatusEffect Entity → T060 (StatusEffect schema) ✓
- [ ] data-model.md:LairAction Entity → T076 (LairAction schema) ✓

**User Story Test Coverage:**

- [ ] quickstart.md:Scenario 1 (Onboarding) → T009 (registration test) ✓
- [ ] quickstart.md:Scenario 2 (Party Creation) → T029 (character CRUD) ✓
- [ ] quickstart.md:Scenario 3 (Encounter Setup) → T048 (encounter builder) ✓
- [ ] quickstart.md:Scenario 4 (Combat Flow) → T058 (combat flow) ✓
- [ ] quickstart.md:Scenario 5 (Persistence) → T083 (data persistence) ✓
- [ ] quickstart.md:Scenario 6 (Tier Limits) → T081 (tier enforcement) ✓

**Constitutional Compliance:**

- [ ] TDD approach: All tests come before implementation ✓
- [ ] Parallel tasks are truly independent (different files) ✓
- [ ] Each task specifies exact file path ✓
- [ ] plan.md:Constitution Check requirements addressed ✓

### Quality Gates

- [ ] Constitution compliance maintained throughout (TDD, complexity limits)
- [ ] Tier enforcement tested at every feature level
- [ ] Offline capability verified for core combat features
- [ ] Performance benchmarks met for all user interactions
- [ ] Security validation covers authentication and input handling

**Estimated Timeline**: 8 weeks with 4 major milestone confirmations
**Total Tasks**: 97 tasks across setup, development, testing, and validation
**Parallel Execution**: 45+ tasks marked [P] for concurrent development
