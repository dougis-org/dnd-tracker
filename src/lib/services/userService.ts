/**
 * User Service - Profile management operations
 * Provides service layer for user profile CRUD and usage tracking
 *
 * Constitutional: Max 200 lines, max 50 lines per function
 */

import { User } from '@/lib/db/models/User';
import type { IUser } from '@/lib/db/models/User';

/**
 * Profile update data interface
 */
export interface ProfileUpdateData {
  displayName?: string;
  timezone?: string;
  dndEdition?: string;
  experienceLevel?: 'new' | 'beginner' | 'intermediate' | 'experienced' | 'veteran';
  primaryRole?: 'dm' | 'player' | 'both';
  profileSetupCompleted?: boolean;
}

/**
 * Usage metric type
 */
export type UsageMetricType = 'sessionsCount' | 'charactersCreatedCount' | 'campaignsCreatedCount';

/**
 * Update user profile with D&D preference fields
 * @param userId - MongoDB user ID
 * @param profileData - Partial profile data to update
 * @returns Updated user document or null if not found
 */
export async function updateUserProfile(
  userId: string,
  profileData: ProfileUpdateData
): Promise<IUser | null> {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: profileData,
      },
      {
        new: true, // Return updated document
        runValidators: true, // Run Mongoose validators
      }
    );

    return user;
  } catch (error) {
    // Re-throw validation errors for API error handling
    throw error;
  }
}

/**
 * Get user profile by ID
 * @param userId - MongoDB user ID
 * @returns User document or null if not found
 */
export async function getUserProfile(userId: string): Promise<IUser | null> {
  try {
    const user = await User.findById(userId);
    return user;
  } catch {
    // Handle invalid ObjectId format
    return null;
  }
}

/**
 * Atomically increment a usage metric counter
 * @param userId - MongoDB user ID
 * @param metricName - Name of the metric to increment
 * @returns Updated user document or null if not found
 */
export async function incrementUsageMetric(
  userId: string,
  metricName: UsageMetricType
): Promise<IUser | null> {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { [metricName]: 1 },
        $set: { metricsLastUpdated: new Date() },
      },
      {
        new: true, // Return updated document
      }
    );

    return user;
  } catch {
    return null;
  }
}

/**
 * Check if user profile is complete
 * @param user - User document
 * @returns True if profile setup is complete
 */
export function checkProfileComplete(user: IUser): boolean {
  // Profile is complete if flag is true and required fields are set
  return (
    user.profileSetupCompleted === true &&
    user.primaryRole !== undefined &&
    user.primaryRole !== null
  );
}
