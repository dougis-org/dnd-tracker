# Tasks: User Registration and Profile Management

**Input**: Design documents from `/home/doug/ai-dev-1/dnd-tracker/specs/002-when-a-user/`
**Prerequisites**: plan.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓
**Branch**: 002-when-a-user
**Feature**: User registration with Clerk authentication, MongoDB persistence, D&D profile preferences, and usage tracking

## Execution Flow (main)

```
1. Load plan.md from feature directory ✓
   → Tech stack: Next.js 15.5+, TypeScript 5.9+, Mongoose 8.5+, Clerk 5.0+, Zod 4+
2. Load optional design documents ✓
   → data-model.md: User entity with D&D preferences
   → contracts/: clerk-webhook.yaml, profile-api.yaml
   → quickstart.md: 8 integration test scenarios
3. Generate tasks by category ✓
   → Setup: Zod schemas, Mongoose model extensions
   → Tests: Contract tests, integration tests
   → Core: API routes, services, UI components
   → Integration: Webhook handlers, form flows
   → Polish: E2E tests, validation
4. Apply task rules ✓
   → Different files = [P] for parallel
   → Same file = sequential
   → Tests before implementation (TDD)
5. Number tasks sequentially ✓
6. Generate dependency graph ✓
7. Create parallel execution examples ✓
8. Validate task completeness ✓
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- All file paths are absolute from repository root
- Tests MUST be written and MUST FAIL before implementation

## Path Conventions

Using Next.js App Router structure:

- Validations: `src/lib/validations/`
- Models: `src/lib/models/`
- Services: `src/lib/services/`
- API Routes: `src/app/api/`
- Components: `src/components/`
- Tests: `tests/unit/`, `tests/integration/`, `tests/e2e/`

---

## Phase 3.1: Setup & Validation Layer ✅

### T001 [P] Extend Zod user validation schemas ✅

**File**: `src/lib/validations/user.ts`
**Description**: Add D&D profile field validations to existing user schemas
**Details**:

- Add `displayNameSchema` (optional, max 100 chars)
- Add `dndEditionSchema` (max 50 chars, default "5th Edition")
- Add `experienceLevelSchema` enum (new, beginner, intermediate, experienced, veteran)
- Add `primaryRoleSchema` enum (dm, player, both)
- Update `userProfileUpdateSchema` to include new D&D fields
- Add `profileSetupSchema` for initial profile form
**Reference**: `/home/doug/ai-dev-2/dnd-tracker-next-js/src/lib/validations/user.ts` lines 87-106
**Test First**: Write validation tests in T004 before implementing

### T002 [P] Write Zod validation schema tests ✅

**File**: `tests/unit/lib/validations/user.test.ts`
**Description**: Write failing tests for D&D profile field validations
**Details**:

- Test displayName: valid (null, <100 chars), invalid (>100 chars)
- Test dndEdition: valid (string, <50 chars), invalid (>50 chars)
- Test experienceLevel: valid (enum values), invalid (non-enum)
- Test primaryRole: valid (enum values), invalid (non-enum)
- Test profileSetupSchema: all fields optional except primaryRole
- Test defaults: timezone='UTC', dndEdition='5th Edition'
**Expected**: All tests should FAIL initially (no implementation yet)

### T003 Run validation tests to verify failure ✅

**Command**: `npm run test -- tests/unit/lib/validations/user.test.ts`
**Description**: Confirm validation tests fail before implementation
**Details**:

- All new D&D field validation tests should fail
- Document failure output
- Proceed to T001 only after confirming failures

---

## Phase 3.2: Data Model Layer ✅

### T004 [P] Extend Mongoose User model with D&D fields ✅

**File**: `src/lib/models/User.ts`
**Description**: Add D&D profile fields to existing User Mongoose schema
**Details**:

- Add displayName field (String, optional, max 100, trim)
- Add dndEdition field (String, default '5th Edition', max 50)
- Add experienceLevel field (String, enum, optional)
- Add primaryRole field (String, enum, optional)
- Add profileSetupCompleted field (Boolean, default false)
- Add usage metrics: sessionsCount, charactersCreatedCount, campaignsCreatedCount (Number, default 0)
- Add metricsLastUpdated field (Date, optional)
**Reference**: `/home/doug/ai-dev-2/dnd-tracker-next-js/src/lib/models/User.ts` lines 292-318
**Constitutional Check**: Keep file under 450 lines (currently ~750, may need split)
**Test First**: Write model tests in T005 before implementing

### T005 [P] Write Mongoose User model tests ✅

**File**: `tests/unit/lib/models/User.test.ts`
**Description**: Write failing tests for D&D profile field persistence
**Details**:

- Test default values: timezone='UTC', dndEdition='5th Edition', profileSetupCompleted=false
- Test optional fields: displayName, experienceLevel, primaryRole can be null
- Test field constraints: displayName max 100, dndEdition max 50
- Test enum validation: experienceLevel and primaryRole enums
- Test usage metrics: default 0, increment operations atomic
- Test Clerk user creation with new fields
**Expected**: All tests should FAIL initially (schema not extended yet)

### T006 Run model tests to verify failure ✅

**Command**: `npm run test -- tests/unit/lib/models/User.test.ts`
**Description**: Confirm model tests fail before schema extension
**Details**:

- New field tests should fail (fields don't exist)
- Document failure output
- Proceed to T004 only after confirming failures

### T007 Run validation tests again to verify they pass ✅

**Command**: `npm run test -- tests/unit/lib/validations/user.test.ts`
**Description**: Verify validation tests now pass after T001 implementation
**Expected**: All validation tests should PASS (green phase)

### T008 Run model tests again to verify they pass ✅

**Command**: `npm run test -- tests/unit/lib/models/User.test.ts`
**Description**: Verify model tests now pass after T004 implementation
**Expected**: All model tests should PASS (green phase)

---

## Phase 3.3: Service Layer ✅

### T009 [P] Create user service helper functions ✅

**File**: `src/lib/services/userService.ts` (new file)
**Description**: Create service layer for user profile operations
**Details**:

- `updateUserProfile(userId, profileData)`: Update D&D profile fields with validation
- `getUserProfile(userId)`: Fetch user with profile data
- `incrementUsageMetric(userId, metricName)`: Atomic counter increment
- `checkProfileComplete(user)`: Determine if profile setup is complete
- Export TypeScript types for service operations
**Max Lines**: 200 lines (constitutional limit: 450)
**Max Function**: 50 lines per function
**Test First**: Write service tests in T010 before implementing

### T010 [P] Write user service tests ✅

**File**: `tests/unit/lib/services/userService.test.ts`
**Description**: Write failing tests for user service operations
**Details**:

- Test updateUserProfile: success, validation errors, user not found
- Test getUserProfile: success, user not found
- Test incrementUsageMetric: atomic increment, concurrent updates
- Test checkProfileComplete: true if required fields set, false otherwise
- Mock Mongoose User model for isolation
**Expected**: All tests should FAIL initially (service doesn't exist)

### T011 Run service tests to verify failure ✅

**Command**: `npm run test -- tests/unit/lib/services/userService.test.ts`
**Description**: Confirm service tests fail before implementation
**Expected**: Tests fail because userService.ts doesn't exist yet

### T012 Run service tests again to verify they pass ✅

**Command**: `npm run test -- tests/unit/lib/services/userService.test.ts`
**Description**: Verify service tests pass after T009 implementation
**Expected**: All service tests should PASS (green phase)

---

## Phase 3.4: API Layer - Clerk Webhook ✅

### T013 [P] Write Clerk webhook integration tests ✅

**File**: `tests/integration/api/webhooks/clerk.test.ts`
**Description**: Write failing tests for Clerk webhook event handling
**Details**:

- Test user.created event: creates MongoDB user with defaults
- Test user.updated event: syncs Clerk changes to MongoDB
- Test user.deleted event: handles user deletion
- Test signature verification: rejects invalid signatures
- Test idempotency: duplicate events handled gracefully
- Test error handling: DB errors return 500 (triggers retry)
- Mock Svix signature verification
- Use in-memory MongoDB for test database
**Reference**: Quickstart scenario 1, 6
**Expected**: All tests should FAIL initially (route doesn't exist)

### T014 Run Clerk webhook tests to verify failure ✅

**Command**: `npm run test -- tests/integration/api/webhooks/clerk.test.ts`
**Description**: Confirm webhook tests fail before implementation
**Expected**: 404 errors because route doesn't exist yet

### T015 Implement Clerk webhook handler ✅

**File**: `src/app/api/webhooks/clerk/route.ts`
**Description**: Create POST handler for Clerk webhook events
**Details**:

- Import Webhook from 'svix' for signature verification
- Verify svix-signature, svix-id, svix-timestamp headers
- Handle user.created: call User.createClerkUser()
- Handle user.updated: call User.updateFromClerkData()
- Handle user.deleted: soft delete or remove user
- Return 200 for success, 400 for bad signature, 500 for DB errors
- Set lastClerkSync and syncStatus fields
- Implement idempotency check by clerkId
**Max Lines**: 150 lines
**Max Function**: 50 lines per handler
**Constitutional**: Extract helper functions if handlers exceed 50 lines

### T016 Run Clerk webhook tests to verify they pass ✅

**Command**: `npm run test -- tests/integration/api/webhooks/clerk.test.ts`
**Description**: Verify webhook tests pass after T015 implementation
**Expected**: All webhook tests should PASS (green phase)

---

## Phase 3.5: API Layer - Profile Management ✅

### T017 [P] Write profile API tests ✅

**File**: `tests/integration/api/users/profile.test.ts` ✅
**Description**: Write failing tests for profile GET/PATCH endpoints
**Details**:

- Test GET /api/users/[id]/profile: returns user profile with auth ✅
- Test GET unauthorized: returns 401 without Clerk token ✅
- Test GET forbidden: returns 403 if userId mismatch ✅
- Test PATCH /api/users/[id]/profile: updates profile fields with validation ✅
- Test PATCH validation errors: returns 400 with error details ✅
- Test PATCH unauthorized: returns 401 without auth ✅
- Test PATCH forbidden: returns 403 if userId mismatch ✅
- Mock Clerk authentication ✅
**Reference**: Quickstart scenarios 2, 4, 7, 8
**Expected**: All tests should FAIL initially (route doesn't exist) ✅

### T018 Run profile API tests to verify failure ✅

**Command**: `npm run test -- tests/integration/api/users/profile.test.ts` ✅
**Description**: Confirm profile API tests fail before implementation
**Expected**: 404 errors because route doesn't exist yet ✅

### T019 Implement profile API route ✅

**File**: `src/app/api/users/[id]/profile/route.ts` ✅
**Description**: Create GET and PATCH handlers for user profile
**Details**:

- GET handler: Verify Clerk auth, check userId matches auth, fetch user profile ✅
- PATCH handler: Verify auth, validate input with Zod, call userService.updateUserProfile() ✅
- Return appropriate HTTP status codes (200, 400, 401, 403, 404) ✅
- Use publicUserSchema for response sanitization (no sensitive fields) ✅
- Handle Zod validation errors with detailed field-level messages ✅
**Max Lines**: 150 lines total (both handlers) ✅ (146 lines)
**Max Function**: 50 lines per handler ✅
**Helper Files Created**:
- `src/lib/services/profileValidation.ts` (113 lines) - Validation & sanitization helpers

### T020 Run profile API tests to verify they pass ✅

**Command**: `npm run test -- tests/integration/api/users/profile.test.ts` ✅
**Description**: Verify profile API tests pass after T019 implementation
**Expected**: All profile API tests should PASS (green phase) ✅ (9/9 passing)

---

## Phase 3.6: UI Layer - Profile Form Component

### T021 [P] Write ProfileForm component tests ✅

**File**: `tests/unit/components/profile/ProfileForm.test.tsx`
**Description**: Write failing tests for reusable profile form component
**Details**:

- Test renders all D&D profile fields (displayName, timezone, dndEdition, experienceLevel, primaryRole)
- Test pre-fills values from user prop
- Test form validation on submit (Zod schema)
- Test displays validation errors inline
- Test calls onSubmit with form data
- Test shows loading state during submission
- Test success message after successful submit
- Use React Testing Library and mock React Hook Form
**Expected**: All tests should FAIL initially (component doesn't exist)

### T022 Run ProfileForm tests to verify failure ✅

**Command**: `npm run test -- tests/unit/components/profile/ProfileForm.test.tsx`
**Description**: Confirm ProfileForm tests fail before implementation
**Expected**: Tests fail because component doesn't exist yet

### T023 Implement ProfileForm component ✅

**File**: `src/components/profile/ProfileForm.tsx`
**Description**: Create reusable profile form with React Hook Form and Zod
**Details**:

- Accept user prop (optional) for edit mode
- Use useForm with zodResolver(profileSetupSchema)
- Render form fields: displayName (text), timezone (select), dndEdition (text), experienceLevel (select), primaryRole (select)
- Show inline validation errors from Zod
- Handle form submission with onSubmit callback prop
- Display loading spinner during submission
- Show success/error toast messages
- Use shadcn/ui form components
**Max Lines**: 200 lines
**Max Function**: 50 lines each (form render, submit handler, validation)
**Constitutional**: Extract field components if file exceeds 200 lines

### T024 Run ProfileForm tests to verify they pass ✅

**Command**: `npm run test -- tests/unit/components/profile/ProfileForm.test.tsx`
**Description**: Verify ProfileForm tests pass after T023 implementation
**Expected**: All component tests should PASS (green phase)

---

## Phase 3.7: UI Layer - Profile Setup Wizard

### T025 [P] Write ProfileSetupWizard component tests

**File**: `tests/unit/components/profile/ProfileSetupWizard.test.tsx`
**Description**: Write failing tests for first-time profile setup flow
**Details**:

- Test renders welcome message for new users
- Test renders ProfileForm with empty initial values
- Test "Complete Profile" button submits form
- Test "Skip for now" button redirects without saving
- Test updates profileSetupCompleted flag on submit
- Test redirects to dashboard after completion or skip
- Mock Next.js router and form submission
**Expected**: All tests should FAIL initially (component doesn't exist)

### T026 Run ProfileSetupWizard tests to verify failure

**Command**: `npm run test -- tests/unit/components/profile/ProfileSetupWizard.test.tsx`
**Description**: Confirm wizard tests fail before implementation
**Expected**: Tests fail because component doesn't exist yet

### T027 Implement ProfileSetupWizard component

**File**: `src/components/profile/ProfileSetupWizard.tsx`
**Description**: Create first-time profile setup wizard component
**Details**:

- Render welcome message: "Welcome to D&D Tracker! Let's set up your profile."
- Embed ProfileForm component (reuse from T023)
- Add "Complete Profile" button (submits form)
- Add "Skip for now" button (calls skip handler, redirects)
- On submit: Call profile API, set profileSetupCompleted=true, redirect to /dashboard
- On skip: Redirect to /dashboard with profileSetupCompleted=false
- Use useRouter for navigation
**Max Lines**: 150 lines
**Max Function**: 50 lines each (submit, skip, render)

### T028 Run ProfileSetupWizard tests to verify they pass

**Command**: `npm run test -- tests/unit/components/profile/ProfileSetupWizard.test.tsx`
**Description**: Verify wizard tests pass after T027 implementation
**Expected**: All wizard tests should PASS (green phase)

---

## Phase 3.8: UI Layer - Page Components

### T029 Create profile setup page

**File**: `src/app/(auth)/profile-setup/page.tsx`
**Description**: Create Next.js page for first-time profile setup
**Details**:

- Import ProfileSetupWizard component
- Fetch current user with Clerk auth
- Redirect to dashboard if profileSetupCompleted is true
- Render ProfileSetupWizard with user data
- Server component with client component for form
**Max Lines**: 100 lines

### T030 Create profile settings page

**File**: `src/app/settings/profile/page.tsx`
**Description**: Create Next.js page for profile management in settings
**Details**:

- Import ProfileForm component
- Fetch current user profile with Clerk auth
- Render ProfileForm in edit mode with current values
- Handle form submission with profile API call
- Show success/error messages
- Server component with client component for form
**Max Lines**: 100 lines

---

## Phase 3.9: End-to-End Tests

### T031 [P] Write profile setup E2E test

**File**: `tests/e2e/profile-setup.spec.ts`
**Description**: Write Playwright E2E test for complete profile setup flow
**Details**:

- Test Scenario 2 from quickstart: Complete profile form
- Test Scenario 3 from quickstart: Skip profile setup
- Test Scenario 4 from quickstart: Update profile in settings
- Use Playwright fixtures for authenticated user
- Verify database state after each action
- Test full user journey from authentication to profile completion
**Expected**: Test should FAIL initially (pages don't exist or aren't wired up)

### T032 Run profile setup E2E test to verify failure

**Command**: `npm run test:e2e -- tests/e2e/profile-setup.spec.ts`
**Description**: Confirm E2E test fails before pages are complete
**Expected**: Test fails because flow not fully implemented

### T033 Run profile setup E2E test to verify it passes

**Command**: `npm run test:e2e -- tests/e2e/profile-setup.spec.ts`
**Description**: Verify E2E test passes after full implementation
**Expected**: E2E test should PASS (complete flow working)

---

## Phase 3.10: Integration & Polish

### T034 Wire up profile setup redirect logic

**File**: `src/middleware.ts` or layout component
**Description**: Add conditional redirect to /profile-setup for first login
**Details**:

- Check user.profileSetupCompleted flag
- If false and first login: redirect to /profile-setup
- If false and not first login: show optional banner reminder
- Allow access to /settings/profile regardless of completion status
**Max Lines**: 50 lines addition

### T035 Run full test suite

**Command**: `npm run test:ci`
**Description**: Run complete test suite to verify all tests pass
**Details**:

- Unit tests: Validations, models, services, components
- Integration tests: API routes, webhooks
- E2E tests: Complete user flows
**Expected**: 100% pass rate, 80%+ coverage on touched files

### T036 Run Codacy analysis

**Command**: `codacy-cli analyze --directory /home/doug/ai-dev-1/dnd-tracker`
**Description**: Run full Codacy scan with pagination for entire codebase
**Details**:

- Check for new code quality issues
- Check for security vulnerabilities
- Check for code duplication
- Verify no files exceed 450 lines (uncommented)
- Verify no functions exceed 50 lines
- Address all findings before proceeding

### T037 [P] Manual testing with quickstart scenarios

**File**: `specs/002-when-a-user/quickstart.md`
**Description**: Execute all 8 quickstart scenarios manually
**Details**:

- Scenario 1: New user registration via Clerk
- Scenario 2: First-time profile setup
- Scenario 3: Skip profile setup
- Scenario 4: Update profile in settings
- Scenario 5: Usage metrics tracking (verify infrastructure)
- Scenario 6: Clerk user update sync
- Scenario 7: Profile validation errors
- Scenario 8: Authorization checks
**Expected**: All scenarios should work as documented

### T038 Run build and verify no errors

**Command**: `npm run build`
**Description**: Verify production build succeeds without errors
**Expected**: Build completes successfully, no TypeScript errors

### T039 Run linters and fix issues

**Command**: `npm run lint:fix && npm run lint:markdown:fix`
**Description**: Run ESLint and Markdown linters, auto-fix issues
**Expected**: No linter errors remaining

### T040 Code review and refactoring

**Description**: Review all changes for code quality and constitutional compliance
**Details**:

- Check for code duplication → extract to utilities
- Verify all files under 450 lines
- Verify all functions under 50 lines
- Check test coverage meets 80%+ on touched files
- Ensure no sensitive data in code or tests
- Verify proper error handling and logging

---

## Dependencies Graph

```
Setup & Validation (T001-T003)
├─ T001 [P] ─┐
└─ T002 [P] ─┴─→ T003

Data Model (T004-T008)
├─ T004 [P] ─┐
└─ T005 [P] ─┴─→ T006 → T007 → T008

Service Layer (T009-T012)
└─ T009 [P] → T010 [P] → T011 → T012

API - Webhook (T013-T016)
└─ T013 [P] → T014 → T015 → T016

API - Profile (T017-T020)
└─ T017 [P] → T018 → T019 → T020

UI - ProfileForm (T021-T024)
└─ T021 [P] → T022 → T023 → T024

UI - Wizard (T025-T028)
└─ T025 [P] (depends on T023) → T026 → T027 → T028

UI - Pages (T029-T030)
├─ T029 (depends on T027)
└─ T030 (depends on T023)

E2E (T031-T033)
└─ T031 [P] (depends on T029, T030) → T032 → T033

Polish (T034-T040)
└─ T034 → T035 → T036 → T037 [P] → T038 → T039 → T040
```

---

## Parallel Execution Examples

### Round 1: Validation & Tests (Independent Files)

```bash
# Can run in parallel - different files, no dependencies
T001: Extend Zod schemas in src/lib/validations/user.ts
T002: Write validation tests in tests/unit/lib/validations/user.test.ts
```

### Round 2: Data Model (After T003)

```bash
# Can run in parallel - different files
T004: Extend Mongoose model in src/lib/models/User.ts
T005: Write model tests in tests/unit/lib/models/User.test.ts
```

### Round 3: Service Layer (After T008)

```bash
# Can run in parallel - different files
T009: Create user service in src/lib/services/userService.ts
T010: Write service tests in tests/unit/lib/services/userService.test.ts
```

### Round 4: API Integration Tests (After T012)

```bash
# Can run in parallel - different test files
T013: Write webhook tests in tests/integration/api/webhooks/clerk.test.ts
T017: Write profile API tests in tests/integration/api/users/profile.test.ts
```

### Round 5: UI Component Tests (After T020)

```bash
# Can run in parallel - different component test files
T021: Write ProfileForm tests in tests/unit/components/profile/ProfileForm.test.tsx
```

---

## Validation Checklist

- [x] All contracts have corresponding tests (clerk-webhook.yaml → T013, profile-api.yaml → T017)
- [x] All entities have model tasks (User entity → T004, T005)
- [x] All tests come before implementation (T002→T001, T005→T004, T010→T009, etc.)
- [x] Parallel tasks truly independent (different files, marked [P])
- [x] Each task specifies exact file path ✓
- [x] No task modifies same file as another [P] task ✓
- [x] TDD cycle enforced: Write test → Verify failure → Implement → Verify pass

---

## Constitutional Compliance Checklist

- [ ] All files under 450 lines (uncommented)
- [ ] All functions under 50 lines
- [ ] 80%+ test coverage on touched code
- [ ] No code duplication (extract shared utilities)
- [ ] No sensitive data in code
- [ ] TypeScript strict mode enforced
- [ ] All tests passing before PR
- [ ] Codacy scan clean
- [ ] Build succeeds
- [ ] Linters pass

---

## Notes

- **Total Tasks**: 40 tasks across all phases
- **Parallel Opportunities**: 14 tasks marked [P] can run concurrently
- **TDD Enforced**: Every implementation task has a test task that must run first
- **Estimated Effort**: 2-3 days with TDD approach
- **File Count**: ~15 new files (tests, components, API routes, services)
- **Reference Implementation**: `/home/doug/ai-dev-2/dnd-tracker-next-js` for patterns

**Ready for execution**: All tasks are specific, actionable, and follow constitutional principles ✅
