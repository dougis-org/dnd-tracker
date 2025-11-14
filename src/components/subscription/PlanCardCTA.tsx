/**
 * PlanCardCTA Component
 * Displays call-to-action buttons
 */

interface PlanCardCTAProps {
  isTrial: boolean;
  trialDaysRemaining: number | null | undefined;
  onManage?: () => void;
  onChoosePlan?: () => void;
}

export function PlanCardCTA({
  isTrial,
  trialDaysRemaining,
  onManage,
  onChoosePlan,
}: PlanCardCTAProps) {
  const showChoosePlan = isTrial && trialDaysRemaining !== null;

  return (
    <div className="flex gap-3">
      <button
        onClick={showChoosePlan ? onChoosePlan : onManage}
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        {showChoosePlan ? 'Choose Plan' : 'Manage'}
      </button>
    </div>
  );
}
