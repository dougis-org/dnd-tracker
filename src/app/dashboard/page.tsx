/**
 * Dashboard Page
 * Main dashboard showing user metrics, subscription usage, and quick actions
 * Constitutional: Max 100 lines per file
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/db/connection';
import { getDashboardMetrics } from '@/lib/services/dashboardService';
import User from '@/lib/db/models/User';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { UsageMetrics } from '@/components/dashboard/UsageMetrics';
import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard';
import { QuickActions } from '@/components/dashboard/QuickActions';

export default async function DashboardPage() {
  // Check authentication
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch dashboard metrics
  await connectToDatabase();
  const user = await User.findByClerkId(userId);

  if (!user) {
    redirect('/profile-setup');
  }

  const metrics = await getDashboardMetrics(String(user._id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <DashboardHeader displayName={metrics.user.displayName} />

      {/* Usage Metrics Cards */}
      <UsageMetrics metrics={metrics} />

      {/* Quick Actions and Subscription */}
      <div className="grid gap-6 md:grid-cols-2">
        <QuickActions />
        <SubscriptionCard metrics={metrics} />
      </div>

      {/* Onboarding Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started Checklist</CardTitle>
          <CardDescription>
            Complete these steps to make the most of your D&D Encounter Tracker
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input type="checkbox" checked readOnly className="rounded" />
              <span className="text-sm line-through text-muted-foreground">
                Create your account
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={metrics.subscription.usage.parties > 0}
                readOnly
                className="rounded"
              />
              <span className="text-sm">Create your first party</span>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" readOnly className="rounded" />
              <span className="text-sm">Add characters to your party</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={metrics.subscription.usage.encounters > 0}
                readOnly
                className="rounded"
              />
              <span className="text-sm">Build your first encounter</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={metrics.metrics.sessionsCount > 0}
                readOnly
                className="rounded"
              />
              <span className="text-sm">Start your first combat session</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
