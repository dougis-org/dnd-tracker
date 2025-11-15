# Quickstart Guide: Subscription & Billing Implementation (Feature 012)

**Feature**: Feature 012 - Subscription & Billing Pages  
**Date**: 2025-11-13  
**Status**: Ready for Implementation  

---

## Quick Reference

### Project Layout

```
src/
├── app/
│   ├── api/
│   │   ├── subscription/route.ts           # GET /api/subscription
│   │   └── billing/history/route.ts        # GET /api/billing/history
│   └── (authenticated)/subscription/page.tsx  # Main page
├── components/subscription/
│   ├── SubscriptionPage.tsx
│   ├── PlanCard.tsx
│   ├── UsageMetrics.tsx
│   ├── PlanComparison.tsx
│   ├── BillingHistory.tsx
│   ├── PaymentMethod.tsx
│   └── index.ts
├── lib/
│   ├── adapters/subscriptionAdapter.ts
│   └── schemas/subscriptionSchema.ts
└── types/subscription.ts

tests/
├── fixtures/subscription-fixtures.ts
└── e2e/subscription.e2e.ts
```

---

## Zod Schemas Quick Reference

### Import Schemas

```typescript
import {
  SubscriptionSchema,
  PlanSchema,
  UsageMetricSchema,
  InvoiceSchema,
  PaginatedInvoicesSchema,
} from '@/lib/schemas/subscriptionSchema';

// Types inferred from schemas
import type {
  Subscription,
  Plan,
  UsageMetric,
  Invoice,
  PaginatedInvoices,
} from '@/lib/schemas/subscriptionSchema';
```

### Common Validation Patterns

```typescript
// Validate and use
const result = SubscriptionSchema.safeParse(data);
if (result.success) {
  console.log(result.data); // Type-safe subscription object
} else {
  console.error(result.error.issues); // Validation errors
}

// Throw on error
const sub = SubscriptionSchema.parse(data);

// Partial updates
const updateData = { planName: 'Master DM' };
const updated = { ...current, ...updateData };
SubscriptionSchema.parse(updated); // Validates full object
```

---

## Adapter Quick Reference

### Import Adapter

```typescript
import { subscriptionAdapter } from '@/lib/adapters/subscriptionAdapter';
```

### Common Adapter Calls

```typescript
// Get subscription
const subscription = await subscriptionAdapter.getSubscription(userId);

// Get usage metrics
const metrics = await subscriptionAdapter.getUsageMetrics(userId);

// Get available plans
const plans = await subscriptionAdapter.getAvailablePlans();

// Get billing history (paginated)
const history = await subscriptionAdapter.getBillingHistory(userId, page, pageSize);
// Returns: { invoices, totalCount, pageSize, currentPage, hasNextPage }
```

### All Methods

```typescript
export const subscriptionAdapter = {
  // Get current subscription
  async getSubscription(userId: string): Promise<Subscription>

  // Get usage metrics
  async getUsageMetrics(userId: string): Promise<UsageMetric[]>

  // Get available plans
  async getAvailablePlans(): Promise<Plan[]>

  // Get billing history (paginated)
  async getBillingHistory(
    userId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedInvoices>

  // Update subscription (for future F014)
  async updateSubscription(userId: string, updates: Partial<Subscription>): Promise<Subscription>

  // Get payment method
  async getPaymentMethod(userId: string): Promise<PaymentMethod | null>
};
```

---

## API Routes Quick Reference

### GET /api/subscription

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { subscriptionAdapter } from '@/lib/adapters/subscriptionAdapter';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'user-123';

    const [subscription, usageMetrics, availablePlans] = await Promise.all([
      subscriptionAdapter.getSubscription(userId),
      subscriptionAdapter.getUsageMetrics(userId),
      subscriptionAdapter.getAvailablePlans(),
    ]);

    return NextResponse.json({
      subscription,
      usageMetrics,
      availablePlans,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch subscription';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

### GET /api/billing/history

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { subscriptionAdapter } from '@/lib/adapters/subscriptionAdapter';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'user-123';

    // Extract pagination params
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(request.nextUrl.searchParams.get('pageSize') || '10', 10);

    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { error: 'Invalid page or pageSize' },
        { status: 400 }
      );
    }

    const history = await subscriptionAdapter.getBillingHistory(userId, page, pageSize);

    return NextResponse.json(history);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch billing history';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

---

## Component Props & Usage

### SubscriptionPage (Orchestrator)

```typescript
import { SubscriptionPage } from '@/components/subscription';

// Usage in page.tsx
export default function Page() {
  return <SubscriptionPage />;
}

// Props (none required; manages state internally)
interface SubscriptionPageProps {}

// State managed internally:
// - Fetches from /api/subscription and /api/billing/history
// - Handles loading, error, and retry states
// - Passes data to child components
```

### PlanCard

```typescript
import { PlanCard } from '@/components/subscription';

<PlanCard
  subscription={subscription}
  trialDaysRemaining={trialDaysRemaining}
  onChoosePlan={() => { /* scroll to comparison */ }}
/>

interface PlanCardProps {
  subscription: Subscription;
  trialDaysRemaining?: number;
  onChoosePlan?: () => void;
}
```

### UsageMetrics

```typescript
import { UsageMetrics } from '@/components/subscription';

<UsageMetrics metrics={usageMetrics} />

interface UsageMetricsProps {
  metrics: UsageMetric[];
}

// Warning: ≥80% usage → amber color + ⚠ label
// Error: ≥100% usage → red color + "Limit reached" label
// Free tier: maxAllowed = 0 → "Unlimited" text
```

### PlanComparison

```typescript
import { PlanComparison } from '@/components/subscription';

<PlanComparison
  plans={availablePlans}
  currentPlanId={subscription.planId}
  onUpgrade={() => showToast('Coming soon')}
  onDowngrade={() => showToast('Coming soon')}
/>

interface PlanComparisonProps {
  plans: Plan[];
  currentPlanId: string;
  onUpgrade?: () => void;
  onDowngrade?: () => void;
}
```

### BillingHistory

```typescript
import { BillingHistory } from '@/components/subscription';

<BillingHistory
  invoices={invoices}
  onDownload={() => showToast('Coming soon')}
/>

interface BillingHistoryProps {
  invoices: Invoice[];
  onDownload?: (invoiceId: string) => void;
}

// Empty state: "No invoices yet" message when invoices = []
// Pagination: component stateless; parent handles pagination params
```

### PaymentMethod

```typescript
import { PaymentMethod } from '@/components/subscription';

<PaymentMethod
  subscription={subscription}
  paymentMethod={paymentMethod}
  onUpdate={() => showToast('Coming soon')}
/>

interface PaymentMethodProps {
  subscription: Subscription;
  paymentMethod?: { last4: string; expiration: string };
  onUpdate?: () => void;
}

// Hidden for free tier (subscription.status = 'active' && planName = 'Free')
// Warning: expiration within 30 days → show warning
```

---

## Test Fixtures Quick Reference

### Mock Data Factories

```typescript
import {
  createMockSubscription,
  createMockPlan,
  createMockUsageMetric,
  createMockInvoice,
  createMockInvoicesPage,
} from '@/tests/fixtures/subscription-fixtures';

// Create with defaults
const subscription = createMockSubscription();

// Override specific fields
const trialSub = createMockSubscription({
  status: 'trial',
  trialDaysRemaining: 7,
});

// Create multiple
const plans = [
  createMockPlan({ name: 'Free' }),
  createMockPlan({ name: 'Seasoned Adventurer' }),
  createMockPlan({ name: 'Master DM' }),
];

// Create paginated response
const page = createMockInvoicesPage(10, 1, 12); // pageSize, currentPage, totalCount
```

---

## Testing Quick Reference

### Unit Test Template

```typescript
import { render, screen } from '@testing-library/react';
import { subscriptionAdapter } from '@/lib/adapters/subscriptionAdapter';
import { createMockSubscription, createMockUsageMetric } from '@/tests/fixtures/subscription-fixtures';

describe('SubscriptionPage', () => {
  it('should render current plan', async () => {
    const sub = createMockSubscription();
    jest.spyOn(subscriptionAdapter, 'getSubscription').mockResolvedValue(sub);

    render(<SubscriptionPage />);

    // Wait for data load + skeleton to clear
    expect(await screen.findByText(sub.planName)).toBeInTheDocument();
  });

  it('should show warning at 80% usage', () => {
    const metric = createMockUsageMetric({
      currentUsage: 8,
      maxAllowed: 10,
    });

    render(<UsageMetrics metrics={[metric]} />);

    expect(screen.getByText(/approaching limit/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveClass('warning');
  });

  it('should show "Coming soon" toast on upgrade', async () => {
    const user = userEvent.setup();
    render(<PlanComparison {...props} />);

    const upgradeButton = screen.getByRole('button', { name: /upgrade/i });
    await user.click(upgradeButton);

    expect(await screen.findByText(/coming soon/i)).toBeInTheDocument();
  });
});
```

### API Route Test Template

```typescript
import { GET } from '@/app/api/subscription/route';
import { subscriptionAdapter } from '@/lib/adapters/subscriptionAdapter';
import { createMockSubscription } from '@/tests/fixtures/subscription-fixtures';

describe('GET /api/subscription', () => {
  it('should return subscription with usage and plans', async () => {
    const mockSub = createMockSubscription();
    jest.spyOn(subscriptionAdapter, 'getSubscription').mockResolvedValue(mockSub);

    const request = new NextRequest('http://localhost:3000/api/subscription', {
      headers: { 'x-user-id': 'user-123' },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('subscription');
    expect(data).toHaveProperty('usageMetrics');
    expect(data).toHaveProperty('availablePlans');
  });
});
```

### E2E Test Template (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test('user can view subscription page', async ({ page }) => {
  await page.goto('/subscription');

  // Wait for content
  await page.waitForSelector('[data-testid="current-plan"]');

  // Check key sections present
  expect(await page.locator('text=Current Plan').isVisible()).toBeTruthy();
  expect(await page.locator('text=Usage Metrics').isVisible()).toBeTruthy();
  expect(await page.locator('text=Compare Plans').isVisible()).toBeTruthy();
});

test('upgrade button shows "Coming soon" toast', async ({ page }) => {
  await page.goto('/subscription');

  const upgradeBtn = page.locator('button:has-text("Upgrade")').first();
  await upgradeBtn.click();

  await expect(page.locator('text=Coming soon')).toBeVisible();
  await page.waitForTimeout(3500); // toast dismisses
  await expect(page.locator('text=Coming soon')).not.toBeVisible();
});
```

---

## Common Patterns & Best Practices

### Loading State with Skeleton

```typescript
{loading ? (
  <div className="space-y-4">
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-64 w-full" />
  </div>
) : (
  <div>
    {/* content */}
  </div>
)}
```

### Error Handling & Retry

```typescript
{error ? (
  <div className="rounded-md bg-red-50 p-4">
    <p className="text-sm text-red-800">{error.message}</p>
    <button
      onClick={loadData}
      className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
    >
      Retry
    </button>
  </div>
) : null}
```

### Toast Notification

```typescript
import { useToast } from '@/hooks/use-toast'; // or similar

const { toast } = useToast();

const handleClick = () => {
  toast({
    title: 'Coming soon',
    description: 'This feature will be available in a future update.',
    duration: 3000, // 3–5 seconds
  });
};
```

### Responsive Table (Mobile Fallback)

```typescript
// Desktop: table
// Mobile: card grid
<div className="hidden md:table">
  {/* table content */}
</div>
<div className="md:hidden space-y-4">
  {/* card content */}
</div>
```

---

## Network Delay & Mocking

### 300ms Delay in Adapter

All adapter calls include a simulated 300ms network delay:

```typescript
const NETWORK_DELAY_MS = 300;

function delay(ms: number = NETWORK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async getSubscription(userId: string): Promise<Subscription> {
  await delay(); // 300ms delay
  return /* fetch from storage */;
}
```

### Mocking in Tests

```typescript
// Mock adapter to return instantly (no delay)
jest.spyOn(subscriptionAdapter, 'getSubscription').mockResolvedValue(mockSub);

// Or mock with delay
jest.spyOn(subscriptionAdapter, 'getSubscription').mockImplementation(
  () => new Promise((resolve) => setTimeout(() => resolve(mockSub), 100))
);
```

---

## Accessibility (a11y) Checklist

- ✅ All images have `alt` text
- ✅ Progress bars have `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`
- ✅ Buttons have descriptive text (not just "Click here")
- ✅ Error messages associated with form fields (aria-describedby)
- ✅ Color not sole means of indicating status (use labels + icons)
- ✅ Keyboard navigation: Tab order logical, focus visible
- ✅ Form inputs have `<label>`

---

## Performance Tips

1. **Lazy Load Images**: Use Next.js `<Image>` component
2. **Memoize Components**: Wrap in `React.memo()` if props stable
3. **Split Large Tables**: Paginate invoices (already designed)
4. **Avoid Inline Functions**: Extract to named functions in tests
5. **Use Suspense**: Wrap async components in `<Suspense>`

---

## Troubleshooting

### Adapter Data Stuck in localStorage

```typescript
// Clear localStorage
localStorage.clear();

// Reload page
window.location.reload();
```

### Tests Failing with 300ms Timeout

```typescript
// Increase timeout in test
jest.setTimeout(5000);

// Or use `waitFor` with custom timeout
await waitFor(() => {
  expect(screen.getByText(/loaded/i)).toBeInTheDocument();
}, { timeout: 1000 });
```

### Components Not Re-rendering

- ✅ Ensure state updates trigger re-render (use `setState` or hooks)
- ✅ Check for memoization preventing updates
- ✅ Verify async data fetched in `useEffect` (not in render)

---

## Resources

- **Spec**: `specs/012-subscription-billing/spec.md`
- **Data Model**: `specs/012-subscription-billing/data-model.md`
- **API Contracts**: `specs/012-subscription-billing/contracts/*.yaml`
- **Implementation Plan**: `specs/012-subscription-billing/plan.md`
- **Feature 010** (Profile/Settings): Reference for adapter patterns

---

**Generated**: 2025-11-13 | **Status**: Ready for Use
