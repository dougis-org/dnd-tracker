/**
 * SubscriptionPageLoading Component
 * Loading skeleton for subscription page
 */

export function SubscriptionPageLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div data-testid="subscription-page-skeleton" className="space-y-4">
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
