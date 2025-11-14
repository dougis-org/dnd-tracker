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
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getRenewalDaysFromNow = () => {
    const now = new Date();
    const renewal = new Date(subscription.renewalDate);
    const diffTime = renewal.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isTrial = subscription.status === 'trial';
  const renewalDaysFromNow = getRenewalDaysFromNow();

  return (
    <div
      data-testid="plan-card"
      role="region"
      className="rounded-lg border border-gray-200 bg-white shadow-md p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {subscription.planName}
          </h2>
          <div className="mt-2 flex items-center gap-2">
            <span
              data-testid={`status-${subscription.status}`}
              className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                isTrial
                  ? 'bg-yellow-100 text-yellow-800'
                  : subscription.status === 'paused'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-green-100 text-green-800'
              }`}
            >
              {isTrial ? 'Trial' : 'Current Plan'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {isTrial && trialDaysRemaining !== null && trialDaysRemaining !== undefined ? (
          <div className="text-sm">
            <p className="text-gray-600">
              Trial ends in{' '}
              <span className="font-semibold text-gray-900">
                {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'}
              </span>
            </p>
            {trialDaysRemaining <= 3 && (
              <p className="text-yellow-600 mt-1">
                ⚠️ Your trial expires soon!
              </p>
            )}
          </div>
        ) : (
          <div className="text-sm">
            <p className="text-gray-600">Renews</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatDate(new Date(subscription.renewalDate))}
            </p>
            {renewalDaysFromNow === 1 && (
              <p className="text-blue-600 text-xs mt-1">Renewing tomorrow</p>
            )}
            {renewalDaysFromNow <= 0 && (
              <p className="text-red-600 text-xs mt-1">Expired</p>
            )}
          </div>
        )}

        <div className="text-sm">
          <p className="text-gray-600">Billing frequency</p>
          <p className="font-semibold text-gray-900">
            {subscription.billingFrequency === 'annual' ? 'Yearly' : 'Monthly'}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        {isTrial && trialDaysRemaining !== null ? (
          <button
            onClick={onChoosePlan}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Choose Plan
          </button>
        ) : (
          <button
            onClick={onManage}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Manage
          </button>
        )}
      </div>
    </div>
  );
}
