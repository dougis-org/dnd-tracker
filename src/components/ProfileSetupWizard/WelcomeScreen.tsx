/**
 * WelcomeScreen - First screen of the profile setup wizard (T011)
 *
 * Displays welcome message and introductory text with a Next button
 * to guide users into the profile setup flow.
 *
 * Props:
 * - onNext: Callback to advance to the next screen
 *
 * Test coverage: Renders with testid, button click triggers onNext
 */

import React from 'react';

interface WelcomeScreenProps {
  onNext: () => void;
}

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <div data-testid="welcome-screen" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to D&D Tracker!
        </h2>
        <p className="text-gray-600">
          Let&apos;s set up your profile to personalize your experience.
        </p>
      </div>

      <div className="space-y-4 text-gray-700">
        <p>You&apos;ll tell us:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Your display name (how you appear to others)</li>
          <li>Your avatar (optional profile picture)</li>
          <li>Your theme preference (light or dark)</li>
          <li>Whether you want notifications</li>
        </ul>
      </div>

      <div className="pt-4">
        <button
          onClick={onNext}
          className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
