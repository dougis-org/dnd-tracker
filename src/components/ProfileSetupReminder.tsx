/**
 * ProfileSetupReminder - Dismissible reminder banner (T019)
 *
 * Displayed on profile settings page for users with incomplete profile setup.
 * Provides link to re-trigger wizard and dismiss button.
 *
 * Features:
 * - Shows only when setup is incomplete (isVisible=true)
 * - Dismissible with button (unless canDismiss=false)
 * - localStorage persistence for dismissal state
 * - Info/warning styling with icon
 * - Accessibility: role="alert", ARIA labels
 * - Reappears on next visit if setup still incomplete
 *
 * Props:
 * - isVisible: Show/hide banner
 * - onStartWizard: Callback to open wizard modal
 * - onDismiss: Callback when user dismisses banner
 * - canDismiss: Allow user to dismiss (default: true)
 */

'use client';

import React, { useState, useEffect } from 'react';
import type { ProfileSetupReminderProps } from '@/types/wizard';

const REMINDER_DISMISSED_KEY = 'wizard:reminder:dismissed';

export default function ProfileSetupReminder({
  isVisible,
  onStartWizard,
  onDismiss,
  canDismiss = true,
}: ProfileSetupReminderProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Load dismissal state from localStorage on mount
  // If setup is still incomplete (isVisible=true), clear dismissal flag
  // to show the reminder again on next visit
  useEffect(() => {
    try {
      if (isVisible) {
        // Setup still incomplete - reset dismissal flag to show reminder again
        localStorage.setItem(REMINDER_DISMISSED_KEY, 'false');
        setIsDismissed(false);
      } else {
        // Setup is complete - don't need to show reminder anymore
        const dismissed = localStorage.getItem(REMINDER_DISMISSED_KEY);
        setIsDismissed(dismissed === 'true');
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [isVisible]);

  // Handle dismiss action
  const handleDismiss = () => {
    setIsDismissed(true);
    
    // Store dismissal in localStorage
    try {
      localStorage.setItem(REMINDER_DISMISSED_KEY, 'true');
    } catch {
      // Ignore localStorage errors
    }

    // Call callback if provided
    onDismiss?.();
  };

  // Handle "Complete Setup" button click
  const handleCompleteSetup = () => {
    onStartWizard?.();
  };

  // Don't render if not visible or already dismissed
  if (!isVisible || isDismissed) {
    return null;
  }

  return (
    <div
      data-testid="profile-setup-reminder"
      role="alert"
      className="mb-6 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-4"
    >
      {/* Info Icon */}
      <div className="flex-shrink-0 mt-0.5">
        <svg
          className="w-5 h-5 text-blue-600 dark:text-blue-400"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
          Complete Your Profile
        </h2>
        <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
          Set up your profile to personalize your experience and get the most out of D&D Tracker.
        </p>

        {/* Action Button */}
        <button
          onClick={handleCompleteSetup}
          className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
        >
          Get Started
        </button>
      </div>

      {/* Dismiss Button */}
      {canDismiss && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-blue-400 dark:text-blue-500 hover:text-blue-600 dark:hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label="Dismiss this reminder"
          title="Dismiss reminder"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
