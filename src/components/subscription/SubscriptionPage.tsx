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
import type {
  Subscription,
  Plan,
  UsageMetric,
} from '@/lib/schemas/subscriptionSchema';

interface SubscriptionResponse {
  subscription: Subscription;
  usageMetrics: UsageMetric[];
  availablePlans: Plan[];
}

interface SubscriptionPageProps {
  onNavigate?: (target: string) => void;
}

export function SubscriptionPage({ onNavigate }: SubscriptionPageProps) {
  const [data, setData] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/subscription');

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? 'You must be logged in to view subscription details'
            : 'Failed to load subscription information'
        );
      }

      const result: SubscriptionResponse = await response.json();
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
    fetchSubscriptionData();
  }, []);

  const handleRetry = () => {
    fetchSubscriptionData();
  };

  const handleManage = () => {
    if (onNavigate) {
      onNavigate('manage-plan');
    }
  };

  const handleChoosePlan = () => {
    if (onNavigate) {
      onNavigate('choose-plan');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div
          data-testid="subscription-page-skeleton"
          className="space-y-4"
        >
          <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3" />
          <div className="rounded-lg border border-gray-200 bg-white shadow-md p-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
              <div className="h-10 bg-gray-200 rounded animate-pulse w-1/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div
          data-testid="subscription-page-error"
          className="rounded-lg border border-red-200 bg-red-50 p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-red-900">
                Unable to Load Subscription
              </h3>
              <p className="text-red-700 mt-2">
                {error ||
                  'Failed to retrieve your subscription information. Please try again.'}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleRetry}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="subscription-page"
      className="max-w-4xl mx-auto px-4 py-8"
    >
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

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage</h2>
        <div className="rounded-lg border border-gray-200 bg-white shadow-md p-6">
          <div className="space-y-4">
            {data.usageMetrics.map((metric) => (
              <div key={metric.id} className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700 font-semibold capitalize">
                    {metric.metricName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {metric.currentUsage} of {metric.maxAllowed}
                  </p>
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-colors ${
                      metric.currentUsage / metric.maxAllowed >= 0.9
                        ? 'bg-red-500'
                        : metric.currentUsage / metric.maxAllowed >= 0.7
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        (metric.currentUsage / metric.maxAllowed) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
