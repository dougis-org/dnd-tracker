import { OfflineBanner } from '@/components/OfflineBanner/OfflineBanner';

/* global alert */

export default function OfflineDemoPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-8">Offline Banner Demo</h1>

      <div className="space-y-4">
        <p className="text-gray-600">
          This page demonstrates the OfflineBanner component. Use browser dev tools to simulate offline/online states.
        </p>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Open browser dev tools (F12)</li>
            <li>Go to Network tab</li>
            <li>Check "Offline" to simulate offline state</li>
            <li>Uncheck to simulate coming back online</li>
          </ul>
        </div>

        <OfflineBanner onRetry={() => alert('Retry clicked!')} pendingOperations={3} />
      </div>
    </div>
  );
}