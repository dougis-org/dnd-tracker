/**
 * Integration tests for ProfileSettingsClient
 * Tests actual component rendering and interaction
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { IUser } from '@/lib/db/models/User';

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Mock Next.js router before importing component
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Import component after mocks
import ProfileSettingsClient from '@/app/settings/profile/ProfileSettingsClient';

describe('ProfileSettingsClient Integration', () => {
  const mockUser: IUser = {
    clerkUserId: 'user_123',
    email: 'test@example.com',
    displayName: 'Test User',
    timezone: 'UTC',
    dndEdition: '5th Edition',
    experienceLevel: 'intermediate',
    primaryRole: 'player',
    profileSetupCompleted: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as IUser;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should render with user data', () => {
    render(<ProfileSettingsClient user={mockUser} />);

    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    const displayNameInput = screen.getByLabelText(/display name/i) as HTMLInputElement;
    expect(displayNameInput.value).toBe('Test User');
  });

  test('should update profile on form submission', async () => {
    const user = userEvent.setup();

    // Mock successful API response
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response);

    render(<ProfileSettingsClient user={mockUser} />);

    // Update display name
    const displayNameInput = screen.getByLabelText(/display name/i);
    await user.clear(displayNameInput);
    await user.type(displayNameInput, 'Updated Name');

    // Submit
    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    // Verify API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/users/profile',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }, { timeout: 3000 });

    // Success message should appear
    await waitFor(() => {
      expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
    });

    // Note: router.refresh() is called after async API call completes
    // In the real app, this refreshes server component data
  });

  test('should display error message on API failure', async () => {
    const user = userEvent.setup();

    // Mock API error
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Update failed' }),
    } as Response);

    render(<ProfileSettingsClient user={mockUser} />);

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    // Error should be displayed
    await waitFor(() => {
      expect(screen.getByText(/update failed/i)).toBeInTheDocument();
    });

    // Router refresh should not be called on error
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
