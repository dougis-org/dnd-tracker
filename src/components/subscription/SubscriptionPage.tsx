/**
 * SubscriptionPage Component (User Story 1: Phase 3)
 *
 * Main subscription page that:
 * - Fetches subscription data from /api/subscription
 * - Displays loading and error states
 * - Renders PlanCard component
 * - Handles data refresh/retry
 */

'use client';

import { useEffect, useState } from 'react';
import { PlanCard } from './PlanCard';
import { SubscriptionPageLoading } from './SubscriptionPageLoading';
import { SubscriptionPageError } from './SubscriptionPageError';
import { SubscriptionPageUsage } from './SubscriptionPageUsage';
import {
  fetchSubscriptionData,
  type SubscriptionResponse,
} from '@/lib/subscription/fetchers';

interface SubscriptionPageProps {
  onNavigate?: (target: string) => void;
}

export function SubscriptionPage({ onNavigate }: SubscriptionPageProps) {
  const [data, setData] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchSubscriptionData();
      setData(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetch();
  }, []);

  const handleRetry = () => {
    handleFetch();
  };

  const handleManage = () => {
    onNavigate?.('manage-plan');
  };

  const handleChoosePlan = () => {
    onNavigate?.('choose-plan');
  };

  if (loading) {
    return <SubscriptionPageLoading />;
  }

  if (error || !data) {
    return <SubscriptionPageError error={error} onRetry={handleRetry} />;
  }

  return (
    <div data-testid="subscription-page" className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Subscription & Billing
      </h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Current Plan
        </h2>
        <PlanCard
          subscription={data.subscription}
          trialDaysRemaining={data.subscription.trialDaysRemaining}
          onManage={handleManage}
          onChoosePlan={handleChoosePlan}
        />
      </div>

      <SubscriptionPageUsage metrics={data.usageMetrics} />

      <div className="text-sm text-gray-600">
        <p>
          Questions about your subscription? Check our{' '}
          <a href="#" className="text-blue-600 hover:underline">
            FAQ
          </a>{' '}
          or contact support.
        </p>
      </div>
    </div>
  );
}
