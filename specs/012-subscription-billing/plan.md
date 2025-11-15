# Implementation Plan: Subscription & Billing Pages (Feature 012)

**Branch**: `feature/012-subscription-billing` | **Date**: 2025-11-13 | **Spec**: [specs/012-subscription-billing/spec.md](./spec.md)

**Maintainer**: @doug

---

## Summary

Feature 012 delivers subscription and billing pages for D&D Tracker, enabling users to view their current plan, usage metrics, compare subscription tiers, and review billing history. The feature uses a localStorage-backed mock adapter with 300ms network delay simulation (consistent with Feature 010) to render all required UI without backend persistence. This establishes the foundation for future Stripe integration (Feature F064) and supports three subscription tiers: Free, Seasoned Adventurer, and Master DM.

**Key Deliverables**:

- `/subscription` page with current plan card, usage metrics, plan comparison table, billing history section, and payment method display
- Zod-validated data schemas for subscriptions, plans, usage metrics, and invoices
- Two API routes: `GET /api/subscription` and `GET /api/billing/history` with paginated responses
- Mock adapter with configurable network delay and realistic error handling
- 80%+ test coverage with Jest + Testing Library
- Fully responsive design for mobile/tablet/desktop (≥320px)
- All non-functional UI elements (upgrade/downgrade, update payment, download invoice) display "Coming soon" toast notifications

---

## Technical Context

**Language/Version**: TypeScript 5.9.2 (Next.js 16, React 19)  
**Primary Dependencies**: Next.js 16, React 19, Tailwind CSS 4.x, shadcn/ui, Zod, Jest 30.2.0+, Playwright 1.56.1+  
**Storage**: localStorage-backed mock adapter with 300ms network delay (swappable for MongoDB/Mongoose in F014)  
**Testing**: Jest + Testing Library (unit/integration), Playwright (E2E)  
**Target Platform**: Web (Next.js full-stack on Node.js 25.x+)  
**Performance Goals**:

- Page load: ≤2 seconds (including 300ms adapter delay)
- Initial paint: ≤1 second
- Skeleton loader during data fetch

**Constraints**:

- Max 450 lines per file (uncommented code)
- Max 50 lines per function
- 80%+ test coverage on new code
- No code duplication (reuse Feature 010 patterns where applicable)
- Mobile-first responsive design
- WCAG 2.1 AA accessibility compliance

**Scale/Scope**:

- 6 UI components (SubscriptionPage, PlanCard, UsageMetrics, PlanComparison, BillingHistory, PaymentMethod)
- 2 API routes (`/api/subscription`, `/api/billing/history`)
- 1 adapter (subscriptionAdapter)
- 5 Zod schemas (Subscription, Plan, UsageMetric, Invoice, pagination)
- 40–60 test cases (unit + integration + E2E)

---

## Constitution Check

**Gate: Must pass before Phase 1 design. Re-check after Phase 1 design.**

✅ **Quality & Ownership**: Plan enforces high quality through TDD (write failing tests first), strict TypeScript, and comprehensive error handling. Single responsibility per component; composition-friendly design.

✅ **Test-First (TDD)**: All new behavior requires failing tests → implementation → refactor. Test suite includes unit tests (component logic, adapter methods), integration tests (API routes), and E2E tests (critical user flows: view plan, check limits, review history).

✅ **Simplicity & Composability**: Components are small (SubscriptionPage, PlanCard ~40 lines each), adapters are modular, and all code follows DRY principles. Reuses Feature 010 patterns (userAdapter, error states, loading states).

✅ **Observability & Security**: Adapter includes console.error logging for storage failures and validation issues. Input validation at every layer (Zod schemas, API routes). No sensitive data in localStorage (mock implementation; real Stripe data deferred to F014).

✅ **Versioning & Governance**: Feature 012 complies with `.specify/memory/constitution.md` v1.0.0 (ratified 2025-11-08). All code follows CONTRIBUTING.md standards: TDD, max file/function sizes, 80% coverage, Codacy checks.

✅ **Development Workflow**: Follows CONTRIBUTING.md § 2 (Development Process):

- TDD required: write failing tests, implement, refactor
- Linting: `npm run lint:fix`, `npm run lint:markdown:fix`
- Quality gates before PR: type-check, lint, test:ci:parallel, build
- Codacy analysis post-edit: `codacy_cli_analyze` for each file

---

## Project Structure

### Documentation (this feature)

```text
specs/012-subscription-billing/
├── spec.md              # Feature specification (existing)
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 research (this document)
├── data-model.md        # Phase 1 data model & schemas
├── contracts/           # Phase 1 API contracts (OpenAPI)
│   ├── subscription-api.yaml
│   └── billing-history-api.yaml
├── quickstart.md        # Phase 1 implementation quickstart
└── tasks.md             # Phase 2 task checklist (/speckit.tasks output)
```

### Source Code (repository root)

```text
src/
├── app/api/subscription/
│   ├── route.ts                    # GET /api/subscription
│   └── __tests__/
│       └── route.test.ts           # API route tests
├── app/api/billing/
│   ├── history/
│   │   ├── route.ts                # GET /api/billing/history
│   │   └── __tests__/
│   │       └── route.test.ts       # Pagination tests
├── app/(authenticated)/subscription/
│   ├── page.tsx                    # Main page (layout + orchestration)
│   └── __tests__/
│       └── page.test.tsx           # E2E component test
├── components/subscription/
│   ├── SubscriptionPage.tsx        # Page orchestrator (~50 lines)
│   ├── PlanCard.tsx                # Current plan display (~40 lines)
│   ├── UsageMetrics.tsx            # Progress bars + warnings (~60 lines)
│   ├── PlanComparison.tsx          # Tier comparison table (~80 lines)
│   ├── BillingHistory.tsx          # Invoice table (~70 lines)
│   ├── PaymentMethod.tsx           # Card display (~40 lines)
│   ├── index.ts                    # Barrel export
│   └── __tests__/
│       ├── SubscriptionPage.test.tsx
│       ├── PlanCard.test.tsx
│       ├── UsageMetrics.test.tsx
│       ├── PlanComparison.test.tsx
│       ├── BillingHistory.test.tsx
│       └── PaymentMethod.test.tsx
├── lib/adapters/
│   ├── subscriptionAdapter.ts      # localStorage-backed mock adapter
│   └── __tests__/
│       └── subscriptionAdapter.test.ts
├── lib/schemas/
│   ├── subscriptionSchema.ts       # Zod schemas for subscription data
│   └── __tests__/
│       └── subscriptionSchema.test.ts
└── types/
    └── subscription.ts             # TypeScript types (inferred from Zod)

tests/
├── e2e/
│   └── subscription.e2e.ts        # Playwright E2E: view plan, check usage, review history
├── integration/
│   └── subscription-api.test.ts   # API route integration tests
└── fixtures/
    └── subscription-fixtures.ts   # Reusable mock data factories
```

**Structure Decision**: Single monorepo (Next.js full-stack) as established in Features 001–011. Subscription feature is frontend-only (no backend persistence); adapter is swappable for F014 backend integration.

---

## Complexity Tracking

| Complexity Concern | Why Needed | Simpler Alternative Rejected |
|-----------|------------|-------------------------------------|
| Pagination (offset/limit) | API routes return paginated invoices to support 10+ historical items without massive response; prepares for infinite scroll or pagination UI in F013+ | Single flat array would leak data structure to UI; pagination abstracts invoice count and enables backend filtering when MongoDB added |
| Mock adapter abstraction | Enables isolated testing of UI logic and easy migration to real backend (Stripe/MongoDB) without refactoring components | Direct localStorage calls would tightly couple components to storage; testing and migration would require mass refactoring |
| Multiple validation layers | Zod at adapter boundary catches malformed data early; schema validation in components prevents runtime errors | Single validation point (API route) misses corruption in localStorage; separate component validation duplicates logic |
| 5 Zod schemas | Each entity (Subscription, Plan, UsageMetric, Invoice) has distinct shape and validation rules; pagination schema is necessary | Single monolithic schema would conflate entities; harder to test, maintain, and extend per-entity validation |

All complexity choices serve maintainability, testability, and future-proofing for F014 integration.

---

## Acceptance Criteria (Normalized & Testable)

**Mapped to user stories & requirements from spec.md**:

1. **View Current Plan** (User Story 1)
   - ✅ SC-001: Subscription page loads all sections within 2s
   - ✅ SC-004: Users identify their current plan within 5s of page load
   - ✅ Test: `expect(screen.getByText(/seasoned adventurer/i)).toBeInTheDocument()`
   - ✅ Test: `expect(screen.getByText(/renewal date:/i)).toBeInTheDocument()`

2. **Review Usage Metrics** (User Story 2)
   - ✅ SC-002: Usage metrics reflect mock data (e.g., 2/3 parties = 66.7% bar)
   - ✅ FR-002: Progress bars display current/max with warning at ≥80%
   - ✅ Test: `expect(progressBar.textContent).toMatch(/66\.7%/)`
   - ✅ Test: `expect(usageCard.classList).toContain('warning')`

3. **Compare Plan Tiers** (User Story 3)
   - ✅ FR-003: Comparison table shows ≥3 tiers with features + limits
   - ✅ FR-003: Current plan highlighted; upgrade/downgrade buttons visible
   - ✅ SC-003: Tiers display consistent formatting; buttons visible
   - ✅ Test: `expect(screen.getByRole('table')).toBeInTheDocument()`
   - ✅ Test: `expect(screen.getByText(/master dm/i)).toBeInTheDocument()`

4. **Access Billing History** (User Story 4)
   - ✅ FR-004: ≥3 mock past invoices display with date, description, amount, status
   - ✅ SC-009: Accessibility: all elements have ARIA labels
   - ✅ Test: `expect(screen.getAllByRole('row')).toHaveLength(4)` (header + 3 invoices)
   - ✅ Test: `expect(screen.getByText(/paid/i)).toBeInTheDocument()`

5. **View Payment Method** (User Story 5)
   - ✅ FR-005: Masked card display (•••• 4242) + expiration visible
   - ✅ FR-005: Free tier hides payment section
   - ✅ Test: `expect(screen.getByText(/••••/)).toBeInTheDocument()`
   - ✅ Test: Free user: `expect(screen.queryByText(/payment method/i)).not.toBeInTheDocument()`

6. **API Routes & Validation**
   - ✅ FR-008: `GET /api/subscription` returns `{ subscription, usageMetrics, availablePlans }`
   - ✅ FR-008: `GET /api/billing/history` returns paginated invoices
   - ✅ FR-007: All schemas use Zod validation
   - ✅ Test: API response matches schema; invalid data rejected

7. **Error Handling & Loading**
   - ✅ FR-009: Error state displays with retry button
   - ✅ FR-010: Empty state displays for new users (no invoices)
   - ✅ Test: Render with error; verify retry button; confirm error cleared after success

8. **Non-Functional Features Show "Coming Soon"**
   - ✅ FR-011: Upgrade/downgrade buttons, update payment, download invoice show toast
   - ✅ Test: Click button → toast appears; toast disappears after 3–5s

9. **Performance**
   - ✅ SC-001: Page ≤2s load time
   - ✅ SC-006: Adapter provides data within 300ms (network delay simulation)
   - ✅ Test: Measure load time; verify 300ms delay in adapter

10. **Responsiveness**
    - ✅ SC-005: Mobile, tablet, desktop responsive; no horizontal scroll on ≥320px
    - ✅ FR-012: Responsive design
    - ✅ Test: E2E on mobile (375px), tablet (768px), desktop (1440px)

11. **Test Coverage**
    - ✅ SC-010: ≥80% coverage on new code
    - ✅ Test: Jest coverage report confirms threshold

---

## Approach & Design Brief

### Architecture Overview

**Three-Layer Design**:

1. **UI Layer** (React Components)
   - `SubscriptionPage`: Orchestrator component; fetches data, manages loading/error states
   - `PlanCard`, `UsageMetrics`, `PlanComparison`, `BillingHistory`, `PaymentMethod`: Presentational components (stateless, accept props)
   - Reuses Feature 010 patterns: skeleton loader, error banner, retry button

2. **API Layer** (Next.js Routes)
   - `GET /api/subscription`: Calls `subscriptionAdapter.getSubscription(userId)` + `adapter.getUsageMetrics(userId)` + `adapter.getAvailablePlans()`
   - `GET /api/billing/history`: Calls `adapter.getBillingHistory(userId, page, pageSize)` with pagination
   - Both routes: validate headers (extract userId), catch errors, return standardized JSON responses

3. **Data Layer** (Adapter + Schemas)
   - `subscriptionAdapter`: localStorage-backed CRUD operations with 300ms network delay simulation
   - Zod schemas: Subscription, Plan, UsageMetric, Invoice, PaginatedResponse
   - Reuses Feature 010 pattern: validate on read/write; throw descriptive errors

### Key Design Decisions

1. **Mock Adapter Pattern** (Feature 010 reuse)
   - localStorage stores subscription data keyed by `subscription:${userId}`
   - 300ms delay simulates real network latency
   - Easy migration to MongoDB + Stripe in F014 (swap adapter without touching components)

2. **Zod Schemas for Type Safety & Validation**
   - All data validated on boundary (adapter read/write and API route)
   - `z.infer<typeof schema>` derives TypeScript types → single source of truth
   - Partial update schemas for PUT requests (id/userId/timestamps immutable)

3. **Pagination Design** (Prepared for F014)
   - API returns `{ invoices: Invoice[], totalCount: number, pageSize: number }`
   - Client-side pagination in mock adapter (page, pageSize parameters)
   - Backend pagination (MongoDB skip/limit) ready for F014

4. **Error Handling & Resilience**
   - localStorage failures → console.error + descriptive error message
   - Corrupted stored data → fallback to defaults, clear storage
   - API errors → try/catch, return 400/500 with error message
   - UI layer: display error banner + retry button; disable operations during loading

5. **Component Composition** (DRY Principle)
   - `UsageMetrics` extracted as reusable metric-display component
   - `PlanComparison` extracted for comparison table (reusable for future tier selector)
   - Shared test utilities (fixtures, mock factories) in `tests/fixtures/subscription-fixtures.ts`

6. **Responsive Design**
   - Tailwind CSS grid/flex for mobile-first layout
   - Card-based design for mobile; table for desktop (responsive table or grid fallback)
   - Breakpoints: mobile <640px, tablet 640–1024px, desktop >1024px

---

## Step-by-Step Implementation Plan (TDD-First)

### Phase 1: Data Layer & Schemas (RED → GREEN → REFACTOR)

**Goal**: Establish Zod schemas, types, and adapter with comprehensive tests.

#### Step 1.1: Write Zod Schemas & Type Tests (RED)

- Create `src/lib/schemas/subscriptionSchema.ts`
- Define schemas: `SubscriptionSchema`, `PlanSchema`, `UsageMetricSchema`, `InvoiceSchema`, `PaginatedInvoicesSchema`
- Write schema tests: invalid inputs rejected, valid inputs accepted
- Test: `subscriptionSchema.safeParse({invalid})` → errors; `safeParse({valid})` → success

**Deliverable**: `subscriptionSchema.ts` + unit tests

#### Step 1.2: Implement Zod Schemas (GREEN)

- Export schemas and types

#### Step 1.3: Create Mock Data Factories (GREEN)

- Build `tests/fixtures/subscription-fixtures.ts`
- Factories: `createMockSubscription()`, `createMockPlan()`, `createMockUsageMetric()`, `createMockInvoice()`
- Factories accept overrides for customization

**Deliverable**: Reusable mock data

#### Step 1.4: Write Adapter Tests (RED)

- Create `src/lib/adapters/__tests__/subscriptionAdapter.test.ts`
- Tests: `getSubscription()`, `getUsageMetrics()`, `getAvailablePlans()`, `getBillingHistory(userId, page, pageSize)`
- Test network delay, localStorage persistence, validation errors, corrupted data recovery
- Test: delay ≥300ms, data persists across reads, invalid data throws

**Deliverable**: Adapter test suite (failing)

#### Step 1.5: Implement Adapter (GREEN)

- Create `src/lib/adapters/subscriptionAdapter.ts`
- Implement all adapter methods; use Zod schemas for validation
- Each method simulates 300ms network delay, persists to localStorage

**Deliverable**: Full mock adapter

#### Step 1.6: Refactor Data Layer (REFACTOR)

- Extract common storage/delay logic into utility functions
- Consolidate error messages
- Ensure DRY principle (no duplicated validation)

**Deliverable**: Clean, maintainable data layer

---

### Phase 2: API Routes (RED → GREEN → REFACTOR)

**Goal**: Two validated API routes returning correct JSON with Zod schemas.

#### Step 2.1: Write API Route Tests (RED)

- Create `src/app/api/subscription/__tests__/route.test.ts`
- Tests: GET returns subscription + usage + plans; validates schema; handles errors
- Create `src/app/api/billing/history/__tests__/route.test.ts`
- Tests: GET with `?page=1&pageSize=10` returns paginated invoices; respects pagination params

**Deliverable**: API route tests (failing)

#### Step 2.2: Implement API Routes (GREEN)

- Create `src/app/api/subscription/route.ts`: `GET` handler calls adapter, returns validated JSON
- Create `src/app/api/billing/history/route.ts`: `GET` handler with pagination params

**Deliverable**: Working API routes

#### Step 2.3: Refactor API Routes (REFACTOR)

- Extract error handling to utility (shared error response format)
- DRY up validation logic

**Deliverable**: Clean API routes

---

### Phase 3: UI Components (RED → GREEN → REFACTOR)

**Goal**: Six focused components (SkeletonCard, LoadingState, ErrorState, +6 feature components).

#### Step 3.1: Write Component Tests (RED)

- Create `src/components/subscription/__tests__/` with test files for:
  - `PlanCard.test.tsx`: render current plan + manage button
  - `UsageMetrics.test.tsx`: render progress bars, warning at ≥80%
  - `PlanComparison.test.tsx`: render table with ≥3 tiers, current plan highlighted
  - `BillingHistory.test.tsx`: render invoice table; empty state when no invoices
  - `PaymentMethod.test.tsx`: render card; hide for free users
  - `SubscriptionPage.test.tsx`: orchestrate data fetch, loading, error states, retry
- All tests: render with mock data, verify content, interact (button clicks → toast)

**Deliverable**: Component tests (failing)

#### Step 3.2: Implement Components (GREEN)

- Create presentational components (`PlanCard`, `UsageMetrics`, etc.) with minimal logic
- Create `SubscriptionPage` orchestrator: fetch data from API, pass to children, handle loading/error
- Use Feature 010 patterns: skeleton loader, error banner, retry logic
- Toast for "Coming soon" buttons

**Deliverable**: Working UI components

#### Step 3.3: Refactor Components (REFACTOR)

- Ensure max 50-line functions, max 450-line files
- Extract duplication (error boundary, loading state)
- Verify accessibility (ARIA labels, keyboard navigation)

**Deliverable**: Clean, accessible components

---

### Phase 4: Page Integration & Routing (RED → GREEN → REFACTOR)

**Goal**: `/subscription` page route and end-to-end page test.

#### Step 4.1: Create Page Route

- Create `src/app/(authenticated)/subscription/page.tsx`: renders `SubscriptionPage`

#### Step 4.2: E2E Tests (RED)

- Create `tests/e2e/subscription.e2e.ts` (Playwright)
- Test 1: Load `/subscription` → see current plan, usage, comparison, history
- Test 2: Check usage warning at ≥80%
- Test 3: Click "Choose Plan" (trial user) → scroll to comparison table
- Test 4: Click upgrade/downgrade button → toast "Coming soon"
- Test 5: Mobile responsiveness: no horizontal scroll on 375px viewport

**Deliverable**: E2E tests

#### Step 4.3: Fix E2E Issues (GREEN + REFACTOR)

- Ensure page responsive, all tests pass

**Deliverable**: Passing E2E tests

---

### Phase 5: Test Coverage & Quality Gate

**Goal**: 80%+ coverage, all linting passes, Codacy analysis clean.

#### Step 5.1: Coverage Check

- Run `npm run test:ci:parallel -- --coverage`
- Target: ≥80% on subscription feature code
- Coverage report identifies uncovered lines; add tests as needed

#### Step 5.2: Linting & Type Check

- `npm run lint` → no errors
- `npm run lint:markdown` → no errors
- `npm run type-check` → no TypeScript errors
- `npm run build` → successful build

#### Step 5.3: Codacy Analysis

- Run `codacy_cli_analyze` on all new files
- Fix any code quality issues (complexity, duplication, code style)

**Deliverable**: 80%+ coverage, clean lint, passing Codacy

---

## Effort, Risks, and Mitigations

### Effort Estimate

| Phase | Component | Lines of Code | Effort | Notes |
|-------|-----------|---------------|--------|-------|
| 1 | Schemas + Adapter | ~400 LOC (schemas 150 + adapter 250) | 2–3 days | Reuse Feature 010 adapter pattern; straightforward Zod work |
| 2 | API Routes | ~80 LOC | 1 day | Simple route handlers; error handling via adapter |
| 3 | UI Components | ~400 LOC (6 components, ~60 avg) | 3–4 days | Feature 010 reuse reduces scope; straightforward React |
| 4 | Page Route + E2E | ~50 LOC + E2E tests | 2 days | E2E can be complex; plan for mobile/tablet edge cases |
| 5 | Testing + QA | Coverage, linting, Codacy | 1–2 days | Iterative refinement; likely to find edge cases |
| **Total** | | ~930 LOC | **9–12 days** | Single developer; parallelizable (schema + components in parallel) |

### Risks & Mitigations

| Risk | Severity | Impact | Mitigation |
|------|----------|--------|-----------|
| localStorage performance at scale (many invoices) | Low | Adapter slow on 100+ invoices; page load >2s | Implement pagination in mock adapter; paginate API response; deferring full data fetch reduces scope |
| Mobile responsive edge cases (payment card display, table overflow) | Medium | Users see broken layout on mobile; SC-005 fails | E2E test on 3 breakpoints; use Tailwind responsive classes; table-to-card fallback for mobile |
| Zod schema validation errors unclear to end users | Low | Users see cryptic error messages | Map Zod errors to user-friendly messages in adapter + API; toast errors on UI |
| Feature 010 pattern assumptions (localStorage keying, delay simulation) don't generalize to subscription data | Low | Need to refactor adapter; code duplication | Review Feature 010 adapter early; extract common storage/delay logic into utility |
| E2E tests flaky (timing, network simulation) | Medium | Tests fail intermittently; CI/CD blocked | Use explicit waits (waitForSelector, waitForTimeout); mock network delays consistently; retry on failure |
| 80% coverage hard to achieve (all UI branches, error paths) | Medium | Must add 50+ test cases; effort overruns | Prioritize: happy path + error cases + edge cases; use parameterized tests (it.each) to reduce duplication |

### Kill-Switch / Rollback Plan

- **Kill-Switch**: Feature 012 is UI-only with mock data; no backend persistence. Can disable by removing `/subscription` route and navigation link if critical issues found.
- **Rollback**: Git revert `feature/012-subscription-billing` → main (no data loss; localStorage state unaffected).
- **Partial Rollout**: Can hide feature behind feature flag in future (deferred to F999).

---

## File-Level Change List

### New Files

| File | Type | Purpose | Lines |
|------|------|---------|-------|
| `src/lib/schemas/subscriptionSchema.ts` | Schema | Zod schemas + types for subscription domain | ~150 |
| `src/lib/adapters/subscriptionAdapter.ts` | Adapter | localStorage-backed mock CRUD + network delay | ~250 |
| `src/components/subscription/SubscriptionPage.tsx` | Component | Orchestrator; data fetching + state management | ~50 |
| `src/components/subscription/PlanCard.tsx` | Component | Current plan display | ~40 |
| `src/components/subscription/UsageMetrics.tsx` | Component | Progress bars + warning indicator | ~60 |
| `src/components/subscription/PlanComparison.tsx` | Component | Tier comparison table | ~80 |
| `src/components/subscription/BillingHistory.tsx` | Component | Invoice table + empty state | ~70 |
| `src/components/subscription/PaymentMethod.tsx` | Component | Masked card display | ~40 |
| `src/components/subscription/index.ts` | Barrel | Re-exports for component folder | ~6 |
| `src/app/api/subscription/route.ts` | API Route | GET /api/subscription endpoint | ~30 |
| `src/app/api/billing/history/route.ts` | API Route | GET /api/billing/history endpoint | ~30 |
| `src/app/(authenticated)/subscription/page.tsx` | Page | Main subscription page route | ~5 |
| `src/types/subscription.ts` | Types | (Inferred from Zod; optional if inline) | N/A |
| `tests/fixtures/subscription-fixtures.ts` | Test Utilities | Mock data factories | ~80 |
| `src/lib/schemas/__tests__/subscriptionSchema.test.ts` | Test | Schema validation tests | ~60 |
| `src/lib/adapters/__tests__/subscriptionAdapter.test.ts` | Test | Adapter unit tests | ~150 |
| `src/app/api/subscription/__tests__/route.test.ts` | Test | API route integration tests | ~50 |
| `src/app/api/billing/history/__tests__/route.test.ts` | Test | Billing history API tests | ~40 |
| `src/components/subscription/__tests__/PlanCard.test.tsx` | Test | Component tests | ~50 |
| `src/components/subscription/__tests__/UsageMetrics.test.tsx` | Test | Component tests | ~60 |
| `src/components/subscription/__tests__/PlanComparison.test.tsx` | Test | Component tests | ~70 |
| `src/components/subscription/__tests__/BillingHistory.test.tsx` | Test | Component tests | ~60 |
| `src/components/subscription/__tests__/PaymentMethod.test.tsx` | Test | Component tests | ~50 |
| `src/components/subscription/__tests__/SubscriptionPage.test.tsx` | Test | Orchestrator tests + loading/error states | ~80 |
| `tests/e2e/subscription.e2e.ts` | E2E Test | Playwright end-to-end tests (5+ scenarios) | ~150 |
| `specs/012-subscription-billing/research.md` | Docs | Phase 0 research findings (this artifact) | ~50 |
| `specs/012-subscription-billing/data-model.md` | Docs | Phase 1 data model + schema definitions | ~100 |
| `specs/012-subscription-billing/contracts/subscription-api.yaml` | Docs | OpenAPI spec for /api/subscription | ~50 |
| `specs/012-subscription-billing/contracts/billing-history-api.yaml` | Docs | OpenAPI spec for /api/billing/history | ~40 |
| `specs/012-subscription-billing/quickstart.md` | Docs | Phase 1 implementation quickstart | ~50 |

**Total New Files**: ~30; **Total Lines**: ~1,600+ (code + tests)

### Modified Files

| File | Change | Reason |
|------|--------|--------|
| `src/components/subscription/index.ts` | (create barrel export) | Standard pattern for component folders; enables `import { SubscriptionPage } from '@/components/subscription'` |
| `.env.example` | (no changes needed) | Feature is mock-only; no new env vars required until F014 (Stripe integration) |
| `docs/Feature-Roadmap.md` | (update status) | Mark Feature 012 as "Implemented" after merge |
| `README.md` | (optional: add features) | Document subscription pages if appropriate |

**Note**: No modifications to existing adapters, schemas, or API routes required. Feature is isolated and non-breaking.

---

## Test Plan

### Unit Tests (Jest + Testing Library)

**Coverage Target**: ≥80% on all new code.

#### Schemas & Adapter (~60 tests)

1. **Zod Schema Validation** (15 tests)
   - Valid subscription object → passes
   - Invalid subscription (missing fields, wrong types) → rejects with error
   - Valid plan object → passes
   - Valid usage metric, invoice → passes
   - Partial update schema rejects immutable fields (id, userId, timestamps)

2. **Adapter Methods** (~30 tests)
   - `getSubscription(userId)` → returns mock subscription; includes 300ms delay
   - `getSubscription()` with corrupted storage → recovers with defaults; clears storage
   - `getUsageMetrics(userId)` → returns array of metrics; validates schema
   - `getAvailablePlans()` → returns 3+ plan tiers
   - `getBillingHistory(userId, page, pageSize)` → returns paginated invoices; respects params
   - `getBillingHistory()` with page out of range → returns empty array or error
   - All methods validate Zod schema before returning
   - Network delay functions as expected

3. **Storage Utilities** (~15 tests)
   - localStorage persistence: write → read → matches
   - Error handling: corrupted JSON in localStorage → recovers
   - Keying: unique keys for different users prevent collision

#### API Routes (~12 tests)

1. **GET /api/subscription** (6 tests)
   - Valid request → 200 with subscription + usage + plans
   - Response matches schema (has required fields)
   - Error case (adapter throws) → 500 with error message
   - Extract userId from header correctly

2. **GET /api/billing/history** (6 tests)
   - Valid request with ?page=1&pageSize=10 → 200 with paginated invoices
   - Response includes totalCount, pageSize
   - Invalid pagination params (page < 1) → 400 error
   - Missing pagination params → defaults applied (page=1, pageSize=10)

#### UI Components (~80 tests)

1. **PlanCard** (8 tests)
   - Render current plan name, renewal date, billing frequency
   - Current plan badge visible
   - Trial user: show trial days remaining
   - "Manage" button visible; "Choose Plan" button visible for trial user
   - "Choose Plan" (trial) → scroll behavior (integration test)

2. **UsageMetrics** (12 tests)
   - Render metric rows (parties, encounters, items, combat sessions)
   - Progress bar displays correct percentage (2/3 = 66.7%)
   - ≥80% usage → warning state (color, label)
   - 100% usage → error state
   - Free tier → "Unlimited" text instead of count
   - Accessible: ARIA labels, keyboard navigation

3. **PlanComparison** (15 tests)
   - Render table with 3+ tiers
   - Current plan column highlighted
   - Features column: ✓ for included, ✗ for excluded
   - Upgrade/downgrade buttons for non-current tiers
   - Button click → "Coming soon" toast
   - Toast dismisses after 3–5 seconds

4. **BillingHistory** (10 tests)
   - Render table with invoice rows
   - Each row: date, description, amount, status
   - ≥3 mock invoices displayed
   - Empty state: "No invoices yet" message when zero invoices
   - Invoice date formatted (human-readable + ISO)
   - Download button (non-functional) → "Coming soon" toast

5. **PaymentMethod** (10 tests)
   - Paid user: render card display (•••• 4242 - Expires 12/26)
   - Free user: section hidden entirely
   - Update button (non-functional) → "Coming soon" toast
   - Expiring card (30 days): warning visible

6. **SubscriptionPage** (25 tests)
   - Loading state: skeleton loader visible
   - Success state: all sections rendered after data fetch
   - Error state: error banner + retry button visible
   - Retry button: clears error, re-fetches data
   - All child components receive correct props
   - Extract userId from context/header correctly

### Integration Tests (~20 tests)

1. **API + Adapter Integration** (10 tests)
   - API route calls adapter; adapter returns valid data
   - Invalid adapter response rejected by API

2. **Component + API Integration** (10 tests)
   - SubscriptionPage fetches from /api/subscription; parses response; passes to children
   - Error during fetch → error state rendered
   - Retry after error → successful re-fetch

### E2E Tests (Playwright) (~8 scenarios)

1. **Happy Path**: Load `/subscription` → see plan, usage, comparison, history (mobile + desktop)
2. **Usage Warning**: Usage at 85% → warning visible
3. **Trial Conversion**: Trial user → "Choose Plan" button → scroll to comparison table
4. **Non-Functional Buttons**: Click upgrade/downgrade/update payment/download → toast appears
5. **Empty State**: New user with no invoices → "No invoices yet" message
6. **Mobile Responsiveness**: 375px viewport → no horizontal scroll; all content visible
7. **Error Handling**: Simulate adapter failure → error banner → retry → success
8. **Payment Method**: Paid user sees card; free user doesn't

### Coverage Target

```
Statements   : 80%+ (excluding test utilities, fixtures)
Branches     : 75%+ (error paths, conditionals)
Functions    : 80%+ (all public functions)
Lines        : 80%+ (avoid dead code)
```

---

## Rollout & Monitoring Plan

### Deployment Strategy

1. **Phase 1: Feature Branch** (this plan)
   - Complete development on `feature/012-subscription-billing`
   - Pass all tests, linting, Codacy analysis
   - Create PR and address review comments

2. **Phase 2: PR Review & Merge** (after plan approval)
   - Automated: Codacy + CI/CD checks must pass
   - Human: Maintainer reviews code quality, test coverage, documentation
   - Merge to `main` via auto-merge (status checks required)

3. **Phase 3: Deployment to Production** (post-merge)
   - Fly.io auto-deploys on `main` push (configured in fly.toml)
   - Monitor for errors in logs
   - No feature flag needed (UI-only; mock data doesn't affect production)

### Monitoring & Observability

1. **Performance Monitoring**
   - Page load time: track in application monitoring (e.g., Vercel Analytics)
   - Network latency: verify 300ms adapter delay in tests (consistent)
   - Error rate: capture failed adapter calls or API errors

2. **Error Tracking**
   - Sentry/error logging: capture adapter failures, API errors, validation errors
   - Console errors: monitor for localStorage corruption or failed parses
   - User feedback: survey users on subscription page UX

3. **Metrics to Track**
   - Page load time (SC-001: target ≤2s)
   - API response time (target ≤500ms for /api/subscription, /api/billing/history)
   - Error rate (target <0.5% on successful data fetch)
   - Usage metric accuracy (spot-check sample users)

### Rollback Plan

- **If critical issues discovered post-deploy**:
  1. Revert `feature/012-subscription-billing` commit to `main`
  2. Fly.io auto-redeploys previous version
  3. No data loss (mock localStorage remains; real data in F014)
  4. Create issue for root cause analysis

---

## Handoff Package

### Artifacts Generated

1. **Implementation Plan** (this file): Detailed step-by-step guide for developers
2. **Data Model Document** (`data-model.md`): Entity definitions, relationships, validation rules
3. **API Contracts** (`contracts/subscription-api.yaml`, `contracts/billing-history-api.yaml`): OpenAPI specs for API routes
4. **Quickstart Guide** (`quickstart.md`): Quick reference for developers (schema usage, adapter calls, component props)
5. **Research Findings** (`research.md`): Phase 0 research (dependencies, technology choices, alternatives)

### Pre-Implementation Checklist

- [ ] Maintainer (@doug) approves this plan
- [ ] Feature branch `feature/012-subscription-billing` exists and is up-to-date with `main`
- [ ] `.specify/memory/constitution.md` is accessible and current
- [ ] Developer has access to repository and CI/CD pipeline
- [ ] Development environment set up: Node.js 25.x+, npm 9.x+, MongoDB (local or Atlas)
- [ ] All dependencies installed (`npm install`)

### Post-Implementation Checklist (Before PR)

- [ ] All tests passing (`npm run test:ci:parallel`)
- [ ] TypeScript compilation successful (`npm run type-check`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Markdown linting passes (`npm run lint:markdown`)
- [ ] Build succeeds (`npm run build`)
- [ ] Coverage ≥80% (`npm run test:ci:parallel -- --coverage`)
- [ ] Codacy analysis clean (run `codacy_cli_analyze` on all new files)
- [ ] No merge conflicts with `main`
- [ ] PR description includes: feature summary, files changed, test coverage, Codacy results
- [ ] All acceptance criteria met (verify each SC-001 through SC-010)

### Knowledge Transfer

- **For Developers**: Review this plan + data-model.md + quickstart.md before starting implementation
- **For Reviewers**: Focus on: test coverage (80%+), component size (<450 lines, functions <50 lines), no code duplication, Zod validation, error handling
- **For Future Maintainers**: F012 establishes foundation for F014 (Stripe integration). Adapter pattern is swappable; can replace localStorage with MongoDB/Stripe API calls without touching components.

---

## Constitution Compliance Summary

✅ **Quality & Ownership**: TDD approach, high quality, single responsibility per component  
✅ **Test-First (TDD)**: 80%+ coverage, failing tests → implementation → refactor cycle  
✅ **Simplicity & Composability**: Small components (<60 lines), reusable adapter, DRY schemas  
✅ **Observability & Security**: Error handling, validation at boundaries, logging for failures  
✅ **Versioning & Governance**: Complies with constitution v1.0.0 and CONTRIBUTING.md  
✅ **Development Workflow**: Follows CONTRIBUTING.md § 2: linting, type checking, tests, Codacy analysis  

All implementation steps respect CONTRIBUTING.md requirements: TDD, code quality gates, security, and comprehensive testing before PR.

---

## Next Steps

1. **Maintainer Review**: @doug reviews this plan; confirms approach, effort estimate, and architecture
2. **Data Model Design** (Phase 1): Generate `data-model.md` + API contracts once plan approved
3. **Implementation** (Phases 1–5): Developers follow step-by-step guide; track progress via `/speckit.tasks`
4. **Testing & QA**: Verify coverage, linting, and Codacy analysis before PR
5. **Handoff to Developers**: Provide quickstart.md, research.md, and artifacts to implementation team

---

**Plan Generated**: 2025-11-13 | **Branch**: `feature/012-subscription-billing` | **Status**: Ready for Implementation
