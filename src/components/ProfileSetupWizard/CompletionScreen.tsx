/**
 * CompletionScreen - Success/completion screen (T015)
 *
 * Displays success message after user completes profile setup.
 * Provides Done button to close modal and complete wizard flow.
 *
 * Props:
 * - onClose: Callback to close modal and finish wizard
 */

import React from 'react';

interface CompletionScreenProps {
  onClose: () => void;
}

export default function CompletionScreen({ onClose }: CompletionScreenProps) {
  return (
    <div data-testid="completion-screen" className="space-y-6 text-center">
      <div>
        <div className="mb-4 flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Profile Complete!
        </h2>
        <p className="text-gray-600">
          Your profile has been set up successfully. You&apos;re all set to start
          playing!
        </p>
      </div>

      {/* Done button */}
      <button
        onClick={onClose}
        className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
      >
        Done
      </button>
    </div>
  );
}
