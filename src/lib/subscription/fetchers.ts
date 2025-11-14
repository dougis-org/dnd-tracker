/**
 * Subscription data fetching utilities
 */

import type {
  Subscription,
  Plan,
  UsageMetric,
} from '@/lib/schemas/subscriptionSchema';

export interface SubscriptionResponse {
  subscription: Subscription;
  usageMetrics: UsageMetric[];
  availablePlans: Plan[];
}

export async function fetchSubscriptionData(): Promise<SubscriptionResponse> {
  const response = await fetch('/api/subscription');

  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? 'You must be logged in to view subscription details'
        : 'Failed to load subscription information'
    );
  }

  return response.json();
}
