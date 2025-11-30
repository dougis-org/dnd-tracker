/**
 * useProfileSetupWizard Hook
 *
 * Custom React hook for managing wizard state, navigation, form data, and submission.
 * Handles:
 * - Screen navigation (welcome, displayName, avatarUpload, preferences, completion)
 * - Form state management (displayName, avatar, theme, notifications)
 * - Client-side validation
 * - API submission with retry logic
 * - LocalStorage persistence for draft recovery
 * - Error handling with toast notifications
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  validateProfileSetup,
  validateDisplayName,
} from '@/lib/wizards/wizardValidation';
import {
  WIZARD_SCREENS,
  WIZARD_SCREEN_ORDER,
  STORAGE_KEYS,
  API_CONSTRAINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '@/lib/wizards/constants';
import type {
  WizardModalState,
  WizardFormState,
  WizardValidationState,
  UseProfileSetupWizardReturn,
  ProfileSetup,
} from '@/types/wizard';

interface UseProfileSetupWizardOptions {
  /** User ID for API calls */
  userId: string;

  /** Whether user can dismiss modal (false on first login) */
  canDismiss?: boolean;

  /** Callback when wizard completes successfully */
  onComplete?: (profile: ProfileSetup) => void;
}

/** Initial empty form state */
function getInitialFormState(): WizardFormState {
  return {
    displayName: '',
    avatar: undefined,
    avatarPreview: undefined,
    theme: 'light',
    notifications: true,
  };
}

/** Initial validation state (all fields valid) */
function getInitialValidationState(): WizardValidationState {
  return {
    displayName: { isValid: true },
    avatar: { isValid: true },
    preferences: { isValid: true },
  };
}

/** Initial modal state */
function getInitialModalState(): WizardModalState {
  return {
    isOpen: false,
    currentScreen: WIZARD_SCREENS.WELCOME,
    formState: getInitialFormState(),
    validationState: getInitialValidationState(),
    isSubmitting: false,
    canDismiss: true,
    submissionError: undefined,
    retryCount: 0,
  };
}

/**
 * Custom hook for managing profile setup wizard state and logic
 *
 * @param options - Configuration options (userId, canDismiss, onComplete callback)
 * @returns Wizard state and action functions
 */
export function useProfileSetupWizard(
  options: UseProfileSetupWizardOptions
): UseProfileSetupWizardReturn {
  const { userId, canDismiss = true, onComplete } = options;

  // Initialize state
  const [state, setState] = useState<WizardModalState>(() => {
    const initialState = getInitialModalState();
    initialState.canDismiss = canDismiss;

    // Try to restore draft from localStorage
    try {
      const savedDraft = localStorage.getItem(STORAGE_KEYS.WIZARD_DRAFT);
      if (savedDraft) {
        const draft: WizardFormState = JSON.parse(savedDraft);
        initialState.formState = draft;
      }
    } catch {
      // Ignore localStorage errors
    }

    return initialState;
  });

  // Helper to update state safely
  // (Removed - using setState directly in each function instead)

  // Save draft to localStorage whenever form changes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.WIZARD_DRAFT,
        JSON.stringify(state.formState)
      );
    } catch {
      // Ignore localStorage errors
    }
  }, [state.formState]);

  // Screen navigation
  const nextScreen = useCallback(() => {
    setState((prev) => {
      const currentIndex = WIZARD_SCREEN_ORDER.indexOf(
        prev.currentScreen as (typeof WIZARD_SCREEN_ORDER)[number]
      );
      // Only navigate if not at last screen
      if (currentIndex >= 0 && currentIndex < WIZARD_SCREEN_ORDER.length - 1) {
        return {
          ...prev,
          currentScreen: WIZARD_SCREEN_ORDER[currentIndex + 1],
        };
      }
      return prev;
    });
  }, []);

  const previousScreen = useCallback(() => {
    setState((prev) => {
      const currentIndex = WIZARD_SCREEN_ORDER.indexOf(
        prev.currentScreen as (typeof WIZARD_SCREEN_ORDER)[number]
      );
      // Only navigate if not at first screen
      if (currentIndex > 0) {
        return {
          ...prev,
          currentScreen: WIZARD_SCREEN_ORDER[currentIndex - 1],
        };
      }
      return prev;
    });
  }, []);

  const goToScreen = useCallback(
    (screen: WizardModalState['currentScreen']) => {
      if (
        WIZARD_SCREEN_ORDER.includes(
          screen as (typeof WIZARD_SCREEN_ORDER)[number]
        )
      ) {
        setState((prev) => ({ ...prev, currentScreen: screen }));
      }
    },
    []
  );

  // Modal control
  const openWizard = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: true }));
  }, []);

  const closeWizard = useCallback(() => {
    setState((prev) => {
      if (prev.canDismiss) {
        return { ...prev, isOpen: false };
      }
      return prev;
    });
  }, []);

  // Form field updates
  const setDisplayName = useCallback((name: string) => {
    const validation = validateDisplayName(name);
    setState((prev) => ({
      ...prev,
      formState: { ...prev.formState, displayName: name },
      validationState: {
        ...prev.validationState,
        displayName: validation,
      },
    }));
  }, []);

  const setAvatar = useCallback((avatar: string | undefined) => {
    setState((prev) => ({
      ...prev,
      formState: {
        ...prev.formState,
        avatar,
      },
    }));
  }, []);

  const setAvatarPreview = useCallback((preview: string | undefined) => {
    setState((prev) => ({
      ...prev,
      formState: {
        ...prev.formState,
        avatarPreview: preview,
      },
    }));
  }, []);

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setState((prev) => ({
      ...prev,
      formState: { ...prev.formState, theme },
    }));
  }, []);

  const setNotifications = useCallback((notifications: boolean) => {
    setState((prev) => ({
      ...prev,
      formState: { ...prev.formState, notifications },
    }));
  }, []);

  // Form submission with retry logic
  const submitWizard = useCallback(async () => {
    // Start submission
    setState((prev) => ({
      ...prev,
      isSubmitting: true,
      submissionError: undefined,
    }));

    // Validate form
    const validation = validateProfileSetup({
      displayName: state.formState.displayName,
      avatar: state.formState.avatar,
      preferences: {
        theme: state.formState.theme,
        notifications: state.formState.notifications,
      },
      completedSetup: true,
    });

    if (!validation.isValid) {
      const errorMessage = validation.error;
      toast.error(errorMessage);
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        submissionError: errorMessage,
      }));
      return;
    }

    let lastError: Error | null = null;
    let attempt = 0;

    // Retry loop with exponential backoff
    while (attempt < API_CONSTRAINTS.MAX_RETRIES) {
      try {
        const response = await fetch(`/api/internal/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile: {
              displayName: state.formState.displayName,
              avatar: state.formState.avatar,
              preferences: {
                theme: state.formState.theme,
                notifications: state.formState.notifications,
              },
              completedSetup: true,
            },
          }),
          signal: AbortSignal.timeout(API_CONSTRAINTS.TIMEOUT_MS),
        });

        if (response.ok) {
          // Success
          await response.json();
          setState({
            ...getInitialModalState(),
            canDismiss: true,
            isOpen: false,
            currentScreen: WIZARD_SCREENS.COMPLETION,
          });

          // Show success toast
          toast.success(SUCCESS_MESSAGES.PROFILE_SAVED);

          // Clear draft
          try {
            localStorage.removeItem(STORAGE_KEYS.WIZARD_DRAFT);
          } catch {
            // Ignore localStorage errors
          }

          // Call completion callback
          if (onComplete) {
            onComplete(validation.data);
          }

          return;
        }

        // Handle HTTP errors
        const errorData = await response.json();
        const errorMessage =
          errorData.message ||
          `HTTP ${response.status}: ${ERROR_MESSAGES.SUBMISSION_FAILED}`;

        if (
          response.status === 400 ||
          response.status === 401 ||
          response.status === 404
        ) {
          // Non-retryable errors
          throw new Error(errorMessage);
        }

        // Retryable errors (500, 504, etc.)
        lastError = new Error(errorMessage);
        attempt++;

        if (attempt < API_CONSTRAINTS.MAX_RETRIES) {
          // Wait with exponential backoff before retry
          const delay =
            API_CONSTRAINTS.RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        attempt++;

        // Check if error is non-retryable
        if (
          lastError.message.includes('HTTP 400') ||
          lastError.message.includes('HTTP 401') ||
          lastError.message.includes('HTTP 404')
        ) {
          break; // Exit retry loop for non-retryable errors
        }

        if (attempt < API_CONSTRAINTS.MAX_RETRIES) {
          const delay =
            API_CONSTRAINTS.RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    const errorMessage = lastError?.message || ERROR_MESSAGES.SUBMISSION_FAILED;
    setState((prev) => ({
      ...prev,
      isSubmitting: false,
      submissionError: errorMessage,
      retryCount: attempt,
    }));

    toast.error(errorMessage);
  }, [state.formState, userId, onComplete]);

  // Clear validation errors
  const clearValidationErrors = useCallback(() => {
    setState((prev) => ({
      ...prev,
      validationState: getInitialValidationState(),
      submissionError: undefined,
    }));
  }, []);

  // Reset wizard
  const resetWizard = useCallback(() => {
    setState(getInitialModalState());
    try {
      localStorage.removeItem(STORAGE_KEYS.WIZARD_DRAFT);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  return {
    state,
    closeWizard,
    openWizard,
    nextScreen,
    previousScreen,
    goToScreen,
    setDisplayName,
    setAvatar,
    setAvatarPreview,
    setTheme,
    setNotifications,
    submitWizard,
    clearValidationErrors,
    resetWizard,
  };
}
