/**
 * Date utility functions for subscription management
 */

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function getRenewalDaysFromNow(renewalDate: Date): number {
  const now = new Date();
  const renewal = new Date(renewalDate);
  const diffTime = renewal.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getTrialStatus(
  daysRemaining: number | null | undefined
): 'critical' | 'warning' | 'normal' | 'no-trial' {
  if (daysRemaining === null || daysRemaining === undefined) {
    return 'no-trial';
  }
  if (daysRemaining <= 0) {
    return 'critical';
  }
  if (daysRemaining <= 3) {
    return 'warning';
  }
  return 'normal';
}
