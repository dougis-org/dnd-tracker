/**
 * Subscription Utilities
 * Subscription tier limit helpers and usage calculation utilities
 * Constitutional: Max 150 lines, max 50 lines per function
 */

export type SubscriptionTier = 'free' | 'seasoned' | 'expert' | 'master' | 'guild';

export type TierLimits = {
  parties: number;
  encounters: number;
  characters: number;
  maxParticipants: number;
};

export type UsageWarning = {
  resource: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
};

/**
 * Subscription tier limits constant
 * Matches data-model.md specifications
 */
export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    parties: 1,
    encounters: 3,
    characters: 10,
    maxParticipants: 6,
  },
  seasoned: {
    parties: 3,
    encounters: 15,
    characters: 50,
    maxParticipants: 10,
  },
  expert: {
    parties: 10,
    encounters: 50,
    characters: 200,
    maxParticipants: 20,
  },
  master: {
    parties: 25,
    encounters: 100,
    characters: 500,
    maxParticipants: 30,
  },
  guild: {
    parties: Infinity,
    encounters: Infinity,
    characters: Infinity,
    maxParticipants: 50,
  },
};

/**
 * Get tier limits for a subscription tier
 * Returns limit object for the given tier
 *
 * @param tier - Subscription tier
 * @returns Limits object
 */
export function getTierLimits(tier: string): TierLimits {
  return SUBSCRIPTION_LIMITS[tier as SubscriptionTier] || SUBSCRIPTION_LIMITS.free;
}

/**
 * Calculate usage percentage
 * Handles edge cases: 0/0 = 0%, x/0 = 100%, x/Infinity = 0%
 *
 * @param current - Current usage count
 * @param limit - Maximum limit
 * @returns Percentage (0-100+), rounded to 2 decimal places
 */
export function calculateUsagePercentage(current: number, limit: number): number {
  // Handle infinite limits
  if (limit === Infinity) {
    return 0;
  }

  // Handle zero limit
  if (limit === 0) {
    return current > 0 ? 100 : 0;
  }

  // Calculate percentage
  const percentage = (current / limit) * 100;
  return Math.round(percentage * 100) / 100;
}

/**
 * Determine warning level based on usage percentage
 * Thresholds: <50% = info, 50-80% = warning, >80% = critical
 *
 * @param percentage - Usage percentage (0-100+)
 * @returns Warning severity level
 */
export function determineWarningLevel(
  percentage: number
): 'info' | 'warning' | 'critical' {
  if (percentage < 50) {
    return 'info';
  }
  if (percentage < 80) {
    return 'warning';
  }
  return 'critical';
}

/**
 * Generate usage warnings for resources exceeding 50% usage
 * Returns array of warnings with resource name, message, and severity
 *
 * Constitutional: Max 50 lines per function
 *
 * @param usage - Current usage by resource
 * @param limits - Tier limits by resource
 * @returns Array of usage warnings
 */
export function generateUsageWarnings(
  usage: { parties?: number; encounters?: number; characters?: number },
  limits: TierLimits
): UsageWarning[] {
  const warnings: UsageWarning[] = [];

  // Check each resource
  const resources: Array<keyof TierLimits> = ['parties', 'encounters', 'characters'];

  for (const resource of resources) {
    const current = usage[resource] || 0;
    const limit = limits[resource];
    const percentage = calculateUsagePercentage(current, limit);

    // Only warn if usage is 50% or higher
    if (percentage >= 50 && limit !== Infinity) {
      const severity = determineWarningLevel(percentage);
      let message: string;

      if (percentage >= 100) {
        message = `You've reached your ${resource} limit (${current} of ${limit})`;
      } else {
        message = `You've used ${current} of ${limit} ${resource}`;
      }

      warnings.push({
        resource,
        message,
        severity,
      });
    }
  }

  return warnings;
}
