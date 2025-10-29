/**
 * Settings Layout Component
 * Provides consistent layout with tab navigation for all settings pages
 * Constitutional: Max 80 lines
 */

import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { SettingsTabs } from '@/components/settings/SettingsTabs';

interface SettingsLayoutProps {
  children: ReactNode;
}

/**
 * Settings layout with authentication check and tab navigation
 * Server component that wraps settings pages
 */
export default async function SettingsLayout({ children }: SettingsLayoutProps) {
  // Verify user is authenticated
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile, preferences, and account settings
        </p>
      </div>

      {/* Tab Navigation */}
      <SettingsTabs />

      {/* Page Content */}
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}
