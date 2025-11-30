/**
 * ProfileSetupWizardWrapper - Client-side wrapper for wizard initialization (T017)
 *
 * Responsible for:
 * - Fetching user profile to check completedSetup flag
 * - Managing wizard visibility state
 * - Rendering the modal when needed
 *
 * Uses useUser from Clerk to get authenticated user and userId.
 * Fire-and-forget approach: fetches profile on mount, sets wizard visibility.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useProfileSetupWizard } from '@/hooks/useProfileSetupWizard';
import ProfileSetupWizardModal from './ProfileSetupWizardModal';

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

export function ProfileSetupWizardWrapper() {
  const { isLoaded, user } = useUser();
  const [shouldShowWizard, setShouldShowWizard] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  // Initialize wizard hook (but only show if needed)
  const wizardHook = useProfileSetupWizard({
    userId: user?.id || '',
    canDismiss: true, // Allow dismissal in wrapper (not first login)
    onComplete: () => {
      // Close wizard when complete
      setShouldShowWizard(false);
    },
  });

  useEffect(() => {
    /**
     * Check if user profile is complete on app load.
     * If completedSetup is false, show wizard modal.
     */
    const checkProfileCompletion = async () => {
      if (!isLoaded || !user?.id) {
        setIsCheckingProfile(false);
        return;
      }

      try {
        setIsCheckingProfile(true);

        // Fetch user profile from API (Feature 014)
        const response = await fetch(`/api/internal/users/${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          // If fetch fails, default to NOT showing wizard (fail-safe)
          // User can access wizard from settings if needed
          console.warn('Failed to fetch user profile, wizard hidden');
          setIsCheckingProfile(false);
          return;
        }

        const profile: UserProfile = await response.json();

        // Check if setup is complete
        const isComplete = profile?.profile?.completedSetup ?? false;

        // Show wizard only if setup is incomplete
        setShouldShowWizard(!isComplete);
      } catch (error) {
        console.error('Error checking profile completion:', error);
        // Fail-safe: don't show wizard on error
        setShouldShowWizard(false);
      } finally {
        setIsCheckingProfile(false);
      }
    };

    checkProfileCompletion();
  }, [isLoaded, user?.id]);

  // Don't render while checking profile or if user not loaded
  if (!isLoaded || isCheckingProfile) {
    return null;
  }

  // Don't render wizard if user not authenticated
  if (!user?.id) {
    return null;
  }

  // Render modal only if needed
  return shouldShowWizard ? (
    <ProfileSetupWizardModal
      wizardHook={wizardHook}
    />
  ) : null;
}
