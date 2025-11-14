/**
 * PlanCardRenewalInfo Component
 * Displays renewal date information
 */

import {
  formatDate,
  getRenewalDaysFromNow,
} from '@/lib/subscription/dateHelpers';

interface PlanCardRenewalInfoProps {
  renewalDate: Date;
}

export function PlanCardRenewalInfo({ renewalDate }: PlanCardRenewalInfoProps) {
  const renewalDays = getRenewalDaysFromNow(renewalDate);
  const isExpired = renewalDays <= 0;
  const isRenewingSoon = renewalDays === 1;

  return (
    <div className="text-sm">
      <p className="text-gray-600">Renews</p>
      <p className="text-lg font-semibold text-gray-900">
        {formatDate(new Date(renewalDate))}
      </p>
      {isRenewingSoon && (
        <p className="text-blue-600 text-xs mt-1">Renewing tomorrow</p>
      )}
      {isExpired && <p className="text-red-600 text-xs mt-1">Expired</p>}
    </div>
  );
}
