'use client';

/**
 * ProfileSetupWizard Component
 * First-time profile setup flow for new users
 *
 * Constitutional: Max 150 lines, max 50 lines per function
 * Embeds ProfileForm component for reusability
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileForm from '@/components/profile/ProfileForm';
import type { ProfileSetup } from '@/lib/validations/user';

interface ProfileSetupWizardProps {
  onComplete?: (data: ProfileSetup & { profileSetupCompleted: boolean }) => Promise<void>;
  onSkip?: (data: { profileSetupCompleted: boolean }) => Promise<void>;
}

export default function ProfileSetupWizard({
  onComplete,
  onSkip,
}: ProfileSetupWizardProps) {
  const router = useRouter();
  const [isSkipping, setIsSkipping] = useState(false);

  const handleComplete = async (data: ProfileSetup) => {
    const completionData = {
      ...data,
      profileSetupCompleted: true,
    };

    if (onComplete) {
      await onComplete(completionData);
    }

    router.push('/dashboard');
  };

  const handleSkip = async () => {
    setIsSkipping(true);

    try {
      const skipData = {
        profileSetupCompleted: false,
      };

      if (onSkip) {
        await onSkip(skipData);
      }

      router.push('/dashboard');
    } finally {
      setIsSkipping(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card className="mb-6">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to D&D Tracker!</CardTitle>
          <CardDescription>
            Let&apos;s set up your profile to get started. You can skip this and complete it later from settings.
          </CardDescription>
        </CardHeader>
      </Card>

      <ProfileForm
        onSubmit={handleComplete}
        title="Set Up Your D&D Profile"
        description="Tell us about your D&D experience and preferences"
        submitLabel="Complete Profile"
      />

      <div className="mt-6 text-center">
        <Button
          variant="ghost"
          onClick={handleSkip}
          disabled={isSkipping}
          className="w-full max-w-md"
        >
          {isSkipping ? 'Skipping...' : 'Skip for now'}
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          You can complete your profile anytime from Settings
        </p>
      </div>
    </div>
  );
}
