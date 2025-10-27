/**
 * Preferences Tab Component
 * Form for managing user application preferences
 * Constitutional: Max 250 lines, max 50 lines per function
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectOption } from '@/components/ui/select';

interface PreferencesFormValues {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  browserNotifications: boolean;
  timezone: string;
  language: string;
  diceRollAnimations: boolean;
  autoSaveEncounters: boolean;
}

interface PreferencesTabProps {
  preferences: PreferencesFormValues;
  onSave: (values: PreferencesFormValues) => Promise<void> | void;
}

export function PreferencesTab({ preferences, onSave }: PreferencesTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formValues, setFormValues] = useState<PreferencesFormValues>(preferences);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setMessage(null);
      await onSave(formValues);
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save preferences. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof PreferencesFormValues, value: PreferencesFormValues[typeof field]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Manage your application preferences and settings</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Theme Selection */}
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              id="theme"
              value={formValues.theme}
              onChange={(e) => updateField('theme', e.target.value)}
            >
              <SelectOption value="light">Light</SelectOption>
              <SelectOption value="dark">Dark</SelectOption>
              <SelectOption value="system">System</SelectOption>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose your preferred color theme for the application
            </p>
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications" className="text-base cursor-pointer">
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications about your campaigns and encounters
              </p>
            </div>
            <input
              type="checkbox"
              id="emailNotifications"
              checked={formValues.emailNotifications}
              onChange={(e) => updateField('emailNotifications', e.target.checked)}
              className="h-5 w-5 rounded"
            />
          </div>

          {/* Browser Notifications */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="browserNotifications" className="text-base cursor-pointer">
                Browser Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Show browser notifications for important updates
              </p>
            </div>
            <input
              type="checkbox"
              id="browserNotifications"
              checked={formValues.browserNotifications}
              onChange={(e) => updateField('browserNotifications', e.target.checked)}
              className="h-5 w-5 rounded"
            />
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              id="timezone"
              value={formValues.timezone}
              onChange={(e) => updateField('timezone', e.target.value)}
            >
              <SelectOption value="UTC">UTC</SelectOption>
              <SelectOption value="America/New_York">Eastern Time</SelectOption>
              <SelectOption value="America/Chicago">Central Time</SelectOption>
              <SelectOption value="America/Denver">Mountain Time</SelectOption>
              <SelectOption value="America/Los_Angeles">Pacific Time</SelectOption>
              <SelectOption value="Europe/London">London</SelectOption>
              <SelectOption value="Europe/Paris">Paris</SelectOption>
              <SelectOption value="Asia/Tokyo">Tokyo</SelectOption>
            </Select>
            <p className="text-sm text-muted-foreground">Used for displaying session times</p>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              id="language"
              value={formValues.language}
              onChange={(e) => updateField('language', e.target.value)}
            >
              <SelectOption value="en">English</SelectOption>
              <SelectOption value="es">Español</SelectOption>
              <SelectOption value="fr">Français</SelectOption>
              <SelectOption value="de">Deutsch</SelectOption>
              <SelectOption value="ja">日本語</SelectOption>
            </Select>
            <p className="text-sm text-muted-foreground">Application display language</p>
          </div>

          {/* Dice Roll Animations */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="diceRollAnimations" className="text-base cursor-pointer">
                Dice Roll Animations
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable animated dice rolls during encounters
              </p>
            </div>
            <input
              type="checkbox"
              id="diceRollAnimations"
              checked={formValues.diceRollAnimations}
              onChange={(e) => updateField('diceRollAnimations', e.target.checked)}
              className="h-5 w-5 rounded"
            />
          </div>

          {/* Auto Save Encounters */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="autoSaveEncounters" className="text-base cursor-pointer">
                Auto-save Encounters
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically save encounter progress every few minutes
              </p>
            </div>
            <input
              type="checkbox"
              id="autoSaveEncounters"
              checked={formValues.autoSaveEncounters}
              onChange={(e) => updateField('autoSaveEncounters', e.target.checked)}
              className="h-5 w-5 rounded"
            />
          </div>

          {/* Success/Error Message */}
          {message && (
            <div
              className={`rounded-md p-4 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
