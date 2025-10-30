/**
 * Dashboard Service
 * Service for dashboard metrics aggregation
 * Constitutional: Max 150 lines, max 50 lines per function
 */

import User from '@/lib/db/models/User';
import { buildDashboardMetrics } from '@/lib/utils/metrics';
import type { IUser } from '@/lib/db/models/User';

/**
 * Get dashboard metrics for a user
 * Accepts either a user object (to avoid redundant queries) or userId string
 *
 * @param userOrUserId - User object or User ID (MongoDB ObjectId)
 * @returns Complete dashboard metrics object
 * @throws Error if user not found or database error
 */
export async function getDashboardMetrics(
  userOrUserId: IUser | string
) {
  let user: IUser;

  // If string provided, fetch from database
  if (typeof userOrUserId === 'string') {
    const fetchedUser = await User.findById(userOrUserId);
    if (!fetchedUser) {
      throw new Error('User not found');
    }
    user = fetchedUser;
  } else {
    // User object already provided
    user = userOrUserId;
  }

  // Build and return dashboard metrics
  return buildDashboardMetrics(user);
}
