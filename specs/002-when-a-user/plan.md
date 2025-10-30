# Implementation Plan: User Registration and Profile Management (Enhanced)

**Branch**: `002-when-a-user-phase` | **Date**: 2025-10-25 | **Spec**: [spec.md](./spec.md)
**Input**: Enhanced feature specification from `/home/doug/ai-dev-1/dnd-tracker/specs/002-when-a-user/spec.md`
**Status**: Enhanced to include login flow, dashboard, settings with tabs, and comprehensive E2E testing

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path ✅
   → Feature spec loaded with enhancements
2. Fill Technical Context ✅
   → Next.js 15.5+, TypeScript 5.9+, Clerk 5.0+, MongoDB 8.0+
3. Fill Constitution Check section ✅
4. Evaluate Constitution Check ✅
   → PASS - No violations, mitigation strategies documented
5. Execute Phase 0 → research.md ✅ (COMPLETED)
6. Execute Phase 1 → contracts, data-model.md, quickstart.md ✅ (COMPLETED)
7. Execute Phase 1 Enhancement → Add dashboard, settings contracts ✅ (COMPLETED)
8. Create E2E test plan → e2e-test-plan.md ✅ (COMPLETED)
9. Update CLAUDE.md with new context ✅ (COMPLETED)
10. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS here. Phases 2-4 are executed by other commands.

## Summary

This feature implements comprehensive user registration and profile management for the D&D Tracker application. When users register through Clerk authentication, the system persists their information in MongoDB, creates a user profile with D&D-specific preferences, assigns the free subscription tier by default, and tracks usage metrics.

**Core Flows**:

1. **Authentication**: Users log in via existing Clerk integration (no custom login screen)
2. **First-Time Setup**: New users complete optional D&D profile form
3. **Dashboard**: Authenticated users access personalized dashboard with subscription tier, usage progress bars, statistics, and quick actions
4. **Profile Management**: Users view and edit profile through settings interface with tabs (Profile, Preferences, Account)
5. **Usage Tracking**: System tracks user activity against subscription limits

**New Enhancements** (2025-10-25):

- Login flow integration with Clerk (FR-013, FR-019)
- Enhanced dashboard with progress bars and usage statistics (FR-014)
- Settings section with tabbed interface (FR-015, FR-016)
- Authorization enforcement for protected pages (FR-017, FR-018)
- Comprehensive E2E test coverage (TR-001 to TR-010)

## Technical Context

**Language/Version**: TypeScript 5.9+ with strict mode
**Primary Dependencies**: Next.js 15.5+, React 19.0+, Mongoose 8.5+, Clerk 5.0+, Zod 4+
**Storage**: MongoDB 8.0+ with Mongoose ODM
**Testing**: Jest 29.7+ with React Testing Library 16.0+ (unit), Playwright 1.46+ (E2E)
**Target Platform**: Web application (Next.js App Router with server/client components)
**Project Type**: web (Next.js full-stack with App Router)
**Performance Goals**: <1.5s dashboard load for authenticated users, <500ms profile form interactions, <800ms settings page load
**Constraints**: 80%+ test coverage, max 450 lines per file, max 50 lines per function
**Scale/Scope**: User profile data model, Clerk webhook integration, profile form UI components, usage tracking infrastructure, dashboard with metrics visualization, settings interface with tabs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Quality Over Speed ✅

- TDD approach required: Tests before implementation
- All tests must pass before PR merge
- Full responsibility for quality and correctness
- E2E tests validate complete user flows

### Test-First Development ✅

- Write validation/model/API/component/E2E tests before implementation
- Red-Green-Refactor cycle enforced

### Remote Authority ✅

- Remote Codacy scans authoritative
- All findings addressed including pre-existing
- CI checks must pass before merge

### Complexity Reduction ✅

- Leverage existing User model from reference project
- Maximum 450 lines per file (uncommented)
- Maximum 50 lines per function
- Extract shared utilities for common operations
- Use shadcn/ui components for dashboard and settings UI

### Security & Standards ✅

- Clerk integration for secure authentication (no custom login)
- Input validation via Zod schemas
- TypeScript strict mode enforced
- 80%+ test coverage on touched code
- Authorization checks on all protected routes

**Initial Assessment**: PASS - No constitutional violations.

**Post-Enhancement Assessment**: PASS - Enhanced scope (dashboard, settings tabs) mitigated with component extraction and composition patterns.

## Project Structure

### Documentation (this feature)

```
specs/002-when-a-user/
├── plan.md              # This file (ENHANCED)
├── spec.md              # Feature specification (ENHANCED)
├── research.md          # Phase 0 output (COMPLETED)
├── data-model.md        # Phase 1 output (COMPLETED)
├── quickstart.md        # Phase 1 output (COMPLETED - Enhanced v2.0)
├── e2e-test-plan.md     # E2E test scenarios (NEW)
├── contracts/           # API contracts (COMPLETED)
│   ├── clerk-webhook.yaml     (COMPLETED)
│   ├── profile-api.yaml       (COMPLETED)
│   ├── dashboard-api.yaml     (COMPLETED)
│   └── settings-api.yaml      (COMPLETED)
├── checklists/
│   ├── requirements.md
│   └── qa-testability.md
└── tasks.md             # Phase 2 (/tasks command - TO BE UPDATED)
```

### Source Code (repository root)

```
src/
├── app/
│   ├── api/
│   │   ├── webhooks/clerk/route.ts      (EXISTING)
│   │   ├── users/[id]/profile/route.ts  (EXISTING)
│   │   └── dashboard/metrics/route.ts   (NEW)
│   ├── (auth)/profile-setup/page.tsx    (EXISTING)
│   ├── dashboard/page.tsx               (NEW)
│   └── settings/
│       ├── layout.tsx                   (NEW)
│       ├── page.tsx                     (NEW)
│       ├── profile/page.tsx             (NEW)
│       ├── preferences/page.tsx         (NEW)
│       └── account/page.tsx             (NEW)
├── components/
│   ├── dashboard/
│   │   ├── DashboardHeader.tsx          (NEW)
│   │   ├── UsageMetrics.tsx             (NEW)
│   │   ├── SubscriptionCard.tsx         (NEW)
│   │   ├── QuickActions.tsx             (NEW)
│   │   └── RecentActivity.tsx           (NEW)
│   ├── settings/
│   │   ├── SettingsTabs.tsx             (NEW)
│   │   ├── ProfileTab.tsx               (NEW)
│   │   ├── PreferencesTab.tsx           (NEW)
│   │   └── AccountTab.tsx               (NEW)
│   └── profile/
│       ├── ProfileForm.tsx              (EXISTING)
│       └── ProfileSetupWizard.tsx       (EXISTING)
├── lib/
│   ├── models/User.ts                   (EXISTING)
│   ├── validations/user.ts              (EXISTING)
│   ├── services/
│   │   ├── userService.ts               (EXISTING)
│   │   └── dashboardService.ts          (NEW)
│   └── utils/
│       ├── subscription.ts              (NEW)
│       └── metrics.ts                   (NEW)
└── types/
    ├── user.ts                          (EXISTING)
    └── dashboard.ts                     (NEW)

tests/
├── unit/ (15+ new test files)
├── integration/ (3+ new test files)
└── e2e/
    ├── auth/login.spec.ts               (NEW)
    ├── dashboard/dashboard.spec.ts      (NEW)
    ├── settings/*.spec.ts               (NEW - 3 files)
    └── profile-setup.spec.ts            (EXISTING)
```

**Structure Decision**: Next.js App Router full-stack with enhanced dashboard and settings sections using tabbed interface pattern via file-based routing.

## Phase 0: Outline & Research

**Status**: ✅ COMPLETED (see research.md)

**Additional Research Needed for Enhancements**:

1. **Dashboard Metrics Visualization**
   - Progress bar components for subscription limits
   - Usage statistics display patterns
   - Real-time vs cached dashboard data

2. **Settings Interface with Tabs**
   - Next.js App Router file-based tab routing
   - ARIA accessibility for tab navigation
   - URL-based tab state (/settings/profile, /settings/preferences)

**Action**: Update research.md with findings for dashboard and settings patterns.

## Phase 1: Design & Contracts

**Status**: ✅ COMPLETED (data-model.md) + 🔄 ENHANCEMENTS IN PROGRESS

### 1. Data Model - ✅ COMPLETED

Existing data model (see data-model.md) is sufficient. No additional fields required.

### 2. API Contracts - 🔄 TO BE ENHANCED

**Existing** (✅ COMPLETED):

- `contracts/clerk-webhook.yaml`
- `contracts/profile-api.yaml`

**NEW** (To be created):

**Dashboard Metrics API** (`contracts/dashboard-api.yaml`):

```yaml
GET /api/dashboard/metrics
Auth: Required (Clerk session)
Response:
  200: { user, subscription: { tier, limits, usage, percentages }, metrics }
  401: Unauthorized
```

**Settings API** (`contracts/settings-api.yaml`):

```yaml
GET /api/users/[id]/settings
PATCH /api/users/[id]/settings/preferences
Auth: Required, userId must match session
```

### 3. Integration Test Scenarios - 🔄 TO BE ENHANCED

**Existing** (✅ quickstart.md):
1-5. User registration, profile setup, updates

**NEW** (To be added to quickstart.md):
6. User Login and Dashboard Access
7. Dashboard Usage Metrics Display
8. Settings Navigation and Profile Viewing
9. Settings Profile Editing
10. Unauthenticated Access Protection

### 4. E2E Test Plan - 📝 TO BE CREATED

Create `e2e-test-plan.md` with comprehensive Playwright test scenarios for TR-001 to TR-010:

1. Login flow (TR-001, TR-009)
2. Dashboard access (TR-002)
3. Profile viewing (TR-003)
4. Profile editing (TR-004)
5. Auth enforcement (TR-005)
6. Authorization enforcement (TR-006)
7. First-time user flow (TR-007)
8. Returning user flow (TR-008)
9. Validation errors (TR-010)

### 5. Update CLAUDE.md - 📝 TO BE EXECUTED

Run `.specify/scripts/bash/update-agent-context.sh claude` to add:

- Dashboard components and metrics
- Settings tabs pattern
- Enhanced E2E testing
- Dashboard/settings APIs

## Phase 2: Task Planning Approach

*This section describes what the /tasks command will do*

**Current State**: tasks.md exists with 40 tasks (T001-T040) covering Phases 3.1-3.8.

**Enhancement Strategy**:

The /tasks command should:

1. Review existing tasks T001-T040 (validation, models, services, APIs, UI)
2. Add NEW tasks for:
   - **Phase 3.9**: Dashboard Layer (T041-T050)
     - Dashboard service, utilities, API, components, page
   - **Phase 3.10**: Settings Layer (T051-T058)
     - Settings tabs, profile/preferences/account tabs, layout
   - **Phase 3.11**: E2E Testing (T059-T067)
     - 9 comprehensive E2E test scenarios per e2e-test-plan.md
   - **Phase 3.12**: Integration & Polish (T068-T072)
     - Dashboard optimization, settings state, full suite, Codacy, quickstart

**Estimated Output**: 72 total tasks (existing 40 + new 32)

**IMPORTANT**: Executed by /tasks command, NOT by /plan.

## Complexity Tracking

**Status**: ✅ NO VIOLATIONS

**Complexity Considerations**:

- Dashboard: Multiple small components (<450 lines each) vs monolithic page
- Settings Tabs: File-based routing vs complex client-side state
- E2E Tests: Separate files by flow with shared fixtures

**Mitigation Strategies**:

- Extract dashboard widgets to components
- Use Next.js App Router for tab routing
- Leverage shadcn/ui components
- Share Playwright fixtures

## Progress Tracking

**Phase Status**:

- [x] Phase 0: Research (ORIGINAL)
- [x] Phase 0: Dashboard & settings research (COMPLETED)
- [x] Phase 1: Design (ORIGINAL)
- [x] Phase 1: Dashboard/settings contracts (COMPLETED)
- [x] Phase 1: E2E test plan (COMPLETED)
- [x] Phase 1: Quickstart enhancement (COMPLETED)
- [x] Phase 1: CLAUDE.md update (COMPLETED)
- [ ] Phase 2: Task planning (/tasks command)
- [ ] Phase 3: Implementation
- [ ] Phase 4: Validation

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations mitigated

**Enhancement Integration**:

- [x] Login flow (FR-013, FR-019)
- [x] Dashboard (FR-014)
- [x] Settings tabs (FR-015, FR-016)
- [x] Authorization (FR-017, FR-018)
- [x] E2E tests (TR-001 to TR-010)
- [x] Project structure updated
- [x] API contracts created (dashboard-api.yaml, settings-api.yaml)
- [x] E2E test plan created (e2e-test-plan.md with 10 scenarios)
- [x] Quickstart scenarios added (scenarios 9-13)
- [x] CLAUDE.md updated

---
*Based on Constitution v1.0.0*
*Enhanced: 2025-10-25 for login, dashboard, settings tabs, and E2E testing*
