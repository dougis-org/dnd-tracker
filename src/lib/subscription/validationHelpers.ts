/**
 * Validation and error handling utilities
 */

import {
  SubscriptionSchema,
  UsageMetricSchema,
  PlanSchema,
  InvoiceSchema,
  type Subscription,
  type UsageMetric,
  type Plan,
  type Invoice,
} from '../schemas/subscriptionSchema';

export function validateSubscription(data: unknown): Subscription | null {
  const result = SubscriptionSchema.safeParse(data);
  if (!result.success) {
    // Don't log result.error as it may not exist in all environments
    return null;
  }
  return result.data;
}

export function validateUsageMetrics(
  items: unknown[]
): UsageMetric[] {
  const metrics: UsageMetric[] = [];
  for (const item of items) {
    const result = UsageMetricSchema.safeParse(item);
    if (result.success) {
      metrics.push(result.data);
    } else {
      console.error('Invalid usage metric:', result.error);
    }
  }
  return metrics;
}

export function validatePlans(items: unknown[]): Plan[] {
  const plans: Plan[] = [];
  for (const item of items) {
    const result = PlanSchema.safeParse(item);
    if (result.success) {
      plans.push(result.data);
    } else {
      console.error('Invalid plan:', result.error);
    }
  }
  return plans;
}

export function validateInvoices(items: unknown[]): Invoice[] {
  const invoices: Invoice[] = [];
  for (const item of items) {
    const result = InvoiceSchema.safeParse(item);
    if (result.success) {
      invoices.push(result.data);
    } else {
      console.error('Invalid invoice:', result.error);
    }
  }
  return invoices;
}
