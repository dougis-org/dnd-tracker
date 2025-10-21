'use client';

/**
 * ProfileSetupClient Component
 * Client wrapper for ProfileSetupWizard that handles API calls
 *
 * Constitutional: Max 100 lines
 */

import ProfileSetupWizard from '@/components/profile/ProfileSetupWizard';
import { updateUserProfile } from '@/lib/services/client/user';
import type { ProfileSetup } from '@/lib/validations/user';

export default function ProfileSetupClient() {
  const handleComplete = async (data: ProfileSetup & { profileSetupCompleted: boolean }) => {
    try {
      await updateUserProfile(data, 'Failed to update profile');
      // Success - wizard will handle redirect
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error; // Let ProfileSetupWizard handle error display
    }
  };

  return <ProfileSetupWizard onComplete={handleComplete} />;
}
