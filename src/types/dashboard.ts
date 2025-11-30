/**
 * Dashboard Types and Interfaces
 *
 * Type definitions for the User Dashboard feature (Feature 016).
 * Defines the data structures for dashboard display, API responses, and error handling.
 */

import type { SubscriptionTier } from './subscription';

/**
 * User information displayed on dashboard
 */
export interface DashboardUser {
  id: string; // userId from Clerk
  email: string;
  displayName: string; // Uses displayName if available, falls back to email
  tier: SubscriptionTier;
}

/**
 * Current resource usage
 */
export interface ResourceUsage {
  parties: number;
  characters: number;
  encounters: number;
}

/**
 * Resource limits for current tier
 */
export interface ResourceLimits {
  parties: number;
  characters: number;
  encounters: number;
}

/**
 * Usage percentages (0-100, may exceed 100 if over limit)
 */
export interface UsagePercentages {
  parties: number;
  characters: number;
  encounters: number;
}

/**
 * Dashboard page data - the complete response from the API
 */
export interface DashboardPageData {
  user: DashboardUser;
  usage: ResourceUsage;
  limits: ResourceLimits;
  percentages: UsagePercentages;
  isEmpty: boolean; // True if all usage counts are 0
  createdAt: string; // ISO8601 timestamp
}

/**
 * Error response from dashboard API
 */
export interface DashboardErrorResponse {
  error: string; // User-friendly error message
  code: string; // Machine-readable error code
}

/**
 * Color state for usage progress bars
 */
export type UsageColorState = 'green' | 'yellow' | 'red';

/**
 * Helper function to determine progress bar color based on usage percentage
 * Green: <80%, Yellow: 80-100%, Red: ≥100%
 * @param percentage - Usage percentage (0-100+)
 * @returns Color state
 */
export function getUsageColorState(percentage: number): UsageColorState {
  if (percentage < 80) return 'green';
  if (percentage < 100) return 'yellow';
  return 'red';
}

/**
 * Helper function to determine if a percentage should show warning
 * Warning appears for yellow (80-100%) and red (≥100%) states
 * @param percentage - Usage percentage (0-100+)
 * @returns True if warning should be displayed
 */
export function shouldShowWarning(percentage: number): boolean {
  return percentage >= 80;
}

/**
 * Helper function to get warning message based on usage state
 * @param resource - Resource name (parties, characters, or encounters)
 * @param usage - Current usage count
 * @param limit - Resource limit
 * @returns Warning message or empty string if no warning needed
 */
export function getWarningMessage(
  resource: keyof ResourceUsage,
  usage: number,
  limit: number
): string {
  if (usage > limit) {
    return `You have exceeded your ${resource} limit (${usage} of ${limit})`;
  }
  if (usage === limit) {
    return `You have reached your ${resource} limit (${usage} of ${limit})`;
  }
  return '';
}

/**
 * Validation helper to check if a value is a valid SubscriptionTier
 * @param value - Value to validate
 * @returns True if value is a valid subscription tier
 */
export function isValidSubscriptionTier(
  value: unknown
): value is SubscriptionTier {
  if (typeof value !== 'string') return false;
  const validTiers: SubscriptionTier[] = [
    'free_adventurer',
    'seasoned_adventurer',
    'expert_dungeon_master',
    'master_of_dungeons',
    'guild_master',
  ];
  return validTiers.includes(value as SubscriptionTier);
}

/**
 * Validation helper to check if a DashboardPageData object is valid
 * @param data - Data to validate
 * @returns True if data has all required fields with correct types
 */
export function isValidDashboardPageData(
  data: unknown
): data is DashboardPageData {
  if (typeof data !== 'object' || data === null) return false;

  const d = data as Record<string, unknown>;

  return (
    typeof d.user === 'object' &&
    d.user !== null &&
    typeof (d.user as Record<string, unknown>).id === 'string' &&
    typeof (d.user as Record<string, unknown>).email === 'string' &&
    typeof (d.user as Record<string, unknown>).displayName === 'string' &&
    isValidSubscriptionTier((d.user as Record<string, unknown>).tier) &&
    typeof d.usage === 'object' &&
    d.usage !== null &&
    typeof (d.usage as Record<string, unknown>).parties === 'number' &&
    typeof (d.usage as Record<string, unknown>).characters === 'number' &&
    typeof (d.usage as Record<string, unknown>).encounters === 'number' &&
    typeof d.limits === 'object' &&
    d.limits !== null &&
    typeof (d.limits as Record<string, unknown>).parties === 'number' &&
    typeof (d.limits as Record<string, unknown>).characters === 'number' &&
    typeof (d.limits as Record<string, unknown>).encounters === 'number' &&
    typeof d.percentages === 'object' &&
    d.percentages !== null &&
    typeof (d.percentages as Record<string, unknown>).parties === 'number' &&
    typeof (d.percentages as Record<string, unknown>).characters === 'number' &&
    typeof (d.percentages as Record<string, unknown>).encounters === 'number' &&
    typeof d.isEmpty === 'boolean' &&
    typeof d.createdAt === 'string'
  );
}
