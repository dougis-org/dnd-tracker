/**
 * Unit tests for ProfileSetupWizard component
 * Tests focus on wizard-specific behavior (callbacks, skip, routing)
 * ProfileForm is tested separately in its own test file
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Import component after mocks
import ProfileSetupWizard from '@/components/profile/ProfileSetupWizard';

describe('ProfileSetupWizard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
  });

  describe('Rendering', () => {
    test('should render welcome message', () => {
      render(<ProfileSetupWizard />);

      expect(screen.getByText(/welcome to d&d tracker/i)).toBeInTheDocument();
    });

    test('should render profile form title and description', () => {
      render(<ProfileSetupWizard />);

      expect(screen.getByText('Set Up Your D&D Profile')).toBeInTheDocument();
      expect(screen.getByText(/tell us about your d&d experience/i)).toBeInTheDocument();
    });

    test('should render Skip button', () => {
      render(<ProfileSetupWizard />);

      expect(screen.getByRole('button', { name: /skip for now/i })).toBeInTheDocument();
    });

    test('should display help text about skipping', () => {
      render(<ProfileSetupWizard />);

      expect(
        screen.getByText(/you can complete your profile anytime from settings/i)
      ).toBeInTheDocument();
    });
  });

  describe('Skip Functionality', () => {
    test('should call onSkip callback with profileSetupCompleted false', async () => {
      const user = userEvent.setup();
      const onSkip = jest.fn().mockResolvedValue(undefined);

      render(<ProfileSetupWizard onSkip={onSkip} />);

      const skipButton = screen.getByRole('button', { name: /skip for now/i });
      await user.click(skipButton);

      await waitFor(() => {
        expect(onSkip).toHaveBeenCalledWith({
          profileSetupCompleted: false,
        });
      });
    });

    test('should show loading state while skipping', async () => {
      const user = userEvent.setup();
      const onSkip = jest.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<ProfileSetupWizard onSkip={onSkip} />);

      const skipButton = screen.getByRole('button', { name: /skip for now/i });
      await user.click(skipButton);

      expect(screen.getByText('Skipping...')).toBeInTheDocument();
      expect(skipButton).toBeDisabled();
    });
  });

  describe('Form Completion', () => {
    test('should call onComplete callback with profileSetupCompleted flag', async () => {
      const user = userEvent.setup();
      const onComplete = jest.fn().mockResolvedValue(undefined);

      render(<ProfileSetupWizard onComplete={onComplete} />);

      // Fill in minimal required fields
      await user.selectOptions(screen.getByLabelText(/experience level/i), 'beginner');
      await user.selectOptions(screen.getByLabelText(/primary role/i), 'player');

      const submitButton = screen.getByRole('button', { name: /complete profile/i });
      await user.click(submitButton);

      await waitFor(
        () => {
          expect(onComplete).toHaveBeenCalledWith(
            expect.objectContaining({
              profileSetupCompleted: true,
            })
          );
        },
        { timeout: 3000 }
      );
    });
  });
});
