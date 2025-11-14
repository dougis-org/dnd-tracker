/**
 * SubscriptionPageError Component
 * Error state for subscription page
 */

interface SubscriptionPageErrorProps {
  error: string | null;
  onRetry: () => void;
}

export function SubscriptionPageError({
  error,
  onRetry,
}: SubscriptionPageErrorProps) {
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
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
