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

/**
 * Helper: Determine if wizard should be shown based on profile
 */
async function isProfileSetupIncomplete(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/internal/users/${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.warn('Failed to fetch user profile, defaulting to hidden');
      return false;
    }

    const profile: UserProfile = await response.json();
    return !(profile?.profile?.completedSetup ?? false);
  } catch (error) {
    console.error('Error checking profile completion:', error);
    return false;
  }
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
      setShouldShowWizard(false);
    },
  });

  useEffect(() => {
    const checkAndShowWizard = async () => {
      if (!isLoaded || !user?.id) {
        setIsCheckingProfile(false);
        return;
      }

      try {
        const shouldShow = await isProfileSetupIncomplete(user.id);
        setShouldShowWizard(shouldShow);
      } finally {
        setIsCheckingProfile(false);
      }
    };

    checkAndShowWizard();
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
