---
description: "Task list for Feature 012: Subscription & Billing Pages"
---

# Tasks: Subscription & Billing Pages (Feature 012)

**Input**: Design documents from `specs/012-subscription-billing/`
**Prerequisites**: ✅ plan.md (implementation plan), ✅ spec.md (user stories & requirements), ✅ data-model.md (entities), ✅ quickstart.md (developer guide)

**Maintainer**: @doug
**Constitution**: All tasks comply with `.specify/memory/constitution.md`. Run Codacy analysis after implementation.

**Feature Branch**: `feature/012-subscription-billing` | **Created**: 2025-11-13 | **Status**: Ready for Implementation

---

## Summary

Feature 012 delivers a subscription and billing management page at `/subscription` with:

- Current plan display with renewal date and billing frequency
- Usage metrics with progress bars and warning indicators (≥80% usage)
- Plan comparison table with 3 tiers and non-functional upgrade/downgrade buttons
- Billing history with paginated invoices
- Payment method display (masked card, hidden for free tier)
- Mock localStorage adapter with 300ms network delay
- Two API routes: `GET /api/subscription`, `GET /api/billing/history`
- 80%+ test coverage with Jest + Testing Library + Playwright E2E
- Fully responsive design (≥320px mobile to desktop)

**MVP Scope**: All 5 user stories (P1 + P2); delivers complete subscription UI foundation.

---

## Phase 1: Setup & Project Structure

**Purpose**: Initialize project structure and configure foundational tooling

- [ ] T001 Create project structure under `src/app/api/subscription/`, `src/app/api/billing/`, `src/app/(authenticated)/subscription/`, `src/components/subscription/`, `src/lib/adapters/`, `src/lib/schemas/`, `tests/fixtures/`, `tests/e2e/`
- [ ] T002 [P] Create barrel export file `src/components/subscription/index.ts` for component exports
- [ ] T003 [P] Create `.env.example` notes (no new env vars required for F012 mock data)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data layer and validation schemas that ALL user stories depend on

**⚠️ CRITICAL**: No UI or API work can begin until this phase completes

### Zod Schemas & Type Definitions (RED → GREEN → REFACTOR)

- [ ] T004 Create Zod schemas in `src/lib/schemas/subscriptionSchema.ts`: SubscriptionSchema, PlanSchema, UsageMetricSchema, InvoiceSchema, PaginatedInvoicesSchema with full validation rules and immutability constraints
- [ ] T005 [P] Create schema validation unit tests in `src/lib/schemas/__tests__/subscriptionSchema.test.ts` (RED: all tests fail)
- [ ] T006 [P] Implement schema validation tests to PASS (GREEN)
- [ ] T007 Create TypeScript types file `src/types/subscription.ts` (or use z.infer in schemas)

### Mock Data Factories & Fixtures

- [ ] T008 [P] Create mock data factories in `tests/fixtures/subscription-fixtures.ts`: `createMockSubscription()`, `createMockPlan()`, `createMockUsageMetric()`, `createMockInvoice()`, `createMockInvoicesPage()` with override support
- [ ] T009 Verify factories generate valid data (matches Zod schemas)

### Adapter Implementation (RED → GREEN → REFACTOR)

- [ ] T010 Create adapter tests in `src/lib/adapters/__tests__/subscriptionAdapter.test.ts` (RED: all tests fail)
  - Tests: `getSubscription()`, `getUsageMetrics()`, `getAvailablePlans()`, `getBillingHistory(page, pageSize)`
  - Tests: 300ms network delay, localStorage persistence, corrupted data recovery, schema validation on read
- [ ] T011 Implement `src/lib/adapters/subscriptionAdapter.ts` with all adapter methods (GREEN)
  - Mock data via localStorage with keys: `subscription:${userId}`, `usage:${userId}`, `plans`, `billing:${userId}`
  - 300ms network delay simulation via `setTimeout`
  - Zod schema validation on every read/write
  - Error handling and corrupted data recovery
- [ ] T012 Refactor adapter: extract shared delay/storage utilities, consolidate error messages, ensure DRY

### Checkpoint: Foundation Complete

✅ Zod schemas validated  
✅ Mock data factories working  
✅ Adapter ready with localStorage + 300ms delay  
✅ All foundational tests passing (30+ tests)  
✅ **User story implementation can now proceed**

---

## Phase 3: User Story 1 - View Current Subscription Plan (Priority: P1)

**Goal**: Users can load `/subscription` and see their current plan name, renewal date, billing frequency, and trial status.

**Independent Test**: Load `/subscription` page → see current plan card with "Current Plan" badge, renewal date, and appropriate CTA (trial users see "Choose Plan", paid users see "Manage").

**Why P1**: Foundation—users need to know their plan status immediately. Core value delivery.

### Tests for User Story 1 (RED - Write Failing Tests First)

- [ ] T013 [P] [US1] Create PlanCard component tests in `src/components/subscription/__tests__/PlanCard.test.tsx` (RED)
  - Test: render current plan name + badge
  - Test: render renewal date in human-readable format
  - Test: render billing frequency (annual/monthly)
  - Test: show "Manage" button for paid users
  - Test: show "Choose Plan" button for trial users (scrolls to comparison table)
- [ ] T014 [P] [US1] Create SubscriptionPage orchestrator tests in `src/components/subscription/__tests__/SubscriptionPage.test.tsx` (RED)
  - Test: loading state renders skeleton
  - Test: success state fetches from /api/subscription and renders PlanCard
  - Test: error state shows error banner + retry button
  - Test: retry button clears error and re-fetches

### API Route for User Story 1 (RED)

- [ ] T015 [US1] Create API route tests in `src/app/api/subscription/__tests__/route.test.ts` (RED)
  - Test: GET /api/subscription returns { subscription, usageMetrics, availablePlans }
  - Test: response schema matches Zod validation
  - Test: extracts userId from x-user-id header correctly
  - Test: error case (adapter throws) → 500 with error message

### Implementation for User Story 1 (GREEN)

- [ ] T016 [P] [US1] Create PlanCard component in `src/components/subscription/PlanCard.tsx` (~40 lines)
  - Props: subscription, trialDaysRemaining, onChoosePlan callback
  - Render: plan name + current plan badge + renewal date + billing frequency
  - Buttons: "Manage" (paid) or "Choose Plan" (trial)
  - Styling: card layout with shadow, Tailwind responsive
- [ ] T017 [P] [US1] Create SubscriptionPage orchestrator in `src/components/subscription/SubscriptionPage.tsx` (~50 lines)
  - State: loading, error, retry
  - Fetch: useEffect calls /api/subscription + /api/billing/history in parallel
  - Render: PlanCard as main child + other sections below
  - Loading: skeleton loaders while data fetches
  - Error: error banner with retry button
- [ ] T018 [US1] Create API route `src/app/api/subscription/route.ts` (~30 lines)
  - GET handler: calls adapter methods, returns { subscription, usageMetrics, availablePlans }
  - Error handling: try/catch, return 500 with error message
  - Zod validation: response matches schema

### Refactor User Story 1 (REFACTOR)

- [ ] T019 [US1] Refactor PlanCard for readability: verify max 50-line functions, max 450-line file, no duplication
- [ ] T020 [US1] Refactor SubscriptionPage: extract loading/error UI to reusable components if shared with other stories
- [ ] T021 [US1] Refactor API route: extract error handling to shared utility if used by other routes

### Tests Green for User Story 1

- [ ] T022 [US1] Run tests locally: `npm run test:ci:parallel -- src/components/subscription/ src/app/api/subscription/` → All tests pass

**Checkpoint: User Story 1 Complete & Independently Testable**

✅ PlanCard displays current plan correctly  
✅ SubscriptionPage fetches and renders plan  
✅ API route returns correct schema  
✅ Loading/error states work  
✅ Can test independently without US2/US3/US4/US5

---

## Phase 4: User Story 2 - Review Usage Metrics & Limits (Priority: P1)

**Goal**: Users see progress bars for each metric (parties, encounters, characters, combat sessions) with current/max values; warning state at ≥80% usage; error state at 100%.

**Independent Test**: Render usage metrics component with mock data → verify progress bars display correct percentages; warning state active at 80%+; error state at 100%; free tier shows "Unlimited".

**Why P1**: Critical user experience—shows value received and prevents surprising limits.

### Tests for User Story 2 (RED - Write Failing Tests First)

- [ ] T023 [P] [US2] Create UsageMetrics component tests in `src/components/subscription/__tests__/UsageMetrics.test.tsx` (RED)
  - Test: render metric row for each metric (parties, encounters, characters, combatSessions)
  - Test: progress bar displays correct percentage (2/3 = 66.7%)
  - Test: ≥80% usage → warning state (amber color, ⚠ label)
  - Test: 100% usage → error state (red, "Limit reached" label)
  - Test: free tier (maxAllowed=0) → "Unlimited" text instead of percentage
  - Test: accessibility: ARIA labels, roles

### Implementation for User Story 2 (GREEN)

- [ ] T024 [P] [US2] Create UsageMetrics component in `src/components/subscription/UsageMetrics.tsx` (~60 lines)
  - Props: metrics (UsageMetric[])
  - Render: horizontal progress bars for each metric
  - Calc: percentage = (currentUsage / maxAllowed) * 100 or "Unlimited" if maxAllowed=0
  - Warning: ≥80% → amber background, ⚠ icon, "Approaching limit" label
  - Error: 100% → red background, "Limit reached" label
  - Display: metric name + current/max values + percentage
  - Styling: Tailwind responsive, shadow on cards
- [ ] T025 [US2] Integrate UsageMetrics into SubscriptionPage: add useEffect call for metrics, pass to component

### Refactor User Story 2 (REFACTOR)

- [ ] T026 [US2] Refactor UsageMetrics: ensure max 50-line functions, accessible color contrast

### Tests Green for User Story 2

- [ ] T027 [US2] Run tests: `npm run test:ci:parallel -- src/components/subscription/__tests__/UsageMetrics.test.tsx` → All pass

**Checkpoint: User Story 2 Complete & Independently Testable**

✅ Progress bars render correctly  
✅ Warning state at 80%+  
✅ Error state at 100%  
✅ Free tier shows "Unlimited"  
✅ Can test independently (no US3/US4/US5 dependency)

---

## Phase 5: User Story 3 - Compare Plan Tiers (Priority: P1)

**Goal**: Users see a comparison table with ≥3 tiers (Free, Seasoned Adventurer, Master DM), features, usage limits, current plan highlighted, and upgrade/downgrade buttons (non-functional → "Coming soon" toast).

**Independent Test**: Render comparison table with mock plans → verify 3+ tiers display; features show checkmarks/X marks; current plan highlighted; buttons trigger "Coming soon" toast.

**Why P1**: Core monetization—clear tier comparison encourages upgrades.

### Tests for User Story 3 (RED - Write Failing Tests First)

- [ ] T028 [P] [US3] Create PlanComparison component tests in `src/components/subscription/__tests__/PlanComparison.test.tsx` (RED)
  - Test: render table with 3+ tiers (Free, Seasoned Adventurer, Master DM)
  - Test: features column shows checkmarks for included, X marks for excluded
  - Test: current plan column highlighted with badge
  - Test: upgrade/downgrade buttons visible for non-current tiers (one per tier)
  - Test: button click → "Coming soon" toast appears
  - Test: toast dismisses after 3–5 seconds
  - Test: accessibility: table structure, button labels

### Implementation for User Story 3 (GREEN)

- [ ] T029 [P] [US3] Create PlanComparison component in `src/components/subscription/PlanComparison.tsx` (~80 lines)
  - Props: plans (Plan[]), currentPlanId, onUpgrade?, onDowngrade? callbacks
  - Render: table with columns: Plan Name | Features | Limits | Buttons
  - Current plan: highlight with badge ("Your Plan") and different background
  - Features: checkmark icon for included, X icon for excluded
  - Buttons: "Upgrade" for lower tiers, "Downgrade" for higher tiers (only for non-current)
  - On button click: show toast "This feature is coming soon" (info style, 3–5s)
  - Styling: Tailwind responsive (stack on mobile, table on desktop)
- [ ] T030 [P] [US3] Install toast notification library (if not present): use shadcn/ui Toast or similar
- [ ] T031 [US3] Integrate PlanComparison into SubscriptionPage: add component below metrics, pass availablePlans + currentPlanId

### Refactor User Story 3 (REFACTOR)

- [ ] T032 [US3] Refactor PlanComparison: verify max file size, extract feature list logic if complex

### Tests Green for User Story 3

- [ ] T033 [US3] Run tests: `npm run test:ci:parallel -- src/components/subscription/__tests__/PlanComparison.test.tsx` → All pass

**Checkpoint: User Story 3 Complete & Independently Testable**

---

## Added Tasks: Billing History, Payment Method, Empty State, Responsive Tests

- [ ] T034 [P] Add explicit API route tests for billing history pagination and validation (`src/app/api/billing/history/__tests__/route.test.ts`) — validate page/pageSize defaults and 400 handling for invalid params.
- [ ] T035 [P] Add BillingHistory component tests (`src/components/subscription/__tests__/BillingHistory.test.tsx`) — rows, empty state, download button → toast, date + currency formatting, pagination behavior.
- [ ] T036 [P] Implement BillingHistory component & integrate into SubscriptionPage (`src/components/subscription/BillingHistory.tsx`, `src/app/api/billing/history/route.ts`).
- [ ] T037 [P] Add PaymentMethod component tests (`src/components/subscription/__tests__/PaymentMethod.test.tsx`) — masked card display, expiring-card warning, free-tier hidden behavior.
- [ ] T038 [P] Implement PaymentMethod component & integrate into SubscriptionPage (`src/components/subscription/PaymentMethod.tsx`).
- [ ] T039 [P] Add empty-state focused tests (billing history empty state) and ensure adapter returns zero invoices for empty-case fixtures.
- [ ] T040 [P] Add responsive E2E checks (Playwright) verifying 320px, 375px, 768px viewports: no horizontal scroll and critical UI stacks correctly.

---

✅ Comparison table displays 3+ tiers  
✅ Features show checkmarks/X marks  
✅ Current plan highlighted  
✅ Buttons show "Coming soon" toast  
✅ Can test independently (no US4/US5 dependency)

---

## Phase 6: User Story 4 - Access Billing History (Priority: P2)

**Goal**: Users see past invoices in a paginated table with date, description, amount, status; empty state for new users; non-functional download button → "Coming soon" toast.

**Independent Test**: Render billing history table with mock invoices → verify rows display; empty state shows for zero invoices; pagination params passed to API; download button triggers toast.

**Why P2**: Important for trust—reduces support tickets; secondary to viewing current plan.

### API Route for User Story 4 (RED)

- [ ] T034 [P] [US4] Create billing history API tests in `src/app/api/billing/history/__tests__/route.test.ts` (RED)
  - Test: GET /api/billing/history?page=1&pageSize=10 returns paginated invoices
  - Test: response includes invoices[], totalCount, pageSize, currentPage, hasNextPage
  - Test: invalid page/pageSize → 400 error
  - Test: default pagination: page=1, pageSize=10

### Tests for User Story 4 (RED - Write Failing Tests First)

- [ ] T035 [P] [US4] Create BillingHistory component tests in `src/components/subscription/__tests__/BillingHistory.test.tsx` (RED)
  - Test: render invoice rows with date, description, amount, status
  - Test: empty state: "No invoices yet" message for zero invoices
  - Test: date formatted in human-readable + ISO timestamp
  - Test: currency formatted with locale
  - Test: download button (non-functional) → "Coming soon" toast
  - Test: pagination: prev/next buttons (state managed by parent or component)
  - Test: accessibility: table structure, button labels

### Implementation for User Story 4 (GREEN)

- [ ] T036 [P] [US4] Create API route `src/app/api/billing/history/route.ts` (~30 lines)
  - GET handler: extract page & pageSize from query params
  - Validate: page ≥ 1, pageSize 1–100
  - Call: adapter.getBillingHistory(userId, page, pageSize)
  - Return: { invoices, totalCount, pageSize, currentPage, hasNextPage }
  - Error: 400 for invalid params, 500 for adapter errors
- [ ] T037 [P] [US4] Create BillingHistory component in `src/components/subscription/BillingHistory.tsx` (~70 lines)
  - Props: invoices (Invoice[]), totalCount, pageSize, currentPage, onPageChange?, onDownload? callbacks
  - Render: table with columns: Date | Description | Amount | Status | Actions
  - Empty state: "No invoices yet" message + guidance text if invoices.length = 0
  - Date: human-readable (locale) + ISO timestamp hover/tooltip
  - Amount: localized currency format (USD, EUR, etc.)
  - Status badge: Paid (green), Pending (yellow), Failed (red)
  - Download button: on click → "Coming soon" toast
  - Pagination: prev/next buttons (disable if first/last page)
  - Styling: Tailwind responsive (table → card grid on mobile)
- [ ] T038 [US4] Integrate BillingHistory into SubscriptionPage: add state for pagination, fetch /api/billing/history in useEffect, pass props

### Refactor User Story 4 (REFACTOR)

- [ ] T039 [US4] Refactor BillingHistory: verify max 50-line functions, responsive design, accessibility

### Tests Green for User Story 4

- [ ] T040 [US4] Run tests: `npm run test:ci:parallel -- src/app/api/billing/__tests__/ src/components/subscription/__tests__/BillingHistory.test.tsx` → All pass

**Checkpoint: User Story 4 Complete & Independently Testable**

✅ Invoice table displays correctly  
✅ Empty state shows  
✅ Pagination works  
✅ Download button shows "Coming soon"  
✅ Can test independently (no US5 dependency)

---

## Phase 7: User Story 5 - Manage Payment Method (Priority: P2)

**Goal**: Paid tier users see masked card (•••• 4242 - Expires 12/26) with optional warning if expiring within 30 days; free tier users don't see this section; non-functional update button → "Coming soon" toast.

**Independent Test**: Render payment method component with paid subscription → see card display; render with free tier → section hidden; update button triggers toast.

**Why P2**: Important for account management; secondary to viewing plan.

### Tests for User Story 5 (RED - Write Failing Tests First)

- [ ] T041 [P] [US5] Create PaymentMethod component tests in `src/components/subscription/__tests__/PaymentMethod.test.tsx` (RED)
  - Test: paid tier user → render card display with masked card + expiration
  - Test: free tier user → section hidden entirely (not in DOM)
  - Test: expiring card (within 30 days) → warning message visible
  - Test: update button → "Coming soon" toast
  - Test: accessibility: ARIA labels

### Implementation for User Story 5 (GREEN)

- [ ] T042 [P] [US5] Create PaymentMethod component in `src/components/subscription/PaymentMethod.tsx` (~40 lines)
  - Props: subscription (Subscription), paymentMethod? ({ last4, expiration }), onUpdate? callback
  - Condition: only render if subscription.planName !== 'Free'
  - Card display: "•••• {last4} - Expires {MM/YY}"
  - Warning: if expiration within 30 days → show warning banner
  - Update button: on click → "Coming soon" toast
  - Styling: card layout, Tailwind responsive
- [ ] T043 [US5] Add mock payment method data to adapter's getPaymentMethod() method (or include in subscription mock)
- [ ] T044 [US5] Integrate PaymentMethod into SubscriptionPage: add conditional render, pass subscription + payment method

### Refactor User Story 5 (REFACTOR)

- [ ] T045 [US5] Refactor PaymentMethod: verify accessibility, styling consistency

### Tests Green for User Story 5

- [ ] T046 [US5] Run tests: `npm run test:ci:parallel -- src/components/subscription/__tests__/PaymentMethod.test.tsx` → All pass

**Checkpoint: User Story 5 Complete & Independently Testable**

✅ Payment method displays for paid users  
✅ Hidden for free tier  
✅ Warning shows for expiring cards  
✅ Update button shows "Coming soon"  
✅ All user stories complete

---

## Phase 8: Page Route & Integration

**Purpose**: Create the page route and integrate all components

### Page Route & Layout

- [ ] T047 Create page route `src/app/(authenticated)/subscription/page.tsx` (~5 lines)
  - Render: `<SubscriptionPage />`
  - Layout: authenticated route (users must be logged in)
- [ ] T048 Verify page accessible at `/subscription` with correct layout

### Full-Page Integration Tests

- [ ] T049 [P] Create end-to-end tests in `tests/e2e/subscription.e2e.ts` (Playwright)
  - Test 1 (E2E-1): Load `/subscription` → see all sections (plan, usage, comparison, history, payment)
  - Test 2 (E2E-2): Verify 2s load time budget met (SC-001)
  - Test 3 (E2E-3): Usage metric warning visible at 85% → verify warning styling/label
  - Test 4 (E2E-4): Trial user → "Choose Plan" button → click → scroll to comparison table
  - Test 5 (E2E-5): Click upgrade button → "Coming soon" toast appears → dismisses after 3–5s
  - Test 6 (E2E-6): Mobile viewport (375px) → no horizontal scroll; all content visible
  - Test 7 (E2E-7): Tablet viewport (768px) → responsive layout correct
  - Test 8 (E2E-8): Error simulation → error banner → retry button → success
- [ ] T050 Run E2E tests: `npm run test:e2e -- subscription.e2e.ts` → All pass

### Navigation & Routing Integration

- [ ] T051 Verify navigation menu includes link to `/subscription` (if applicable to Feature 002)
- [ ] T052 Test authenticated route guard (redirect to login if not authenticated)

---

## Phase 9: Test Coverage & Quality Gates

**Purpose**: Ensure 80%+ coverage, all linting passes, Codacy analysis clean

### Coverage Check

- [ ] T053 Run coverage report: `npm run test:ci:parallel -- --coverage`
  - Target: ≥80% statements, branches, functions, lines on all new code
  - Review coverage report: identify uncovered lines
  - Add tests as needed to reach 80%+
- [ ] T054 [P] Add missing unit tests to reach 80% coverage threshold
- [ ] T055 Verify coverage report shows ≥80% on:
  - `src/lib/schemas/subscriptionSchema.ts`
  - `src/lib/adapters/subscriptionAdapter.ts`
  - `src/components/subscription/*.tsx`
  - `src/app/api/subscription/route.ts`
  - `src/app/api/billing/history/route.ts`

### Linting & Type Checking

- [ ] T056 [P] Run linting: `npm run lint` → No errors
  - Fix any code style issues
  - Verify max 450-line files
  - Verify max 50-line functions
- [ ] T057 [P] Run type checking: `npm run type-check` → No TypeScript errors
- [ ] T058 [P] Run markdown linting: `npm run lint:markdown` → No errors
- [ ] T059 [P] Run build: `npm run build` → Successful (no errors)

### Codacy Analysis

- [ ] T060 Run Codacy analysis on all new files: `codacy_cli_analyze --rootPath /home/doug/ai-dev-1/dnd-tracker --file src/lib/schemas/subscriptionSchema.ts`
- [ ] T061 [P] Run Codacy on: `src/lib/adapters/subscriptionAdapter.ts`
- [ ] T062 [P] Run Codacy on: `src/components/subscription/*.tsx`
- [ ] T063 [P] Run Codacy on: `src/app/api/subscription/route.ts`, `src/app/api/billing/history/route.ts`
- [ ] T064 Address any Codacy issues (complexity, duplication, style)
- [ ] T065 Re-run Codacy analysis after fixes → Clean

### Quality Gate Summary

- [ ] T066 Verify all metrics:
  - ✅ 80%+ test coverage
  - ✅ TypeScript strict mode no errors
  - ✅ ESLint no errors
  - ✅ Markdown lint no errors
  - ✅ Build successful
  - ✅ Codacy analysis clean
  - ✅ E2E tests passing on mobile/tablet/desktop

---

## Phase 10: Documentation & Handoff

**Purpose**: Update documentation and prepare for PR

### Documentation Updates

- [ ] T067 Verify `specs/012-subscription-billing/quickstart.md` is accurate (already written)
- [ ] T068 Update `specs/012-subscription-billing/plan.md` "Status" field to "Implemented" if desired
- [ ] T069 [P] Create or update `.env.example` notes (no new env vars for F012)
- [ ] T070 [P] Add component documentation to `src/components/subscription/index.ts` (JSDoc comments)

### Pre-PR Checklist

- [ ] T071 Verify branch is up-to-date with `main`: `git pull origin main`
- [ ] T072 Commit all changes: `git add . && git commit -m "feat(012): subscription and billing pages"`
- [ ] T073 Create pull request with description:
  - Summary: Feature 012 delivers subscription and billing pages
  - User stories: US1–US5 complete
  - Test coverage: 80%+
  - Files changed: ~30 new files, ~1600+ LOC
  - Codacy: Clean analysis
  - E2E: All scenarios passing
- [ ] T074 Link GitHub issue #12 in PR description
- [ ] T075 [P] Verify CI/CD checks pass (GitHub Actions)
- [ ] T076 Request PR review from @doug

---

## Phase 11: Polish & Refinement

**Purpose**: Final improvements, edge cases, and accessibility polish

### Edge Case Handling

- [ ] T077 Test zero usage (all metrics at 0/X) → no warnings, displays "0/X"
- [ ] T078 Test free tier with no payment method → payment section hidden, no errors
- [ ] T079 Test transient state (page loading while renewal processes) → show loading state
- [ ] T080 Test no browser support for localStorage → fallback to in-memory or show error

### Accessibility Improvements

- [ ] T081 Audit with axe DevTools: `npm run test:a11y` (if command exists) or manual check
- [ ] T082 Verify keyboard navigation: Tab through all interactive elements
- [ ] T083 Verify color contrast: all text meets WCAG AA (4.5:1 for normal text)
- [ ] T084 Add ARIA labels to progress bars, buttons, status badges
- [ ] T085 Test with screen reader (NVDA, JAWS, VoiceOver) if possible

### Performance Polish

- [ ] T086 Verify 300ms network delay in adapter consistent and testable
- [ ] T087 Verify skeleton loaders show while data fetches (no blank page)
- [ ] T088 Optimize re-renders: check for unnecessary useEffect calls, memoization
- [ ] T089 Lazy load heavy components if needed (unlikely for F012 scope)

### Mobile & Responsive Testing

- [ ] T090 Test on actual mobile devices (iOS Safari, Chrome Android) if possible
- [ ] T091 Verify no horizontal scrolling on 320px viewport
- [ ] T092 Verify touch targets are ≥44px (mobile accessibility)
- [ ] T093 Test on tablet (768px) and desktop (1440px)

---

## Dependencies & Execution Order

### Phase Dependencies

| Phase | Dependencies | Status |
|-------|--------------|--------|
| 1: Setup | None | Immediate start |
| 2: Foundational | Depends on Phase 1 | ⚠️ BLOCKS all user stories |
| 3: US1 (P1) | Depends on Phase 2 | Starts after Phase 2 |
| 4: US2 (P1) | Depends on Phase 2 | Can run parallel with US1 if staffed |
| 5: US3 (P1) | Depends on Phase 2 | Can run parallel with US1/US2 |
| 6: US4 (P2) | Depends on Phase 2 | Can run parallel after US1 |
| 7: US5 (P2) | Depends on Phase 2 | Can run parallel after US1 |
| 8: Page Route | Depends on all user stories (US1–US5) | Starts after all stories complete |
| 9: Test Coverage & QA | Depends on all implementation | Final validation |
| 10: Documentation | Depends on Phase 9 | Before PR |
| 11: Polish | Depends on Phase 10 | Optional refinement |

### Parallel Opportunities

**Phase 1 (Setup)**:

- T002, T003 can run in parallel (independent files)

**Phase 2 (Foundational)**:

- T005, T006 can run in parallel (schema tests)
- T008 can run in parallel with T004 (fixtures independent)
- T010, T011, T012 follow sequentially (adapter depends on schemas)

**Phase 3–7 (User Stories)**:

- After Phase 2 completes, all 5 user stories can proceed in parallel (different components, no dependencies)
- Within each US: RED tests → GREEN implementation → REFACTOR can overlap
- US1 & US2: most critical (P1) → complete first for MVP
- US3: also P1 → complete before US4/US5
- US4 & US5: P2 → lower priority but should complete before PR

**Phase 8 (Page Route)**:

- Depends on all user stories → cannot start until all components integrated

**Phase 9 (QA)**:

- T056–T062 can run in parallel (independent linting/coverage checks)

**Example Timeline (Single Developer)**:

1. Days 1–2: Phase 1 + Phase 2 (Setup + Foundational) = 2 days
2. Days 3–4: Phase 3 (US1) = 2 days
3. Days 4–5: Phase 4 (US2) = 1.5 days (overlaps with US1)
4. Days 5–6: Phase 5 (US3) = 1.5 days (overlaps with US2)
5. Days 6–7: Phase 6 (US4) = 1.5 days
6. Days 7–8: Phase 7 (US5) = 1.5 days
7. Days 8–9: Phase 8 + 9 (Integration + QA) = 1–2 days
8. Days 9–10: Phase 10 + 11 (Docs + Polish) = 1 day

**Total: 9–12 days** (single developer, sequential US implementation)

**With 2 Developers** (parallel US implementation):

1. Days 1–2: Setup + Foundational (both)
2. Days 3–4: Developer A: US1 + US2 | Developer B: US3 + US4
3. Days 4–5: Developer A: US4 + US5 | Developer B: E2E tests
4. Days 5–6: Both: Page Route + QA
5. Days 6–7: Both: Docs + Polish

**Total: 6–7 days** (two developers, parallel work)

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch schema work in parallel:
Developer A: T004 (create schemas) → T005 (RED tests) → T006 (GREEN) → T007 (types)
Developer B: T008 (mock factories) → T009 (verify factories)

# Schema work blocks adapter, so:
After T007 completes → T010 (RED adapter tests) → T011 (GREEN) → T012 (REFACTOR)

# Both developers wait for Phase 2 to complete, then split user stories
```

---

## Parallel Example: Phases 3–7 (User Stories)

```bash
# After Phase 2 (Foundational) completes, launch all 5 user stories:

Developer A Stream:
- T013–T022 (US1: PlanCard + SubscriptionPage + API route)
- T023–T027 (US2: UsageMetrics)
- T034–T040 (US4: BillingHistory)

Developer B Stream:
- T028–T033 (US3: PlanComparison)
- T041–T046 (US5: PaymentMethod)

# All streams run in parallel, complete by Day 8
# Then converge on Page Route + QA
```

---

## MVP Scope & Checkpoints

### MVP: User Stories 1–3 (P1 features)

**Checkpoint 1** (After Phase 2):

- ✅ Zod schemas validated and tested
- ✅ Mock adapter working with localStorage + 300ms delay
- ✅ Mock data factories working
- ✅ **Foundation ready for US implementation**

**Checkpoint 2** (After Phase 3 – US1):

- ✅ Current plan card displays correctly
- ✅ SubscriptionPage fetches and orchestrates
- ✅ API route returns correct schema
- ✅ **Can demo: "Users can view their current plan"**

**Checkpoint 3** (After Phase 4 – US2):

- ✅ Usage metrics render with progress bars
- ✅ Warning state at 80%+
- ✅ **Can demo: "Users can see their usage limits with warnings"**

**Checkpoint 4** (After Phase 5 – US3):

- ✅ Plan comparison table displays all tiers
- ✅ Current plan highlighted
- ✅ Upgrade/downgrade buttons show "Coming soon"
- ✅ **MVP complete: "Users can compare plans and see upgrade path"**

**Checkpoints 5–6** (After Phases 6–7 – US4 & US5):

- ✅ Billing history displays invoices
- ✅ Payment method displays for paid users
- ✅ All edge cases handled
- ✅ **Feature complete: All 5 user stories delivered**

---

## Test Organization by Phase

### Phase 2: Foundational Tests (30+ tests)

**Location**: `src/lib/schemas/__tests__/`, `src/lib/adapters/__tests__/`, `tests/fixtures/`

- Schema validation tests: 15 tests
- Adapter unit tests: 30+ tests
- Total: ~50 tests

**Running**: `npm run test:ci:parallel -- src/lib/`

### Phases 3–7: Component & Route Tests (100+ tests)

**Location**: `src/components/subscription/__tests__/`, `src/app/api/*/route.test.ts`

- PlanCard: 8 tests
- UsageMetrics: 12 tests
- PlanComparison: 15 tests
- BillingHistory: 10 tests
- PaymentMethod: 10 tests
- SubscriptionPage: 25 tests
- API routes (/subscription, /billing/history): 12 tests
- Total: ~92 component tests

**Running**: `npm run test:ci:parallel -- src/components/subscription/ src/app/api/`

### Phase 8: E2E Tests (8 scenarios)

**Location**: `tests/e2e/subscription.e2e.ts`

- E2E-1: Load page → see all sections
- E2E-2: Verify 2s load time
- E2E-3: Usage warning at 85%
- E2E-4: Trial user → "Choose Plan" → scroll
- E2E-5: Non-functional buttons → toast
- E2E-6: Mobile responsive (375px)
- E2E-7: Tablet responsive (768px)
- E2E-8: Error handling → retry

**Running**: `npm run test:e2e -- subscription.e2e.ts`

### Total Coverage

- **~150+ tests** across unit + integration + E2E
- **80%+ code coverage** on all new code
- **All user stories independently testable**

---

## Implementation Notes

### Tech Stack Alignment

- **TypeScript 5.9.2**: Strict mode, no `any` types
- **Next.js 16**: App Router, API routes at `/app/api/`
- **React 19**: Functional components, Hooks (useState, useEffect, useContext)
- **Tailwind CSS 4.x**: Utility-first, responsive design
- **shadcn/ui**: Pre-built components (Button, Card, Table, Toast, etc.)
- **Zod**: Schema validation + TypeScript type inference
- **Jest 30.2.0+**: Unit + integration tests
- **Playwright 1.56.1+**: E2E tests
- **Testing Library**: React component testing

### Key Patterns from Feature 010

- Mock adapter with localStorage + network delay
- useEffect for data fetching
- Loading/error/retry UI states
- Skeleton loaders
- Toast notifications
- Responsive Tailwind design

### New Patterns for Feature 012

- Pagination support (prepared for F014 backend)
- Multi-component orchestration (SubscriptionPage)
- Tab-based section layout (plan, usage, comparison, history, payment)
- Status-based conditional rendering (trial vs. active vs. free)
- Warning thresholds (80% usage)

---

## Rollout & Deployment

### Pre-Merge Validation

- [ ] All tests passing (unit + integration + E2E)
- [ ] 80%+ code coverage
- [ ] No TypeScript errors
- [ ] ESLint clean
- [ ] Markdown lint clean
- [ ] Codacy analysis clean
- [ ] No code duplication
- [ ] Responsive on mobile/tablet/desktop

### PR Merge

- [ ] Automated: CI/CD checks pass (GitHub Actions)
- [ ] Human: Code review by @doug
- [ ] Manual: Demo feature on staging if available
- [ ] Merge to `main` via auto-merge (status checks required)

### Deployment to Production

- [ ] Fly.io auto-deploys on `main` push
- [ ] Monitor error logs for issues
- [ ] Feature is UI-only; no backend data persistence

### Monitoring Post-Deploy

- [ ] Page load time (target ≤2s)
- [ ] API response time (target ≤500ms)
- [ ] Error rate (target <0.5%)
- [ ] User feedback on subscription UX

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Test Coverage | ≥80% | TBD (after implementation) |
| Code Duplication | 0% (DRY) | TBD |
| File Size | Max 450 lines | TBD |
| Function Size | Max 50 lines | TBD |
| Type Safety | No `any` types | TBD |
| Accessibility | WCAG 2.1 AA | TBD |
| Mobile Responsive | ≥320px no scroll | TBD |
| Load Time | ≤2s | TBD |
| E2E Scenarios | 8/8 passing | TBD |
| Linting | 0 errors | TBD |
| Build | Success | TBD |

---

## Next Steps (Post-Approval)

1. ✅ This tasks.md is generated and ready
2. Execute Phase 1: Setup (T001–T003)
3. Execute Phase 2: Foundational (T004–T012) ← **CRITICAL PATH**
4. Execute Phases 3–7: User Stories (T013–T046) ← Run in parallel if possible
5. Execute Phase 8: Page Route (T047–T052)
6. Execute Phase 9: QA (T053–T065)
7. Execute Phase 10: Docs (T066–T076)
8. Optional: Execute Phase 11: Polish (T077–T093)
9. Submit PR and merge to `main`
10. Monitor production deployment

---

**Document Generated**: 2025-11-13 | **Status**: Ready for Execution | **Branch**: `feature/012-subscription-billing` | **Maintainer**: @doug

---

## Notes for Developers

- **Start with Phase 2 Foundational**: Schemas, adapter, and fixtures are dependencies for all UI work
- **Test-First Approach**: Write RED tests (failing), then GREEN implementation, then REFACTOR
- **Independent Testing**: Each user story can be tested independently without others
- **Parallel Work**: After Phase 2, all 5 user stories can proceed in parallel
- **MVP Path**: Complete US1 → US2 → US3 for minimum viable product; US4/US5 are secondary
- **Reference**: See `quickstart.md` for code examples, `plan.md` for architecture, `data-model.md` for schemas
- **Questions**: Ask @doug for clarifications on acceptance criteria or implementation details
