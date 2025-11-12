import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from '@/components/profile/ProfilePage';
import {
  createMockProfile,
  createMockPreferences,
  makeAdapterPending,
  makeAdapterFail,
} from '../../../test-helpers/userAdapterMocks';

// Mock the adapter
jest.mock('@/lib/adapters/userAdapter', () => ({
  userAdapter: {
    getProfile: jest.fn(),
    getPreferences: jest.fn(),
    updateProfile: jest.fn(),
    updatePreferences: jest.fn(),
    getNotifications: jest.fn(),
    updateNotifications: jest.fn(),
  },
}));

import { userAdapter as mockUserAdapter } from '@/lib/adapters/userAdapter';

describe('ProfilePage', () => {
  const mockProfile = createMockProfile();
  const mockPreferences = createMockPreferences();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders skeleton loader while data is loading', () => {
    makeAdapterPending(mockUserAdapter);

    render(<ProfilePage />);

    // Should show skeleton/loader placeholder
    const skeleton = screen.queryByTestId('profile-loader');
    expect(skeleton).toBeInTheDocument();
  });

  test('renders profile form with data on successful load', async () => {
    mockUserAdapter.getProfile.mockResolvedValueOnce(mockProfile);
    mockUserAdapter.getPreferences.mockResolvedValueOnce(mockPreferences);

    render(<ProfilePage />);

    // Wait for form to render
    const form = await screen.findByTestId('profile-form');
    expect(form).toBeInTheDocument();

    // Verify form is populated with data
    const nameInput = screen.getByDisplayValue('Test User');
    expect(nameInput).toBeInTheDocument();
  });

  test('renders error banner on fetch failure', async () => {
    const error = new Error('Failed to fetch profile');
    makeAdapterFail(mockUserAdapter, error);

    render(<ProfilePage />);

    const errorElement = await screen.findByTestId('profile-error');
    expect(errorElement).toBeInTheDocument();

    // Error message should be visible
    expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
  });

  test('renders empty state for new users with no profile data', async () => {
    // Return empty/minimal profile indicating new user
    const emptyProfile = createMockProfile({ name: '' });

    mockUserAdapter.getProfile.mockResolvedValueOnce(emptyProfile);
    mockUserAdapter.getPreferences.mockResolvedValueOnce(mockPreferences);

    render(<ProfilePage />);

    const emptyState = await screen.findByTestId('profile-empty');
    expect(emptyState).toBeInTheDocument();

    // Empty state message should guide user
    expect(
      screen.getByText(/complete your profile|configure your settings/i)
    ).toBeInTheDocument();
  });

  test('retry button calls fetch again after error', async () => {
    const error = new Error('Network error');
    makeAdapterFail(mockUserAdapter, error);

    render(<ProfilePage />);

    const errorElement = await screen.findByTestId('profile-error');
    expect(errorElement).toBeInTheDocument();

    // Simulate retry by clicking retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    // Mock successful response for retry
    mockUserAdapter.getProfile.mockResolvedValueOnce(mockProfile);
    mockUserAdapter.getPreferences.mockResolvedValueOnce(mockPreferences);

    // Click retry and verify new fetch is attempted
    await act(async () => {
      retryButton.click();
    });

    // After retry, should show form (or loader, then form)
    await waitFor(() => {
      expect(mockUserAdapter.getProfile).toHaveBeenCalledTimes(2); // initial call + retry
    });
  });

  test('skeleton loader is initially shown before any data arrives', () => {
    // Simulate slow network - return never-resolving promise
    makeAdapterPending(mockUserAdapter);

    render(<ProfilePage />);

    // Component should render loader first
    expect(screen.getByTestId('profile-loader')).toBeInTheDocument();
  });
});
