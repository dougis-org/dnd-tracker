import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from '@/components/profile/ProfilePage';
import * as userAdapter from '@/lib/adapters/userAdapter';

// Mock the adapter
jest.mock('@/lib/adapters/userAdapter');

describe('ProfilePage', () => {
  const mockProfile = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-11-01'),
  };

  const mockPreferences = {
    userId: 'user-123',
    experienceLevel: 'Intermediate' as const,
    preferredRole: 'Player' as const,
    ruleset: '5e' as const,
    updatedAt: new Date('2025-11-01'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders skeleton loader while data is loading', () => {
    (userAdapter.getProfile as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // never resolves
    );
    (userAdapter.getPreferences as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // never resolves
    );

    render(<ProfilePage />);

    // Should show skeleton/loader placeholder
    const skeleton = screen.queryByTestId('profile-loader');
    expect(skeleton).toBeInTheDocument();
  });

  test('renders profile form with data on successful load', async () => {
    (userAdapter.getProfile as jest.Mock).mockResolvedValueOnce(mockProfile);
    (userAdapter.getPreferences as jest.Mock).mockResolvedValueOnce(mockPreferences);

    render(<ProfilePage />);

    // Wait for form to render
    await waitFor(() => {
      expect(screen.queryByTestId('profile-form')).toBeInTheDocument();
    });

    // Verify form is populated with data
    const nameInput = screen.getByDisplayValue('Test User');
    expect(nameInput).toBeInTheDocument();
  });

  test('renders error banner on fetch failure', async () => {
    const error = new Error('Failed to fetch profile');
    (userAdapter.getProfile as jest.Mock).mockRejectedValueOnce(error);

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-error')).toBeInTheDocument();
    });

    // Error message should be visible
    expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
  });

  test('renders empty state for new users with no profile data', async () => {
    // Return empty/minimal profile indicating new user
    const emptyProfile = {
      id: 'user-123',
      name: '',
      email: 'new@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (userAdapter.getProfile as jest.Mock).mockResolvedValueOnce(emptyProfile);
    (userAdapter.getPreferences as jest.Mock).mockResolvedValueOnce(mockPreferences);

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-empty')).toBeInTheDocument();
    });

    // Empty state message should guide user
    expect(
      screen.getByText(/complete your profile|configure your settings/i)
    ).toBeInTheDocument();
  });

  test('retry button calls fetch again after error', async () => {
    const error = new Error('Network error');
    (userAdapter.getProfile as jest.Mock).mockRejectedValueOnce(error);

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-error')).toBeInTheDocument();
    });

    // Simulate retry by clicking retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    // Mock successful response for retry
    (userAdapter.getProfile as jest.Mock).mockResolvedValueOnce(mockProfile);
    (userAdapter.getPreferences as jest.Mock).mockResolvedValueOnce(mockPreferences);

    // Click retry and verify new fetch is attempted
    retryButton.click();

    // After retry, should show form (or loader, then form)
    await waitFor(() => {
      expect(userAdapter.getProfile).toHaveBeenCalledTimes(2); // initial call + retry
    });
  });

  test('skeleton loader is initially shown before any data arrives', () => {
    // Simulate slow network - return never-resolving promise
    (userAdapter.getProfile as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );
    (userAdapter.getPreferences as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    render(<ProfilePage />);

    // Component should render loader first
    expect(screen.getByTestId('profile-loader')).toBeInTheDocument();
  });
});
