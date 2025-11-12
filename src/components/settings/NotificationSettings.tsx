'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { userAdapter } from '@/lib/adapters/userAdapter';

interface NotificationSettingsProps {
  notifications?: {
    emailNotifications: boolean;
    partyUpdates: boolean;
    encounterReminders: boolean;
  };
}

type SaveMessage = { type: 'success' | 'error'; text: string } | null;

export default function NotificationSettings({
  notifications,
}: NotificationSettingsProps) {
  const [notifs, setNotifs] = useState(notifications || {
    emailNotifications: true,
    partyUpdates: false,
    encounterReminders: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<SaveMessage>(null);

  const handleToggle = (field: string) => {
    setNotifs((prev) => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      await userAdapter.updateNotifications('user-123', notifs);
      setSaveMessage({
        type: 'success',
        text: 'Notifications updated successfully!',
      });
    } catch (_error) {
      setSaveMessage({
        type: 'error',
        text: 'Error updating notifications. Please try again.',
      });
      // Revert to original notifications
      setNotifs(notifications || {
        emailNotifications: true,
        partyUpdates: false,
        encounterReminders: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Control how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Notifications
            </label>
            <p className="text-sm text-gray-500">
              Receive important updates via email
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifs.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
              className="sr-only peer"
              aria-label="Email notifications"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Party Updates
            </label>
            <p className="text-sm text-gray-500">
              Get notified about party member activity
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifs.partyUpdates}
              onChange={() => handleToggle('partyUpdates')}
              className="sr-only peer"
              aria-label="Party updates"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Encounter Reminders
            </label>
            <p className="text-sm text-gray-500">
              Reminders about upcoming encounters and sessions
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifs.encounterReminders}
              onChange={() => handleToggle('encounterReminders')}
              className="sr-only peer"
              aria-label="Encounter reminders"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>

        {saveMessage && (
          <div
            className={`p-4 rounded-md ${
              saveMessage.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {saveMessage.text}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </CardContent>
    </Card>
  );
}
