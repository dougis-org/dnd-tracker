/**
 * Integration tests for ProfileSetupClient
 * Tests actual component rendering and interaction
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Mock Next.js router before importing component
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Import component after mocks are set up
import ProfileSetupClient from '@/app/(auth)/profile-setup/ProfileSetupClient';

describe('ProfileSetupClient Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should render ProfileSetupWizard', () => {
    render(<ProfileSetupClient />);

    expect(screen.getByText(/welcome to d&d tracker/i)).toBeInTheDocument();
  });

  test('should submit profile data on form completion', async () => {
    const user = userEvent.setup();

    // Mock successful API response
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response);

    render(<ProfileSetupClient />);

    // Fill required fields
    await user.selectOptions(screen.getByLabelText(/experience level/i), 'beginner');
    await user.selectOptions(screen.getByLabelText(/primary role/i), 'player');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /complete profile/i });
    await user.click(submitButton);

    // Verify API was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/users/profile',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });

  test('should handle API errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock API error
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Profile update failed' }),
    } as Response);

    render(<ProfileSetupClient />);

    // Fill and submit
    await user.selectOptions(screen.getByLabelText(/experience level/i), 'beginner');
    await user.selectOptions(screen.getByLabelText(/primary role/i), 'player');

    const submitButton = screen.getByRole('button', { name: /complete profile/i });
    await user.click(submitButton);

    // Verify error was logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to update profile:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
