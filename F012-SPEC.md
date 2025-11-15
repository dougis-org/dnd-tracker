# Feature Specification: Subscription & Billing Pages

**Feature Branch**: `feature/012-subscription-billing`  
**Created**: 2025-11-12  
**Status**: Draft  
**Input**: User description: "Subscription and Billing pages"

**Maintainer**: @doug  
**Canonical components (UI)**: SubscriptionPage, BillingPage, PlanCard, UsageMetrics, PlanComparison, BillingHistory  
**Constitution**: This specification must comply with `.specify/memory/constitution.md`. After edits, run the required Codacy analysis for any edited files per repository rules.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Current Subscription Plan (Priority: P1)

A user wants to understand their current subscription status, including what plan they're on, when it renews, and what features are available.

**Why this priority**: Core feature—users need to know their subscription status immediately upon visiting subscription pages. This is the foundation for all other subscription features.

**Independent Test**: Can be fully tested by loading `/subscription` page and verifying subscription information displays correctly with mock data. Delivers value by showing users what they've paid for.

**Acceptance Scenarios**:

1. **Given** a user is logged in and has an active subscription, **When** they navigate to `/subscription`, **Then** they see their current plan name (e.g., "Seasoned Adventurer"), renewal date, and annual/monthly billing frequency
2. **Given** a user is viewing the subscription page, **When** they examine the plan card, **Then** they see a clear "Current Plan" badge and next renewal date
3. **Given** a new user with a free trial, **When** they view `/subscription`, **Then** they see trial remaining days and trial conversion CTA

---

### User Story 2 - Review Usage Metrics & Limits (Priority: P1)

A user wants to see how much of their subscription allocation they've used (parties, encounters, etc.) with visual progress indicators to understand if they need to upgrade.

**Why this priority**: Critical for user experience—shows value received and encourages upgrades at natural friction points. Prevents user frustration from hitting limits unexpectedly.

**Independent Test**: Can be fully tested by rendering usage metrics with progress bars and verifying accuracy of percentages. Delivers clear value by preventing feature lockouts.

**Acceptance Scenarios**:

1. **Given** a user with active usage (e.g., 2/3 parties, 8/15 encounters), **When** they view `/subscription`, **Then** they see horizontal progress bars for each metric with current/max values
2. **Given** a user approaching their limit (e.g., 9/10 available items), **When** they view a metric bar, **Then** the bar displays warning coloring (amber/orange) to indicate approaching limit
3. **Given** a user who has hit a limit (encounters 15/15), **When** they view that metric, **Then** the bar shows red/error state and displays "Limit reached" text

---

### User Story 3 - Compare Plan Tiers (Priority: P1)

A user wants to understand what features and usage limits each subscription tier offers to make informed upgrade/downgrade decisions.

**Why this priority**: Directly supports monetization—clear tier comparison encourages upgrades. Tier decisions happen before checkout, making this essential for conversion.

**Independent Test**: Can be fully tested by rendering a comparison table with mock tier data and verifying all features/limits display. Delivers value by enabling confident purchasing decisions.

**Acceptance Scenarios**:

1. **Given** a user on the `/subscription` page, **When** they scroll to the plan comparison section, **Then** they see a table with 3+ tiers (Free, Seasoned Adventurer, Master DM) with features listed
2. **Given** a comparison table with multiple tiers, **When** the user reviews a feature row, **Then** they see checkmarks for included features and X marks for excluded/paid features
3. **Given** a comparison table, **When** the user views their current tier column, **Then** it has visual highlighting (different background or badge) to show their current plan

---

### User Story 4 - Access Billing History (Priority: P2)

A user wants to see past invoices and charges to verify correct billing and manage records for accounting purposes.

**Why this priority**: Important for user trust and support—reduces billing-related support tickets. Secondary to viewing current plan but still valuable for user confidence.

**Independent Test**: Can be fully tested by rendering a billing history table with mock transaction data. Delivers value by providing transparency and supporting record-keeping.

**Acceptance Scenarios**:

1. **Given** a user viewing `/subscription`, **When** they look for billing history, **Then** they see a "Billing History" section with a table of past invoices
2. **Given** a billing history table, **When** the user reviews an invoice row, **Then** they see: invoice date, description (subscription renewal), amount, and status (Paid/Pending)
3. **Given** a past invoice in the table, **When** the user clicks on it, **Then** a download/view action becomes available (non-functional in this feature)

---

### User Story 5 - Manage Payment Method (Priority: P2)

A user wants to update or view their stored payment method to ensure billing continues uninterrupted or to change payment options.

**Why this priority**: Important for account management and reducing churn from failed payments. Secondary to viewing plan but critical for account control.

**Independent Test**: Can be fully tested by displaying a payment method section with update UI. Delivers value by giving users confidence in payment management.

**Acceptance Scenarios**:

1. **Given** a user on `/subscription`, **When** they scroll to the "Payment Method" section, **Then** they see a card display showing last 4 digits and expiration (e.g., "•••• 4242 - Expires 12/26")
2. **Given** a payment method display, **When** the user wants to change it, **Then** they see an "Update Payment Method" button (non-functional in this feature)
3. **Given** a user with an expiring payment method, **When** they view the payment section, **Then** a warning shows if expiration is within 30 days

---

### Edge Cases

- What happens when a user has zero usage (all metrics at 0/X)?
- How does the system handle users on a free tier with no payment method on file?
- What if a user is viewing the page while a renewal is processing (transient state)?
- How should upcoming renewal charges or failed payments be displayed?
- What if user's browser doesn't support the data loading simulation (network delay)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a subscription management page at `/subscription` showing current plan, renewal date, and billing frequency
- **FR-002**: System MUST display usage metrics for core features (parties, encounters, items, combat sessions) with current/max values as progress bars
- **FR-003**: System MUST render a plan comparison table showing ≥3 tiers with features and usage limits for each tier, with current plan highlighted
- **FR-004**: System MUST display a billing history section showing ≥3 mock past invoices with date, description, amount, and status
- **FR-005**: System MUST display a payment method section showing masked card information (last 4 digits and expiration)
- **FR-006**: System MUST render all subscription page content using mock data via a localStorage-backed adapter with 300ms network delay simulation
- **FR-007**: System MUST use Zod validation schemas for subscription and billing data structures
- **FR-008**: System MUST provide API routes `/api/subscription` (GET) and `/api/billing/history` (GET) that return mock data
- **FR-009**: System MUST display error state and retry mechanism if data loading fails
- **FR-010**: System MUST display empty state UI if user has no billing history
- **FR-011**: Buttons for upgrade/downgrade, update payment method, and download invoice MUST be present but non-functional (show "Not Implemented" on click)
- **FR-012**: System MUST be fully responsive and mobile-optimized for screens ≥320px width

### Key Entities *(include if feature involves data)*

- **Subscription**: Represents user's current plan subscription with fields: planId, planName, billingFrequency (monthly/annual), renewalDate, status (active/trial/paused), trialDaysRemaining
- **Plan**: Defines available subscription tiers with fields: planId, name (Free/Seasoned Adventurer/Master DM), monthlyPrice, annualPrice, features[], usageLimits{}
- **UsageMetric**: Tracks feature usage with fields: metricName, currentUsage, maxAllowed, category (character/party/encounter)
- **Invoice**: Represents billing history entry with fields: invoiceId, date, amount, description, status (Paid/Pending), downloadUrl

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Subscription page loads and displays all required sections (plan, usage, comparison, history, payment) within 2 seconds on standard connections
- **SC-002**: Usage metrics accurately reflect mock data (e.g., if 2/3 parties shown, progress bar displays 66.7%)
- **SC-003**: Plan comparison table displays all tiers with consistent formatting and user's current plan clearly highlighted
- **SC-004**: Users can identify their current subscription status within 5 seconds of page load
- **SC-005**: Page is fully responsive and functional on mobile, tablet, and desktop without horizontal scrolling of critical content on devices ≥320px
- **SC-006**: localStorage adapter provides data within 300ms (with simulated network delay) for consistent perceived performance
- **SC-007**: 100% of route paths (`/subscription` and related sub-pages) respond with correct content
- **SC-008**: Error handling displays user-friendly message and retry option if data loading fails
- **SC-009**: All interactive elements (buttons, links) have visible focus states and ARIA labels for accessibility
- **SC-010**: Code coverage for subscription components and adapters ≥80%

## Assumptions

- **Platform**: Feature integrates with existing Next.js 16 + React 19 + TypeScript 5.9 + Tailwind CSS + shadcn/ui stack
- **Data Persistence**: Mock data uses localStorage with 300ms simulated network delay (consistent with Feature 010 pattern)
- **Billing Model**: Three subscription tiers assumed: Free (no payment), Seasoned Adventurer (paid), Master DM (premium)
- **Payment Gateway**: Actual payment processing deferred to F064 (Stripe Integration); this feature shows UI only
- **User Authentication**: Assumes users are already authenticated via Clerk (F013) before accessing subscription pages
- **Mobile Breakpoints**: Responsive design targets: mobile <640px, tablet 640px-1024px, desktop >1024px
- **Accessibility**: WCAG 2.1 AA compliance required; follows shadcn/ui component patterns for a11y
- **Testing**: Unit tests with Jest + Testing Library; E2E tests with Playwright

## Dependencies

- **Explicit**: Feature 001 (Design System), Feature 002 (Navigation)
- **Implicit**: User authentication context available (from Feature 013 planned)
- **Data**: Mock subscription/billing data provided via adapter pattern (following Feature 010 approach)
