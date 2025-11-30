/**
 * PreferencesScreen - Theme and notification preferences screen (T014)
 *
 * Allows user to select theme (light/dark) and enable/disable notifications.
 * Next button is always enabled on this screen.
 *
 * Props:
 * - theme: Current theme selection ('light' or 'dark')
 * - onThemeChange: Callback when theme radio changes
 * - notifications: Current notification preference (boolean)
 * - onNotificationsChange: Callback when notifications checkbox changes
 * - onNext: Callback to advance to next screen
 */

import React from 'react';

interface PreferencesScreenProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  notifications: boolean;
  onNotificationsChange: (enabled: boolean) => void;
  onNext: () => void;
}

export default function PreferencesScreen({
  theme,
  onThemeChange,
  notifications,
  onNotificationsChange,
  onNext,
}: PreferencesScreenProps) {
  return (
    <div data-testid="preferences-screen" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your Preferences
        </h2>
        <p className="text-gray-600">
          Customize how you experience the game.
        </p>
      </div>

      {/* Theme Selection */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-800 mb-3">
          Theme
        </legend>
        <div className="space-y-3">
          <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
            <input
              type="radio"
              name="theme"
              value="light"
              checked={theme === 'light'}
              onChange={() => onThemeChange('light')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="ml-3 font-medium text-gray-700">Light Theme</span>
          </label>
          <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={theme === 'dark'}
              onChange={() => onThemeChange('dark')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="ml-3 font-medium text-gray-700">Dark Theme</span>
          </label>
        </div>
      </fieldset>

      {/* Notifications Toggle */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
        <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => onNotificationsChange(e.target.checked)}
            aria-label="Enable notifications"
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="ml-3 font-medium text-gray-700">
            Enable notifications for combat and party updates
          </span>
        </label>
      </div>

      {/* Next button */}
      <button
        onClick={onNext}
        className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Next
      </button>
    </div>
  );
}
