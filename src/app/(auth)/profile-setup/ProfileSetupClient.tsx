'use client';

/**
 * ProfileSetupClient Component
 * Client wrapper for ProfileSetupWizard that handles API calls
 *
 * Constitutional: Max 100 lines
 */

import ProfileSetupWizard from '@/components/profile/ProfileSetupWizard';
import type { ProfileSetup } from '@/lib/validations/user';

export default function ProfileSetupClient() {

  const handleComplete = async (data: ProfileSetup & { profileSetupCompleted: boolean }) => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      // Success - wizard will handle redirect
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error; // Let ProfileSetupWizard handle error display
    }
  };

  const handleSkip = async (data: { profileSetupCompleted: boolean }) => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to skip profile setup');
      }

      // Success - wizard will handle redirect
    } catch (error) {
      console.error('Failed to skip profile setup:', error);
      throw error;
    }
  };

  return (
    <ProfileSetupWizard
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
}
