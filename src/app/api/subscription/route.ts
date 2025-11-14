/**
 * GET /api/subscription
 * Returns the current user's subscription data including:
 * - Current subscription (plan, renewal date, status)
 * - Usage metrics for all categories
 * - Available plans for upgrade/downgrade
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getSubscription,
  getUsageMetrics,
  getAvailablePlans,
} from '@/lib/adapters/subscriptionAdapter';
import type {
  Subscription,
  UsageMetric,
  Plan,
} from '@/lib/schemas/subscriptionSchema';

interface SubscriptionResponse {
  subscription: Subscription;
  usageMetrics: UsageMetric[];
  availablePlans: Plan[];
}

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // In a real app, get userId from session/auth
    // For MVP, use a mock userId
    const userId = 'user-123';

    // Fetch subscription data from adapter
    const subscription = await getSubscription(userId);
    const usageMetrics = await getUsageMetrics(userId);
    const availablePlans = await getAvailablePlans();

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const response: SubscriptionResponse = {
      subscription,
      usageMetrics,
      availablePlans,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch subscription',
      },
      { status: 500 }
    );
  }
}
