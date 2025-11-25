import React, { useState } from 'react';
import { UserProfile, UserPreferences } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectOption } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { userAdapter } from '@/lib/adapters/userAdapter';
import { parseEmail, validateName } from '@/lib/validation/userValidation';

interface ProfileFormProps {
  profile: UserProfile;
  preferences: UserPreferences;
  'data-testid'?: string;
}

export default function ProfileForm({
  profile: initialProfile,
  preferences: initialPreferences,
  'data-testid': testId,
}: ProfileFormProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const validateField = (name: string, value: string): string | null => {
    if (name === 'email') {
      const validation = parseEmail(value);
      return validation.success ? null : validation.error || null;
    }
    if (name === 'name') {
      const validation = validateName(value);
      return validation.success ? null : validation.error || null;
    }
    return null;
  };

  const handleProfileChange =
    (field: keyof UserProfile) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setProfile((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    };

  const handlePreferencesChange =
    (field: keyof UserPreferences) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setPreferences((prev) => ({ ...prev, [field]: value as never }));
    };

  const handleBlur =
    (field: string) =>
    (e: React.FocusEvent<HTMLInputElement>) => {
      const error = validateField(field, e.target.value);
      if (error) {
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Validate all fields before saving
      const emailValidation = parseEmail(profile.email);
      const nameValidation = validateName(profile.name);

      if (!emailValidation.success || !nameValidation.success) {
        setErrors({
          ...(emailValidation.success ? {} : { email: emailValidation.error }),
          ...(nameValidation.success ? {} : { name: nameValidation.error }),
        });
        setIsSaving(false);
        return;
      }

      // Save both profile and preferences
      const userId = 'user-123'; // TODO: Get from Clerk auth in F013
      await Promise.all([
        userAdapter.updateProfile(userId, {
          name: profile.name,
          email: profile.email,
        }),
        userAdapter.updatePreferences(userId, preferences),
      ]);

      setSaveMessage({
        type: 'success',
        text: 'Profile saved successfully!',
      });
      setErrors({});
    } catch (error) {
      // Revert to original values on error
      setProfile(initialProfile);
      setPreferences(initialPreferences);
      setSaveMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save profile',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Profile</h1>
      <Card data-testid={testId}>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
        {/* Save Message */}
        {saveMessage && (
          <div
            className={`rounded-md p-4 text-sm ${
              saveMessage.type === 'success'
                ? 'bg-green-50 text-green-900'
                : 'bg-red-50 text-red-900'
            }`}
          >
            {saveMessage.text}
          </div>
        )}

        {/* Name Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <Input
            name="name"
            value={profile.name}
            onChange={handleProfileChange('name')}
            onBlur={handleBlur('name')}
            placeholder="Your name"
            disabled={isSaving}
          />
          {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            name="email"
            type="email"
            value={profile.email}
            onChange={handleProfileChange('email')}
            onBlur={handleBlur('email')}
            placeholder="your@email.com"
            disabled={isSaving}
          />
          {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
        </div>

        {/* Experience Level */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Experience Level</label>
          <Select
            value={preferences.experienceLevel}
            onChange={handlePreferencesChange('experienceLevel')}
            disabled={isSaving}
          >
            <SelectOption value="Novice">Novice</SelectOption>
            <SelectOption value="Intermediate">Intermediate</SelectOption>
            <SelectOption value="Advanced">Advanced</SelectOption>
          </Select>
        </div>

        {/* Preferred Role */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Preferred Role</label>
          <Select
            value={preferences.preferredRole}
            onChange={handlePreferencesChange('preferredRole')}
            disabled={isSaving}
          >
            <SelectOption value="DM">Dungeon Master</SelectOption>
            <SelectOption value="Player">Player</SelectOption>
            <SelectOption value="Both">Both</SelectOption>
          </Select>
        </div>

        {/* Ruleset */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Ruleset</label>
          <Select
            value={preferences.ruleset}
            onChange={handlePreferencesChange('ruleset')}
            disabled={isSaving}
          >
            <SelectOption value="5e">D&D 5e</SelectOption>
            <SelectOption value="3.5e">D&D 3.5e</SelectOption>
            <SelectOption value="PF2e">Pathfinder 2e</SelectOption>
          </Select>
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
      </Card>
    </div>
  );
}
