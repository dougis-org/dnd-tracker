/**
 * Dashboard Validation Helpers
 *
 * Extracted from dashboard.ts to reduce complexity
 * Provides utility functions for dashboard data validation
 *
 * Feature 016: User Dashboard with Real Data
 */

import type {
  DashboardPageData,
  DashboardUser,
  ResourceUsage,
  UsagePercentages,
} from './dashboard';
import type { ResourceLimits } from './subscription';

/**
 * Validates if a dashboard user object has all required fields
 */
export function isValidDashboardUser(user: unknown): user is DashboardUser {
  if (!user || typeof user !== 'object') return false;
  const u = user as Record<string, unknown>;
  return (
    typeof u.userId === 'string' &&
    typeof u.email === 'string' &&
    (typeof u.displayName === 'string' ||
      u.displayName === null ||
      u.displayName === undefined)
  );
}

/**
 * Validates if a resource usage object has all required fields
 */
export function isValidResourceUsage(usage: unknown): usage is ResourceUsage {
  if (!usage || typeof usage !== 'object') return false;
  const u = usage as Record<string, unknown>;
  return (
    typeof u.parties === 'number' &&
    typeof u.characters === 'number' &&
    typeof u.encounters === 'number' &&
    u.parties >= 0 &&
    u.characters >= 0 &&
    u.encounters >= 0
  );
}

/**
 * Validates if a resource limits object has all required fields
 */
export function isValidResourceLimits(
  limits: unknown
): limits is ResourceLimits {
  if (!limits || typeof limits !== 'object') return false;
  const l = limits as Record<string, unknown>;
  return (
    (typeof l.parties === 'number' || l.parties === Number.POSITIVE_INFINITY) &&
    (typeof l.characters === 'number' ||
      l.characters === Number.POSITIVE_INFINITY) &&
    (typeof l.encounters === 'number' ||
      l.encounters === Number.POSITIVE_INFINITY)
  );
}

/**
 * Validates if usage percentages object has all required fields
 */
export function isValidUsagePercentages(
  percentages: unknown
): percentages is UsagePercentages {
  if (!percentages || typeof percentages !== 'object') return false;
  const p = percentages as Record<string, unknown>;
  return (
    typeof p.parties === 'number' &&
    typeof p.characters === 'number' &&
    typeof p.encounters === 'number' &&
    p.parties >= 0 &&
    p.characters >= 0 &&
    p.encounters >= 0
  );
}

/**
 * Validates if the dashboard data response has correct shape
 */
export function isValidDashboardPageData(
  data: unknown
): data is DashboardPageData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;

  return (
    isValidDashboardUser(d.user) &&
    isValidResourceUsage(d.usage) &&
    isValidResourceLimits(d.limits) &&
    isValidUsagePercentages(d.percentages) &&
    typeof d.isEmpty === 'boolean' &&
    typeof d.createdAt === 'string'
  );
}

/**
 * Determines if the dashboard should show empty state
 */
export function shouldShowEmptyState(usage: ResourceUsage): boolean {
  return (
    usage.parties === 0 && usage.characters === 0 && usage.encounters === 0
  );
}

/**
 * Determines the color state for a usage percentage
 * Green: <80%, Yellow: 80-99%, Red: >=100%
 */
export function getUsageColorState(
  percentage: number
): 'green' | 'yellow' | 'red' {
  if (percentage < 80) return 'green';
  if (percentage < 100) return 'yellow';
  return 'red';
}

/**
 * Checks if any resource is at warning level (>=80%)
 */
export function hasWarningLevelUsage(percentages: UsagePercentages): boolean {
  return (
    percentages.parties >= 80 ||
    percentages.characters >= 80 ||
    percentages.encounters >= 80
  );
}

/**
 * Gets display name with email fallback
 */
export function getDisplayName(user: DashboardUser): string {
  if (user.displayName && user.displayName.trim()) {
    return user.displayName;
  }
  return user.email;
}
