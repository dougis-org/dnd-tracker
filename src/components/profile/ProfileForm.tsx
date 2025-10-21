'use client';

/**
 * ProfileForm Component
 * Reusable D&D profile form with React Hook Form and Zod validation
 *
 * Constitutional: Max 200 lines, max 50 lines per function
 * Used in: ProfileSetupWizard, Settings Profile Page
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { profileSetupSchema, type ProfileSetup } from '@/lib/validations/user';
import { EXPERIENCE_LEVEL_OPTIONS, PRIMARY_ROLE_OPTIONS } from '@/lib/validations/constants';
import type { IUser } from '@/lib/db/models/User';

interface ProfileFormProps {
  user?: IUser;
  onSubmit: (data: ProfileSetup) => Promise<void>;
  title?: string;
  description?: string;
  submitLabel?: string;
}

export default function ProfileForm({
  user,
  onSubmit,
  title = 'D&D Profile',
  description = 'Customize your D&D preferences',
  submitLabel = 'Save Profile',
}: ProfileFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileSetup>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      timezone: user?.timezone || 'UTC',
      dndEdition: user?.dndEdition || '5th Edition',
      experienceLevel: user?.experienceLevel || undefined,
      primaryRole: user?.primaryRole || undefined,
    },
  });

  const handleFormSubmit = async (data: ProfileSetup) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(false);
      await onSubmit(data);
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to update profile'
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              data-testid="profile-form-display-name"
              type="text"
              placeholder="e.g., Dungeon Master Alex"
              {...register('displayName')}
              aria-invalid={errors.displayName ? 'true' : 'false'}
            />
            {errors.displayName && (
              <p className="text-sm text-red-600" role="alert">
                {errors.displayName.message}
              </p>
            )}
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              type="text"
              placeholder="UTC"
              {...register('timezone')}
              aria-invalid={errors.timezone ? 'true' : 'false'}
            />
            {errors.timezone && (
              <p className="text-sm text-red-600" role="alert">
                {errors.timezone.message}
              </p>
            )}
          </div>

          {/* D&D Edition */}
          <div className="space-y-2">
            <Label htmlFor="dndEdition">D&D Edition</Label>
            <Input
              id="dndEdition"
              type="text"
              placeholder="5th Edition"
              {...register('dndEdition')}
              aria-invalid={errors.dndEdition ? 'true' : 'false'}
            />
            {errors.dndEdition && (
              <p className="text-sm text-red-600" role="alert">
                {errors.dndEdition.message}
              </p>
            )}
          </div>

          {/* Experience Level */}
          <div className="space-y-2">
            <Label htmlFor="experienceLevel">Experience Level</Label>
            <select
              id="experienceLevel"
              {...register('experienceLevel')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-invalid={errors.experienceLevel ? 'true' : 'false'}
            >
              <option value="">Select experience level</option>
              {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.experienceLevel && (
              <p className="text-sm text-red-600" role="alert">
                {errors.experienceLevel.message}
              </p>
            )}
          </div>

          {/* Primary Role */}
          <div className="space-y-2">
            <Label htmlFor="primaryRole">Primary Role</Label>
            <select
              id="primaryRole"
              {...register('primaryRole')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-invalid={errors.primaryRole ? 'true' : 'false'}
            >
              <option value="">Select primary role</option>
              {PRIMARY_ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.primaryRole && (
              <p className="text-sm text-red-600" role="alert">
                {errors.primaryRole.message}
              </p>
            )}
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="rounded-md bg-red-50 p-4" role="alert">
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          )}

          {/* Success Message */}
          {submitSuccess && (
            <div className="rounded-md bg-green-50 p-4" role="alert">
              <p className="text-sm text-green-800">
                Profile updated successfully!
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            data-testid="profile-form-submit-button"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
