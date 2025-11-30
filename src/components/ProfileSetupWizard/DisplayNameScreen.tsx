/**
 * DisplayNameScreen - Display name input screen (T012)
 *
 * Allows user to enter their display name with real-time validation feedback.
 * Shows validation errors if displayName is empty or exceeds 50 characters.
 * Next button is disabled when displayName is invalid.
 *
 * Props:
 * - value: Current display name value
 * - onChange: Callback when display name changes
 * - onNext: Callback to advance to next screen
 *
 * Validation:
 * - Required: non-empty after trim
 * - Length: 1-50 characters
 */

import React, { useMemo } from 'react';

interface DisplayNameScreenProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}

export default function DisplayNameScreen({
  value,
  onChange,
  onNext,
}: DisplayNameScreenProps) {
  // Validate display name: 1-50 chars, non-empty after trim
  const isValid = useMemo(() => {
    const trimmed = value.trim();
    return trimmed.length > 0 && trimmed.length <= 50;
  }, [value]);

  const isTooLong = value.length > 50;
  const isEmpty = value.trim().length === 0;

  return (
    <div data-testid="display-name-screen" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What&apos;s your name?
        </h2>
        <p className="text-gray-600">
          This is how other players will see you in the game.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => {}}
            aria-label="Display name"
            placeholder="Enter your display name"
            className={`w-full px-3 py-2 border rounded-lg transition-colors ${
              isEmpty && value.length > 0
                ? 'border-red-500 focus:ring-red-500'
                : isTooLong
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
            } focus:outline-none focus:ring-2`}
            maxLength={60}
          />

          {/* Validation error messages */}
          {isEmpty && value.length > 0 && (
            <p className="mt-2 text-sm text-red-600">
              Display name cannot be empty
            </p>
          )}
          {isTooLong && (
            <p className="mt-2 text-sm text-red-600">
              Display name must be 50 characters or less
            </p>
          )}

          {/* Character counter */}
          <p className="mt-1 text-xs text-gray-500">
            {value.length}/50 characters
          </p>
        </div>

        <button
          onClick={onNext}
          disabled={!isValid}
          className={`w-full px-4 py-2 font-medium rounded-lg transition-colors ${
            isValid
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
