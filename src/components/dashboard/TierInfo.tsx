'use client';

/**
 * Tier Information Display Component (T012)
 *
 * Displays:
 * - User's subscription tier name (e.g., "Seasoned Adventurer")
 * - User's display name or email fallback
 * - Tier limits table (parties, characters, encounters)
 *
 * Feature 016: User Dashboard with Real Data
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SubscriptionTier, ResourceLimits } from '@/types/dashboard';

interface TierInfoProps {
  /**
   * User's subscription tier
   */
  tier: SubscriptionTier;

  /**
   * User's display name
   */
  displayName: string;

  /**
   * User's email (fallback for display)
   */
  email: string;

  /**
   * Resource limits for this tier
   */
  limits: ResourceLimits;
}

/**
 * Format tier name for display (e.g., free_adventurer -> Free Adventurer)
 */
function formatTierName(tier: SubscriptionTier): string {
  return tier
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Tier information card showing subscription level and limits
 */
function TierInfo({
  tier,
  displayName,
  email,
  limits,
}: TierInfoProps): React.ReactElement {
  const tierDisplayName = formatTierName(tier);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Subscription</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tier and User Info */}
        <div className="flex items-start justify-between pb-4 border-b">
          <div>
            <p className="text-sm text-gray-600">Tier</p>
            <p className="text-lg font-semibold">{tierDisplayName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Adventurer</p>
            <p className="text-lg font-semibold truncate max-w-xs">
              {displayName || email}
            </p>
          </div>
        </div>

        {/* Limits Table */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Resource Limits</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Parties</span>
              <span className="font-medium">
                {limits.parties === Number.POSITIVE_INFINITY ? '∞' : limits.parties}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Characters</span>
              <span className="font-medium">
                {limits.characters === Number.POSITIVE_INFINITY ? '∞' : limits.characters}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Encounters</span>
              <span className="font-medium">
                {limits.encounters === Number.POSITIVE_INFINITY ? '∞' : limits.encounters}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TierInfo;
