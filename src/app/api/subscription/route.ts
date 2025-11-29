/**
 * GET /api/subscription
 * Returns the current user's subscription data including:
 * - Current subscription (plan, renewal date, status)
 * - Usage metrics for all categories
 * - Available plans for upgrade/downgrade
 */

import { NextRequest, NextResponse } from 'next/server';
import type { SubscriptionResponse } from '@/lib/schemas/subscriptionSchema';
import {
  createDefaultSubscription,
  createDefaultUsageMetrics,
  createDefaultPlans,
} from '@/lib/adapters/subscriptionDefaults';

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // In a real app, get userId from session/auth
    // For MVP, use a mock userId
    const userId = 'user-123';

    // TODO [Technical Debt]: subscriptionAdapter is currently client-only and cannot be used in SSR/server routes.
    // See issue #45: Refactor subscriptionAdapter to support server-side usage and replace mock data with real fetching.
    // Temporary workaround: return mock data for MVP. Planned for Feature 030 (Item Model & API with MongoDB / Mongoose).
    const subscription = createDefaultSubscription(userId);
    const usageMetrics = createDefaultUsageMetrics(userId);
    const availablePlans = createDefaultPlans();

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
