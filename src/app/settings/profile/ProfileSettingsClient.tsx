'use client';

/**
 * ProfileSettingsClient Component
 * Client wrapper for ProfileForm in settings context
 * Handles API calls with ProfileForm's built-in success/error handling
 *
 * Constitutional: Max 100 lines, max 50 lines per function
 */

import { useRouter } from 'next/navigation';
import ProfileForm from '@/components/profile/ProfileForm';
import { updateUserProfile } from '@/lib/services/client/user';
import type { IUser } from '@/lib/db/models/User';
import type { ProfileSetup } from '@/lib/validations/user';

interface ProfileSettingsClientProps {
  user: IUser;
}

export default function ProfileSettingsClient({ user }: ProfileSettingsClientProps) {
  const router = useRouter();

  const handleSubmit = async (data: ProfileSetup) => {
    await updateUserProfile(data, 'Failed to update profile');

    // Refresh the page to show updated data
    router.refresh();
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

      <ProfileForm
        user={user}
        onSubmit={handleSubmit}
        title="Your D&D Profile"
        description="Update your D&D preferences and information"
        submitLabel="Save Changes"
      />
    </div>
  );
}
