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

## Phase 3.9: Dashboard Layer

### T031 [P] Create subscription utilities

**File**: `src/lib/utils/subscription.ts` (new file)
**Description**: Create subscription tier limit helpers and usage calculation utilities
**Details**:

- Export SUBSCRIPTION_LIMITS constant (from data-model.md)
- `getTierLimits(tier)`: Returns limits object for given subscription tier
- `calculateUsagePercentage(current, limit)`: Calculate percentage (0-100)
- `determineWarningLevel(percentage)`: Returns 'info' | 'warning' | 'critical' based on thresholds (<50%, 50-80%, >80%)
- `generateUsageWarnings(usage, limits)`: Returns array of warning objects with resource, message, severity
**Max Lines**: 150 lines
**Test First**: Write tests in T032 before implementing

### T032 [P] Write subscription utilities tests

**File**: `tests/unit/lib/utils/subscription.test.ts`
**Description**: Write failing tests for subscription utility functions
**Details**:

- Test getTierLimits: Returns correct limits for all tier enum values
- Test calculateUsagePercentage: Handles 0/0, division by zero, correct percentages
- Test determineWarningLevel: Returns correct severity for boundary values (49%, 50%, 79%, 80%, 90%)
- Test generateUsageWarnings: Returns empty array when usage low, correct warnings when high
**Expected**: All tests should FAIL initially (utilities don't exist)

### T033 Run subscription utilities tests to verify failure

**Command**: `npm run test -- tests/unit/lib/utils/subscription.test.ts`
**Description**: Confirm utilities tests fail before implementation
**Expected**: Tests fail because utilities file doesn't exist yet

### T034 [P] Create metrics utilities

**File**: `src/lib/utils/metrics.ts` (new file)
**Description**: Create user metrics formatting and transformation helpers
**Details**:

- `formatLastLogin(date)`: Format last login timestamp to human-readable string
- `calculateMetricsSummary(user)`: Extract and format activity metrics
- `buildDashboardMetrics(user)`: Aggregate all dashboard data from user document
**Max Lines**: 100 lines
**Test First**: Write tests in T035 before implementing

### T035 [P] Write metrics utilities tests

**File**: `tests/unit/lib/utils/metrics.test.ts`
**Description**: Write failing tests for metrics utility functions
**Details**:

- Test formatLastLogin: Handles null, formats dates correctly
- Test calculateMetricsSummary: Returns correct structure
- Test buildDashboardMetrics: Aggregates all required dashboard data
**Expected**: All tests should FAIL initially (utilities don't exist)

### T036 Run metrics utilities tests to verify failure

**Command**: `npm run test -- tests/unit/lib/utils/metrics.test.ts`
**Description**: Confirm metrics tests fail before implementation
**Expected**: Tests fail because utilities file doesn't exist yet

### T037 [P] Create dashboard service

**File**: `src/lib/services/dashboardService.ts` (new file)
**Description**: Create service for dashboard metrics aggregation
**Details**:

- `getDashboardMetrics(userId)`: Fetch user, calculate subscription usage, build metrics response
- Integrate subscription utilities for limits and warnings
- Integrate metrics utilities for activity data
- Return structure matching dashboard-api.yaml contract
**Max Lines**: 150 lines
**Max Function**: 50 lines
**Test First**: Write tests in T038 before implementing

### T038 [P] Write dashboard service tests

**File**: `tests/unit/lib/services/dashboardService.test.ts`
**Description**: Write failing tests for dashboard service operations
**Details**:

- Test getDashboardMetrics: Success with complete data structure
- Test getDashboardMetrics: User not found returns 404
- Test subscription usage calculations: Correct percentages and warnings
- Mock User model and utilities
**Expected**: All tests should FAIL initially (service doesn't exist)

### T039 Run dashboard service tests to verify failure

**Command**: `npm run test -- tests/unit/lib/services/dashboardService.test.ts`
**Description**: Confirm dashboard service tests fail before implementation
**Expected**: Tests fail because service doesn't exist yet

### T040 [P] Write dashboard API integration tests

**File**: `tests/integration/api/dashboard/metrics.test.ts`
**Description**: Write failing tests for dashboard metrics API endpoint
**Details**:

- Test GET /api/dashboard/metrics: Returns complete dashboard data with auth
- Test GET unauthorized: Returns 401 without Clerk token
- Test response structure: Matches dashboard-api.yaml contract
- Verify subscription tier, limits, usage, percentages, warnings, metrics
- Mock Clerk authentication
**Reference**: Quickstart scenario 10, dashboard-api.yaml contract
**Expected**: All tests should FAIL initially (route doesn't exist)

### T041 Run dashboard API tests to verify failure

**Command**: `npm run test -- tests/integration/api/dashboard/metrics.test.ts`
**Description**: Confirm dashboard API tests fail before implementation
**Expected**: 404 errors because route doesn't exist yet

### T042 Implement dashboard metrics API route

**File**: `src/app/api/dashboard/metrics/route.ts`
**Description**: Create GET handler for dashboard metrics
**Details**:

- Verify Clerk authentication
- Extract userId from Clerk session
- Call dashboardService.getDashboardMetrics(userId)
- Return 200 with metrics or appropriate error codes (401, 500)
- Follow dashboard-api.yaml contract
**Max Lines**: 100 lines
**Max Function**: 50 lines

### T043 Run dashboard API tests to verify they pass

**Command**: `npm run test -- tests/integration/api/dashboard/metrics.test.ts`
**Description**: Verify dashboard API tests pass after T042 implementation
**Expected**: All dashboard API tests should PASS (green phase)

### T044 [P] Write dashboard component tests

**File**: `tests/unit/components/dashboard/DashboardHeader.test.tsx`
**Description**: Write failing tests for dashboard header component
**Details**:

- Test renders user display name
- Test renders subscription tier badge
- Test renders correct greeting message
**Expected**: All tests should FAIL initially (component doesn't exist)

### T045 [P] Write usage metrics component tests

**File**: `tests/unit/components/dashboard/UsageMetrics.test.tsx`
**Description**: Write failing tests for usage metrics display component
**Details**:

- Test renders progress bars for parties, encounters, creatures
- Test displays correct usage numbers and percentages
- Test applies correct color coding (green/yellow/red)
- Test displays usage warnings when thresholds exceeded
**Expected**: All tests should FAIL initially (component doesn't exist)

### T046 Run dashboard component tests to verify failure

**Command**: `npm run test -- tests/unit/components/dashboard/*.test.tsx`
**Description**: Confirm dashboard component tests fail before implementation
**Expected**: Tests fail because components don't exist yet

### T047 Implement dashboard header component

**File**: `src/components/dashboard/DashboardHeader.tsx`
**Description**: Create dashboard header with user info and greeting
**Details**:

- Display user displayName or fallback to first name
- Display subscription tier badge with tier name
- Show greeting message based on time of day (optional)
- Use shadcn/ui components for styling
**Max Lines**: 100 lines

### T048 Implement usage metrics component

**File**: `src/components/dashboard/UsageMetrics.tsx`
**Description**: Create usage metrics display with progress bars
**Details**:

- Accept metrics prop with subscription data
- Render progress bars for parties, encounters, creatures
- Display usage as "X / Y" format
- Apply color coding: green (<50%), yellow (50-80%), red (>80%)
- Display warnings array if provided
- Use shadcn/ui Progress component
**Max Lines**: 200 lines
**Max Function**: 50 lines
**Constitutional**: Extract ProgressBar subcomponent if needed

### T049 Run dashboard component tests to verify they pass

**Command**: `npm run test -- tests/unit/components/dashboard/*.test.tsx`
**Description**: Verify dashboard component tests pass after implementation
**Expected**: All component tests should PASS (green phase)

### T050 Create dashboard page

**File**: `src/app/dashboard/page.tsx`
**Description**: Create authenticated dashboard page with metrics
**Details**:

- Verify Clerk authentication, redirect to login if not authenticated
- Fetch dashboard metrics from API
- Render DashboardHeader with user data
- Render UsageMetrics with subscription data
- Show quick actions (Create Party, Create Encounter buttons - placeholders)
- Server component with client components for interactive parts
**Max Lines**: 150 lines
**Performance**: Page load within 1.5s target

---

## Phase 3.10: Settings Layer

### T051 [P] Write settings API integration tests

**File**: `tests/integration/api/users/settings.test.ts`
**Description**: Write failing tests for settings API endpoints
**Details**:

- Test GET /api/users/[userId]/settings: Returns complete settings with auth
- Test GET unauthorized: Returns 401 without Clerk token
- Test GET forbidden: Returns 403 if userId doesn't match session
- Test PATCH /api/users/[userId]/settings/preferences: Updates preferences with validation
- Test PATCH validation errors: Returns 400 with detailed errors
- Test response structure: Matches settings-api.yaml contract
- Mock Clerk authentication
**Reference**: settings-api.yaml contract, quickstart scenarios 11-12
**Expected**: All tests should FAIL initially (routes don't exist)

### T052 Run settings API tests to verify failure

**Command**: `npm run test -- tests/integration/api/users/settings.test.ts`
**Description**: Confirm settings API tests fail before implementation
**Expected**: 404 errors because routes don't exist yet

### T053 Implement settings GET API route

**File**: `src/app/api/users/[userId]/settings/route.ts`
**Description**: Create GET handler for user settings
**Details**:

- Verify Clerk authentication
- Verify userId matches authenticated user (403 if mismatch)
- Fetch user profile and preferences
- Return complete settings object matching settings-api.yaml
- Handle errors (401, 403, 404, 500)
**Max Lines**: 100 lines

### T054 Implement preferences PATCH API route

**File**: `src/app/api/users/[userId]/settings/preferences/route.ts`
**Description**: Create PATCH handler for preferences updates
**Details**:

- Verify Clerk authentication and userId match
- Validate preferences update with Zod schema
- Update only provided preferences fields (partial update)
- Return updated complete settings object
- Handle validation errors with field-level details
**Max Lines**: 150 lines
**Max Function**: 50 lines

### T055 Run settings API tests to verify they pass

**Command**: `npm run test -- tests/integration/api/users/settings.test.ts`
**Description**: Verify settings API tests pass after T053-T054 implementation
**Expected**: All settings API tests should PASS (green phase)

### T056 [P] Write settings component tests

**File**: `tests/unit/components/settings/SettingsTabs.test.tsx`
**Description**: Write failing tests for settings tab navigation component
**Details**:

- Test renders tab buttons for Profile, Preferences, Account
- Test active tab indicator reflects current route
- Test tab navigation updates URL
- Test keyboard navigation (ARIA compliance)
**Expected**: All tests should FAIL initially (component doesn't exist)

### T057 [P] Write preferences tab component tests

**File**: `tests/unit/components/settings/PreferencesTab.test.tsx`
**Description**: Write failing tests for preferences form component
**Details**:

- Test renders all preference fields (theme, notifications, language, animations, autoSave)
- Test pre-fills current preference values
- Test form submission updates preferences
- Test validation and error display
**Expected**: All tests should FAIL initially (component doesn't exist)

### T058 Run settings component tests to verify failure

**Command**: `npm run test -- tests/unit/components/settings/*.test.tsx`
**Description**: Confirm settings component tests fail before implementation
**Expected**: Tests fail because components don't exist yet

### T059 Implement settings tabs component

**File**: `src/components/settings/SettingsTabs.tsx`
**Description**: Create tabbed navigation for settings sections
**Details**:

- Render tabs: Profile, Preferences, Account
- Use Next.js Link for tab navigation
- Active tab indicator based on current pathname
- ARIA attributes for accessibility
- Use shadcn/ui Tabs component
**Max Lines**: 100 lines

### T060 Implement preferences tab component

**File**: `src/components/settings/PreferencesTab.tsx`
**Description**: Create preferences form with theme, notifications, etc.
**Details**:

- Form fields: theme (select), emailNotifications (toggle), browserNotifications (toggle), timezone (select), language (select), diceRollAnimations (toggle), autoSaveEncounters (toggle)
- Use React Hook Form with Zod validation
- Submit updates to preferences API
- Show success/error feedback
- Use shadcn/ui form components
**Max Lines**: 250 lines
**Max Function**: 50 lines
**Constitutional**: Extract field groups if file exceeds 250 lines

### T061 Run settings component tests to verify they pass

**Command**: `npm run test -- tests/unit/components/settings/*.test.tsx`
**Description**: Verify settings component tests pass after implementation
**Expected**: All component tests should PASS (green phase)

### T062 Create settings layout with tabs

**File**: `src/app/settings/layout.tsx`
**Description**: Create settings layout with shared tab navigation
**Details**:

- Render SettingsTabs component
- Provide layout structure for all settings pages
- Verify authentication, redirect to login if needed
- Server component wrapping client components
**Max Lines**: 80 lines

### T063 Create settings profile tab page

**File**: `src/app/settings/profile/page.tsx`
**Description**: Create profile editing page within settings
**Details**:

- Reuse ProfileForm component from T023
- Fetch current user profile
- Handle profile updates
- Show in settings context (not standalone)
**Max Lines**: 80 lines

### T064 Create settings preferences tab page

**File**: `src/app/settings/preferences/page.tsx`
**Description**: Create preferences editing page within settings
**Details**:

- Render PreferencesTab component
- Fetch current preferences
- Handle preferences updates
**Max Lines**: 80 lines

### T065 Create settings account tab page

**File**: `src/app/settings/account/page.tsx`
**Description**: Create account info page within settings
**Details**:

- Display subscription tier (read-only)
- Display account creation date
- Display last login timestamp
- Placeholder for "Delete Account" functionality (disabled)
**Max Lines**: 100 lines

### T066 Create settings index page redirect

**File**: `src/app/settings/page.tsx`
**Description**: Create redirect from /settings to /settings/profile as default
**Details**:

- Redirect to /settings/profile using Next.js redirect()
**Max Lines**: 20 lines

---

## Phase 3.11: End-to-End Tests (Comprehensive E2E Coverage)

### T067 [P] Write login flow E2E test

**File**: `tests/e2e/auth/login.spec.ts` (new file)
**Description**: Write Playwright test for user login flow (E2E-001 from e2e-test-plan.md)
**Details**:

- Test TR-001, TR-009: Unauthenticated user redirected to Clerk sign-in
- Test successful login with valid credentials
- Test login failure with invalid credentials (Clerk error messages)
- Test post-login redirect to dashboard
- Verify Clerk session established
- Test page load performance (<1.5s for dashboard)
**Reference**: e2e-test-plan.md E2E-001, quickstart scenario 9
**Expected**: Test should FAIL initially (dashboard page doesn't exist yet)

### T068 [P] Write dashboard access E2E test

**File**: `tests/e2e/dashboard/dashboard.spec.ts` (new file)
**Description**: Write Playwright test for dashboard access and display (E2E-002 from e2e-test-plan.md)
**Details**:

- Test TR-002: Authenticated user can access dashboard
- Verify dashboard displays subscription tier badge
- Verify usage metrics with progress bars display correctly
- Verify usage warnings appear for high usage
- Verify activity metrics display (sessions, characters, campaigns)
- Test color coding for progress bars (green/yellow/red)
**Reference**: e2e-test-plan.md E2E-002, quickstart scenario 10
**Expected**: Test should FAIL initially (dashboard components not complete)

### T069 [P] Write profile viewing E2E test

**File**: `tests/e2e/settings/profile-view.spec.ts` (new file)
**Description**: Write Playwright test for profile viewing in settings (E2E-003 from e2e-test-plan.md)
**Details**:

- Test TR-003: User can navigate to settings and view profile
- Test settings tab navigation (Profile, Preferences, Account)
- Verify all profile fields display correctly
- Verify read-only fields (email from Clerk)
- Test URL updates with tab changes
- Test keyboard navigation (ARIA)
**Reference**: e2e-test-plan.md E2E-003, quickstart scenario 11
**Expected**: Test should FAIL initially (settings pages don't exist yet)

### T070 [P] Write profile editing E2E test

**File**: `tests/e2e/settings/profile-edit.spec.ts` (new file)
**Description**: Write Playwright test for profile editing (E2E-004 from e2e-test-plan.md)
**Details**:

- Test TR-004, TR-010: User can edit profile fields and save changes
- Test validation errors display correctly
- Test success message after save
- Verify database persistence of changes
- Test form interaction performance (<500ms)
- Test validation: displayName max length, enum values
**Reference**: e2e-test-plan.md E2E-004, quickstart scenario 12
**Expected**: Test should FAIL initially (settings pages don't exist yet)

### T071 [P] Write auth enforcement E2E test

**File**: `tests/e2e/auth/auth-enforcement.spec.ts` (new file)
**Description**: Write Playwright test for authentication enforcement (E2E-005 from e2e-test-plan.md)
**Details**:

- Test TR-005: Unauthenticated users redirected from protected pages
- Test /dashboard requires auth
- Test /settings requires auth
- Test /settings/profile requires auth
- Verify redirect to Clerk sign-in with return URL
- Test post-login redirect to original destination
**Reference**: e2e-test-plan.md E2E-005, quickstart scenario 13
**Expected**: Test should FAIL initially (auth enforcement not complete)

### T072 [P] Write authorization enforcement E2E test

**File**: `tests/e2e/auth/authorization.spec.ts` (new file)
**Description**: Write Playwright test for authorization enforcement (E2E-006 from e2e-test-plan.md)
**Details**:

- Test TR-006: Users cannot access other users' data
- Test API returns 403 for cross-user profile access
- Test API returns 403 for cross-user settings access
- Test API returns 403 for cross-user dashboard access
- Verify no data leakage in error responses
**Reference**: e2e-test-plan.md E2E-006, quickstart scenario 8
**Expected**: Test should FAIL initially (authorization checks not complete)

### T073 [P] Write first-time user flow E2E test

**File**: `tests/e2e/profile/first-time-flow.spec.ts` (new file)
**Description**: Write Playwright test for first-time user complete flow (E2E-007 from e2e-test-plan.md)
**Details**:

- Test TR-007: Clerk login → profile setup → dashboard
- Test new user sees profile setup form
- Test profile completion sets profileSetupCompleted flag
- Test redirect to dashboard after profile completion
- Test can skip profile setup and access dashboard
- Verify full end-to-end flow timing
**Reference**: e2e-test-plan.md E2E-007, quickstart scenarios 2, 3
**Expected**: Test should FAIL initially (profile setup page doesn't exist yet)

### T074 [P] Write returning user flow E2E test

**File**: `tests/e2e/profile/returning-user.spec.ts` (new file)
**Description**: Write Playwright test for returning user flow (E2E-008 from e2e-test-plan.md)
**Details**:

- Test TR-008: Clerk login → dashboard (skip profile setup)
- Test returning user (profileSetupCompleted=true) goes directly to dashboard
- Test no profile setup prompt for returning users
- Test user can access settings to update profile later
- Verify dashboard loads with existing user data
**Reference**: e2e-test-plan.md E2E-008, quickstart scenario 9
**Expected**: Test should FAIL initially (redirect logic not complete)

### T075 [P] Write settings navigation E2E test

**File**: `tests/e2e/settings/navigation.spec.ts` (new file)
**Description**: Write Playwright test for settings tab navigation (E2E-009 from e2e-test-plan.md)
**Details**:

- Test tab navigation between Profile, Preferences, Account
- Test URL updates correctly for each tab
- Test active tab indicator
- Test keyboard navigation works
- Test settings page load performance (<800ms)
- Test preferences form displays all fields
**Reference**: e2e-test-plan.md E2E-009, quickstart scenario 11
**Expected**: Test should FAIL initially (settings tabs not complete)

### T076 [P] Write validation errors E2E test

**File**: `tests/e2e/profile/validation.spec.ts` (new file)
**Description**: Write Playwright test for validation error handling (E2E-010 from e2e-test-plan.md)
**Details**:

- Test TR-010: Validation errors display correctly
- Test displayName max length validation
- Test dndEdition max length validation
- Test enum value validation (experienceLevel, primaryRole)
- Test inline error messages appear
- Test form field highlighting on error
- Test error messages clear after correction
**Reference**: e2e-test-plan.md E2E-010, quickstart scenario 7, scenario 12
**Expected**: Test should FAIL initially (validation UI not complete)

### T077 Run all E2E tests to verify initial failure

**Command**: `npm run test:e2e`
**Description**: Confirm all E2E tests fail before full implementation
**Expected**: All E2E tests fail because flows not fully implemented

### T078 [P] Write profile setup E2E test (original scenario)

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

---

## Phase 3.12: Integration & Polish

### T079 Wire up profile setup redirect logic

**File**: `src/middleware.ts` or layout component
**Description**: Add conditional redirect to /profile-setup for first login
**Details**:

- Check user.profileSetupCompleted flag
- If false and first login: redirect to /profile-setup
- If false and not first login: show optional banner reminder
- Allow access to /settings/profile regardless of completion status
**Max Lines**: 50 lines addition

### T080 Run all E2E tests to verify they pass

**Command**: `npm run test:e2e`
**Description**: Verify all E2E tests pass after full implementation
**Expected**: All E2E tests should PASS (10+ E2E tests covering all TR requirements)

### T081 Optimize dashboard metrics loading

**Description**: Add caching and optimization for dashboard metrics
**Details**:

- Add React Query for dashboard data fetching
- Implement loading states for dashboard components
- Add error boundaries for component failures
- Optimize database queries in dashboardService
- Add metrics caching (5 minute TTL)
**Max Lines**: Review existing files, extract utilities if needed

### T082 Add settings state management

**Description**: Implement optimistic updates for settings changes
**Details**:

- Add React Query mutations for settings updates
- Implement optimistic UI updates for preference changes
- Add rollback on API failure
- Show loading states during updates
**Max Lines**: Review existing files, add hooks if needed

### T083 Run full test suite

**Command**: `npm run test:ci`
**Description**: Run complete test suite to verify all tests pass
**Details**:

- Unit tests: Validations, models, services, utilities, components
- Integration tests: API routes, webhooks, dashboard, settings
- E2E tests: Complete user flows (10+ scenarios)
**Expected**: 100% pass rate, 80%+ coverage on touched files

### T084 Run Codacy analysis

**Command**: `codacy-cli analyze --directory /home/doug/ai-dev-1/dnd-tracker`
**Description**: Run full Codacy scan with pagination for entire codebase
**Details**:

- Check for new code quality issues
- Check for security vulnerabilities
- Check for code duplication
- Verify no files exceed 450 lines (uncommented)
- Verify no functions exceed 50 lines
- Address all findings before proceeding

### T085 [P] Manual testing with quickstart scenarios

**File**: `specs/002-when-a-user/quickstart.md`
**Description**: Execute all 13 quickstart scenarios manually
**Details**:

- Scenario 1: New user registration via Clerk
- Scenario 2: First-time profile setup
- Scenario 3: Skip profile setup
- Scenario 4: Update profile in settings
- Scenario 5: Usage metrics tracking
- Scenario 6: Clerk user update sync
- Scenario 7: Profile validation errors
- Scenario 8: Authorization checks
- Scenario 9: User login and dashboard access
- Scenario 10: Dashboard usage metrics display
- Scenario 11: Settings navigation and profile viewing
- Scenario 12: Settings profile editing and validation
- Scenario 13: Unauthenticated access protection
**Expected**: All scenarios should work as documented

### T086 Run build and verify no errors

**Command**: `npm run build`
**Description**: Verify production build succeeds without errors
**Expected**: Build completes successfully, no TypeScript errors

### T087 Run linters and fix issues

**Command**: `npm run lint:fix && npm run lint:markdown:fix`
**Description**: Run ESLint and Markdown linters, auto-fix issues
**Expected**: No linter errors remaining

### T088 Code review and refactoring

**Description**: Review all changes for code quality and constitutional compliance
**Details**:

- Check for code duplication → extract to utilities
- Verify all files under 450 lines
- Verify all functions under 50 lines
- Check test coverage meets 80%+ on touched files
- Ensure no sensitive data in code or tests
- Verify proper error handling and logging
- Review dashboard and settings performance targets met

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

Dashboard Layer (T031-T050)
├─ T031 [P] ─┐
├─ T032 [P] ─┤
├─ T034 [P] ─┤
├─ T035 [P] ─┤
├─ T037 [P] ─┤
└─ T038 [P] ─┴─→ T033 → T036 → T039 → T040 [P] → T041 → T042 → T043
              → T044 [P] → T045 [P] → T046 → T047 → T048 → T049
              → T050 (depends on T043, T047, T048)

Settings Layer (T051-T066)
└─ T051 [P] → T052 → T053 → T054 → T055
   → T056 [P] → T057 [P] → T058 → T059 → T060 → T061
   → T062 → T063 → T064 → T065 → T066

E2E Tests (T067-T078)
├─ T067 [P] (depends on T050) ─┐
├─ T068 [P] (depends on T050) ─┤
├─ T069 [P] (depends on T063) ─┤
├─ T070 [P] (depends on T063) ─┤
├─ T071 [P] ─────────────────┤
├─ T072 [P] ─────────────────┤
├─ T073 [P] (depends on T029) ─┤
├─ T074 [P] (depends on T050) ─┤
├─ T075 [P] (depends on T062) ─┤
└─ T076 [P] (depends on T063) ─┴─→ T077 → T078 [P] (depends on T029, T030, T063)

Polish (T079-T088)
└─ T079 → T080 → T081 → T082 → T083 → T084 → T085 [P] → T086 → T087 → T088
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

### Round 6: Dashboard Utilities (After T030)

```bash
# Can run in parallel - different utility files
T031: Create subscription utilities in src/lib/utils/subscription.ts
T032: Write subscription tests in tests/unit/lib/utils/subscription.test.ts
T034: Create metrics utilities in src/lib/utils/metrics.ts
T035: Write metrics tests in tests/unit/lib/utils/metrics.test.ts
T037: Create dashboard service in src/lib/services/dashboardService.ts
T038: Write dashboard service tests in tests/unit/lib/services/dashboardService.test.ts
```

### Round 7: Dashboard API (After T039)

```bash
# Can run in parallel - test file separate from implementation
T040: Write dashboard API tests in tests/integration/api/dashboard/metrics.test.ts
```

### Round 8: Dashboard Components (After T043)

```bash
# Can run in parallel - different component test files
T044: Write DashboardHeader tests in tests/unit/components/dashboard/DashboardHeader.test.tsx
T045: Write UsageMetrics tests in tests/unit/components/dashboard/UsageMetrics.test.tsx
```

### Round 9: Settings Layer (After T050)

```bash
# Can run in parallel - different test files
T051: Write settings API tests in tests/integration/api/users/settings.test.ts
T056: Write settings tabs tests in tests/unit/components/settings/SettingsTabs.test.tsx
T057: Write preferences tab tests in tests/unit/components/settings/PreferencesTab.test.tsx
```

### Round 10: E2E Tests (After T066)

```bash
# Can run in parallel - all E2E test files independent
T067: Write login flow E2E test in tests/e2e/auth/login.spec.ts
T068: Write dashboard access E2E test in tests/e2e/dashboard/dashboard.spec.ts
T069: Write profile viewing E2E test in tests/e2e/settings/profile-view.spec.ts
T070: Write profile editing E2E test in tests/e2e/settings/profile-edit.spec.ts
T071: Write auth enforcement E2E test in tests/e2e/auth/auth-enforcement.spec.ts
T072: Write authorization E2E test in tests/e2e/auth/authorization.spec.ts
T073: Write first-time flow E2E test in tests/e2e/profile/first-time-flow.spec.ts
T074: Write returning user E2E test in tests/e2e/profile/returning-user.spec.ts
T075: Write settings navigation E2E test in tests/e2e/settings/navigation.spec.ts
T076: Write validation errors E2E test in tests/e2e/profile/validation.spec.ts
T078: Write profile setup E2E test in tests/e2e/profile-setup.spec.ts
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

- **Total Tasks**: 88 tasks across all phases (T001-T088)
- **Original Scope**: T001-T030 (Profile management - 30 tasks)
- **Dashboard Layer**: T031-T050 (Dashboard with metrics - 20 tasks)
- **Settings Layer**: T051-T066 (Settings with tabs - 16 tasks)
- **E2E Testing**: T067-T078 (Comprehensive E2E coverage - 12 tasks)
- **Polish**: T079-T088 (Integration and optimization - 10 tasks)
- **Parallel Opportunities**: 40+ tasks marked [P] can run concurrently
- **TDD Enforced**: Every implementation task has a test task that must run first
- **Estimated Effort**: 5-7 days with TDD approach (original: 2-3 days)
- **File Count**: ~45 new files (tests, components, API routes, services, utilities, pages)
- **E2E Test Files**: 11 comprehensive Playwright test files covering all TR requirements
- **Performance Targets**: Dashboard <1.5s, Settings <800ms, Form interactions <500ms
- **Reference Implementation**: `/home/doug/ai-dev-2/dnd-tracker-next-js` for patterns

**Ready for execution**: All tasks are specific, actionable, and follow constitutional principles ✅
