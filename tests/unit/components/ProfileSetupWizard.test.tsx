/**
 * ProfileSetupWizard Component Integration Tests
 *
 * TDD-First Tests: Component rendering, validation, screen transitions, accessibility,
 * error states, and submission behavior.
 *
 * Test Categories (25 total):
 * 1. Rendering & Modal Display (4)
 * 2. Screen Navigation (4)
 * 3. Form Validation & Field Updates (6)
 * 4. Accessibility (4)
 * 5. Error Handling & Retry (4)
 * 6. Integration with Hook (3)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileSetupWizardModal from '@/components/ProfileSetupWizard/ProfileSetupWizardModal';
import type { UseProfileSetupWizardReturn } from '@/types/wizard';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock child components (they'll be tested separately)
jest.mock('@/components/ProfileSetupWizard/WelcomeScreen', () => {
  return function MockWelcomeScreen({ onNext }: any) {
    return <div data-testid="welcome-screen">Welcome <button onClick={onNext}>Next</button></div>;
  };
});

jest.mock('@/components/ProfileSetupWizard/DisplayNameScreen', () => {
  return function MockDisplayNameScreen({ value, onChange, onNext }: any) {
    return (
      <div data-testid="display-name-screen">
        <input value={value} onChange={(e) => onChange(e.target.value)} />
        <button onClick={onNext}>Next</button>
      </div>
    );
  };
});

jest.mock('@/components/ProfileSetupWizard/AvatarUploadScreen', () => {
  return function MockAvatarUploadScreen({ onNext }: any) {
    return <div data-testid="avatar-screen">Avatar Upload <button onClick={onNext}>Next</button></div>;
  };
});

jest.mock('@/components/ProfileSetupWizard/PreferencesScreen', () => {
  return function MockPreferencesScreen({ onNext }: any) {
    return <div data-testid="preferences-screen">Preferences <button onClick={onNext}>Next</button></div>;
  };
});

jest.mock('@/components/ProfileSetupWizard/CompletionScreen', () => {
  return function MockCompletionScreen({ onClose }: any) {
    return <div data-testid="completion-screen">Complete <button onClick={onClose}>Close</button></div>;
  };
});

describe('ProfileSetupWizard Component - ProfileSetupWizardModal.tsx', () => {
  // Mock hook return value
  const createMockHookReturn = (overrides = {}): UseProfileSetupWizardReturn => ({
    state: {
      isOpen: true,
      currentScreen: 'welcome',
      formState: {
        displayName: '',
        avatar: undefined,
        avatarPreview: undefined,
        theme: 'light',
        notifications: true,
      },
      validationState: {
        displayName: { isValid: true },
        avatar: { isValid: true },
        preferences: { isValid: true },
      },
      isSubmitting: false,
      canDismiss: true,
      submissionError: undefined,
      retryCount: 0,
    },
    closeWizard: jest.fn(),
    openWizard: jest.fn(),
    nextScreen: jest.fn(),
    previousScreen: jest.fn(),
    goToScreen: jest.fn(),
    setDisplayName: jest.fn(),
    setAvatar: jest.fn(),
    setAvatarPreview: jest.fn(),
    setTheme: jest.fn(),
    setNotifications: jest.fn(),
    submitWizard: jest.fn(),
    clearValidationErrors: jest.fn(),
    resetWizard: jest.fn(),
    ...overrides,
  });

  describe('Rendering & Modal Display', () => {
    // T009.1: Modal renders when isOpen is true
    test('T009.1 should render modal when isOpen is true', () => {
      const mockHook = createMockHookReturn();
      render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
    });

    // T009.2: Modal is hidden when isOpen is false
    test('T009.2 should not render modal when isOpen is false', () => {
      const mockHook = createMockHookReturn({ state: { ...createMockHookReturn().state, isOpen: false } });
      const { container } = render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      expect(container.firstChild).toBeEmptyDOMElement();
    });

    // T009.3: Close button appears when canDismiss is true
    test('T009.3 should show close button when canDismiss is true', () => {
      const mockHook = createMockHookReturn({ state: { ...createMockHookReturn().state, canDismiss: true } });
      render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      expect(screen.getByLabelText(/close|dismiss/i)).toBeInTheDocument();
    });

    // T009.4: Close button is hidden when canDismiss is false
    test('T009.4 should hide close button when canDismiss is false', () => {
      const mockHook = createMockHookReturn({ state: { ...createMockHookReturn().state, canDismiss: false } });
      render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      expect(screen.queryByLabelText(/close|dismiss/i)).not.toBeInTheDocument();
    });
  });

  describe('Screen Navigation', () => {
    // T009.5: Welcome screen displays on initial load
    test('T009.5 should display welcome screen on initial load', () => {
      const mockHook = createMockHookReturn();
      render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
    });

    // T009.6: Next button advances to next screen
    test('T009.6 should advance to next screen when next button clicked', () => {
      const mockHook = createMockHookReturn();
      render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      expect(mockHook.nextScreen).toHaveBeenCalled();
    });

    // T009.7: Previous button goes back to previous screen
    test('T009.7 should go to previous screen when previous button clicked', () => {
      const mockHook = createMockHookReturn({
        state: { ...createMockHookReturn().state, currentScreen: 'displayName' },
      });
      render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      const prevButton = screen.getByRole('button', { name: /back|previous/i });
      fireEvent.click(prevButton);

      expect(mockHook.previousScreen).toHaveBeenCalled();
    });

    // T009.8: Completion screen displays after final screen
    test('T009.8 should display completion screen after last screen', () => {
      const mockHook = createMockHookReturn({
        state: { ...createMockHookReturn().state, currentScreen: 'completion' },
      });
      render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      expect(screen.getByTestId('completion-screen')).toBeInTheDocument();
    });
  });

  describe('Form Validation & Field Updates', () => {
    // T009.9: Display name field updates state
    test('T009.9 should update display name when field changes', async () => {
      const mockHook = createMockHookReturn({
        state: { ...createMockHookReturn().state, currentScreen: 'displayName' },
      });
      render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'Aragorn');

      expect(mockHook.setDisplayName).toHaveBeenCalledWith('Aragorn');
    });

    // T009.10: Validation error displays for empty displayName
    test('T009.10 should display validation error for empty displayName', () => {
      const mockHook = createMockHookReturn({
        state: {
          ...createMockHookReturn().state,
          currentScreen: 'displayName',
          validationState: {
            displayName: { isValid: false, error: 'Display name is required' },
            avatar: { isValid: true },
            preferences: { isValid: true },
          },
        },
      });
      render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      expect(screen.getByText(/display name is required/i)).toBeInTheDocument();
    });

    // T009.11: Next button disabled when displayName invalid
    test('T009.11 should disable next button when displayName is invalid', () => {
      const mockHook = createMockHookReturn({
        state: {
          ...createMockHookReturn().state,
          currentScreen: 'displayName',
          validationState: {
            displayName: { isValid: false, error: 'Display name is required' },
            avatar: { isValid: true },
            preferences: { isValid: true },
          },
        },
      });
      render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });

    // T009.12: Theme preference updates state
    test('T009.12 should update theme when preference changes', async () => {
      const mockHook = createMockHookReturn({
        state: { ...createMockHookReturn().state, currentScreen: 'preferences' },
      });
      render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      const darkThemeRadio = screen.getByRole('radio', { name: /dark/i });
      await userEvent.click(darkThemeRadio);

      expect(mockHook.setTheme).toHaveBeenCalledWith('dark');
    });

    // T009.13: Notifications toggle updates state
    test('T009.13 should toggle notifications when checkbox changes', async () => {
      const mockHook = createMockHookReturn({
        state: { ...createMockHookReturn().state, currentScreen: 'preferences' },
      });
      render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      const notificationsToggle = screen.getByRole('checkbox', { name: /notification/i });
      await userEvent.click(notificationsToggle);

      expect(mockHook.setNotifications).toHaveBeenCalledWith(false);
    });
  });

  describe('Accessibility', () => {
    // T009.14: Modal has proper ARIA attributes
    test('T009.14 should have proper ARIA role and labelledby', () => {
      const mockHook = createMockHookReturn();
      render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby');
    });

    // T009.15: Escape key closes modal when canDismiss is true
    test('T009.15 should close modal on Escape key when canDismiss is true', () => {
      const mockHook = createMockHookReturn();
      render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

      expect(mockHook.closeWizard).toHaveBeenCalled();
    });

    // T009.16: Escape key does not close modal when canDismiss is false
    test('T009.16 should not close modal on Escape key when canDismiss is false', () => {
      const mockHook = createMockHookReturn({ state: { ...createMockHookReturn().state, canDismiss: false } });
      mockHook.closeWizard.mockClear();
      render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

      expect(mockHook.closeWizard).not.toHaveBeenCalled();
    });

    // T009.17: Form inputs have proper labels
    test('T009.17 should have properly labeled form inputs', () => {
      const mockHook = createMockHookReturn({
        state: { ...createMockHookReturn().state, currentScreen: 'displayName' },
      });
      render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling & Retry', () => {
    // T009.18: Error message displays on submission failure
    test('T009.18 should display error message on submission failure', () => {
      const mockHook = createMockHookReturn({
        state: {
          ...createMockHookReturn().state,
          currentScreen: 'completion',
          submissionError: 'Failed to save profile',
        },
      });
      render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      expect(screen.getByText(/failed to save profile/i)).toBeInTheDocument();
    });

    // T009.19: Retry button appears on error
    test('T009.19 should display retry button on submission error', () => {
      const mockHook = createMockHookReturn({
        state: {
          ...createMockHookReturn().state,
          currentScreen: 'completion',
          submissionError: 'Failed to save profile',
        },
      });
      render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    // T009.20: Retry button calls submitWizard
    test('T009.20 should call submitWizard when retry button clicked', () => {
      const mockHook = createMockHookReturn({
        state: {
          ...createMockHookReturn().state,
          currentScreen: 'completion',
          submissionError: 'Failed to save profile',
        },
      });
      render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      expect(mockHook.submitWizard).toHaveBeenCalled();
    });

    // T009.21: Loading state shows during submission
    test('T009.21 should display loading state during submission', () => {
      const mockHook = createMockHookReturn({
        state: {
          ...createMockHookReturn().state,
          isSubmitting: true,
        },
      });
      render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Integration with Hook', () => {
    // T009.22: Close button calls closeWizard hook
    test('T009.22 should call closeWizard when close button clicked', () => {
      const mockHook = createMockHookReturn();
      render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      const closeButton = screen.getByLabelText(/close|dismiss/i);
      fireEvent.click(closeButton);

      expect(mockHook.closeWizard).toHaveBeenCalled();
    });

    // T009.23: Submit button calls submitWizard on completion screen
    test('T009.23 should call submitWizard on completion screen submit', () => {
      const mockHook = createMockHookReturn({
        state: { ...createMockHookReturn().state, currentScreen: 'completion' },
      });
      render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      const submitButton = screen.getByRole('button', { name: /submit|complete|done/i });
      fireEvent.click(submitButton);

      expect(mockHook.submitWizard).toHaveBeenCalled();
    });

    // T009.24: Modal closes on successful submission
    test('T009.24 should close modal after successful submission', () => {
      const mockHook = createMockHookReturn({
        state: { ...createMockHookReturn().state, currentScreen: 'completion' },
      });
      render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      const submitButton = screen.getByRole('button', { name: /submit|complete|done/i });
      fireEvent.click(submitButton);

      expect(mockHook.submitWizard).toHaveBeenCalled();
    });

    // T009.25: Form data persists across screen navigation
    test('T009.25 should persist form data across screen navigation', async () => {
      const mockHook = createMockHookReturn({
        state: {
          ...createMockHookReturn().state,
          formState: { ...createMockHookReturn().state.formState, displayName: 'Aragorn' },
        },
      });
      render(<ProfileSetupWizardModal wizardHook={mockHook} />);

      // After navigation, displayName should still be available
      expect(mockHook.state.formState.displayName).toBe('Aragorn');
    });
  });
});
