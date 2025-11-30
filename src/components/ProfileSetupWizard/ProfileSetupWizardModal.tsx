/**
 * ProfileSetupWizardModal - Main wrapper for the profile setup wizard (T016)
 *
 * Renders the appropriate screen based on currentScreen state,
 * manages navigation, handles accessibility (ARIA, focus trap, Escape key),
 * and integrates with useProfileSetupWizard hook for state management.
 *
 * The modal is non-dismissible on first login (canDismiss=false),
 * but dismissible on subsequent visits.
 *
 * Props:
 * - wizardHook: Complete hook return with state and all methods
 */

/* eslint-disable-next-line no-undef */
type HTMLDiv = HTMLDivElement;

import React, { useRef } from 'react';
import WelcomeScreen from './WelcomeScreen';
import DisplayNameScreen from './DisplayNameScreen';
import AvatarUploadScreen from './AvatarUploadScreen';
import PreferencesScreen from './PreferencesScreen';
import CompletionScreen from './CompletionScreen';
import type { UseProfileSetupWizardReturn } from '@/types/wizard';

interface ProfileSetupWizardModalProps {
  wizardHook: UseProfileSetupWizardReturn;
}

export default function ProfileSetupWizardModal({
  wizardHook,
}: ProfileSetupWizardModalProps) {
  const modalRef = useRef<HTMLDiv>(null);
  const {
    state,
    nextScreen,
    previousScreen,
    setDisplayName,
    setTheme,
    setNotifications,
    closeWizard,
    submitWizard,
  } = wizardHook;

  if (!state.isOpen) {
    return null;
  }

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDiv>) => {
    if (e.key === 'Escape' && state.canDismiss) {
      closeWizard();
    }
  };

  // Calculate progress
  const screens = ['welcome', 'displayName', 'avatar', 'preferences', 'completion'];
  const currentIndex = screens.indexOf(state.currentScreen);
  const progress = ((currentIndex + 1) / screens.length) * 100;

  // Render current screen
  const renderScreen = () => {
    switch (state.currentScreen) {
      case 'welcome':
        return <WelcomeScreen onNext={nextScreen} />;

      case 'displayName':
        return (
          <DisplayNameScreen
            value={state.formState.displayName}
            onChange={setDisplayName}
            onNext={nextScreen}
          />
        );

      case 'avatarUpload':
        return (
          <AvatarUploadScreen
            preview={state.formState.avatarPreview}
            onNext={nextScreen}
          />
        );

      case 'preferences':
        return (
          <PreferencesScreen
            theme={state.formState.theme}
            onThemeChange={setTheme}
            notifications={state.formState.notifications}
            onNotificationsChange={setNotifications}
            onNext={nextScreen}
          />
        );

      case 'completion':
        return <CompletionScreen onClose={closeWizard} />;

      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-title"
        onKeyDown={handleKeyDown}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h1 id="wizard-title" className="text-xl font-bold text-gray-900">
            Profile Setup
          </h1>
          {state.canDismiss && (
            <button
              onClick={closeWizard}
              aria-label="Close wizard"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Loading state */}
          {state.isSubmitting && (
            <div
              role="progressbar"
              aria-valuenow={state.retryCount}
              className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center"
            >
              <div className="animate-spin mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m0 0h6m0-6h-6m0 0h-6" />
                </svg>
              </div>
              <span className="text-sm text-blue-700">Saving your profile...</span>
            </div>
          )}

          {/* Error state */}
          {state.submissionError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium mb-3">
                {state.submissionError}
              </p>
              <button
                onClick={submitWizard}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Screen content */}
          {renderScreen()}
        </div>

        {/* Footer with navigation */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex items-center justify-between">
          {/* Back button */}
          {currentIndex > 0 && (
            <button
              onClick={previousScreen}
              className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded transition-colors"
            >
              Back
            </button>
          )}
          {currentIndex === 0 && <div />}

          {/* Screen indicator */}
          <span className="text-sm text-gray-600">
            Step {currentIndex + 1} of {screens.length}
          </span>

          {/* Action button (submission on completion screen) */}
          {state.currentScreen === 'completion' && (
            <button
              onClick={submitWizard}
              disabled={state.isSubmitting}
              className="px-6 py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {state.isSubmitting ? 'Saving...' : 'Submit'}
            </button>
          )}
          {state.currentScreen !== 'completion' && <div />}
        </div>
      </div>
    </div>
  );
}
