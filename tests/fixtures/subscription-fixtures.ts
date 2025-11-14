/**
 * Subscription Mock Data Factories
 *
 * Factory functions for generating consistent mock data for testing.
 * All generated data is guaranteed to match Zod schemas and simulate
 * realistic subscription states.
 */

import {
  type Subscription,
  type Plan,
  type UsageMetric,
  type Invoice,
  type PaginatedInvoices,
} from '../../src/lib/schemas/subscriptionSchema';
import { createPaginationResponse } from './pagination-helpers';

/**
 * Creates a mock Subscription with default or overridden values
 */
export function createMockSubscription(
  overrides?: Partial<Subscription>
): Subscription {
  const renewalDate = new Date();
  renewalDate.setFullYear(renewalDate.getFullYear() + 1);

  return {
    id: 'sub_abc123',
    userId: 'user-123',
    planId: 'plan_sa',
    planName: 'Seasoned Adventurer',
    billingFrequency: 'annual',
    renewalDate,
    status: 'active',
    trialDaysRemaining: null,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock free tier subscription
 */
export function createMockFreeSubscription(
  overrides?: Partial<Subscription>
): Subscription {
  const renewalDate = new Date();
  renewalDate.setMonth(renewalDate.getMonth() + 1);

  return createMockSubscription({
    id: 'sub_free',
    planId: 'plan_free',
    planName: 'Free',
    billingFrequency: 'monthly',
    renewalDate,
    status: 'active',
    ...overrides,
  });
}

/**
 * Creates a mock trial subscription
 */
export function createMockTrialSubscription(
  overrides?: Partial<Subscription>
): Subscription {
  const renewalDate = new Date();
  renewalDate.setDate(renewalDate.getDate() + 7); // Trial ends in 7 days

  return createMockSubscription({
    id: 'sub_trial',
    planId: 'plan_free',
    planName: 'Free',
    status: 'trial',
    trialDaysRemaining: 7,
    renewalDate,
    ...overrides,
  });
}

/**
 * Creates a mock Plan
 */
export function createMockPlan(overrides?: Partial<Plan>): Plan {
  return {
    id: 'plan_sa',
    name: 'Seasoned Adventurer',
    monthlyPrice: 9.99,
    annualPrice: 99.99,
    features: [
      'Up to 5 parties',
      'Up to 50 encounters',
      'Advanced character management',
      'Full combat tracking',
      'Encounter builder',
    ],
    usageLimits: {
      parties: 5,
      encounters: 50,
      characters: 50,
      combatSessions: 50,
    },
    ...overrides,
  };
}

/**
 * Creates a mock Free plan
 */
export function createMockFreePlan(overrides?: Partial<Plan>): Plan {
  return createMockPlan({
    id: 'plan_free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      'Up to 1 party',
      'Up to 5 encounters',
      'Basic character management',
      'Limited combat tracking',
    ],
    usageLimits: {
      parties: 1,
      encounters: 5,
      characters: 10,
      combatSessions: 3,
    },
    ...overrides,
  });
}

/**
 * Creates a mock Master DM plan
 */
export function createMockMasterDMPlan(overrides?: Partial<Plan>): Plan {
  return createMockPlan({
    id: 'plan_md',
    name: 'Master DM',
    monthlyPrice: 19.99,
    annualPrice: 199.99,
    features: [
      'Unlimited parties',
      'Unlimited encounters',
      'Advanced character management',
      'Full combat tracking',
      'Encounter builder',
      'Monster library',
      'Advanced reporting',
      'Priority support',
    ],
    usageLimits: {
      parties: 999999,
      encounters: 999999,
      characters: 999999,
      combatSessions: 999999,
    },
    ...overrides,
  });
}

/**
 * Creates a list of all available plans
 */
export function createMockPlans(): Plan[] {
  return [createMockFreePlan(), createMockPlan(), createMockMasterDMPlan()];
}

/**
 * Creates a mock UsageMetric
 */
export function createMockUsageMetric(
  overrides?: Partial<UsageMetric>
): UsageMetric {
  return {
    id: 'metric_parties',
    userId: 'user-123',
    metricName: 'parties',
    currentUsage: 2,
    maxAllowed: 5,
    category: 'party',
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a list of mock usage metrics for all metric types
 */
export function createMockUsageMetrics(
  overrides?: Partial<UsageMetric>
): UsageMetric[] {
  return [
    createMockUsageMetric({
      id: 'metric_parties',
      metricName: 'parties',
      currentUsage: 2,
      maxAllowed: 5,
      category: 'party',
      ...overrides,
    }),
    createMockUsageMetric({
      id: 'metric_encounters',
      metricName: 'encounters',
      currentUsage: 12,
      maxAllowed: 50,
      category: 'encounter',
      ...overrides,
    }),
    createMockUsageMetric({
      id: 'metric_characters',
      metricName: 'characters',
      currentUsage: 8,
      maxAllowed: 50,
      category: 'character',
      ...overrides,
    }),
    createMockUsageMetric({
      id: 'metric_combatSessions',
      metricName: 'combatSessions',
      currentUsage: 3,
      maxAllowed: 50,
      category: 'encounter',
      ...overrides,
    }),
  ];
}

/**
 * Creates a mock Invoice
 */
export function createMockInvoice(overrides?: Partial<Invoice>): Invoice {
  return {
    id: 'inv_001',
    userId: 'user-123',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    description: 'Seasoned Adventurer - Annual Subscription',
    amount: 99.99,
    currency: 'USD',
    status: 'Paid',
    taxAmount: 7.5,
    taxRate: 0.08,
    downloadUrl: 'https://example.com/invoices/inv_001.pdf',
    ...overrides,
  };
}

/**
 * Creates a list of mock invoices for pagination testing
 */
export function createMockInvoices(count = 5): Invoice[] {
  const invoices: Invoice[] = [];
  const baseDate = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(baseDate);
    date.setMonth(date.getMonth() - i);

    invoices.push(
      createMockInvoice({
        id: `inv_${String(i + 1).padStart(3, '0')}`,
        date,
        description: `Seasoned Adventurer - ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        amount: 99.99,
        taxAmount: 7.5,
      })
    );
  }

  return invoices;
}

/**
 * Creates a paginated response of invoices
 */
export function createMockPaginatedInvoices(overrides?: {
  page?: number;
  pageSize?: number;
  totalCount?: number;
  invoices?: Invoice[];
}): PaginatedInvoices {
  const page = overrides?.page ?? 1;
  const pageSize = overrides?.pageSize ?? 10;
  const totalCount = overrides?.totalCount ?? 12;
  const invoices =
    overrides?.invoices ?? createMockInvoices(Math.min(pageSize, totalCount));

  return createPaginationResponse(invoices, page, pageSize, totalCount);
}

/**
 * Creates usage metrics with specific warning levels for testing
 */
export function createMockUsageMetricsWithWarning(): UsageMetric[] {
  return [
    createMockUsageMetric({
      id: 'metric_parties',
      metricName: 'parties',
      currentUsage: 4, // 80% of 5
      maxAllowed: 5,
      category: 'party',
    }),
    createMockUsageMetric({
      id: 'metric_encounters',
      metricName: 'encounters',
      currentUsage: 50, // 100% of 50 (error state)
      maxAllowed: 50,
      category: 'encounter',
    }),
    createMockUsageMetric({
      id: 'metric_characters',
      metricName: 'characters',
      currentUsage: 5, // 10% of 50 (normal state)
      maxAllowed: 50,
      category: 'character',
    }),
  ];
}

/**
 * Creates usage metrics for free tier (all "Unlimited")
 */
export function createMockFreeUsageMetrics(): UsageMetric[] {
  return [
    createMockUsageMetric({
      id: 'metric_parties',
      metricName: 'parties',
      currentUsage: 0,
      maxAllowed: 0, // Signals "Unlimited" in UI
      category: 'party',
    }),
  ];
}
