'use client';

import React, { useState, useEffect } from 'react';
import AccountSettings from './AccountSettings';
import PreferencesSettings from './PreferencesSettings';
import NotificationSettings from './NotificationSettings';
import DataManagement from './DataManagement';
import { userAdapter } from '@/lib/adapters/userAdapter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type SettingsSection = 'account' | 'preferences' | 'notifications' | 'data';

interface UserData {
  profile?: {
    name: string;
    email: string;
    createdAt: Date;
  };
  preferences?: {
    experienceLevel: string;
    preferredRole: string;
    ruleset: string;
  };
  notifications?: {
    emailNotifications: boolean;
    partyUpdates: boolean;
    encounterReminders: boolean;
  };
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  const [userData, setUserData] = useState<UserData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const userId = 'user-123';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profile, preferences, notifications] = await Promise.all([
        userAdapter.getProfile(userId),
        userAdapter.getPreferences(userId),
        userAdapter.getNotifications(userId),
      ]);
      setUserData({ profile, preferences, notifications });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load settings'));
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700">Error loading settings</CardTitle>
          <CardDescription className="text-red-600">
            {error.message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button
            onClick={handleRetry}
            className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!userData.profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Complete your settings</CardTitle>
          <CardDescription>
            Set up your profile and preferences to get started
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h1 className="text-4xl font-bold mb-4">Settings</h1>
          <CardTitle>Manage Your Settings</CardTitle>
        </CardHeader>
      </Card>
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveSection('account')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeSection === 'account'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Account
        </button>
        <button
          onClick={() => setActiveSection('preferences')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeSection === 'preferences'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Preferences
        </button>
        <button
          onClick={() => setActiveSection('notifications')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeSection === 'notifications'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Notifications
        </button>
        <button
          onClick={() => setActiveSection('data')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeSection === 'data'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Data
        </button>
      </div>

      <div>
        {activeSection === 'account' && (
          <AccountSettings profile={userData.profile} />
        )}
        {activeSection === 'preferences' && (
          <PreferencesSettings preferences={userData.preferences} />
        )}
        {activeSection === 'notifications' && (
          <NotificationSettings notifications={userData.notifications} />
        )}
        {activeSection === 'data' && <DataManagement />}
      </div>
    </div>
  );
}
