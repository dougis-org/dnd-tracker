/**
 * Preferences Client Component
 * Client wrapper for PreferencesTab with API integration
 * Constitutional: Max 80 lines
 */

'use client';

import { useRouter } from 'next/navigation';
import { PreferencesTab } from '@/components/settings/PreferencesTab';

interface PreferencesFormValues {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  browserNotifications: boolean;
  timezone: string;
  language: string;
  diceRollAnimations: boolean;
  autoSaveEncounters: boolean;
}

interface PreferencesClientProps {
  preferences: PreferencesFormValues;
  userId: string;
}

/**
 * Client component that handles preferences updates
 */
export function PreferencesClient({ preferences, userId }: PreferencesClientProps) {
  const router = useRouter();

  const handleSave = async (values: PreferencesFormValues) => {
    const response = await fetch(`/api/users/${userId}/settings/preferences`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save preferences');
    }

    // Refresh the page data
    router.refresh();
  };

  return <PreferencesTab preferences={preferences} onSave={handleSave} />;
}
