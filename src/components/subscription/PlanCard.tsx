/**
 * PlanCard Component (User Story 1: Phase 3)
 *
 * Displays the user's current subscription plan card with:
 * - Plan name with "Current Plan" badge
 * - Renewal date in human-readable format
 * - Billing frequency (annual/monthly)
 * - CTA button (Manage for paid, Choose Plan for trial)
 * - Status indicator
 */

'use client';

import { PlanCardHeader } from './PlanCardHeader';
import { PlanCardTrialInfo } from './PlanCardTrialInfo';
import { PlanCardRenewalInfo } from './PlanCardRenewalInfo';
import { PlanCardCTA } from './PlanCardCTA';
import type { Subscription } from '@/lib/schemas/subscriptionSchema';

interface PlanCardProps {
  subscription: Subscription;
  trialDaysRemaining?: number | null;
  onManage?: () => void;
  onChoosePlan?: () => void;
}

export function PlanCard({
  subscription,
  trialDaysRemaining,
  onManage,
  onChoosePlan,
}: PlanCardProps) {
  const isTrial = subscription.status === 'trial';

  return (
    <div
      data-testid="plan-card"
      role="region"
      aria-label={`Your current ${subscription.planName} subscription`}
      className="rounded-lg border border-gray-200 bg-white shadow-md p-6"
    >
      <PlanCardHeader subscription={subscription} />

      <div
        role="region"
        aria-label="Current subscription plan details"
        className="space-y-3 mb-6"
      >
        {isTrial ? (
          <PlanCardTrialInfo daysRemaining={trialDaysRemaining} />
        ) : (
          <PlanCardRenewalInfo renewalDate={subscription.renewalDate} />
        )}

        <div className="text-sm">
          <p className="text-gray-600">Billing frequency</p>
          <p className="font-semibold text-gray-900">
            {subscription.billingFrequency === 'annual' ? 'Yearly' : 'Monthly'}
          </p>
        </div>
      </div>

      <PlanCardCTA
        isTrial={isTrial}
        trialDaysRemaining={trialDaysRemaining}
        onManage={onManage}
        onChoosePlan={onChoosePlan}
      />
    </div>
  );
}
