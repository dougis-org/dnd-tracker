/**
 * Dashboard Service
 * Service for dashboard metrics aggregation
 * Constitutional: Max 150 lines, max 50 lines per function
 */

import User from '@/lib/db/models/User';
import { buildDashboardMetrics } from '@/lib/utils/metrics';

/**
 * Get dashboard metrics for a user
 * Fetches user, calculates subscription usage, builds metrics response
 *
 * @param userId - User ID (MongoDB ObjectId)
 * @returns Complete dashboard metrics object
 * @throws Error if user not found or database error
 */
export async function getDashboardMetrics(userId: string) {
  // Fetch user from database
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Build and return dashboard metrics
  return buildDashboardMetrics(user);
}
