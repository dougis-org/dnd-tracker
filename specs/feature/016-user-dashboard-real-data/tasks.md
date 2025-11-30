# Feature 016: User Dashboard with Real Data — Task Breakdown

**Feature**: User Dashboard with Real Data  
**Branch**: `feature/016-user-dashboard-real-data`  
**Date Generated**: 2025-11-29  
**Status**: Ready for Implementation  
**Total Tasks**: 32 (organized into 5 phases)

## Task Checklist

### Phase 1: Setup

**Goal**: Project initialization and dependency verification

- [ ] T001 Verify feature branch `feature/016-user-dashboard-real-data` is active and up-to-date
- [ ] T002 Verify Feature 004 (Dashboard Page) UI exists at `src/app/dashboard/page.tsx`
- [ ] T003 Verify Feature 013 (Clerk Auth) is implemented and `/api/auth` endpoints exist
- [ ] T004 Verify Feature 014 (MongoDB User Model) is implemented and User model is accessible at `src/lib/models/user.ts`
- [ ] T005 Create feature directory structure:
  - `src/types/dashboard.ts`
  - `src/lib/dashboardApi.ts`
  - `src/app/api/v1/dashboard/usage/route.ts`
  - `src/components/Dashboard/` (create directory)

### Phase 2: Foundational

**Goal**: Implement data contracts, types, and API client

- [ ] T006 Create Subscription Tier types in `src/types/subscription.ts`:
  - Export `SubscriptionTier` type: `'free_adventurer' | 'seasoned_adventurer' | 'expert_dungeon_master' | 'master_of_dungeons' | 'guild_master'`
  - Export `TierLimits` constant with hardcoded limits per tier
  - Add JSDoc explaining tier definitions

- [ ] T007 Create Dashboard types in `src/types/dashboard.ts`:
  - Export `DashboardPageData` interface with user, usage, limits, createdAt, isEmpty, usagePercentages
  - Export error response types
  - Add validation helpers

- [ ] T008 Create API client in `src/lib/dashboardApi.ts`:
  - Implement `getDashboardData(): Promise<DashboardPageData>` function
  - Add error handling with user-friendly messages
  - Use SWR with `revalidateOnFocus: false`

- [ ] T009 Implement API endpoint at `src/app/api/v1/dashboard/usage/route.ts`:
  - Verify authentication via Clerk
  - Query User document from MongoDB
  - Query resource counts in parallel
  - Calculate usage percentages
  - Set cache header `Cache-Control: no-store, no-cache, must-revalidate`

### Phase 3: User Story P1 (Core Dashboard)

**Story Goal**: Display subscription tier and real-time resource usage  

- [ ] T010 [P] [US1] Create main Dashboard container in `src/components/Dashboard/Dashboard.tsx`:
  - Fetch data on mount using SWR
  - Show skeleton screen while loading
  - Handle errors with retry button (max 3 attempts)
  - Pass data to DashboardContent component

- [ ] T011 [P] [US1] Create DashboardContent router in `src/components/Dashboard/DashboardContent.tsx`:
  - Check `isEmpty` flag
  - Route to EmptyState or main layout

- [ ] T012 [P] [US2] Create TierInfo display in `src/components/Dashboard/TierInfo.tsx`:
  - Show subscription tier name
  - Show user display name or email
  - Display tier limits table

- [ ] T013 [P] [US2] Create UsageMetrics display in `src/components/Dashboard/UsageMetrics.tsx`:
  - Display count and percentage
  - Render progress bars with color logic
  - Show "X of Y" format

- [ ] T014 [P] [US2] Create QuickActions in `src/components/Dashboard/QuickActions.tsx`:
  - Three buttons: "New Character", "New Party", "New Encounter"

- [ ] T015 [P] [US2] Create EmptyState in `src/components/Dashboard/EmptyState.tsx`:
  - Welcome message with user name
  - CTA buttons

- [ ] T016 [P] [US1] Write unit tests for API endpoint in `tests/unit/dashboard/api.test.ts`:
  - Test with all 5 tiers
  - Test percentage calculations
  - Test error cases
  - 42+ test cases

- [ ] T017 [P] [US2] Write unit tests for UsageMetrics in `tests/unit/components/UsageMetrics.test.tsx`:
  - Test color calculation
  - Test progress bar rendering
  - Test edge cases

- [ ] T018 [P] [US2] Write unit tests for TierInfo in `tests/unit/components/TierInfo.test.tsx`:
  - Test all 5 tiers
  - Test name fallback

- [ ] T019 [P] [US2] Write unit tests for EmptyState in `tests/unit/components/EmptyState.test.tsx`:
  - Test welcome message
  - Test CTA buttons

- [ ] T020 [US1] Write integration tests in `tests/integration/dashboard.integration.test.ts`:
  - Full flow testing
  - Loading/data/error states

### Phase 4: User Story P2 (Production-Ready)

**Story Goal**: Error handling, empty state, navigation  

- [ ] T021 [P] Enhance Dashboard with error state in `src/components/Dashboard/ErrorState.tsx`:
  - Error banner with actions
  - Retry button for 5xx

- [ ] T022 [DEFERRED-P3] Enhance QuickActions tier limit handling:
  - Optional enhancement

- [ ] T023 [US3] Integration tests for empty state in `tests/integration/emptyState.integration.test.ts`:
  - Empty state logic

- [ ] T024 [US4] Integration tests for error handling in `tests/integration/errorHandling.integration.test.ts`:
  - Error scenarios

- [ ] T025 [P] [US1] E2E test for core dashboard in `tests/e2e/dashboard.e2e.test.ts`:
  - Full user flow
  - Responsive testing

- [ ] T026 [P] [US3] E2E test for empty state in `tests/e2e/emptyState.e2e.test.ts`:
  - Empty state flow

- [ ] T027 [P] [US4] E2E test for quick actions in `tests/e2e/quickActions.e2e.test.ts`:
  - Navigation testing

- [ ] T028 Verify WCAG 2.1 AA accessibility

- [ ] T029 Verify mobile responsiveness

### Phase 5: Polish

**Goal**: Code quality and documentation  

- [ ] T030 Run linting and code quality checks:
  - `npm run type-check`
  - `npm run lint`
  - Codacy analysis

- [ ] T031 Verify test coverage (80%+ on new code)

- [ ] T032 Create feature documentation:
  - JSDoc comments
  - Update roadmap
