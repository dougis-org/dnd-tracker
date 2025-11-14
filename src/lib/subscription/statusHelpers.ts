/**
 * Status badge utility functions
 */

export interface BadgeConfig {
  bgColor: string;
  textColor: string;
  label: string;
}

export function getPlanStatusBadge(
  status: string,
  isTrial: boolean
): BadgeConfig {
  if (isTrial) {
    return {
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      label: 'Trial',
    };
  }
  if (status === 'paused') {
    return {
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      label: 'Paused',
    };
  }
  return {
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    label: 'Current Plan',
  };
}

export function getUsageBarColor(usage: number, max: number): string {
  const percentage = usage / max;
  if (percentage >= 0.9) return 'bg-red-500';
  if (percentage >= 0.7) return 'bg-yellow-500';
  return 'bg-green-500';
}
