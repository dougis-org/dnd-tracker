# Tasks: Profile Setup Wizard (Feature 015)

**Input**: Design documents from `/specs/015-profile-setup-wizard/`  
**Prerequisites**: plan.md (complete), spec.md (complete), research.md (complete), data-model.md (complete), contracts/ (complete)

**Maintainer**: @doug  
**Constitution**: All tasks and their ordering must comply with `.specify/memory/constitution.md`. After making edits to tasks, run the Codacy analysis for the edited files.

**Tests**: Tests are REQUIRED for this feature (TDD-first approach). Tests must be written FIRST, verified to FAIL, then implementation follows.

**Organization**: Tasks are grouped by implementation phase: Setup → Foundational → User Story 1 → Polish & E2E.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and feature directory structure

- [X] T000 [P] Verify `react-hot-toast` is installed in `package.json` (or add if missing): `npm install react-hot-toast`
- [X] T001 Create constants file in `src/lib/wizards/constants.ts` (max sizes, defaults)
- [X] T002 Create TypeScript types file in `src/types/wizard.ts` (wizard state interfaces)

---

## Phase 2: Foundational (Blocking Prerequisites for All User Stories)

**Purpose**: Core utilities and validation schemas that MUST be complete before any wizard component work begins

**⚠️ CRITICAL**: No wizard component work can begin until this phase is complete

- [ ] T003 [P] Write failing unit tests for avatar compression in `tests/unit/lib/avatarCompression.test.ts` (8 test cases: JPEG/PNG/WebP compression, format validation, timeout, base64 size limit, error handling)
- [ ] T004 [P] Implement avatar compression utility in `src/lib/wizards/avatarCompression.ts` (~80 lines: Canvas API, quality adjustment loop, base64 export, error handling)
- [ ] T005 [P] Write failing unit tests for Zod validation schemas in `tests/unit/lib/wizardValidation.test.ts` (10 test cases: displayName validation, avatar size limits, preferences enum, full schema validation)
- [ ] T006 [P] Implement Zod validation schemas in `src/lib/wizards/wizardValidation.ts` (~30 lines: displayName, avatar, preferences, profileSetupSchema)
- [ ] T007 Write failing unit tests for useProfileSetupWizard hook in `tests/unit/hooks/useProfileSetupWizard.test.ts` (15 test cases: state init, screen nav, form updates, submission, error handling, retry logic, localStorage persistence)
- [ ] T008 Implement useProfileSetupWizard custom hook in `src/hooks/useProfileSetupWizard.ts` (~120 lines: state management, navigation, submission, error toast, retry)

**Checkpoint**: Avatar compression, validation schemas, and state hook are fully tested and functional - wizard components can now be implemented

---

## Phase 3: User Story 1 - First Login Setup (Priority: P1) MVP

**Goal**: Deliver a complete, functional 5-screen wizard that guides users through profile setup on first login

**Independent Test**: Verify that a new user is automatically directed to the setup wizard upon first login, can complete all 5 screens, and their profile is saved successfully to MongoDB.

### Tests for User Story 1 (TDD-First)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T009 [P] [US1] Write failing component integration tests in `tests/unit/components/ProfileSetupWizard.test.tsx` (25 test cases: component rendering, validation, screen transitions, accessibility, error states, submission)
- [ ] T010 [P] [US1] Write failing integration tests for full wizard flow in `tests/integration/wizard-flow.integration.test.ts` (15 test cases: complete flow, skip behavior, error recovery, retry logic, MongoDB save, non-dismissible on first login, dismissible on repeat visits, close button visible/hidden, Escape key behavior)

### Implementation for User Story 1

#### Screen Components (Render → Pass Tests)

- [ ] T011 [P] [US1] Implement WelcomeScreen component in `src/components/ProfileSetupWizard/WelcomeScreen.tsx` (~40 lines: intro text, Next button)
- [ ] T012 [P] [US1] Implement DisplayNameScreen component in `src/components/ProfileSetupWizard/DisplayNameScreen.tsx` (~60 lines: text input, validation on blur, error display, disabled Next until valid)
- [ ] T013 [P] [US1] Implement AvatarUploadScreen component in `src/components/ProfileSetupWizard/AvatarUploadScreen.tsx` (~100 lines: file picker, size validation, compression call, preview, error handling)
- [ ] T014 [P] [US1] Implement PreferencesScreen component in `src/components/ProfileSetupWizard/PreferencesScreen.tsx` (~60 lines: theme radio buttons, notifications toggle, Next always enabled)
- [ ] T015 [P] [US1] Implement CompletionScreen component in `src/components/ProfileSetupWizard/CompletionScreen.tsx` (~40 lines: success message, Finish button)

#### Modal & Navigation (State Integration)

- [ ] T016 [US1] Implement ProfileSetupWizardModal main wrapper in `src/components/ProfileSetupWizard/ProfileSetupWizardModal.tsx` (~100 lines: screen router, navigation buttons, focus trap, keyboard escape handling, modal role/title)
- [ ] T017 [US1] Implement modal trigger logic in `src/app/layout.tsx` (fetch user profile after Clerk auth, check completedSetup flag, render modal conditionally)

**Checkpoint**: At this point, User Story 1 (first login wizard) should be fully functional and testable independently. Tests for component rendering, validation, screen transitions, and full wizard flow should all pass. Mock MongoDB data should save correctly.

---

## Phase 4: User Story 2 - Profile Incomplete Reminder (Priority: P1)

**Goal**: Deliver dismissible reminder banner on profile settings page for users with incomplete setup

**Independent Test**: Verify that users who skip the wizard see a dismissible reminder banner on the profile settings page, can dismiss it, and the banner reappears on next visit if setup remains incomplete.

### Tests for User Story 2 (TDD-First)

- [ ] T018 [P] [US2] Write failing unit tests for ProfileSetupReminder component in `tests/unit/components/ProfileSetupReminder.test.tsx` (5 test cases: render when incomplete, hidden when complete, dismiss button, banner text/link, reappear on next visit)

### Implementation for User Story 2

- [ ] T019 [P] [US2] Implement ProfileSetupReminder component in `src/components/ProfileSetupReminder.tsx` (~50 lines: dismissible banner, warning/info styling, link to re-trigger modal)
- [ ] T020 [US2] Add ProfileSetupReminder to profile settings page in `src/app/profile/settings/page.tsx` (embed reminder component at top if page exists; create if needed)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. New users get wizard on first login; users who skip see reminder on profile page.

---

## Phase 5: Polish & E2E Coverage

**Purpose**: End-to-end testing, accessibility validation, and final refinements

### E2E Tests (Playwright)

- [ ] T021 [P] Write failing E2E tests for complete wizard flow in `tests/e2e/wizard.e2e.spec.ts` (8 test cases: new user sees wizard, completes all screens, profile saved, navigates away, skips wizard, sees reminder, re-triggers wizard)
- [ ] T022 [P] Write failing accessibility E2E tests in `tests/e2e/wizard-a11y.e2e.spec.ts` (6 test cases: keyboard nav, screen reader announcements, focus trap, Escape key, visual focus indicator, error announcements)

### Accessibility & Validation

- [ ] T023 [US1] Run accessibility audit using Playwright a11y tests; implement any required fixes (aria-labels, role attributes, focus management refinements)
- [ ] T024 [P] Validate all wizard components conform to file size limits (<450 lines per file, <50 lines per function)

### Documentation & Final Checks

- [ ] T025 Code cleanup and refactoring: remove duplication, optimize imports, improve readability
- [ ] T026 [P] Run `npm run type-check` and verify no `any` types in wizard code
- [ ] T027 [P] Run `npm run lint` and fix any ESLint violations
- [ ] T028 [P] Run `npm run lint:markdown` and fix any markdown issues
- [ ] T029 Run `npm run build` and verify production build succeeds
- [ ] T030 Run `npm test` (all unit/integration tests) and verify 80%+ coverage on touched files
- [ ] T031 Verify precommit hook passes all checks (type-check, lint, build)
- [ ] T032 Run Codacy analysis on all new/edited files and resolve any quality issues

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all component work
- **User Story 1 (Phase 3)**: Depends on Foundational completion - wizard screens and modal
- **User Story 2 (Phase 4)**: Depends on Foundational + US1 completion - reminder banner
- **Polish & E2E (Phase 5)**: Depends on all user stories being complete

### Within Phase 2 (Foundational)

All marked [P] can run in parallel:

```bash
# Parallel batch 1: Avatar compression
Task T003: Write failing avatar compression tests
Task T004: Implement avatar compression utility

# Parallel batch 2: Validation schemas
Task T005: Write failing Zod schema tests
Task T006: Implement Zod validation schemas

# Then sequential (depends on T004 + T006):
Task T007: Write failing useProfileSetupWizard tests
Task T008: Implement useProfileSetupWizard hook
```

### Within Phase 3 (User Story 1)

All screen components marked [P] can run in parallel:

```bash
# Tests first (TDD):
Task T009: Write failing component tests
Task T010: Write failing integration tests

# Then parallel screen implementations (no inter-dependencies):
Task T011: WelcomeScreen
Task T012: DisplayNameScreen
Task T013: AvatarUploadScreen
Task T014: PreferencesScreen
Task T015: CompletionScreen

# Then modal wrapper (depends on all screens):
Task T016: ProfileSetupWizardModal main wrapper
Task T017: Modal trigger logic in RootLayout
```

### Within Phase 4 (User Story 2)

- Test first: T018
- Then implementations: T019, T020 (can run in parallel)

### Phase 5 (Polish & E2E)

Most tasks marked [P] can run in parallel:

```bash
# E2E tests in parallel:
Task T021: E2E wizard flow tests
Task T022: E2E accessibility tests

# Validation/cleanup in parallel:
Task T023: Run a11y audit + fix
Task T024: Verify file size limits
Task T025: Code cleanup
Task T026–T028: Linting tasks (can run in parallel locally)

# Then sequential (depends on all above):
Task T029: Production build verification
Task T030: Run full test suite
Task T031: Precommit hook validation
Task T032: Codacy analysis
```

---

## Parallel Opportunities

### Parallel within Foundational Phase

```bash
# Avatar compression and Validation can run in parallel:
- Avatar compression tests + implementation
- Zod schema tests + implementation
# Then both feed into the hook work
```

### Parallel within User Story 1 (Screens)

```bash
# All 5 screen components are independent and can be built in parallel:
- WelcomeScreen (T011)
- DisplayNameScreen (T012)
- AvatarUploadScreen (T013)
- PreferencesScreen (T014)
- CompletionScreen (T015)
# Then modal wrapper integrates them
```

### Parallel within Polish Phase

```bash
# E2E tests, linting, type checking can all run in parallel:
- E2E wizard flow tests (T021)
- E2E accessibility tests (T022)
- Type checking (T026)
- ESLint (T027)
- Markdown linting (T028)
- Code cleanup (T025)
# Then sequential verification (build → tests → precommit → Codacy)
```

---

## Implementation Strategy

### MVP First (Phases 1–3 Only)

1. Complete Phase 1: Setup (constants + types)
2. Complete Phase 2: Foundational (avatar compression, validation, hook)
3. Complete Phase 3: User Story 1 (wizard screens + modal)
4. **STOP and VALIDATE**: Run full test suite, verify 80%+ coverage, test manually
5. Deploy/demo if ready

### Incremental Delivery

1. **MVP Checkpoint (after Phase 3)**: First login wizard is fully functional
   - New users see wizard modal on first login
   - Users can navigate through 5 screens
   - Profile data is saved to MongoDB
   - Avatar compression works
   - Validation shows real-time feedback
   - Save errors show toast + allow retry
   - Deploy with feature flag `ENABLE_PROFILE_SETUP_WIZARD=true`

2. **Phase 4 Checkpoint (after US2)**: Reminder banner for incomplete profiles
   - Users who skip wizard see reminder on profile page
   - Reminder is dismissible
   - Reminder reappears on next visit if setup incomplete
   - Deploy incrementally (no breaking changes)

3. **Final Checkpoint (after Phase 5)**: E2E coverage + accessibility validated
   - Full Playwright test suite passing
   - WCAG 2.1 AA compliance verified
   - All quality checks passing (build, lint, type-check, Codacy)
   - Production-ready

### Parallel Team Strategy

With multiple developers:

```bash
# Phase 1: One developer (fast, 1 hour)
- Create constants + types

# Phase 2: Two developers in parallel
- Developer A: Avatar compression (T003–T004) + Zod schemas (T005–T006)
- Developer B: useProfileSetupWizard hook (T007–T008)
# Then both developers move to Phase 3

# Phase 3: Multiple developers in parallel
- Developer A: WelcomeScreen (T011) + DisplayNameScreen (T012)
- Developer B: AvatarUploadScreen (T013) + PreferencesScreen (T014)
- Developer C: CompletionScreen (T015)
- Then all together: Modal wrapper (T016) + RootLayout trigger (T017)

# Phase 4: Two developers in parallel
- Developer A: Reminder component (T019) + profile settings integration (T020)
- Developer B: Tests for reminder (T018)

# Phase 5: Parallel where possible
- Multiple developers: E2E tests, linting, cleanup (T021–T028 marked [P])
- Sequential verification: build → tests → Codacy
```

---

## Testing Strategy

### Test Coverage (80%+ Required)

| File | Type | Coverage Target | Notes |
|------|------|-----------------|-------|
| `src/lib/wizards/avatarCompression.ts` | Unit | 85%+ | 8 test cases covering compression, errors, timeouts |
| `src/lib/wizards/wizardValidation.ts` | Unit | 90%+ | 10 test cases covering all validation rules |
| `src/hooks/useProfileSetupWizard.ts` | Unit | 80%+ | 15 test cases covering state, submission, errors |
| `src/components/ProfileSetupWizard/*.tsx` | Unit | 85%+ | 25 test cases covering all screens, transitions, accessibility |
| `src/components/ProfileSetupReminder.tsx` | Unit | 85%+ | 5 test cases covering render, dismiss, reappear |
| Full Wizard Flow | Integration | 80%+ | 15 test cases covering end-to-end scenarios |
| E2E (Playwright) | E2E | Functional | 8 scenarios for flow + 6 for accessibility |

### Test-First (TDD) Phases

1. **Phase 2 Foundational**: Write tests → verify FAIL → implement → verify PASS
   - Avatar compression tests (T003) fail → implementation (T004) passes
   - Zod schema tests (T005) fail → implementation (T006) passes
   - Hook tests (T007) fail → implementation (T008) passes

2. **Phase 3 User Story 1**: Write tests → verify FAIL → implement → verify PASS
   - Component tests (T009) fail → screen implementations (T011–T015) pass
   - Integration tests (T010) fail → modal wrapper (T016–T017) passes

3. **Phase 4 User Story 2**: Write tests → verify FAIL → implement → verify PASS
   - Reminder tests (T018) fail → reminder implementation (T019–T020) passes

4. **Phase 5 Polish & E2E**: Write E2E tests → verify FAIL → implementation verified → tests PASS
   - E2E tests (T021–T022) fail → existing implementations pass

---

## Quality Gates & Checkpoints

### After Each Phase

- ✅ All tests for that phase passing
- ✅ No new TypeScript errors or `any` types
- ✅ ESLint passes with no warnings
- ✅ File size limits respected (<450 lines per file)
- ✅ Function size limits respected (<50 lines per function)
- ✅ Code duplication reviewed (DRY principle)
- ✅ Precommit hook passes

### Pre-Merge Checklist

- [ ] All 65+ unit tests passing (80%+ coverage)
- [ ] All 15+ integration tests passing
- [ ] All 14 E2E tests passing (8 flow + 6 accessibility)
- [ ] TypeScript strict mode: no `any` types, all types explicit
- [ ] ESLint passes with no warnings
- [ ] Markdown linting passes
- [ ] Production build succeeds (`npm run build`)
- [ ] Precommit hook passes all checks
- [ ] Codacy analysis run on all new/edited files, no critical issues
- [ ] Code review approved

---

## Effort Estimation

| Phase | Task Count | Estimate | Notes |
|-------|-----------|----------|-------|
| Phase 1: Setup | 2 | 0.5 days | Constants + types |
| Phase 2: Foundational | 6 | 2 days | Avatar compression, validation, hook (TDD) |
| Phase 3: User Story 1 | 9 | 3 days | 5 screens + modal wrapper + trigger (TDD) |
| Phase 4: User Story 2 | 3 | 1 day | Reminder component (TDD) |
| Phase 5: Polish & E2E | 12 | 2 days | E2E tests, linting, accessibility, quality checks |
| **Total** | **32 tasks** | **8–9 days** | TDD throughout; assumes Feature 014 stable |

---

## Rollback Plan

### Pre-Rollout Safeguards

- Feature flag: `ENABLE_PROFILE_SETUP_WIZARD=true` (defaults to false)
- Soft rollout: Enable for 5% of new users first
- Monitor metrics: Avatar compression success rate, save latency, error rate

### Rollback Triggers

- Avatar compression failure rate > 1%
- Profile save error rate > 5%
- Modal load time > 500ms (p95)
- Screen reader / keyboard navigation failures

### Immediate Actions on Rollback

1. Set feature flag to `false` immediately
2. Notify @doug with Sentry error log
3. Investigate root cause in development branch
4. Fix and redeploy

---

## Handoff Package

### Documentation

- ✅ `specs/015-profile-setup-wizard/plan.md` (implementation strategy)
- ✅ `specs/015-profile-setup-wizard/spec.md` (requirements)
- ✅ `specs/015-profile-setup-wizard/research.md` (tech decisions)
- ✅ `specs/015-profile-setup-wizard/data-model.md` (schema extension)
- ✅ `specs/015-profile-setup-wizard/quickstart.md` (usage guide)
- ✅ `specs/015-profile-setup-wizard/contracts/wizard-api-contract.md` (API notes)

### Code Artifacts

- 25 new source files (components, hooks, utilities, types)
- 20 new test files (unit, integration, E2E)
- 2 modified files (src/app/layout.tsx, src/app/profile/settings/page.tsx)

### Pre-Deployment Checklist

- [ ] All tasks from Phase 1–5 complete
- [ ] All quality gates passed
- [ ] Code review approved
- [ ] Feature flag configured in CI/CD
- [ ] Monitoring alerts configured (Sentry, error rates)
- [ ] Release notes prepared

### Post-Deployment

1. Enable feature flag for 5% of new users
2. Monitor metrics for 24–48 hours
3. If healthy, enable for 50% of new users
4. If healthy, enable for 100% of new users
5. Document any issues in follow-up GitHub issues
6. Mark Feature 015 as complete in `docs/Feature-Roadmap.md`

---

## Notes

- All tasks must follow TDD: write failing tests FIRST, implement to pass
- [P] tasks = different files, no dependencies on incomplete tasks in this phase
- [US#] labels map tasks to specific user stories for traceability
- Each user story should be independently completable and testable
- Avoid: vague tasks, same-file conflicts, cross-story dependencies
- Commit after each logical group of tasks (typically after each phase)
- Stop at any checkpoint to validate user story independently before proceeding

---

**Generated by**: `/speckit.tasks` workflow  
**Date**: 2025-11-28  
**Status**: Ready for Phase 1 Implementation
