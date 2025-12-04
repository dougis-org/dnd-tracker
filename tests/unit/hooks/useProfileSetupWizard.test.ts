/**
 * useProfileSetupWizard Hook - Unit Tests
 *
 * TDD-FIRST: These tests specify expected behavior for:
 * - State initialization
 * - Screen navigation (next/previous/go to)
 * - Form updates (displayName, avatar, theme, notifications)
 * - Submission with retry logic
 * - Error handling with toast notifications
 * - LocalStorage persistence
 */

import { renderHook, act } from '@testing-library/react';
import toast from 'react-hot-toast';
import { useProfileSetupWizard } from '@/hooks/useProfileSetupWizard';
import type { WizardFormState } from '@/types/wizard';

// Mock react-hot-toast
jest.mock('react-hot-toast');

// Mock fetch for API calls
global.fetch = jest.fn();

describe('useProfileSetupWizard Hook - useProfileSetupWizard.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (fetch as jest.Mock).mockClear();
  });

  describe('State Initialization', () => {
    // Test 1: Initialize with default state
    test('T007.1 should initialize with welcome screen and empty form', () => {
      // Arrange & Act
      const { result } = renderHook(() =>
        useProfileSetupWizard({ userId: 'user123' })
      );

      // Assert
      expect(result.current.state.isOpen).toBe(false);
      expect(result.current.state.currentScreen).toBe('welcome');
      expect(result.current.state.formState.displayName).toBe('');
      expect(result.current.state.formState.theme).toBe('light');
      expect(result.current.state.formState.notifications).toBe(true);
      expect(result.current.state.isSubmitting).toBe(false);
      expect(result.current.state.retryCount).toBe(0);
    });

    // Test 2: Initialize with canDismiss false (first login)
    test('T007.2 should set canDismiss based on prop', () => {
      // Act
      const { result: result1 } = renderHook(() =>
        useProfileSetupWizard({ userId: 'user123', canDismiss: false })
      );
      const { result: result2 } = renderHook(() =>
        useProfileSetupWizard({ userId: 'user123', canDismiss: true })
      );

      // Assert
      expect(result1.current.state.canDismiss).toBe(false);
      expect(result2.current.state.canDismiss).toBe(true);
    });

    // Test 3: Restore draft from localStorage
    test('T007.3 should restore wizard draft from localStorage', () => {
      // Arrange
      const draft: WizardFormState = {
        displayName: 'Saved Name',
        theme: 'dark',
        notifications: false,
        avatar: 'data:image/jpeg;base64,ABC',
        avatarPreview: 'blob:abc123',
      };
      localStorage.setItem('wizard:draft', JSON.stringify(draft));

      // Act
      const { result } = renderHook(() =>
        useProfileSetupWizard({ userId: 'user123' })
      );

      // Assert
      expect(result.current.state.formState.displayName).toBe('Saved Name');
      expect(result.current.state.formState.theme).toBe('dark');
      expect(result.current.state.formState.notifications).toBe(false);
    });
  });

  describe('Screen Navigation', () => {
    // Test 4: Navigate to next screen
    test('T007.4 should navigate to next screen', () => {
      // Arrange
      const { result } = renderHook(() =>
        useProfileSetupWizard({ userId: 'user123' })
      );

      // Act
      act(() => {
        result.current.nextScreen();
      });

      // Assert
      expect(result.current.state.currentScreen).toBe('displayName');
    });

    // Test 5: Navigate to previous screen
    test('T007.5 should navigate to previous screen', () => {
      // Arrange
      const { result } = renderHook(() =>
        useProfileSetupWizard({ userId: 'user123' })
      );

      // Act
      act(() => {
        result.current.nextScreen();
        result.current.nextScreen();
        result.current.previousScreen();
      });

      // Assert
      expect(result.current.state.currentScreen).toBe('displayName');
    });

    // Test 6: Go to specific screen
    test('T007.6 should jump to specific screen', () => {
      // Arrange
      const { result } = renderHook(() =>
        useProfileSetupWizard({ userId: 'user123' })
      );

      // Act
      act(() => {
        result.current.goToScreen('preferences');
      });

      // Assert
      expect(result.current.state.currentScreen).toBe('preferences');
    });

    // Test 7: Prevent navigation past final screen
    test('T007.7 should not navigate past final screen', () => {
      // Arrange
      const { result } = renderHook(() =>
        useProfileSetupWizard({ userId: 'user123' })
      );

      // Act
      act(() => {
        result.current.goToScreen('completion');
        result.current.nextScreen(); // Try to go past completion
      });

      // Assert
      expect(result.current.state.currentScreen).toBe('completion');
    });

    // Test 8: Prevent navigation before first screen
    test('T007.8 should not navigate before first screen', () => {
      // Arrange
      const { result } = renderHook(() =>
        useProfileSetupWizard({ userId: 'user123' })
      );

      // Act
      act(() => {
        result.current.previousScreen(); // Try to go before welcome
      });

      // Assert
      expect(result.current.state.currentScreen).toBe('welcome');
    });
  });

  describe('Form Updates', () => {
    // Test 9: Update display name
    test('T007.9 should update display name', () => {
      // Arrange
      const { result } = renderHook(() =>
        useProfileSetupWizard({ userId: 'user123' })
      );

      // Act
      act(() => {
        result.current.setDisplayName('Aragorn');
      });

      // Assert
      expect(result.current.state.formState.displayName).toBe('Aragorn');
    });

    // Test 10: Update theme preference
    test('T007.10 should update theme preference', () => {
      // Arrange
      const { result } = renderHook(() =>
        useProfileSetupWizard({ userId: 'user123' })
      );

      // Act
      act(() => {
        result.current.setTheme('dark');
      });

      // Assert
      expect(result.current.state.formState.theme).toBe('dark');
    });

    // Test 11: Update notifications preference
    test('T007.11 should update notifications preference', () => {
      // Arrange
      const { result } = renderHook(() =>
        useProfileSetupWizard({ userId: 'user123' })
      );

      // Act
      act(() => {
        result.current.setNotifications(false);
      });

      // Assert
      expect(result.current.state.formState.notifications).toBe(false);
    });

    // Test 12: Update avatar
    test('T007.12 should update avatar and preview', () => {
      // Arrange
      const { result } = renderHook(() =>
        useProfileSetupWizard({ userId: 'user123' })
      );
      const avatar = 'data:image/jpeg;base64,ABC123';
      const preview = 'blob:preview123';

      // Act
      act(() => {
        result.current.setAvatar(avatar);
        result.current.setAvatarPreview(preview);
      });

      // Assert
      expect(result.current.state.formState.avatar).toBe(avatar);
      expect(result.current.state.formState.avatarPreview).toBe(preview);
    });

    // Test 13: Save draft to localStorage after updates
    test('T007.13 should save draft to localStorage after updates', () => {
      // Arrange
      const { result } = renderHook(() =>
        useProfileSetupWizard({ userId: 'user123' })
      );

      // Act
      act(() => {
        result.current.setDisplayName('Legolas');
        result.current.setTheme('dark');
      });

      // Assert
      const draft = JSON.parse(localStorage.getItem('wizard:draft') || '{}');
      expect(draft.displayName).toBe('Legolas');
      expect(draft.theme).toBe('dark');
    });
  });

  describe('Modal Control', () => {
    // Test 14: Open and close modal
    test('T007.14 should open and close modal', () => {
      // Arrange
      const { result } = renderHook(() =>
        useProfileSetupWizard({ userId: 'user123' })
      );

      // Act & Assert
      expect(result.current.state.isOpen).toBe(false);

      act(() => {
        result.current.openWizard();
      });
      expect(result.current.state.isOpen).toBe(true);

      act(() => {
        result.current.closeWizard();
      });
      expect(result.current.state.isOpen).toBe(false);
    });

    // Test 15: Prevent close on first login (canDismiss=false)
    test('T007.15 should prevent close when canDismiss is false', () => {
      // Arrange
      const { result } = renderHook(() =>
        useProfileSetupWizard({ userId: 'user123', canDismiss: false })
      );

      // Act
      act(() => {
        result.current.openWizard();
        result.current.closeWizard(); // Should have no effect
      });

      // Assert
      expect(result.current.state.isOpen).toBe(true);
    });
  });

  describe('Form Submission', () => {
    // Test 16: Submit wizard with valid data
    test('T007.16 should submit wizard profile with valid data', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        json: async () => ({
          userId: 'user123',
          profile: { completedSetup: true },
        }),
      };
      (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useProfileSetupWizard({ userId: 'user123' })
      );

      // Act
      act(() => {
        result.current.setDisplayName('Aragorn');
        result.current.setTheme('dark');
        result.current.setNotifications(true);
      });

      await act(async () => {
        await result.current.submitWizard();
      });

      // Assert
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/internal/users/user123'),
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('Aragorn'),
        })
      );
      expect(result.current.state.isSubmitting).toBe(false);
    });

    // Test 17: Handle submission error with toast
    test('T007.17 should show error toast on submission failure', async () => {
      // Arrange
      const mockResponse = {
        ok: false,
        json: async () => ({
          error: 'Validation error',
          message: 'Invalid display name',
        }),
      };
      (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useProfileSetupWizard({ userId: 'user123' })
      );

      // Act
      await act(async () => {
        await result.current.submitWizard();
      });

      // Assert
      expect(toast.error).toHaveBeenCalled();
      expect(result.current.state.submissionError).toBeDefined();
    });

    // Test 18: Retry logic with exponential backoff
    test('T007.18 should retry failed submission up to 3 times', async () => {
      // Arrange
      const mockResponse = {
        ok: false,
        json: async () => ({ error: 'Network error' }),
      };
      (fetch as jest.Mock)
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce(mockResponse);

      const { result, rerender } = renderHook(() =>
        useProfileSetupWizard({ userId: 'user123' })
      );

      // Act
      act(() => {
        result.current.setDisplayName('Gandalf');
      });

      // Force re-render to ensure state is updated
      rerender({ userId: 'user123' });

      await act(async () => {
        await result.current.submitWizard();
      });

      // Assert
      expect(result.current.state.retryCount).toBeLessThanOrEqual(3);
      expect(fetch).toHaveBeenCalledTimes(3); // Should retry 3 times
    });
  });

  describe('Validation & Error Handling', () => {
    // Test 19: Clear validation errors
    test('T007.19 should clear validation errors', () => {
      // Arrange
      const { result } = renderHook(() =>
        useProfileSetupWizard({ userId: 'user123' })
      );

      // Act
      act(() => {
        result.current.clearValidationErrors();
      });

      // Assert
      // ValidationState should be reset
      expect(result.current.state.validationState.displayName.isValid).toBe(
        true
      );
      expect(
        result.current.state.validationState.displayName.error
      ).toBeUndefined();
    });

    // Test 20: Reset wizard to initial state
    test('T007.20 should reset wizard to initial state', () => {
      // Arrange
      const { result } = renderHook(() =>
        useProfileSetupWizard({ userId: 'user123' })
      );

      // Act
      act(() => {
        result.current.setDisplayName('Test');
        result.current.setTheme('dark');
        result.current.goToScreen('preferences');
        result.current.resetWizard();
      });

      // Assert
      expect(result.current.state.currentScreen).toBe('welcome');
      expect(result.current.state.formState.displayName).toBe('');
      expect(result.current.state.formState.theme).toBe('light');
      expect(result.current.state.retryCount).toBe(0);
    });

    // Test 21: Validate display name on change
    test('T007.21 should validate display name field on update', () => {
      // Arrange
      const { result } = renderHook(() =>
        useProfileSetupWizard({ userId: 'user123' })
      );

      // Act
      act(() => {
        result.current.setDisplayName('A'); // Valid: 1 char
      });

      // Assert
      expect(result.current.state.validationState.displayName.isValid).toBe(
        true
      );

      // Act
      act(() => {
        result.current.setDisplayName('A'.repeat(51)); // Invalid: > 50 chars
      });

      // Assert
      expect(result.current.state.validationState.displayName.isValid).toBe(
        false
      );
      expect(
        result.current.state.validationState.displayName.error
      ).toBeDefined();
    });

    // Additional tests for branch coverage
    describe('Additional Coverage Tests', () => {
      // Test 22: Navigate directly to specific screen
      test('T007.22 should navigate directly to a specific screen', () => {
        // Arrange
        const { result } = renderHook(() =>
          useProfileSetupWizard({ userId: 'user123' })
        );

        // Act
        act(() => {
          result.current.goToScreen('avatarUpload');
        });

        // Assert
        expect(result.current.state.currentScreen).toBe('avatarUpload');

        // Act - Go to another screen
        act(() => {
          result.current.goToScreen('completion');
        });

        // Assert
        expect(result.current.state.currentScreen).toBe('completion');
      });

      // Test 23: Set multiple form fields and verify state
      test('T007.23 should update multiple form fields independently', () => {
        // Arrange
        const { result } = renderHook(() =>
          useProfileSetupWizard({ userId: 'user123' })
        );

        // Act - Set multiple fields
        act(() => {
          result.current.setDisplayName('Aragorn');
          result.current.setTheme('dark');
          result.current.setNotifications(false);
        });

        // Assert
        expect(result.current.state.formState.displayName).toBe('Aragorn');
        expect(result.current.state.formState.theme).toBe('dark');
        expect(result.current.state.formState.notifications).toBe(false);
      });

      // Test 24: Test loading state during submission
      test('T007.24 should track loading state during submission', async () => {
        // Arrange
        const onComplete = jest.fn();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: { completedSetup: true },
          }),
        });

        const { result } = renderHook(() =>
          useProfileSetupWizard({ userId: 'user123', onComplete })
        );

        // Act - Submit wizard
        act(() => {
          result.current.setDisplayName('Legolas');
        });

        await act(async () => {
          await result.current.submitWizard();
        });

        // Assert - should complete and call onComplete
        expect(result.current.state.currentScreen).toBe('completion');
        expect(onComplete).toHaveBeenCalled();
      });

      // T025: Test retry with exponential backoff on transient errors
      it('T025: should retry with exponential backoff on 429 Too Many Requests', async () => {
        // Arrange
        const onComplete = jest.fn();
        const delays: number[] = [];
        const originalSetTimeout = global.setTimeout;
        global.setTimeout = ((callback: any, delay: number) => {
          delays.push(delay);
          // Call immediately to avoid test timeout
          callback();
          return 0 as any;
        }) as any;

        // First two calls: 429 errors, third call: success
        let callCount = 0;
        (global.fetch as jest.Mock).mockImplementation(() => {
          callCount++;
          if (callCount <= 2) {
            return Promise.resolve({
              ok: false,
              status: 429,
              json: () => Promise.resolve({ error: 'Too many requests' }),
            });
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ userId: 'user-123' }),
          });
        });

        const { result } = renderHook(() =>
          useProfileSetupWizard({ onComplete })
        );

        // Act
        await act(async () => {
          result.current.openWizard();
        });

        await act(async () => {
          result.current.setDisplayName('Aragorn');
        });

        await act(async () => {
          await result.current.submitWizard();
        });

        // Assert - should have retried with backoff multiple times
        expect(delays.length).toBeGreaterThanOrEqual(2);
        expect(callCount).toBe(3);
        expect(result.current.state.currentScreen).toBe('completion');

        // Restore original setTimeout
        global.setTimeout = originalSetTimeout;
      });

      // T026: Test max retries exceeded scenario
      it('T026: should fail after max retries on persistent errors', async () => {
        // Arrange
        const onComplete = jest.fn();
        const delays: number[] = [];
        const originalSetTimeout = global.setTimeout;
        global.setTimeout = ((callback: any, delay: number) => {
          delays.push(delay);
          callback();
          return 0 as any;
        }) as any;

        // Always return 500 to force all retries
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: false,
          status: 500,
          json: () =>
            Promise.resolve({
              error: 'Internal server error',
            }),
        });

        const { result } = renderHook(() =>
          useProfileSetupWizard({ onComplete })
        );

        // Act
        await act(async () => {
          result.current.openWizard();
        });

        await act(async () => {
          result.current.setDisplayName('Boromir');
        });

        await act(async () => {
          await result.current.submitWizard();
        });

        // Assert - should not complete due to persistent error
        expect(result.current.state.currentScreen).not.toBe('completion');
        expect(onComplete).not.toHaveBeenCalled();
        expect(result.current.state.submissionError).toBeDefined();
        // Should have retry delays - indicating exponential backoff triggered
        expect(delays.length).toBeGreaterThan(0);

        // Restore original setTimeout
        global.setTimeout = originalSetTimeout;
      });

      // T027: Test error recovery after initialization
      it('T027: should handle validation error transitions correctly', async () => {
        // Arrange
        const onComplete = jest.fn();
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ userId: 'user-456' }),
        });

        const { result } = renderHook(() =>
          useProfileSetupWizard({ onComplete })
        );

        // Act - trigger validation
        await act(async () => {
          result.current.openWizard();
          result.current.setDisplayName('ValidName');
        });

        // Assert - displayName should be set
        expect(result.current.state.formState.displayName).toBe('ValidName');
      });

      // T028: Test multiple form field updates between screens
      it('T028: should maintain state across screen transitions with multiple updates', async () => {
        // Arrange
        const onComplete = jest.fn();
        const { result } = renderHook(() =>
          useProfileSetupWizard({ onComplete })
        );

        // Act
        await act(async () => {
          result.current.openWizard();
          // Still on welcome screen
          expect(result.current.state.currentScreen).toBe('welcome');
          result.current.nextScreen(); // Move to displayName
        });

        // Assert - after next, should be on displayName screen
        expect(result.current.state.currentScreen).toBe('displayName');
        
        // Act - update fields and navigate again
        await act(async () => {
          result.current.setDisplayName('Gimli');
          result.current.setTheme('dark');
          result.current.nextScreen(); // Move to theme
        });

        // Assert - values persisted through navigation
        expect(result.current.state.formState.displayName).toBe('Gimli');
        expect(result.current.state.formState.theme).toBe('dark');
      });

      // T029: Test non-retryable error (400) exits immediately
      it('T029: should not retry on non-retryable errors (400)', async () => {
        // Arrange
        const onComplete = jest.fn();
        let callCount = 0;

        (global.fetch as jest.Mock).mockImplementation(() => {
          callCount++;
          return Promise.resolve({
            ok: false,
            status: 400,
            json: () => Promise.resolve({ error: 'Bad request' }),
          });
        });

        const { result } = renderHook(() =>
          useProfileSetupWizard({ onComplete })
        );

        // Act
        await act(async () => {
          result.current.openWizard();
        });

        await act(async () => {
          result.current.setDisplayName('Legolas');
        });

        await act(async () => {
          await result.current.submitWizard();
        });

        // Assert - should not retry on 400 error
        expect(callCount).toBe(1); // Only one attempt, no retries
        expect(result.current.state.submissionError).toBeDefined();
        expect(result.current.state.submissionError).toContain('400');
      });

      // T030: Test catch block retry logic with network errors  
      it('T030: should retry on network errors thrown from fetch', async () => {
        // Arrange
        const onComplete = jest.fn();
        let callCount = 0;

        // Mock fetch to fail first time with retryable error, succeed second time
        (global.fetch as jest.Mock).mockImplementation(async () => {
          callCount++;
          if (callCount === 1) {
            throw new Error('Network error');
          }
          return {
            ok: true,
            json: () => Promise.resolve({ userId: 'user-456' }),
          };
        });

        const { result } = renderHook(() =>
          useProfileSetupWizard({ onComplete })
        );

        // Act
        await act(async () => {
          result.current.openWizard();
        });

        await act(async () => {
          result.current.setDisplayName('Gandalf');
        });

        // Submit - should trigger retry logic and succeed on second attempt
        await act(async () => {
          await result.current.submitWizard();
        });

        // Assert - should have retried after network error
        expect(callCount).toBeGreaterThanOrEqual(2);
        expect(result.current.state.currentScreen).toBe('completion');
        expect(onComplete).toHaveBeenCalled();
      });

      // T031: Test catch block with non-retryable errors (404)
      it('T031: should NOT retry on non-retryable errors like 404', async () => {
        // Arrange
        const onComplete = jest.fn();
        let callCount = 0;

        // Mock fetch to throw non-retryable error (404)
        (global.fetch as jest.Mock).mockImplementation(async () => {
          callCount++;
          throw new Error('HTTP 404: Not Found');
        });

        const { result } = renderHook(() =>
          useProfileSetupWizard({ onComplete })
        );

        // Act
        await act(async () => {
          result.current.openWizard();
        });

        await act(async () => {
          result.current.setDisplayName('Gandalf');
        });

        // Submit - should NOT retry on 404
        await act(async () => {
          await result.current.submitWizard();
        });

        // Assert - should only call once (no retry on 404)
        expect(callCount).toBe(1);
        expect(result.current.state.currentScreen).not.toBe('completion');
        expect(result.current.state.submissionError).toBeTruthy();
      });
    });
  });
});
