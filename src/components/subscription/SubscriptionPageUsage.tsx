/**
 * SubscriptionPageUsage Component
 * Displays usage metrics with progress bars
 */

import { getUsageBarColor } from '@/lib/subscription/statusHelpers';
import type { UsageMetric } from '@/lib/schemas/subscriptionSchema';

interface SubscriptionPageUsageProps {
  metrics: UsageMetric[];
}

export function SubscriptionPageUsage({ metrics }: SubscriptionPageUsageProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage</h2>
      <div className="rounded-lg border border-gray-200 bg-white shadow-md p-6">
        <div className="space-y-4">
          {metrics.map((metric) => (
            <UsageMetricRow key={metric.id} metric={metric} />
          ))}
        </div>
      </div>
    </div>
  );
}

function UsageMetricRow({ metric }: { metric: UsageMetric }) {
  // Avoid division by zero: if maxAllowed is 0 ("Unlimited"), percentage is 0
  const percentage =
    metric.maxAllowed === 0 ? 0 : metric.currentUsage / metric.maxAllowed;
  const barColor = getUsageBarColor(metric.currentUsage, metric.maxAllowed);

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-700 font-semibold capitalize">
          {metric.metricName}
        </p>
        <p className="text-sm text-gray-600">
          {metric.currentUsage} of {metric.maxAllowed}
        </p>
      </div>
      <div
        className="w-32 bg-gray-200 rounded-full h-2"
        role="progressbar"
        aria-valuenow={metric.currentUsage}
        aria-valuemin={0}
        aria-valuemax={metric.maxAllowed || 100}
        aria-label={`${metric.metricName} usage`}
      >
        <div
          className={`h-2 rounded-full transition-colors ${barColor}`}
          style={{
            width: `${Math.min(percentage * 100, 100)}%`,
          }}
        />
      </div>
    </div>
  );
}
