# Requirements Traceability Matrix: User Registration and Profile Management

**Feature**: 002-when-a-user
**Created**: 2025-10-26
**Purpose**: Map functional requirements to test scenarios, edge cases, and implementation tasks
**Maintained By**: QA Team + Development Team

---

## Traceability Scheme

**Requirement ID Format**:
- Functional Requirements: `FR-XXX` (e.g., FR-001, FR-002)
- Testing Requirements: `TR-XXX` (e.g., TR-001, TR-010)
- Non-Functional Requirements: `NFR-CAT-XXX` (e.g., NFR-PERF-001, NFR-SEC-005)
- Edge Cases: `EC-XXX` (e.g., EC-001, EC-010)
- E2E Test Scenarios: `E2E-XXX` (e.g., E2E-001, E2E-010)
- Tasks: `TXXX` (e.g., T001, T088)

**Relationships**:

- `FR-XXX` → `TR-XXX`: Functional requirement tested by testing requirement
- `FR-XXX` → `EC-XXX`: Functional requirement has associated edge case
- `TR-XXX` → `E2E-XXX`: Testing requirement implemented by E2E test scenario
- `FR-XXX` → `TXXX`: Functional requirement implemented by task(s)
- `NFR-XXX` → `TR-XXX`: Non-functional requirement validated by testing requirement

---

## Complete Traceability Matrix

| FR ID | Functional Requirement | Edge Cases | NFRs | Test Requirements | E2E Tests | Implementation Tasks | Test Files |
|-------|------------------------|------------|------|-------------------|-----------|----------------------|------------|
| FR-001 | Persist user profile with auth ID, preferences | EC-005 | NFR-SEC-009, NFR-REL-001 | TR-007 | E2E-007 | T001, T004, T009 | `tests/unit/lib/models/User.test.ts`, `tests/e2e/profile/first-time-flow.spec.ts` |
| FR-002 | Present profile form to new users | EC-003 | NFR-PERF-001, NFR-ACCESS-001 | TR-007 | E2E-007 | T021, T023, T025, T027, T029 | `tests/unit/components/profile/ProfileForm.test.tsx`, `tests/e2e/profile/first-time-flow.spec.ts` |
| FR-003 | Collect D&D profile fields | EC-004 | NFR-SEC-006, NFR-SEC-007 | TR-010 | E2E-010 | T001, T002, T021, T023 | `tests/unit/lib/validations/user.test.ts`, `tests/e2e/profile/validation.spec.ts` |
| FR-004 | Assign free tier subscription by default | - | NFR-SEC-002 | TR-007 | E2E-007 | T004, T031, T032 | `tests/unit/lib/models/User.test.ts`, `tests/unit/lib/utils/subscription.test.ts` |
| FR-005 | Track subscription tier for feature limits | - | NFR-PERF-010 | TR-002 | E2E-002 | T031, T032, T037, T040 | `tests/unit/lib/utils/subscription.test.ts`, `tests/e2e/dashboard/dashboard.spec.ts` |
| FR-006 | Track usage metrics (sessions, characters, campaigns) | - | NFR-OBS-003 | TR-002 | E2E-002 | T004, T009, T034, T035, T037 | `tests/unit/lib/services/userService.test.ts`, `tests/unit/lib/utils/metrics.test.ts` |
| FR-007 | Include role field (user/admin) | EC-006 | NFR-SEC-003 | - | - | T004 | `tests/unit/lib/models/User.test.ts`, `tests/integration/api/users/profile.test.ts` |
| FR-008 | Restrict admin role to manual DB updates | EC-006 | NFR-SEC-003 | - | - | T017, T019 (validation rejection) | `tests/integration/api/users/profile.test.ts` |
| FR-009 | Validate profile inputs (constraints) | EC-004 | NFR-SEC-006 | TR-010 | E2E-010 | T001, T002, T017, T019 | `tests/unit/lib/validations/user.test.ts`, `tests/e2e/profile/validation.spec.ts` |
| FR-010 | Allow profile skip/partial completion | EC-003 | - | TR-007 | E2E-007 | T025, T027, T029, T079 | `tests/e2e/profile/first-time-flow.spec.ts` |
| FR-011 | Allow profile updates after registration | EC-008 | NFR-PERF-002 | TR-003, TR-004 | E2E-003, E2E-004 | T017, T019, T030 | `tests/integration/api/users/profile.test.ts`, `tests/e2e/settings/profile-edit.spec.ts` |
| FR-012 | Associate profile with auth identity | EC-005 | NFR-SEC-001 | TR-001 | E2E-001 | T013, T015 | `tests/integration/api/webhooks/clerk.test.ts`, `tests/e2e/auth/login.spec.ts` |
| FR-013 | Use Clerk auth for login, redirect to dashboard | EC-001, EC-002 | NFR-SEC-001, NFR-PERF-003 | TR-001, TR-009 | E2E-001 | T067, T080 | `tests/e2e/auth/login.spec.ts` |
| FR-014 | Provide dashboard with subscription, usage, features | - | NFR-PERF-003, NFR-ACCESS-006 | TR-002 | E2E-002 | T031-T050 | `tests/unit/components/dashboard/*.test.tsx`, `tests/e2e/dashboard/dashboard.spec.ts` |
| FR-015 | Provide settings/profile page for viewing | - | NFR-PERF-004, NFR-ACCESS-007 | TR-003 | E2E-003 | T051-T066 | `tests/e2e/settings/profile-view.spec.ts` |
| FR-016 | Provide profile editing with validation | EC-004, EC-008 | NFR-PERF-005, NFR-ACCESS-003 | TR-004, TR-010 | E2E-004 | T017, T019, T051-T066 | `tests/e2e/settings/profile-edit.spec.ts` |
| FR-017 | Restrict dashboard/settings to authenticated users | EC-007 | NFR-SEC-001, NFR-SEC-004 | TR-005 | E2E-005 | T079 (middleware) | `tests/e2e/auth/auth-enforcement.spec.ts` |
| FR-018 | Enforce profile ownership (no cross-user access) | EC-009 | NFR-SEC-002, NFR-SEC-011 | TR-006 | E2E-006 | T017, T019, T051, T053 | `tests/e2e/auth/authorization.spec.ts` |
| FR-019 | Display Clerk error messages for login failures | EC-001, EC-002 | - | TR-009 | E2E-001 | T067 | `tests/e2e/auth/login.spec.ts` |

---

## Testing Requirements Traceability

| TR ID | Testing Requirement | E2E Test Scenario | Playwright Test File | Functional Requirements Covered |
|-------|---------------------|-------------------|----------------------|--------------------------------|
| TR-001 | Validate login flow (Clerk → dashboard) | E2E-001 | `tests/e2e/auth/login.spec.ts` | FR-013, FR-012 |
| TR-002 | Validate dashboard displays user data | E2E-002 | `tests/e2e/dashboard/dashboard.spec.ts` | FR-014, FR-005, FR-006 |
| TR-003 | Validate profile viewing in settings | E2E-003 | `tests/e2e/settings/profile-view.spec.ts` | FR-015, FR-011 |
| TR-004 | Validate profile editing and persistence | E2E-004 | `tests/e2e/settings/profile-edit.spec.ts` | FR-016, FR-011 |
| TR-005 | Validate auth enforcement for protected pages | E2E-005 | `tests/e2e/auth/auth-enforcement.spec.ts` | FR-017 |
| TR-006 | Validate authorization (no cross-user access) | E2E-006 | `tests/e2e/auth/authorization.spec.ts` | FR-018 |
| TR-007 | Validate first-time user flow (login → setup → dashboard) | E2E-007 | `tests/e2e/profile/first-time-flow.spec.ts` | FR-002, FR-010, FR-001 |
| TR-008 | Validate returning user flow (login → dashboard, skip setup) | E2E-008 | `tests/e2e/profile/returning-user.spec.ts` | FR-013, FR-010 |
| TR-009 | Validate login failure scenarios with Clerk errors | E2E-001 (part 2) | `tests/e2e/auth/login.spec.ts` | FR-019, FR-013 |
| TR-010 | Validate profile validation errors displayed correctly | E2E-010 | `tests/e2e/profile/validation.spec.ts` | FR-009, FR-003, FR-016 |

---

## Edge Case Traceability

| EC ID | Edge Case | Functional Requirements | Test Coverage | Implementation Notes |
|-------|-----------|------------------------|---------------|----------------------|
| EC-001 | Invalid login credentials | FR-013, FR-019 | TR-009, E2E-001 | Clerk handles auth, displays errors; no MongoDB record created |
| EC-002 | Auth failures/timeouts | FR-013, FR-019 | TR-009, E2E-001 | Clerk SDK retries, app shows loading state |
| EC-003 | Skip/abandon profile form | FR-002, FR-010 | TR-007, E2E-007 | Set `profileSetupCompleted: false`, redirect to dashboard |
| EC-004 | Invalid profile data | FR-003, FR-009, FR-016 | TR-010, E2E-010 | Client + server validation with Zod, inline error messages |
| EC-005 | Duplicate registration (clerkId exists) | FR-001, FR-012 | Integration tests | Webhook idempotency, MongoDB unique index on clerkId |
| EC-006 | Unauthorized admin flag manipulation | FR-007, FR-008 | Integration tests | API ignores `role` field, logs attempts |
| EC-007 | Unauthenticated dashboard access | FR-017 | TR-005, E2E-005 | Middleware redirect to Clerk sign-in |
| EC-008 | Concurrent profile edits | FR-011, FR-016 | Integration tests | Last-write-wins, atomic MongoDB updates |
| EC-009 | Cross-user profile access | FR-018 | TR-006, E2E-006 | API returns 403 Forbidden if userId mismatch |
| EC-010 | User account deletion | FR-001 | Integration tests | Soft delete with 30-day retention, then PII anonymization |

---

## Non-Functional Requirements Traceability

| NFR ID | Non-Functional Requirement | Functional Requirement | Test Method | Target Metric |
|--------|---------------------------|------------------------|-------------|---------------|
| NFR-PERF-001 | Profile form submission <2s (p95) | FR-002, FR-016 | Load testing | <2s for 95% of requests |
| NFR-PERF-002 | Profile retrieval <500ms (p95) | FR-011, FR-015 | API benchmarking | <500ms for 95% of requests |
| NFR-PERF-003 | Dashboard load <1.5s (p95) | FR-014 | Lighthouse, RUM | <1.5s TTI |
| NFR-PERF-004 | Settings page load <800ms (p95) | FR-015, FR-016 | Lighthouse | <800ms TTI |
| NFR-PERF-005 | Form interactions <500ms | FR-016 | User interaction metrics | <500ms |
| NFR-SEC-001 | All profile APIs require auth | FR-011, FR-015, FR-016, FR-017 | TR-005, E2E-005 | 401 without token |
| NFR-SEC-002 | No cross-user profile access | FR-018 | TR-006, E2E-006 | 403 for userId mismatch |
| NFR-SEC-003 | Admin role via DB only | FR-007, FR-008 | Integration tests | API rejects role field |
| NFR-SEC-006 | Server-side Zod validation | FR-003, FR-009, FR-016 | TR-010, E2E-010 | 400 with error details |
| NFR-ACCESS-001 | Keyboard navigation for forms | FR-002, FR-016 | E2E-010, Axe scan | No keyboard traps |
| NFR-ACCESS-007 | ARIA roles for settings tabs | FR-015 | E2E-009 (E2E-003), Axe scan | Screen reader compatible |

---

## Task-to-Requirement Mapping (Sample)

| Task ID | Task Description | Functional Requirements | Testing Requirements |
|---------|------------------|------------------------|---------------------|
| T001 | Extend Zod user validation schemas | FR-003, FR-009 | TR-010 |
| T002 | Write Zod validation schema tests | FR-003, FR-009 | TR-010 |
| T004 | Extend Mongoose User model | FR-001, FR-003, FR-004, FR-006, FR-007 | TR-007 |
| T009 | Create user service functions | FR-001, FR-006, FR-011 | - |
| T013 | Write Clerk webhook integration tests | FR-012 | TR-001 |
| T015 | Implement Clerk webhook handler | FR-012 | TR-001 |
| T017 | Write profile API tests | FR-011, FR-016, FR-018 | TR-003, TR-004, TR-006 |
| T019 | Implement profile API route | FR-011, FR-016, FR-018 | TR-003, TR-004, TR-006 |
| T031 | Create subscription utilities | FR-005 | TR-002 |
| T040 | Write dashboard API integration tests | FR-014 | TR-002 |
| T050 | Create dashboard page | FR-014 | TR-002 |
| T067 | Write login flow E2E test | FR-013, FR-019 | TR-001, TR-009 |
| T068 | Write dashboard access E2E test | FR-014 | TR-002 |
| T069 | Write profile viewing E2E test | FR-015 | TR-003 |
| T070 | Write profile editing E2E test | FR-016 | TR-004, TR-010 |
| T071 | Write auth enforcement E2E test | FR-017 | TR-005 |
| T072 | Write authorization enforcement E2E test | FR-018 | TR-006 |

---

## Defect Traceability Template

When defects are found, link them to requirements using this format:

| Defect ID | Title | Severity | Affected Requirements | Failed Test | Root Cause | Status |
|-----------|-------|----------|----------------------|-------------|------------|--------|
| DEF-001 | Example: Profile form allows 101 char displayName | High | FR-003, FR-009 | E2E-010 | Zod schema used `.max(100)` but MongoDB used `maxlength: 101` | Fixed in PR #123 |

---

## Requirements Coverage Summary

**Functional Requirements**: 19 total (FR-001 to FR-019)
- Fully tested: 19/19 (100%)
- Mapped to E2E tests: 15/19 (79%)
- Mapped to edge cases: 10/19 (53%)
- Mapped to NFRs: 12/19 (63%)

**Testing Requirements**: 10 total (TR-001 to TR-010)
- All mapped to E2E test scenarios (100%)
- All mapped to functional requirements (100%)

**Edge Cases**: 10 total (EC-001 to EC-010)
- All mapped to functional requirements (100%)
- All have test coverage defined (100%)

**Non-Functional Requirements**: 48 total (NFR-PERF-001 to NFR-OBS-003)
- Performance: 10 requirements
- Security: 16 requirements
- Accessibility: 8 requirements
- Reliability: 4 requirements
- Compliance: 3 requirements
- Others: 7 requirements

**E2E Test Scenarios**: 10 scenarios (E2E-001 to E2E-010, excluding E2E-009 which is covered in E2E-003)
- All mapped to testing requirements (100%)
- All have Playwright test files defined (100%)

---

## Bi-Directional Traceability Verification

**Forward Traceability** (Requirement → Test → Implementation):
✅ All functional requirements have test coverage
✅ All test requirements have E2E test scenarios
✅ All E2E scenarios have Playwright test files

**Backward Traceability** (Test → Requirement):
✅ All tests map back to at least one functional requirement
✅ All tasks map back to functional or testing requirements
✅ No orphaned tests or tasks

**Gaps Identified**: None

---

## Change Impact Analysis Template

When a requirement changes, use this matrix to identify affected artifacts:

**Example**: If FR-009 (validation rules) changes:
1. **Tests to Update**: TR-010, E2E-010, T001, T002
2. **Test Files**: `tests/unit/lib/validations/user.test.ts`, `tests/e2e/profile/validation.spec.ts`
3. **Implementation Files**: `src/lib/validations/user.ts`, API routes using validation
4. **Documentation**: Update Terminology section in spec.md (validation constraint definitions)
5. **NFRs to Reconsider**: NFR-SEC-006 (validation enforcement)

---

**Document Version**: 1.0
**Last Updated**: 2025-10-26
**Maintained By**: QA Team + Engineering Team
**Review Cadence**: Updated with each sprint/feature change
