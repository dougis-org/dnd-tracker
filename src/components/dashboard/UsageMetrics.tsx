'use client';

/**
 * Usage Metrics Display Component (T013)
 *
 * Displays:
 * - Resource count and percentage for parties, characters, encounters
 * - Progress bars with color-coded states (green <80%, yellow 80-100%, red ≥100%)
 * - "X of Y" count format
 * - Warning text for yellow/red states
 *
 * Feature 016: User Dashboard with Real Data
 */

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  shouldShowWarning,
  getWarningMessage,
  type ResourceUsage,
  type ResourceLimits,
  type UsagePercentages,
} from '@/types/dashboard';

interface UsageMetricsProps {
  /**
   * Current resource usage
   */
  usage: ResourceUsage;

  /**
   * Resource limits for current tier
   */
  limits: ResourceLimits;

  /**
   * Usage percentages (0-100+)
   */
  percentages: UsagePercentages;
}

interface MetricRowProps {
  /**
   * Resource name (parties, characters, encounters)
   */
  name: string;

  /**
   * Display label for resource
   */
  label: string;

  /**
   * Current usage count
   */
  usage: number;

  /**
   * Resource limit
   */
  limit: number;

  /**
   * Usage percentage
   */
  percentage: number;
}

/**
 * Individual metric row with progress bar and warning
 */
function MetricRow({
  name,
  label,
  usage,
  limit,
  percentage,
}: MetricRowProps): React.ReactElement {
  const showWarning = shouldShowWarning(percentage);
  const warning = getWarningMessage(
    name as keyof ResourceUsage,
    usage,
    limit
  );

  // Clamp percentage for display (max 100% for bar)
  const displayPercentage = Math.min(percentage, 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm text-gray-600">
          {usage} of {limit}
        </span>
      </div>

      <Progress value={displayPercentage} max={100} className="h-2" />

      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-600">
          {Math.round(Math.min(percentage, 100))}%
        </span>
        {showWarning && warning && (
          <span className="text-xs text-amber-600 font-medium">{warning}</span>
        )}
      </div>
    </div>
  );
}

/**
 * Usage metrics display with progress bars and warnings
 */
function UsageMetrics({
  usage,
  limits,
  percentages,
}: UsageMetricsProps): React.ReactElement {
  const hasWarning = Object.values(percentages).some((p) => p >= 80);

  return (
    <div className="space-y-4">
      {/* Warning banner if any resource is at 80%+ */}
      {hasWarning && (
        <Alert variant="destructive" className="border-amber-300 bg-amber-50">
          <AlertDescription className="text-amber-900">
            You are approaching your resource limits. Consider upgrading your subscription for more capacity.
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Parties */}
        <Card>
          <CardContent className="pt-6">
            <MetricRow
              name="parties"
              label="Parties"
              usage={usage.parties}
              limit={limits.parties}
              percentage={percentages.parties}
            />
          </CardContent>
        </Card>

        {/* Characters */}
        <Card>
          <CardContent className="pt-6">
            <MetricRow
              name="characters"
              label="Characters"
              usage={usage.characters}
              limit={limits.characters}
              percentage={percentages.characters}
            />
          </CardContent>
        </Card>

        {/* Encounters */}
        <Card>
          <CardContent className="pt-6">
            <MetricRow
              name="encounters"
              label="Encounters"
              usage={usage.encounters}
              limit={limits.encounters}
              percentage={percentages.encounters}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default UsageMetrics;
