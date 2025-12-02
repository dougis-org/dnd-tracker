'use client';

/**
 * Dashboard Content Router Component (T011)
 *
 * Routes dashboard display based on data state:
 * - If isEmpty: Show EmptyState component with welcome message
 * - Otherwise: Show main dashboard layout with TierInfo, UsageMetrics, QuickActions
 *
 * Feature 016: User Dashboard with Real Data
 */

import React from 'react';
import type { DashboardPageData } from '@/types/dashboard';
import EmptyState from './EmptyState';
import TierInfo from './TierInfo';
import UsageMetrics from './UsageMetrics';
import QuickActions from './QuickActions';

interface DashboardContentProps {
  /**
   * Dashboard data from API
   */
  data: DashboardPageData;
}

/**
 * Dashboard content with conditional rendering based on isEmpty flag
 */
function DashboardContent({ data }: DashboardContentProps): React.ReactElement {
  // Show empty state if no resources created yet
  if (data.isEmpty) {
    return <EmptyState userName={data.user.displayName} />;
  }

  // Show main dashboard layout
  return (
    <div className="space-y-8">
      {/* Tier Information Card */}
      <div>
        <TierInfo
          tier={data.user.tier}
          displayName={data.user.displayName}
          email={data.user.email}
          limits={data.limits}
        />
      </div>

      {/* Usage Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Resource Usage</h2>
        <UsageMetrics
          usage={data.usage}
          limits={data.limits}
          percentages={data.percentages}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <QuickActions />
      </div>
    </div>
  );
}

export default DashboardContent;
