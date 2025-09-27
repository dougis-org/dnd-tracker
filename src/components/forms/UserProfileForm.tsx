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
import { Select, SelectOption } from '@/components/ui/select'
import { FormField, ErrorDisplay, SuccessDisplay } from '@/components/ui/form-field'
import { ProfileUpdateSchema, type ProfileUpdate } from '@/lib/validations/auth'
import { User, Settings, Palette, Gamepad2 } from 'lucide-react'

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
            <FormField
              id="displayName"
              label="Display Name"
              error={errors.profile?.displayName?.message}
            >
              <Input
                id="displayName"
                placeholder="Enter your display name"
                {...register('profile.displayName')}
                className={errors.profile?.displayName ? 'border-destructive' : ''}
              />
            </FormField>

            {/* D&D Ruleset */}
            <FormField
              id="dndRuleset"
              label="D&D Ruleset"
              error={errors.profile?.dndRuleset?.message}
            >
              <Select
                id="dndRuleset"
                {...register('profile.dndRuleset')}
                className={errors.profile?.dndRuleset ? 'border-destructive' : ''}
              >
                <SelectOption value="">Select ruleset</SelectOption>
                <SelectOption value="5e">D&D 5th Edition</SelectOption>
                <SelectOption value="3.5e">D&D 3.5 Edition</SelectOption>
                <SelectOption value="pf1">Pathfinder 1st Edition</SelectOption>
                <SelectOption value="pf2">Pathfinder 2nd Edition</SelectOption>
              </Select>
            </FormField>

            {/* Experience Level */}
            <FormField
              id="experienceLevel"
              label="Experience Level"
              error={errors.profile?.experienceLevel?.message}
            >
              <Select
                id="experienceLevel"
                {...register('profile.experienceLevel')}
                className={errors.profile?.experienceLevel ? 'border-destructive' : ''}
              >
                <SelectOption value="">Select experience level</SelectOption>
                <SelectOption value="beginner">Beginner (New to D&D)</SelectOption>
                <SelectOption value="intermediate">Intermediate (Some experience)</SelectOption>
                <SelectOption value="expert">Expert (Veteran player/DM)</SelectOption>
              </Select>
            </FormField>

            {/* Role */}
            <FormField
              id="role"
              label="Primary Role"
              error={errors.profile?.role?.message}
            >
              <Select
                id="role"
                {...register('profile.role')}
                className={errors.profile?.role ? 'border-destructive' : ''}
              >
                <SelectOption value="">Select role</SelectOption>
                <SelectOption value="player">Player</SelectOption>
                <SelectOption value="dm">Dungeon Master</SelectOption>
                <SelectOption value="both">Both Player & DM</SelectOption>
              </Select>
            </FormField>
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
          <FormField
            id="theme"
            label="Theme"
            icon={Palette}
            error={errors.preferences?.theme?.message}
          >
            <Select
              id="theme"
              {...register('preferences.theme')}
              className={errors.preferences?.theme ? 'border-destructive' : ''}
            >
              <SelectOption value="">Select theme</SelectOption>
              <SelectOption value="light">Light</SelectOption>
              <SelectOption value="dark">Dark</SelectOption>
              <SelectOption value="auto">Auto (System)</SelectOption>
            </Select>
            {watchedTheme && (
              <p className="text-xs text-muted-foreground">
                {watchedTheme === 'auto'
                  ? 'Theme will match your system preference'
                  : `Using ${watchedTheme} theme`
                }
              </p>
            )}
          </FormField>

          {/* Default Initiative Type */}
          <FormField
            id="defaultInitiativeType"
            label="Default Initiative Type"
            icon={Gamepad2}
            error={errors.preferences?.defaultInitiativeType?.message}
          >
            <Select
              id="defaultInitiativeType"
              {...register('preferences.defaultInitiativeType')}
              className={errors.preferences?.defaultInitiativeType ? 'border-destructive' : ''}
            >
              <SelectOption value="">Select initiative type</SelectOption>
              <SelectOption value="manual">Manual (Roll yourself)</SelectOption>
              <SelectOption value="auto">Auto (System rolls)</SelectOption>
            </Select>
          </FormField>

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
          <ErrorDisplay error={submitError} />
          <SuccessDisplay
            message="Profile updated successfully!"
            show={submitSuccess}
          />

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