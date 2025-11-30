/**
 * GET /api/v1/dashboard/usage
 *
 * Fetch dashboard data for authenticated user including:
 * - User info (email, displayName, subscription tier)
 * - Resource usage counts (parties, characters, encounters)
 * - Resource limits based on subscription tier
 * - Usage percentages
 *
 * Feature 016: User Dashboard with Real Data
 * Cache-Control: no-store (fresh data per SC-010)
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToMongo } from '@/lib/db/connection';
import UserModel from '@/lib/models/user';
import EncounterModel from '@/lib/models/encounter';
import { DashboardBuilder, type DashboardPageData } from '@/types/dashboard';
import { logger } from '@/lib/utils/logger';

/**
 * Get authenticated user ID from request
 * TODO: In production, extract from Clerk session/auth context
 * For MVP testing: uses x-user-id header
 */
function getAuthenticatedUserId(request: NextRequest): string | null {
  const userId = request.headers.get('x-user-id');
  return userId || null;
}

/**
 * Get resource counts for user
 * Defaults to 0 for unimplemented features
 */
async function getResourceCounts(
  userId: string
): Promise<{ parties: number; characters: number; encounters: number }> {
  try {
    const encounters = await EncounterModel.countDocuments({
      owner_id: userId,
    });
    return { parties: 0, characters: 0, encounters }; // Others default to 0 until features complete
  } catch {
    logger.warn('Resource count query failed, defaulting to 0', { context: { userId } });
    return { parties: 0, characters: 0, encounters: 0 };
  }
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<DashboardPageData | { error: string; code: string }>> {
  try {
    const userId = getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Please log in to view your dashboard', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    await connectToMongo();
    const user = await UserModel.findOne({ userId }).select('email displayName subscriptionTier');

    if (!user) {
      logger.warn('Dashboard API called for non-existent user', { context: { userId } });
      return NextResponse.json(
        { error: 'Your profile could not be found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const usage = await getResourceCounts(userId);
    const response = DashboardBuilder.buildPageData(userId, user, usage);

    logger.info('Dashboard data fetched successfully', {
      context: { userId, tier: user.subscriptionTier, isEmpty: response.isEmpty },
    });

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Dashboard API error', { context: { error: message } });

    return NextResponse.json(
      { error: 'We encountered an error. Please try again.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
