'use client'

/**
 * User profile form component with React Hook Form
 * UI: shadcn/ui components, real-time validation, class level management
 */
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProfileUpdateSchema, type ProfileUpdate } from '@/lib/validations/auth'
import { User, Settings, Palette, Gamepad2 } from 'lucide-react'

const selectStyles = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

interface UserProfileFormProps {
  initialData?: Partial<ProfileUpdate>
  onSubmit: (data: ProfileUpdate) => Promise<void>
  isLoading?: boolean
}

export default function UserProfileForm({
  initialData,
  onSubmit,
  isLoading = false,
}: UserProfileFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
    watch,
  } = useForm<ProfileUpdate>({
    resolver: zodResolver(ProfileUpdateSchema),
    defaultValues: initialData || {},
    mode: 'onChange',
  })

  const watchedTheme = watch('preferences.theme')

  const handleFormSubmit = async (data: ProfileUpdate) => {
    try {
      setSubmitError(null)
      setSubmitSuccess(false)

      await onSubmit(data)

      setSubmitSuccess(true)
      reset(data) // Reset form with new values to clear dirty state

      // Clear success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to update profile'
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile Information</span>
          </CardTitle>
          <CardDescription>
            Update your basic profile information and D&D preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="Enter your display name"
                {...register('profile.displayName')}
                className={errors.profile?.displayName ? 'border-destructive' : ''}
              />
              {errors.profile?.displayName && (
                <p className="text-sm text-destructive">
                  {errors.profile.displayName.message}
                </p>
              )}
            </div>

            {/* D&D Ruleset */}
            <div className="space-y-2">
              <Label htmlFor="dndRuleset">D&D Ruleset</Label>
              <select
                id="dndRuleset"
                {...register('profile.dndRuleset')}
                className={selectStyles}
              >
                <option value="">Select ruleset</option>
                <option value="5e">D&D 5th Edition</option>
                <option value="3.5e">D&D 3.5 Edition</option>
                <option value="pf1">Pathfinder 1st Edition</option>
                <option value="pf2">Pathfinder 2nd Edition</option>
              </select>
              {errors.profile?.dndRuleset && (
                <p className="text-sm text-destructive">
                  {errors.profile.dndRuleset.message}
                </p>
              )}
            </div>

            {/* Experience Level */}
            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience Level</Label>
              <select
                id="experienceLevel"
                {...register('profile.experienceLevel')}
                className={selectStyles}
              >
                <option value="">Select experience level</option>
                <option value="beginner">Beginner (New to D&D)</option>
                <option value="intermediate">Intermediate (Some experience)</option>
                <option value="expert">Expert (Veteran player/DM)</option>
              </select>
              {errors.profile?.experienceLevel && (
                <p className="text-sm text-destructive">
                  {errors.profile.experienceLevel.message}
                </p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Primary Role</Label>
              <select
                id="role"
                {...register('profile.role')}
                className={selectStyles}
              >
                <option value="">Select role</option>
                <option value="player">Player</option>
                <option value="dm">Dungeon Master</option>
                <option value="both">Both Player & DM</option>
              </select>
              {errors.profile?.role && (
                <p className="text-sm text-destructive">
                  {errors.profile.role.message}
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Preferences</span>
          </CardTitle>
          <CardDescription>
            Customize your experience with personal preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme */}
          <div className="space-y-2">
            <Label htmlFor="theme" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span>Theme</span>
            </Label>
            <select
              id="theme"
              {...register('preferences.theme')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select theme</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
            {errors.preferences?.theme && (
              <p className="text-sm text-destructive">
                {errors.preferences.theme.message}
              </p>
            )}
            {watchedTheme && (
              <p className="text-xs text-muted-foreground">
                {watchedTheme === 'auto'
                  ? 'Theme will match your system preference'
                  : `Using ${watchedTheme} theme`
                }
              </p>
            )}
          </div>

          {/* Default Initiative Type */}
          <div className="space-y-2">
            <Label htmlFor="defaultInitiativeType" className="flex items-center space-x-2">
              <Gamepad2 className="h-4 w-4" />
              <span>Default Initiative Type</span>
            </Label>
            <select
              id="defaultInitiativeType"
              {...register('preferences.defaultInitiativeType')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select initiative type</option>
              <option value="manual">Manual (Roll yourself)</option>
              <option value="auto">Auto (System rolls)</option>
            </select>
            {errors.preferences?.defaultInitiativeType && (
              <p className="text-sm text-destructive">
                {errors.preferences.defaultInitiativeType.message}
              </p>
            )}
          </div>

          {/* Auto Advance Rounds */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoAdvanceRounds"
              {...register('preferences.autoAdvanceRounds')}
              className="h-4 w-4 rounded border border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <Label htmlFor="autoAdvanceRounds" className="text-sm font-medium">
              Automatically advance rounds in combat
            </Label>
          </div>
          {errors.preferences?.autoAdvanceRounds && (
            <p className="text-sm text-destructive">
              {errors.preferences.autoAdvanceRounds.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <Card>
        <CardContent className="pt-6">
          {/* Error Display */}
          {submitError && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{submitError}</p>
            </div>
          )}

          {/* Success Display */}
          {submitSuccess && (
            <div className="mb-4 p-3 rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300">
                Profile updated successfully!
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={!isDirty || isSubmitting || isLoading}
            >
              Reset Changes
            </Button>

            <Button
              onClick={handleSubmit(handleFormSubmit)}
              disabled={!isDirty || isSubmitting || isLoading}
              variant="dragon"
            >
              {isSubmitting || isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {/* Dirty State Indicator */}
          {isDirty && (
            <p className="text-xs text-muted-foreground mt-2">
              You have unsaved changes.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}