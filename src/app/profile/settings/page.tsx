/**
 * Profile Settings Page - with ProfileSetupReminder (T020)
 *
 * Wrapper page that:
 * - Fetches user profile to check completedSetup flag
 * - Shows ProfileSetupReminder if setup incomplete
 * - Opens wizard modal when user clicks "Get Started"
 * - Displays profile settings below reminder (if exists)
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import ProfileSetupReminder from '@/components/ProfileSetupReminder';
import { useProfileSetupWizard } from '@/hooks/useProfileSetupWizard';
import SettingsPage from '@/components/settings/SettingsPage';

interface UserProfile {
  userId: string;
  email: string;
  profile?: {
    displayName?: string;
    avatar?: string;
    preferences?: {
      theme: 'light' | 'dark';
      notifications: boolean;
    };
    completedSetup?: boolean;
    setupCompletedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ProfileSettingsPage() {
  const { isLoaded, user } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  // Initialize wizard hook
  const wizardHook = useProfileSetupWizard({
    userId: user?.id || '',
    canDismiss: true,
    onComplete: () => {
      // Refresh profile after wizard completion
      if (user?.id) {
        fetchUserProfile(user.id);
      }
    },
  });

  // Fetch user profile to check completedSetup flag
  const fetchUserProfile = async (userId: string) => {
    try {
      setIsCheckingProfile(true);
      const response = await fetch(`/api/internal/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('Failed to fetch user profile');
        setIsCheckingProfile(false);
        return;
      }

      const profile: UserProfile = await response.json();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsCheckingProfile(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user?.id) {
      fetchUserProfile(user.id);
    } else if (isLoaded && !user?.id) {
      setIsCheckingProfile(false);
    }
  }, [isLoaded, user?.id]);

  // Don't render while checking profile or if user not loaded
  if (!isLoaded || isCheckingProfile) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  // Don't render if user not authenticated
  if (!user?.id) {
    return <div className="container mx-auto p-6">Please log in to access settings.</div>;
  }

  const isProfileIncomplete = !userProfile?.profile?.completedSetup;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Show reminder if setup incomplete */}
      {isProfileIncomplete && (
        <ProfileSetupReminder
          isVisible={true}
          onStartWizard={() => wizardHook.openWizard()}
          onDismiss={() => {
            // Optional: handle custom dismiss logic
          }}
          canDismiss={true}
        />
      )}

      {/* Settings page content */}
      <SettingsPage />
    </div>
  );
}
