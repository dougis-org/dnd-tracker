import React, { useState, useEffect } from 'react';
import { UserProfile, UserPreferences } from '@/types/user';
import { userAdapter } from '@/lib/adapters/userAdapter';
import ProfileForm from './ProfileForm';
import ProfileLoader from './ProfileLoader';
import ProfileError from './ProfileError';
import ProfileEmpty from './ProfileEmpty';

interface ProfileData {
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  error: Error | null;
  loading: boolean;
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData>({
    profile: null,
    preferences: null,
    error: null,
    loading: true,
  });

  const loadData = async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const userId = 'user-123'; // TODO: Get from Clerk auth in F013
      const [profile, preferences] = await Promise.all([
        userAdapter.getProfile(userId),
        userAdapter.getPreferences(userId),
      ]);
      setData({
        profile,
        preferences,
        error: null,
        loading: false,
      });
    } catch (error) {
      setData((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to load profile'),
        loading: false,
      }));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (data.loading) {
    return <ProfileLoader data-testid="profile-loader" />;
  }

  if (data.error) {
    return (
      <ProfileError
        error={data.error}
        onRetry={loadData}
        data-testid="profile-error"
      />
    );
  }

  if (
    !data.profile ||
    !data.preferences ||
    (data.profile.name === '' && data.profile.email)
  ) {
    return <ProfileEmpty data-testid="profile-empty" />;
  }

  return (
    <ProfileForm
      profile={data.profile}
      preferences={data.preferences}
      data-testid="profile-form"
    />
  );
}
