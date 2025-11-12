'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Select, SelectOption } from '@/components/ui/select';
import { userAdapter } from '@/lib/adapters/userAdapter';

interface PreferencesSettingsProps {
  preferences?: {
    experienceLevel: string;
    preferredRole: string;
    ruleset: string;
  };
}

type SaveMessage = { type: 'success' | 'error'; text: string } | null;

export default function PreferencesSettings({
  preferences,
}: PreferencesSettingsProps) {
  const [prefs, setPrefs] = useState(preferences || {
    experienceLevel: 'Intermediate',
    preferredRole: 'Player',
    ruleset: '5e',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<SaveMessage>(null);

  const handleChange = (field: string, value: string) => {
    setPrefs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      await userAdapter.updatePreferences('user-123', prefs as {
        experienceLevel: 'Novice' | 'Intermediate' | 'Advanced';
        preferredRole: 'DM' | 'Player' | 'Both';
        ruleset: '5e' | '3.5e' | 'PF2e';
      });
      setSaveMessage({
        type: 'success',
        text: 'Preferences saved successfully!',
      });
    } catch (_error) {
      setSaveMessage({
        type: 'error',
        text: 'Error saving preferences. Please try again.',
      });
      // Revert to original preferences
      setPrefs(preferences || {
        experienceLevel: 'Intermediate',
        preferredRole: 'Player',
        ruleset: '5e',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>D&D Preferences</CardTitle>
        <CardDescription>
          Customize your role-playing preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label
            htmlFor="experience-level"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Experience Level
          </label>
          <Select
            id="experience-level"
            value={prefs.experienceLevel}
            onChange={(e) =>
              handleChange('experienceLevel', e.target.value)
            }
          >
            <SelectOption value="Novice">Novice</SelectOption>
            <SelectOption value="Intermediate">Intermediate</SelectOption>
            <SelectOption value="Advanced">Advanced</SelectOption>
          </Select>
        </div>

        <div>
          <label
            htmlFor="preferred-role"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Preferred Role
          </label>
          <Select
            id="preferred-role"
            value={prefs.preferredRole}
            onChange={(e) => handleChange('preferredRole', e.target.value)}
          >
            <SelectOption value="DM">Dungeon Master</SelectOption>
            <SelectOption value="Player">Player</SelectOption>
            <SelectOption value="Both">Both</SelectOption>
          </Select>
        </div>

        <div>
          <label
            htmlFor="ruleset"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Ruleset
          </label>
          <Select
            id="ruleset"
            value={prefs.ruleset}
            onChange={(e) => handleChange('ruleset', e.target.value)}
          >
            <SelectOption value="5e">D&D 5e</SelectOption>
            <SelectOption value="3.5e">D&D 3.5e</SelectOption>
            <SelectOption value="PF2e">Pathfinder 2e</SelectOption>
          </Select>
        </div>

        {saveMessage && (
          <div
            className={`p-4 rounded-md ${
              saveMessage.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {saveMessage.text}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </CardContent>
    </Card>
  );
}
