# Tasks: User Profile & Settings Pages (F010)

**Feature**: F010 - User Profile & Settings Pages  
**Branch**: `feature/010-user-profile-settings`  
**Status**: Ready for Implementation  
**Total Tasks**: 42  
**Estimated Duration**: 18–24 hours (compressed to ~2 days with parallel work)

---

## Overview

This checklist breaks down Feature 010 into executable tasks organized by implementation phase. Each task is independently testable and includes a specific file path. Tasks marked `[P]` can be parallelized; tasks with story labels `[USX]` are assigned to specific user stories.

**Structure**:

- **Phase 1**: Setup (project initialization)
- **Phase 2**: Foundational (schemas, validation, data layer)
- **Phase 3**: User Story 1 - View User Profile (P1)
- **Phase 4**: User Story 2 - Edit Profile Preferences (P1)
- **Phase 5**: User Story 3 - Access Settings Page (P1)
- **Phase 6**: User Story 4 - Configure Notifications (P2)
- **Phase 7**: User Story 5 - Data Export (P2)
- **Phase 8**: E2E Tests & Polish

---

## Phase 1: Setup

- [x] T001 Create project structure per implementation plan in `src/lib/`, `src/components/`, `src/types/`, `tests/`

---

## Phase 2: Foundational — Schemas, Validation & Data Layer (TDD-First)

### Zod Schemas (Tests → Implementation)

- [x] T002 Write failing tests for Zod schemas in `tests/unit/schemas/userSchema.test.ts` (valid/invalid email, name length, enum validation)
- [x] T003 Implement Zod schemas in `src/lib/schemas/userSchema.ts` (userProfileSchema, userPreferencesSchema, notificationSettingsSchema, update schemas)

### Validation Utilities (Tests → Implementation)

- [x] T004 Write failing tests for validation utilities in `tests/unit/lib/userValidation.test.ts` (parseEmail, validateName, validatePreferences functions)
- [x] T005 Implement validation utilities in `src/lib/validation/userValidation.ts` (helper functions for client-side validation)

### Type Definitions

- [x] T006 [P] Create User, Profile, Preferences, Notifications TypeScript interfaces in `src/types/user.ts`

### Mock Data Adapter (Tests → Implementation)

- [x] T007 Write failing tests for mock adapter in `tests/integration/adapters/userAdapter.test.ts` (getProfile, updateProfile, getPreferences, updatePreferences, getNotifications, updateNotifications, error paths)
- [x] T008 Implement mock adapter in `src/lib/adapters/userAdapter.ts` (localStorage-backed CRUD operations, network delay simulation)

### Form Helpers (Tests → Implementation)

- [x] T009 Write failing tests for form helpers in `tests/unit/lib/profileFormHelpers.test.ts` (optimistic state, error recovery, form reset utilities)
- [x] T010 Implement form helpers in `src/lib/utils/profileFormHelpers.ts` (optimistic update logic, error handling, form state utilities)

---

## Phase 3: User Story 1 — View User Profile (P1)

### ProfilePage Component Tests (TDD-First)

- [ ] T011 [P] [US1] Write failing tests for ProfilePage in `tests/unit/components/profile/ProfilePage.test.tsx` (renders skeleton while loading, renders form on success, renders error banner on failure, renders empty state for new users, retry button works)

### ProfilePage Component Implementation

- [ ] T012 [P] [US1] Implement ProfilePage component in `src/components/profile/ProfilePage.tsx` (root container with data fetching, conditional rendering of loader/form/error/empty states)

### ProfileLoader Component (Skeleton)

- [ ] T013 [P] [US1] Write failing test for ProfileLoader skeleton in `tests/unit/components/profile/ProfileLoader.test.tsx` (verifies skeleton structure displays)
- [ ] T014 [P] [US1] Implement ProfileLoader skeleton component in `src/components/profile/ProfileLoader.tsx` (visual skeleton/shimmer while loading)

### ProfileError Component (Error Banner)

- [ ] T015 [P] [US1] Write failing test for ProfileError banner in `tests/unit/components/profile/ProfileError.test.tsx` (verifies error message and retry button render)
- [ ] T016 [P] [US1] Implement ProfileError banner component in `src/components/profile/ProfileError.tsx` (error message display, retry button handler)

### ProfileEmpty Component (Empty State)

- [ ] T017 [P] [US1] Write failing test for ProfileEmpty in `tests/unit/components/profile/ProfileEmpty.test.tsx` (verifies guidance message displays for new users)
- [ ] T018 [P] [US1] Implement ProfileEmpty component in `src/components/profile/ProfileEmpty.tsx` (empty state message guiding users to configure settings)

---

## Phase 4: User Story 2 — Edit Profile Preferences (P1)

### ProfileForm Component (Editable Form with TDD)

- [ ] T019 [P] [US2] Write failing tests for ProfileForm in `tests/unit/components/profile/ProfileForm.test.tsx` (pre-populated fields, validation errors on blur, save button disabled during submission, success toast on save, error toast & form revert on failure, optimistic updates work)
- [ ] T020 [P] [US2] Implement ProfileForm component in `src/components/profile/ProfileForm.tsx` (editable form with name, email, preferences dropdowns; real-time validation; optimistic state management)

### Profile API Routes

- [ ] T021 [P] [US2] Implement GET/PUT `/api/user/profile` route in `src/app/api/user/profile/route.ts` (backed by mock adapter, returns/updates profile data)
- [ ] T022 [P] [US2] Implement GET/PUT `/api/user/preferences` route in `src/app/api/user/preferences/route.ts` (backed by mock adapter, returns/updates preferences)

### Update Profile Page Route

- [ ] T023 Update `src/app/profile/page.tsx` to render ProfilePage component (replace NotImplementedPage placeholder)

---

## Phase 5: User Story 3 — Access Settings Page (P1)

### SettingsPage Component (Root Container with TDD)

- [ ] T024 [P] [US3] Write failing tests for SettingsPage in `tests/unit/components/settings/SettingsPage.test.tsx` (all sections render on page, tab/section navigation works, error boundary catches errors)
- [ ] T025 [P] [US3] Implement SettingsPage component in `src/components/settings/SettingsPage.tsx` (main container with section navigation, renders all settings sections)

### AccountSettings Component

- [ ] T026 [P] [US3] Write failing test for AccountSettings in `tests/unit/components/settings/AccountSettings.test.tsx` (verifies account info displays)
- [ ] T027 [P] [US3] Implement AccountSettings component in `src/components/settings/AccountSettings.tsx` (display account info read-only or with link to profile)

### PreferencesSettings Component

- [ ] T028 [P] [US3] Write failing tests for PreferencesSettings in `tests/unit/components/settings/PreferencesSettings.test.tsx` (dropdown selects render, save button persists changes, validation on save)
- [ ] T029 [P] [US3] Implement PreferencesSettings component in `src/components/settings/PreferencesSettings.tsx` (D&D preferences dropdown selects with save logic)

### Update Settings Page Route

- [ ] T030 Update `src/app/settings/page.tsx` to render SettingsPage component (replace NotImplementedPage placeholder)

---

## Phase 6: User Story 4 — Configure Notification Preferences (P2)

### NotificationSettings Component (Toggle Switches with TDD)

- [ ] T031 [P] [US4] Write failing tests for NotificationSettings in `tests/unit/components/settings/NotificationSettings.test.tsx` (toggle switches render, toggles change UI immediately, save button persists state)
- [ ] T032 [P] [US4] Implement NotificationSettings component in `src/components/settings/NotificationSettings.tsx` (toggle switches for email notifications, party updates, encounter reminders; optimistic updates)

### Notification API Route

- [ ] T033 [P] [US4] Implement GET/PUT `/api/user/notifications` route in `src/app/api/user/notifications/route.ts` (backed by mock adapter, returns/updates notification settings)

---

## Phase 7: User Story 5 — Data Export (P2)

### DataManagement Component (Export Button Stub with TDD)

- [ ] T034 [P] [US5] Write failing test for DataManagement in `tests/unit/components/settings/DataManagement.test.tsx` (export button visible, click handler called)
- [ ] T035 [P] [US5] Implement DataManagement component in `src/components/settings/DataManagement.tsx` (export button stub with placeholder handler for future F048 file download)

---

## Phase 8: E2E Tests & Polish

### E2E Tests (Playwright)

- [ ] T036 Write E2E profile workflow in `tests/e2e/profile-settings.spec.ts` (navigate to /profile, form loads with data, edit name/email, save, refresh page, verify changes persist, enter invalid email verify error, retry on error)
- [ ] T037 Write E2E settings workflow in `tests/e2e/profile-settings.spec.ts` (navigate to /settings, all sections visible, toggle notification preference, save, navigate away and back, verify state persists, error scenarios)

### Code Quality & Final Checks

- [ ] T038 Run code review checklist in all modified files (verify file size < 450 lines, functions < 50 lines, no `any` types, WCAG 2.1 AA accessibility compliance)
- [ ] T039 Run linting and formatting (`npm run lint:fix`, `npm run type-check`, `npm run lint:markdown:fix`)
- [ ] T040 Verify test coverage is 80%+ on new code by running `npm run test:ci:parallel` and reviewing `coverage/` report
- [ ] T041 Build verification (`npm run build` completes successfully with no errors)
- [ ] T042 Final integration test: Run full test suite (`npm run test:ci:parallel && npm run test:e2e`)

---

## Dependency Graph & Execution Order

### Critical Path (Must be Sequential)

```
T001 (Setup)
  ↓
T002-T005 (Zod Schemas + Validation)
  ↓
T006-T010 (Types + Adapter + Form Helpers)
  ↓
[Parallel Streams Start]
```

### Parallelization Strategy (After T010)

**Parallel Stream A** (Profile Implementation - US1 & US2):

```
T011-T018 (ProfilePage + sub-components - tests & implementations can run concurrently)
  ↓
T019-T020 (ProfileForm - test then implementation)
  ↓
T021-T022 (Profile & Preferences API routes)
  ↓
T023 (Update profile page route)
```

**Parallel Stream B** (Settings Implementation - US3, US4, US5):

```
T024-T025 (SettingsPage - test then implementation)
  ↓
T026-T029 (AccountSettings & PreferencesSettings - tests & implementations concurrent)
  ↓
T031-T032 (NotificationSettings - test then implementation)
  ↓
T034-T035 (DataManagement - test then implementation)
  ↓
T033 (Notifications API route)
  ↓
T030 (Update settings page route)
```

**Synchronized Checkpoint** (Both streams):

```
T036-T037 (E2E Tests)
  ↓
T038-T042 (Polish & Final Checks)
```

### Example 2-Developer Parallel Execution (Recommended)

**Developer 1** (4–5 hours):

- T001, T002-T005 (serial setup)
- T006-T010 (serial foundational)
- T011-T023 (ProfilePage stream: tests, components, ProfileForm, API routes)

**Developer 2** (4–5 hours, starts after T010):

- T024-T035 (SettingsPage stream: all settings sections, components, API routes)

**Both Together** (1–2 hours):

- T036-T037 (E2E tests)
- T038-T042 (Polish & verification)

**Total**: ~2 days with parallel work

---

## MVP Scope (Recommended for First Sprint)

**High-Value MVP** (Complete Tasks T001–T030):

- ✅ **US1**: View User Profile (T011–T018)
- ✅ **US2**: Edit Profile & Preferences (T019–T023)
- ✅ **US3**: Access Settings Page (T024–T030)
- ✅ All foundational infrastructure (T001–T010)

**Defer to Second Sprint**:

- Notification Preferences (US4) — T031–T033
- Data Export (US5) — T034–T035

This MVP delivers **70% of feature value** in **~12–14 hours** and unblocks user profile viewing/editing immediately.

---

## Implementation Strategy

### TDD Cycle (Mandatory for All Test Tasks)

For each task involving tests (e.g., T002, T004, T007, T009, T011, etc.):

1. **Red Phase**: Write failing tests describing expected behavior
2. **Green Phase**: Implement minimal code to pass tests
3. **Refactor Phase**: Clean up, extract helpers, remove duplication
4. **Verify Phase**: Run tests, confirm 80%+ coverage

### File Size & Function Length Constraints

- **Max per file**: 450 lines (uncommented code)
- **Max per function**: 50 lines
- **Action if exceeded**: Extract helpers or split into sub-components immediately

### Testing Strategy per Phase

**Phase 2 (Data Layer - T002–T010)**:

- Target: 100% coverage (schemas, validation, adapter, helpers)
- Rationale: Small, critical modules; every branch must be tested

**Phase 3–7 (Components - T011–T035)**:

- Target: 80%+ coverage
- Use semantic selectors (getByRole, getByLabelText); avoid snapshots
- Cover happy path, validation errors, error states, edge cases

**Phase 8 (E2E - T036–T037)**:

- Test all user-facing workflows end-to-end
- Profile workflow: load → edit → save → refresh → verify
- Settings workflow: load → toggle → save → navigate → verify
- Error scenarios: network timeout, validation errors, retry success

### Validation & Error Messages

**Client-side** (profileFormHelpers, component-level):

- Real-time validation on field blur/change
- Inline error messages displayed immediately (< 200ms)
- Form inputs/buttons disabled during async operations

**Server-side** (API routes, mocked in F010, real in F014):

- Zod schema validation on request body
- 400 Bad Request with structured error details
- Consistent error response format across all endpoints

---

## Integration Checkpoints

### Checkpoint 1: Foundational Layer Complete (After T010)

**Verification Command**:

```bash
npm run test:ci:parallel -- tests/unit/schemas tests/unit/lib tests/integration/adapters
```

**Success Criteria**:

- ✅ All Zod schema tests pass
- ✅ All validation utility tests pass
- ✅ All adapter tests pass
- ✅ Coverage: 100% for schemas, 85%+ for adapter

### Checkpoint 2: ProfilePage Stream Complete (After T023)

**Verification**:

```bash
npm run test:ci:parallel -- tests/unit/components/profile tests/integration/adapters
```

**Manual Browser Test**:

- Navigate to `http://localhost:3000/profile`
- Verify skeleton loads, then data displays
- Edit form, click save, verify success toast
- Refresh page, verify changes persisted

**Success Criteria**:

- ✅ All profile component tests pass
- ✅ Coverage: 80%+ for profile components
- ✅ Browser test: form loads, edit, save, persist

### Checkpoint 3: SettingsPage Stream Complete (After T030)

**Verification**:

```bash
npm run test:ci:parallel -- tests/unit/components/settings
```

**Manual Browser Test**:

- Navigate to `http://localhost:3000/settings`
- Verify all sections render (Account, Preferences, Notifications, Data)
- Toggle notification switch, click save, verify success toast
- Refresh page, verify toggle state persisted

**Success Criteria**:

- ✅ All settings component tests pass
- ✅ Coverage: 80%+ for settings components
- ✅ Browser test: sections render, toggle works, persists

### Checkpoint 4: E2E Tests Complete (After T037)

**Verification**:

```bash
npm run test:e2e
```

**Success Criteria**:

- ✅ All E2E workflows pass
- ✅ Accessibility audit (axe-playwright) passes with no violations
- ✅ Error recovery tests pass (retry on failure)

### Checkpoint 5: Final Quality Gate (After T042)

**Verification Commands**:

```bash
npm run test:ci:parallel    # All unit/integration tests
npm run lint                # ESLint checks
npm run type-check          # TypeScript strict mode
npm run build               # Next.js build
npm run test:e2e            # All E2E tests
```

**Success Criteria**:

- ✅ All tests passing (unit, integration, E2E)
- ✅ Linting: No new issues
- ✅ TypeScript: No strict mode violations
- ✅ Build: Completes successfully
- ✅ Coverage: 80%+ on all new code
- ✅ Codacy analysis: No new critical/error issues
- ✅ Accessibility: WCAG 2.1 AA compliance verified

---

## Task Checklist Format Reference

Each task follows this strict format:

```
- [ ] [TaskID] [P?] [US#?] Description with exact file path
```

**Components Explained**:

- `[ ]` — Unchecked checkbox (mark as `[x]` when completed)
- `TaskID` — Sequential identifier from T001 to T042
- `[P]` — **Optional parallelization marker** (task can run concurrently with others; only if dependencies met)
- `[US#]` — **Optional story label** (US1, US2, US3, US4, US5; marks which user story owns this task)
- `Description` — Clear action (e.g., "Write failing test" or "Implement component")
- `File path` — Exact repository-relative path where changes will be made

**Example Interpretation**:

- `- [ ] T011 [P] [US1] Write failing tests... in tests/unit/components/profile/ProfilePage.test.tsx`
  - ID: T011
  - Parallelizable: Yes (marked [P])
  - User Story: US1 (View Profile)
  - Action: Write test
  - File: `tests/unit/components/profile/ProfilePage.test.tsx`

---

## Success Criteria (Feature Complete)

Feature 010 is considered **complete and ready for merge** when:

- ✅ All 42 tasks are checked off (completed)
- ✅ All unit tests passing: `npm run test:ci:parallel`
- ✅ All E2E tests passing: `npm run test:e2e`
- ✅ Test coverage: 80%+ on all new code (verified in `coverage/` report)
- ✅ TypeScript compilation: `npm run type-check` ✅ (no errors)
- ✅ Linting: `npm run lint` ✅ (no new issues)
- ✅ Build: `npm run build` ✅ (completes successfully)
- ✅ Code review checklist: All files reviewed
  - Max 450 lines per file (uncommented)
  - Max 50 lines per function
  - No `any` types in TypeScript
  - No code duplication (DRY principle)
- ✅ Accessibility: WCAG 2.1 AA compliance verified
  - Keyboard navigation tested (Tab, Shift+Tab, Enter)
  - ARIA labels present on form fields
  - axe-playwright audit passes with no violations
  - Screen reader compatibility verified
- ✅ Codacy analysis: No new critical or error-level issues
- ✅ Manual testing: Deployed to staging and tested by QA team
- ✅ PR approved by code reviewer
- ✅ All GitHub Actions CI/CD checks pass

---

## Notes for Implementation

### localStorage Mock Behavior (F010)

The mock adapter simulates realistic network behavior:

```typescript
// Simulate 500ms network delay to prevent race conditions
await new Promise(resolve => setTimeout(resolve, 500));
```

This ensures tests aren't flaky due to timing. After F014 (MongoDB integration), remove or reduce this delay.

### Form State & Optimistic Updates Pattern

All profile/settings forms follow this pattern:

```typescript
// 1. User clicks save
setFormState(newValues);  // ← UI updates immediately (optimistic)

// 2. Send to adapter/API
adapter.updateProfile(newValues)
  .then(() => {
    showSuccessToast();   // ← Success feedback
  })
  .catch((error) => {
    setFormState(previousValues);  // ← Revert on error
    showErrorToast(error.message);
  });
```

This provides instant feedback to users while ensuring consistency if the save fails.

### Component Organization Principle

Each component is modular and independently testable:

- **ProfileForm**, **NotificationSettings**, **PreferencesSettings**: Standalone components
- **Props**: Fully typed via TypeScript interfaces
- **State**: Local `useState`; adapter handles persistence
- **No global state**: Simplicity & testability

### Future Integration with F014 & F013

**After F014 (MongoDB User Model)**:

- Replace `src/lib/adapters/userAdapter.ts` with real MongoDB adapter
- Zod schemas reused for server-side validation
- API routes call Mongoose models instead of mock adapter
- localStorage fallback removed

**After F013 (Clerk Integration)**:

- Remove mock authentication fallback
- Extract `userId` from Clerk session headers
- Protect all routes with Clerk middleware
- Enable real user management features

---

## Estimated Timeline

| Phase | Tasks | Duration | Effort |
|-------|-------|----------|--------|
| 1: Setup | T001 | 15 min | Trivial |
| 2: Foundational | T002–T010 | 2–3 hrs | High (TDD) |
| 3: US1 View Profile | T011–T018 | 3–4 hrs | High (components) |
| 4: US2 Edit Profile | T019–T023 | 2–3 hrs | Medium (form + routes) |
| 5: US3 Settings Page | T024–T030 | 3–4 hrs | Medium (sections) |
| 6: US4 Notifications | T031–T033 | 1.5–2 hrs | Low (similar to profile) |
| 7: US5 Data Export | T034–T035 | 30 min | Very Low (stub) |
| 8: E2E & Polish | T036–T042 | 2–3 hrs | Medium (final checks) |
| **TOTAL** | **42 tasks** | **18–24 hrs** | **~2 days (parallel)** |

---

## Status & Next Steps

**Current Status**: ✅ Ready for Development

**Next Steps**:

1. Assign developers to parallel streams (recommended: 2 developers)
2. Begin **Phase 1** (T001) — project setup
3. Proceed sequentially through **Phase 2** (T002–T010) — foundational layer
4. After Phase 2 complete, parallelize **Phases 3–7** (profile + settings streams)
5. After both streams complete, execute **Phase 8** (E2E + polish)
6. Run final integration checkpoint (T042)
7. Merge to `main` and deploy to staging

**Estimated Completion**: 2–3 days (with 2-developer parallel effort)

---

**Tasks Specification Generated**: 2025-11-11  
**Based on**: `specs/010-user-profile-settings/plan.md`, `spec.md`, `data-model.md`  
**Author**: AI Agent (Speckit.tasks mode)  
**Review Status**: Ready for Implementation Review
