/**
 * Account Settings Client Component
 * Displays subscription tier, creation date, last login
 * Constitutional: Max 100 lines
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AccountClientProps {
  accountInfo: {
    subscriptionTier: string;
    subscriptionStatus: string;
    currentPeriodEnd?: Date;
    createdAt: Date;
    lastLoginAt?: Date;
  };
  userId: string;
}

/**
 * Format date to human-readable string
 */
function formatDate(date: Date | undefined): string {
  if (!date) return 'Never';

  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format subscription tier for display
 */
function formatTier(tier: string): string {
  const tierMap: Record<string, string> = {
    free: 'Free',
    seasoned: 'Seasoned Adventurer',
    expert: 'Expert Tactician',
    master: 'Master Strategist',
    guild: 'Guild Leader',
  };
  return tierMap[tier] || tier;
}

/**
 * Client component for account settings
 */
export function AccountClient({ accountInfo }: AccountClientProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Account</h2>
        <p className="text-muted-foreground">
          Manage your account settings and subscription
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Your current subscription tier and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tier</p>
              <p className="text-lg font-semibold">{formatTier(accountInfo.subscriptionTier)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="text-lg font-semibold capitalize">{accountInfo.subscriptionStatus}</p>
            </div>
          </div>
          {accountInfo.currentPeriodEnd && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Period Ends</p>
              <p className="text-lg">{formatDate(accountInfo.currentPeriodEnd)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Details about your account history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Member Since</p>
            <p className="text-lg">{formatDate(accountInfo.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Last Login</p>
            <p className="text-lg">{formatDate(accountInfo.lastLoginAt)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Permanent account actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" disabled>
            Delete Account (Coming Soon)
          </Button>
          <p className="mt-2 text-sm text-muted-foreground">
            This feature is not yet available. Contact support if you need to delete your account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
