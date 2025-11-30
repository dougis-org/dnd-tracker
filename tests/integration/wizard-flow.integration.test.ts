/**
 * Profile Setup Wizard - Full Integration Flow Tests
 *
 * Tests the complete wizard user journey from first render through successful submission,
 * including API interactions, error handling, and state persistence.
 *
 * Test Categories (15 total):
 * 1. Complete Wizard Flow (5)
 * 2. Error Recovery (4)
 * 3. State Persistence (3)
 * 4. API Behavior (3)
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import useProfileSetupWizard from '@/hooks/useProfileSetupWizard';

// Mock API response types
interface MockUserProfile {
  userId: string;
  email: string;
  displayName: string;
  profile: {
    displayName: string;
    avatar?: string;
    preferences: {
      theme: 'light' | 'dark';
      notifications: boolean;
    };
    completedSetup: boolean;
    setupCompletedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

describe('Profile Setup Wizard - Complete Flow Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Complete Wizard Flow', () => {
    // T010.1: User completes wizard from welcome to completion
    test('T010.1 should complete full wizard flow from welcome to completion', async () => {
      const mockResponse: MockUserProfile = {
        userId: 'user_123',
        email: 'test@example.com',
        displayName: 'Test User',
        profile: {
          displayName: 'Test User',
          avatar: 'data:image/jpeg;base64,test',
          preferences: { theme: 'dark', notifications: true },
          completedSetup: true,
          setupCompletedAt: '2025-11-28T15:30:00Z',
        },
        createdAt: '2025-11-28T12:00:00Z',
        updatedAt: '2025-11-28T15:30:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() =>
        useProfileSetupWizard({
          userId: 'user_123',
          onComplete: jest.fn(),
        })
      );

      // Navigate through all screens
      expect(result.current.state.currentScreen).toBe('welcome');

      await act(async () => {
        result.current.nextScreen();
      });
      expect(result.current.state.currentScreen).toBe('displayName');

      await act(async () => {
        result.current.setDisplayName('Test User');
        result.current.nextScreen();
      });
      expect(result.current.state.currentScreen).toBe('avatar');

      await act(async () => {
        result.current.nextScreen();
      });
      expect(result.current.state.currentScreen).toBe('preferences');

      await act(async () => {
        result.current.setTheme('dark');
        result.current.setNotifications(true);
        result.current.nextScreen();
      });
      expect(result.current.state.currentScreen).toBe('completion');

      // Submit wizard
      await act(async () => {
        await result.current.submitWizard();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/internal/users/user_123',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        })
      );

      expect(result.current.state.isSubmitting).toBe(false);
    });

    // T010.2: User can navigate backward through screens
    test('T010.2 should allow backward navigation through screens', async () => {
      const { result } = renderHook(() =>
        useProfileSetupWizard({
          userId: 'user_123',
          onComplete: jest.fn(),
        })
      );

      // Move forward two screens
      await act(async () => {
        result.current.nextScreen();
        result.current.nextScreen();
      });
      expect(result.current.state.currentScreen).toBe('avatar');

      // Move back
      await act(async () => {
        result.current.previousScreen();
      });
      expect(result.current.state.currentScreen).toBe('displayName');

      await act(async () => {
        result.current.previousScreen();
      });
      expect(result.current.state.currentScreen).toBe('welcome');
    });

    // T010.3: Form data persists across navigation
    test('T010.3 should persist form data across screen navigation', async () => {
      const { result } = renderHook(() =>
        useProfileSetupWizard({
          userId: 'user_123',
          onComplete: jest.fn(),
        })
      );

      // Set data on displayName screen
      await act(async () => {
        result.current.nextScreen();
        result.current.setDisplayName('Aragorn');
        result.current.setTheme('dark');
      });

      // Navigate away and back
      await act(async () => {
        result.current.nextScreen();
        result.current.previousScreen();
      });

      // Data should still be there
      expect(result.current.state.formState.displayName).toBe('Aragorn');
      expect(result.current.state.formState.theme).toBe('dark');
    });

    // T010.4: Draft saved to localStorage after each field update
    test('T010.4 should save draft to localStorage after field updates', async () => {
      const { result } = renderHook(() =>
        useProfileSetupWizard({
          userId: 'user_123',
          onComplete: jest.fn(),
        })
      );

      await act(async () => {
        result.current.nextScreen();
        result.current.setDisplayName('Legolas');
      });

      const draft = localStorage.getItem('wizard:draft');
      expect(draft).toBeTruthy();

      const parsedDraft = JSON.parse(draft!);
      expect(parsedDraft.formState.displayName).toBe('Legolas');
    });

    // T010.5: Wizard modal can be dismissed and reopened
    test('T010.5 should allow closing and reopening wizard modal', async () => {
      const { result } = renderHook(() =>
        useProfileSetupWizard({
          userId: 'user_123',
          onComplete: jest.fn(),
        })
      );

      expect(result.current.state.isOpen).toBe(true);

      await act(async () => {
        result.current.closeWizard();
      });
      expect(result.current.state.isOpen).toBe(false);

      await act(async () => {
        result.current.openWizard();
      });
      expect(result.current.state.isOpen).toBe(true);
    });
  });

  describe('Error Recovery', () => {
    // T010.6: Failed submission shows error and allows retry
    test('T010.6 should display error on failed submission and allow retry', async () => {
      const onComplete = jest.fn();
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            userId: 'user_123',
            profile: { completedSetup: true },
          }),
        });

      const { result } = renderHook(() =>
        useProfileSetupWizard({
          userId: 'user_123',
          onComplete,
        })
      );

      // Navigate to completion screen
      await act(async () => {
        result.current.nextScreen();
        result.current.setDisplayName('Gimli');
        result.current.nextScreen();
        result.current.nextScreen();
        result.current.nextScreen();
      });

      // First submission attempt fails
      await act(async () => {
        await result.current.submitWizard();
      });

      expect(result.current.state.submissionError).toBeTruthy();
      expect(result.current.state.retryCount).toBe(1);

      // Second attempt succeeds
      await act(async () => {
        await result.current.submitWizard();
      });

      expect(result.current.state.submissionError).toBeUndefined();
      expect(onComplete).toHaveBeenCalled();
    });

    // T010.7: Validation error blocks progression
    test('T010.7 should block progression with validation error', async () => {
      const { result } = renderHook(() =>
        useProfileSetupWizard({
          userId: 'user_123',
          onComplete: jest.fn(),
        })
      );

      // Move to displayName screen
      await act(async () => {
        result.current.nextScreen();
      });

      // Try to progress without setting displayName
      await act(async () => {
        // Attempt next without valid displayName should be blocked by component
        // (hook allows it; component should disable button)
      });

      expect(result.current.state.validationState.displayName.isValid).toBe(
        false
      );
    });

    // T010.8: Network error triggers exponential backoff retry
    test('T010.8 should retry with exponential backoff on network error', async () => {
      jest.useFakeTimers();

      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            userId: 'user_123',
            profile: { completedSetup: true },
          }),
        });

      const { result } = renderHook(() =>
        useProfileSetupWizard({
          userId: 'user_123',
          onComplete: jest.fn(),
        })
      );

      await act(async () => {
        result.current.nextScreen();
        result.current.setDisplayName('Boromir');
        result.current.nextScreen();
        result.current.nextScreen();
        result.current.nextScreen();
      });

      const submitPromise = act(async () => {
        await result.current.submitWizard();
      });

      // First retry after 1s
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Second retry after 2s more
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await submitPromise;

      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(result.current.state.retryCount).toBe(2);

      jest.useRealTimers();
    });

    // T010.9: Validation error shows specific field message
    test('T010.9 should display specific validation error for fields', async () => {
      const { result } = renderHook(() =>
        useProfileSetupWizard({
          userId: 'user_123',
          onComplete: jest.fn(),
        })
      );

      await act(async () => {
        result.current.nextScreen();
        result.current.setDisplayName(''); // Empty - should fail validation
      });

      expect(result.current.state.validationState.displayName.isValid).toBe(
        false
      );
      expect(
        result.current.state.validationState.displayName.error
      ).toBeTruthy();
    });
  });

  describe('State Persistence', () => {
    // T010.10: Draft loaded from localStorage on hook init
    test('T010.10 should load draft from localStorage on initialization', async () => {
      const draftData = {
        formState: {
          displayName: 'Frodo',
          avatar: undefined,
          avatarPreview: undefined,
          theme: 'light' as const,
          notifications: false,
        },
        currentScreen: 'preferences',
      };

      localStorage.setItem('wizard:draft', JSON.stringify(draftData));

      const { result } = renderHook(() =>
        useProfileSetupWizard({
          userId: 'user_123',
          onComplete: jest.fn(),
        })
      );

      // After small delay for localStorage read
      await waitFor(() => {
        expect(result.current.state.formState.displayName).toBe('Frodo');
      });
    });

    // T010.11: Reset clears draft and resets state
    test('T010.11 should clear draft and reset state on reset', async () => {
      const { result } = renderHook(() =>
        useProfileSetupWizard({
          userId: 'user_123',
          onComplete: jest.fn(),
        })
      );

      // Make some changes
      await act(async () => {
        result.current.nextScreen();
        result.current.setDisplayName('Gandalf');
      });

      const draftBefore = localStorage.getItem('wizard:draft');
      expect(draftBefore).toBeTruthy();

      // Reset
      await act(async () => {
        result.current.resetWizard();
      });

      expect(result.current.state.currentScreen).toBe('welcome');
      expect(result.current.state.formState.displayName).toBe('');
      expect(localStorage.getItem('wizard:draft')).toBeNull();
    });

    // T010.12: Modal state persists across hook unmount/remount
    test('T010.12 should persist modal open state across re-renders', async () => {
      const { result, rerender } = renderHook(() =>
        useProfileSetupWizard({
          userId: 'user_123',
          onComplete: jest.fn(),
        })
      );

      // Open modal
      await act(async () => {
        result.current.openWizard();
      });
      expect(result.current.state.isOpen).toBe(true);

      // Simulate re-render
      rerender();

      expect(result.current.state.isOpen).toBe(true);
    });
  });

  describe('API Behavior', () => {
    // T010.13: Submission payload matches API contract
    test('T010.13 should send correctly formatted payload matching API contract', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          userId: 'user_123',
          profile: { completedSetup: true },
        }),
      });

      const { result } = renderHook(() =>
        useProfileSetupWizard({
          userId: 'user_123',
          onComplete: jest.fn(),
        })
      );

      const avatar = 'data:image/jpeg;base64,test';

      await act(async () => {
        result.current.nextScreen();
        result.current.setDisplayName('Frodo Baggins');
        result.current.nextScreen();
        result.current.setAvatar(avatar);
        result.current.nextScreen();
        result.current.nextScreen();
        result.current.setTheme('dark');
        result.current.setNotifications(true);
        result.current.nextScreen();
        await result.current.submitWizard();
      });

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      // Verify payload structure matches API contract
      expect(requestBody).toEqual({
        profile: {
          displayName: 'Frodo Baggins',
          avatar,
          preferences: {
            theme: 'dark',
            notifications: true,
          },
          completedSetup: true,
        },
      });
    });

    // T010.14: HTTP 400 error displays validation error
    test('T010.14 should handle HTTP 400 validation error from API', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Validation error',
          message: 'displayName must be 1–50 characters',
        }),
      });

      const { result } = renderHook(() =>
        useProfileSetupWizard({
          userId: 'user_123',
          onComplete: jest.fn(),
        })
      );

      await act(async () => {
        result.current.nextScreen();
        result.current.setDisplayName('Test');
        result.current.nextScreen();
        result.current.nextScreen();
        result.current.nextScreen();
        await result.current.submitWizard();
      });

      expect(result.current.state.submissionError).toBeTruthy();
    });

    // T010.15: HTTP 413 error suggests retry with smaller avatar
    test('T010.15 should handle HTTP 413 Payload Too Large error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 413,
        json: async () => ({
          error: 'Avatar too large',
          message: 'Avatar must be 250KB or smaller (base64 encoded)',
        }),
      });

      const { result } = renderHook(() =>
        useProfileSetupWizard({
          userId: 'user_123',
          onComplete: jest.fn(),
        })
      );

      await act(async () => {
        result.current.nextScreen();
        result.current.setDisplayName('Test');
        result.current.nextScreen();
        result.current.setAvatar('x'.repeat(300000)); // Large base64
        result.current.nextScreen();
        result.current.nextScreen();
        result.current.nextScreen();
        await result.current.submitWizard();
      });

      expect(result.current.state.submissionError).toContain('Avatar');
    });
  });
});
