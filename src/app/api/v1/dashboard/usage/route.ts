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
  return request.headers.get('x-user-id');
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
    return { parties: 0, characters: 0, encounters };
  } catch {
    logger.warn('Resource count query failed, defaulting to 0', {
      context: { userId },
    });
    return { parties: 0, characters: 0, encounters: 0 };
  }
}

/**
 * Build response with cache headers
 */
function buildResponse(data: DashboardPageData): NextResponse<DashboardPageData> {
  return NextResponse.json(data, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}

/**
 * Build error response
 */
function buildErrorResponse(
  error: string,
  code: string,
  status: number
): NextResponse<{ error: string; code: string }> {
  return NextResponse.json({ error, code }, { status });
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<DashboardPageData | { error: string; code: string }>> {
  try {
    const userId = getAuthenticatedUserId(request);
    if (!userId) {
      return buildErrorResponse(
        'Please log in to view your dashboard',
        'AUTH_REQUIRED',
        401
      );
    }

    await connectToMongo();
    const user = await UserModel.findOne({ userId }).select(
      'email displayName subscriptionTier'
    );

    if (!user) {
      logger.warn('Dashboard API called for non-existent user', {
        context: { userId },
      });
      return buildErrorResponse(
        'Your profile could not be found',
        'USER_NOT_FOUND',
        404
      );
    }

    const usage = await getResourceCounts(userId);
    const response = DashboardBuilder.buildPageData(userId, user, usage);

    logger.info('Dashboard data fetched successfully', {
      context: { userId, tier: user.subscriptionTier, isEmpty: response.isEmpty },
    });

    return buildResponse(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Dashboard API error', { context: { error: message } });
    return buildErrorResponse(
      'We encountered an error. Please try again.',
      'INTERNAL_ERROR',
      500
    );
  }
}
