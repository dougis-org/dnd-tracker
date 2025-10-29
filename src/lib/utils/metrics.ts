/**
 * Metrics Utilities
 * User metrics formatting and transformation helpers
 * Constitutional: Max 100 lines, max 50 lines per function
 */

import { getTierLimits, calculateUsagePercentage, generateUsageWarnings } from './subscription';
import type { IUser } from '@/lib/db/models/User';

/**
 * Format last login timestamp to human-readable string
 * Returns relative time for recent logins, formatted date for older ones
 *
 * @param date - Last login date
 * @returns Formatted timestamp string
 */
export function formatLastLogin(date: Date | null | undefined): string {
  if (!date) {
    return 'Never';
  }

  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return 'Just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }

  // Format as date for older logins
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Calculate metrics summary from user document
 * Extracts and formats activity metrics
 *
 * @param user - User document with metrics
 * @returns Summary object with formatted metrics
 */
export function calculateMetricsSummary(user: IUser) {
  return {
    sessionsCount: user.sessionsCount || 0,
    charactersCreatedCount: user.charactersCreatedCount || 0,
    campaignsCreatedCount: user.campaignsCreatedCount || 0,
    lastLogin: formatLastLogin(user.lastLoginAt),
    memberSince: new Date(user.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    }),
  };
}

/**
 * Build complete dashboard metrics from user document
 * Aggregates all dashboard data including subscription, usage, and activity
 *
 * Constitutional: Max 50 lines per function
 *
 * @param user - User document
 * @returns Complete dashboard metrics object
 */
export function buildDashboardMetrics(user: IUser) {
  // Handle both old schema (subscriptionTier) and new schema (subscription.tier)
  const tier = user.subscription?.tier || user.subscriptionTier || 'free';
  const limits = getTierLimits(tier);

  // Extract usage from user document
  // User model schema has usage.partiesCount, encountersCount, creaturesCount
  const usage = {
    parties: user.usage?.partiesCount || 0,
    encounters: user.usage?.encountersCount || 0,
    characters: user.usage?.creaturesCount || 0,
  };

  // Calculate percentages
  const percentages = {
    parties: calculateUsagePercentage(usage.parties, limits.parties),
    encounters: calculateUsagePercentage(usage.encounters, limits.encounters),
    characters: calculateUsagePercentage(usage.characters, limits.characters),
  };

  // Generate warnings
  const warnings = generateUsageWarnings(usage, limits);

  // Build metrics summary
  const metrics = calculateMetricsSummary(user);

  return {
    user: {
      id: String(user._id),
      displayName: user.profile?.displayName || user.firstName || user.email?.split('@')[0] || 'User',
      email: user.email,
    },
    subscription: {
      tier,
      limits,
      usage,
      percentages,
      warnings,
    },
    metrics,
  };
}
