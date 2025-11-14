/**
 * Subscription Mock Adapter (localStorage)
 *
 * Provides localStorage-backed data access for subscription and billing features.
 * Implements 300ms network delay simulation and Zod schema validation.
 * Ready to be swapped for MongoDB adapter in F014.
 *
 * Storage Keys:
 * - subscription:${userId}: Subscription object
 * - usage:${userId}: UsageMetric array
 * - plans: Plan array (shared, not per-user)
 * - billing:${userId}: Invoice array
 */
'use client';

import {
  SubscriptionSchema,
  PlanSchema,
  UsageMetricSchema,
  InvoiceSchema,
  type Subscription,
  type Plan,
  type UsageMetric,
  type Invoice,
  type PaginatedInvoices,
} from '../schemas/subscriptionSchema';

const NETWORK_DELAY_MS = 300;

// Get storage safely (client-side only)
const storage = (() => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  } as Storage;
})();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeJsonParse(jsonString: string | null): unknown {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse JSON from localStorage:', error);
    return null;
  }
}

function createDefaultSubscription(userId: string): Subscription {
  const renewalDate = new Date();
  renewalDate.setMonth(renewalDate.getMonth() + 1);

  return {
    id: `sub_${userId}`,
    userId,
    planId: 'plan_free',
    planName: 'Free',
    billingFrequency: 'monthly',
    renewalDate,
    status: 'active',
    trialDaysRemaining: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function createDefaultUsageMetrics(userId: string): UsageMetric[] {
  return [
    {
      id: 'metric_parties',
      userId,
      metricName: 'parties',
      currentUsage: 0,
      maxAllowed: 1,
      category: 'party',
      updatedAt: new Date(),
    },
    {
      id: 'metric_encounters',
      userId,
      metricName: 'encounters',
      currentUsage: 0,
      maxAllowed: 5,
      category: 'encounter',
      updatedAt: new Date(),
    },
    {
      id: 'metric_characters',
      userId,
      metricName: 'characters',
      currentUsage: 0,
      maxAllowed: 10,
      category: 'character',
      updatedAt: new Date(),
    },
    {
      id: 'metric_combatSessions',
      userId,
      metricName: 'combatSessions',
      currentUsage: 0,
      maxAllowed: 3,
      category: 'encounter',
      updatedAt: new Date(),
    },
  ];
}

function createDefaultPlans(): Plan[] {
  return [
    {
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
    },
    {
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
    },
    {
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
    },
  ];
}

export async function getSubscription(userId: string): Promise<Subscription> {
  await delay(NETWORK_DELAY_MS);

  try {
    const data = safeJsonParse(
      storage.getItem(`subscription:${userId}`) as string | null
    );

    if (!data) {
      return createDefaultSubscription(userId);
    }

    const result = SubscriptionSchema.safeParse(data);

    if (!result.success) {
      console.error(
        `Invalid subscription data for user ${userId}:`,
        result.error
      );
      storage.removeItem(`subscription:${userId}`);
      return createDefaultSubscription(userId);
    }

    return result.data;
  } catch (error) {
    console.error(`Error fetching subscription for user ${userId}:`, error);
    return createDefaultSubscription(userId);
  }
}

export async function getUsageMetrics(userId: string): Promise<UsageMetric[]> {
  await delay(NETWORK_DELAY_MS);

  try {
    const data = safeJsonParse(
      storage.getItem(`usage:${userId}`) as string | null
    );

    if (!data || !Array.isArray(data) || data.length === 0) {
      return createDefaultUsageMetrics(userId);
    }

    const metrics: UsageMetric[] = [];
    for (const item of data) {
      const result = UsageMetricSchema.safeParse(item);
      if (result.success) {
        metrics.push(result.data);
      } else {
        console.error(`Invalid usage metric:`, result.error);
      }
    }

    return metrics.length > 0 ? metrics : createDefaultUsageMetrics(userId);
  } catch (error) {
    console.error(`Error fetching usage metrics for user ${userId}:`, error);
    return createDefaultUsageMetrics(userId);
  }
}

export async function getAvailablePlans(): Promise<Plan[]> {
  await delay(NETWORK_DELAY_MS);

  try {
    const data = safeJsonParse(storage.getItem('plans') as string | null);

    if (!data || !Array.isArray(data) || data.length === 0) {
      return createDefaultPlans();
    }

    const plans: Plan[] = [];
    for (const item of data) {
      const result = PlanSchema.safeParse(item);
      if (result.success) {
        plans.push(result.data);
      } else {
        console.error(`Invalid plan:`, result.error);
      }
    }

    return plans.length > 0 ? plans : createDefaultPlans();
  } catch (error) {
    console.error('Error fetching available plans:', error);
    return createDefaultPlans();
  }
}

export async function getBillingHistory(
  userId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedInvoices> {
  await delay(NETWORK_DELAY_MS);

  const safePage = Math.max(1, parseInt(String(page), 10) || 1);
  const safePageSize = Math.max(
    1,
    Math.min(100, parseInt(String(pageSize), 10) || 10)
  );

  try {
    const data = safeJsonParse(
      storage.getItem(`billing:${userId}`) as string | null
    );

    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        invoices: [],
        totalCount: 0,
        pageSize: safePageSize,
        currentPage: safePage,
        hasNextPage: false,
      };
    }

    const invoices: Invoice[] = [];
    for (const item of data) {
      const result = InvoiceSchema.safeParse(item);
      if (result.success) {
        invoices.push(result.data);
      } else {
        console.error(`Invalid invoice:`, result.error);
      }
    }

    const totalCount = invoices.length;
    const startIndex = (safePage - 1) * safePageSize;
    const endIndex = startIndex + safePageSize;
    const paginatedInvoices = invoices.slice(startIndex, endIndex);
    const hasNextPage = endIndex < totalCount;

    return {
      invoices: paginatedInvoices,
      totalCount,
      pageSize: safePageSize,
      currentPage: safePage,
      hasNextPage,
    };
  } catch (error) {
    console.error(`Error fetching billing history for user ${userId}:`, error);
    return {
      invoices: [],
      totalCount: 0,
      pageSize: safePageSize,
      currentPage: safePage,
      hasNextPage: false,
    };
  }
}

export function initializeMockData(userId: string): void {
  try {
    const subscription = createDefaultSubscription(userId);
    storage.setItem(`subscription:${userId}`, JSON.stringify(subscription));

    const metrics = createDefaultUsageMetrics(userId);
    storage.setItem(`usage:${userId}`, JSON.stringify(metrics));

    if (!storage.getItem('plans')) {
      const plans = createDefaultPlans();
      storage.setItem('plans', JSON.stringify(plans));
    }

    storage.setItem(`billing:${userId}`, JSON.stringify([]));
  } catch (error) {
    console.error(`Error initializing mock data for user ${userId}:`, error);
  }
}
