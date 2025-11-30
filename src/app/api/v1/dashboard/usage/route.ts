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
 *
 * Response Cache Control:
 * - Cache-Control: no-store, no-cache, must-revalidate
 * - Ensures fresh data on each dashboard load per SC-010
 *
 * Error Responses:
 * - 401: Unauthorized (no auth token)
 * - 404: User not found
 * - 500: Internal server error
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToMongo } from '@/lib/db/connection';
import UserModel from '@/lib/models/user';
import EncounterModel from '@/lib/models/encounter';
import { TierLimits, type SubscriptionTier } from '@/types/subscription';
import type { DashboardPageData } from '@/types/dashboard';
import { logger } from '@/lib/utils/logger';

/**
 * Get authenticated user ID from request
 * In production, this would come from Clerk session
 * For MVP, using x-user-id header for testing
 */
function getAuthenticatedUserId(request: NextRequest): string | null {
  // TODO: In production, extract from Clerk session/auth context
  // For MVP testing: check x-user-id header
  const userId = request.headers.get('x-user-id');
  if (userId) {
    return userId;
  }

  // TODO: Implement Clerk auth extraction
  // try {
  //   const { userId } = await auth();
  //   return userId;
  // } catch (error) {
  //   logger.warn('Failed to get user from auth', { context: { error: String(error) } });
  //   return null;
  // }

  return null;
}

/**
 * Get resource counts for user, handling missing collections gracefully
 * Per spec, defaults to 0 if collections don't exist
 */
async function getResourceCounts(userId: string): Promise<{
  parties: number;
  characters: number;
  encounters: number;
}> {
  const counts = {
    characters: 0,
    parties: 0,
    encounters: 0,
  };

  try {
    // Query Encounter count (Feature 008 is implemented)
    // Note: Uses owner_id field as per EncounterDoc schema
    counts.encounters = await EncounterModel.countDocuments({
      owner_id: userId,
      // Soft-delete filtering per FR-006
      // Note: Encounter model doesn't have deletedAt yet, but we'll add it if needed
    });
  } catch (error) {
    logger.warn('Encounter count query failed, defaulting to 0', {
      context: {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    counts.encounters = 0;
  }

  // TODO: Features 018 (Characters) and 032 (Parties) not yet implemented
  // These queries will fail until those features are complete
  // Default to 0 with logging per dependency fallback strategy

  try {
    // Feature 018: Character model when available
    // const Character = mongoose.model('Character');
    // counts.characters = await Character.countDocuments({
    //   userId,
    //   deletedAt: null
    // });
    counts.characters = 0; // Default until Feature 018
  } catch (error) {
    logger.warn('Character count query failed, defaulting to 0', {
      context: {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    counts.characters = 0;
  }

  try {
    // Feature 032: Party model when available
    // const Party = mongoose.model('Party');
    // counts.parties = await Party.countDocuments({
    //   userId,
    //   deletedAt: null
    // });
    counts.parties = 0; // Default until Feature 032
  } catch (error) {
    logger.warn('Party count query failed, defaulting to 0', {
      context: {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    counts.parties = 0;
  }

  return counts;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<DashboardPageData | { error: string; code: string }>> {
  try {
    // Verify authentication
    const userId = getAuthenticatedUserId(request);

    if (!userId) {
      logger.warn('Dashboard API called without authentication', {
        context: {
          path: request.nextUrl.pathname,
        },
      });
      return NextResponse.json(
        {
          error: 'Please log in to view your dashboard',
          code: 'AUTH_REQUIRED',
        },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectToMongo();

    // Query user document
    const user = await UserModel.findOne({ userId }).select(
      'email displayName subscriptionTier'
    );

    if (!user) {
      logger.warn('Dashboard API called for non-existent user', {
        context: { userId },
      });
      return NextResponse.json(
        {
          error: 'Your profile could not be found',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Get subscription tier from user document
    const tier: SubscriptionTier = user.subscriptionTier;

    // Get resource counts (parallel queries)
    const usage = await getResourceCounts(userId);

    // Get limits for tier
    const limits = TierLimits[tier];

    // Calculate usage percentages (with guard against division by zero)
    const percentages = {
      parties: limits.parties > 0 ? (usage.parties / limits.parties) * 100 : 0,
      characters: limits.characters > 0 ? (usage.characters / limits.characters) * 100 : 0,
      encounters: limits.encounters > 0 ? (usage.encounters / limits.encounters) * 100 : 0,
    };

    // Determine if empty state should be shown
    const isEmpty =
      usage.parties === 0 && usage.characters === 0 && usage.encounters === 0;

    // Build response
    const response: DashboardPageData = {
      user: {
        id: userId,
        email: user.email,
        displayName: user.displayName || user.email,
        tier,
      },
      usage,
      limits,
      percentages,
      isEmpty,
      createdAt: new Date().toISOString(),
    };

    logger.info('Dashboard data fetched successfully', {
      context: {
        userId,
        tier,
        isEmpty,
        usage,
      },
    });

    // Set cache headers to enforce no-caching per SC-010
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control':
          'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Dashboard API error', {
      context: {
        error: message,
        path: request.nextUrl.pathname,
      },
    });

    return NextResponse.json(
      {
        error: 'We encountered an error. Please try again.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
