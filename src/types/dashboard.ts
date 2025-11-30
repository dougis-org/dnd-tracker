/**
 * Dashboard Types and Utilities
 *
 * Type definitions and centralized builders for the User Dashboard feature.
 * Uses builder pattern to reduce complexity and duplication.
 *
 * Feature 016: User Dashboard with Real Data
 */

/**
 * Subscription tier enum matching UserModel
 */
export type SubscriptionTier =
  | 'free_adventurer'
  | 'seasoned_adventurer'
  | 'expert_dungeon_master'
  | 'master_of_dungeons'
  | 'guild_master';

/**
 * Resource limits per subscription tier
 */
export const TierLimits: Record<SubscriptionTier, ResourceLimits> = {
  free_adventurer: { parties: 1, characters: 3, encounters: 5 },
  seasoned_adventurer: { parties: 3, characters: 10, encounters: 15 },
  expert_dungeon_master: { parties: 5, characters: 20, encounters: 50 },
  master_of_dungeons: { parties: 10, characters: 50, encounters: 100 },
  guild_master: { parties: 20, characters: 100, encounters: 200 },
};

/**
 * User information displayed on dashboard
 */
export interface DashboardUser {
  id: string;
  email: string;
  displayName: string;
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
 * Complete dashboard API response
 */
export interface DashboardPageData {
  user: DashboardUser;
  usage: ResourceUsage;
  limits: ResourceLimits;
  percentages: UsagePercentages;
  isEmpty: boolean;
  createdAt: string;
}

/**
 * Error response from dashboard API
 */
export interface DashboardErrorResponse {
  error: string;
  code: string;
}

/**
 * Color state for usage progress bars
 */
export type UsageColorState = 'green' | 'yellow' | 'red';

/**
 * Builder class for DashboardPageData - reduces complexity and duplication
 * Replaces multiple validator functions with a single focused builder
 */
export class DashboardBuilder {
  /**
   * Build dashboard data from user and usage information
   */
  static buildPageData(
    userId: string,
    user: {
      email: string;
      displayName: string;
      subscriptionTier: SubscriptionTier;
    },
    usage: ResourceUsage
  ): DashboardPageData {
    const tier = user.subscriptionTier;
    const limits = TierLimits[tier];
    const percentages = {
      parties: limits.parties > 0 ? (usage.parties / limits.parties) * 100 : 0,
      characters:
        limits.characters > 0
          ? (usage.characters / limits.characters) * 100
          : 0,
      encounters:
        limits.encounters > 0
          ? (usage.encounters / limits.encounters) * 100
          : 0,
    };

    return {
      user: {
        id: userId,
        email: user.email,
        displayName: user.displayName || user.email,
        tier,
      },
      usage,
      limits,
      percentages,
      isEmpty:
        usage.parties === 0 && usage.characters === 0 && usage.encounters === 0,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Validate dashboard response structure
   */
  static isValidPageData(data: unknown): data is DashboardPageData {
    if (typeof data !== 'object' || data === null) return false;
    const d = data as Record<string, unknown>;

    return (
      this.isValidUser(d.user) &&
      this.isValidUsage(d.usage) &&
      this.isValidLimits(d.limits) &&
      this.isValidPercentages(d.percentages) &&
      typeof d.isEmpty === 'boolean' &&
      typeof d.createdAt === 'string'
    );
  }

  private static isValidUser(user: unknown): user is DashboardUser {
    if (typeof user !== 'object' || user === null) return false;
    const u = user as Record<string, unknown>;
    return (
      typeof u.id === 'string' &&
      typeof u.email === 'string' &&
      typeof u.displayName === 'string' &&
      this.isValidTier(u.tier)
    );
  }

  private static isValidUsage(usage: unknown): usage is ResourceUsage {
    if (typeof usage !== 'object' || usage === null) return false;
    const u = usage as Record<string, unknown>;
    return (
      typeof u.parties === 'number' &&
      typeof u.characters === 'number' &&
      typeof u.encounters === 'number'
    );
  }

  private static isValidLimits(limits: unknown): limits is ResourceLimits {
    if (typeof limits !== 'object' || limits === null) return false;
    const l = limits as Record<string, unknown>;
    return (
      typeof l.parties === 'number' &&
      typeof l.characters === 'number' &&
      typeof l.encounters === 'number'
    );
  }

  private static isValidPercentages(
    percentages: unknown
  ): percentages is UsagePercentages {
    if (typeof percentages !== 'object' || percentages === null) return false;
    const p = percentages as Record<string, unknown>;
    return (
      typeof p.parties === 'number' &&
      typeof p.characters === 'number' &&
      typeof p.encounters === 'number'
    );
  }

  private static isValidTier(value: unknown): value is SubscriptionTier {
    if (typeof value !== 'string') return false;
    return value in TierLimits;
  }
}

/**
 * Get color state for usage percentage
 * Green: <80%, Yellow: 80-99%, Red: >=100%
 */
export function getUsageColorState(percentage: number): UsageColorState {
  if (percentage < 80) return 'green';
  if (percentage < 100) return 'yellow';
  return 'red';
}

/**
 * Check if usage is at warning level (>=80%)
 */
export function isWarningLevel(percentage: number): boolean {
  return percentage >= 80;
}

/**
 * Get display name with email fallback
 */
export function getDisplayName(user: DashboardUser): string {
  if (user.displayName?.trim()) {
    return user.displayName;
  }
  return user.email;
}

/**
 * Check if usage should show warning (>=80%)
 */
export function shouldShowWarning(percentage: number): boolean {
  return percentage >= 80;
}

/**
 * Get warning message based on usage vs limit
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
