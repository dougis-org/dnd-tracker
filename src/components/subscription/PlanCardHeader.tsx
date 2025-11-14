/**
 * PlanCardHeader Component
 * Displays plan name and status badge
 */

import { getPlanStatusBadge } from '@/lib/subscription/statusHelpers';
import type { Subscription } from '@/lib/schemas/subscriptionSchema';

interface PlanCardHeaderProps {
  subscription: Subscription;
}

export function PlanCardHeader({ subscription }: PlanCardHeaderProps) {
  const isTrial = subscription.status === 'trial';
  const badge = getPlanStatusBadge(subscription.status, isTrial);

  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {subscription.planName}
        </h2>
        <div className="mt-2 flex items-center gap-2">
          <span
            data-testid={`status-${subscription.status}`}
            className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${badge.bgColor} ${badge.textColor}`}
          >
            {badge.label}
          </span>
        </div>
      </div>
    </div>
  );
}
