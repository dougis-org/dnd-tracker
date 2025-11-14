/**
 * PlanCardTrialInfo Component
 * Displays trial-specific information when subscription is in trial
 */

interface PlanCardTrialInfoProps {
  daysRemaining: number | null | undefined;
}

export function PlanCardTrialInfo({ daysRemaining }: PlanCardTrialInfoProps) {
  if (daysRemaining === null || daysRemaining === undefined) {
    return null;
  }

  const isCritical = daysRemaining <= 0;
  const isWarning = daysRemaining <= 3;

  return (
    <div className="text-sm">
      <p className="text-gray-600">
        Trial ends in{' '}
        <span className="font-semibold text-gray-900">
          {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
        </span>
      </p>
      {isWarning && !isCritical && (
        <p className="text-yellow-600 mt-1">⚠️ Your trial expires soon!</p>
      )}
      {isCritical && (
        <p className="text-red-600 mt-1">❌ Your trial has expired!</p>
      )}
    </div>
  );
}
