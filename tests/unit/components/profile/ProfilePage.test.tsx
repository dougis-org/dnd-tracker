import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from '@/components/profile/ProfilePage';
import * as userAdapter from '@/lib/adapters/userAdapter';
import {
  createMockProfile,
  createMockPreferences,
  setupUserAdapterMocks,
  makeAdapterPending,
  makeAdapterFail,
} from '../../../test-helpers/userAdapterMocks';

// Mock the adapter
jest.mock('@/lib/adapters/userAdapter');

const mockUserAdapter = userAdapter as jest.Mocked<typeof userAdapter>;

describe('ProfilePage', () => {
  const mockProfile = createMockProfile();
  const mockPreferences = createMockPreferences();

  beforeEach(() => {
    setupUserAdapterMocks(mockUserAdapter);
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
    await waitFor(() => {
      expect(screen.queryByTestId('profile-form')).toBeInTheDocument();
    });

    // Verify form is populated with data
    const nameInput = screen.getByDisplayValue('Test User');
    expect(nameInput).toBeInTheDocument();
  });

  test('renders error banner on fetch failure', async () => {
    const error = new Error('Failed to fetch profile');
    makeAdapterFail(mockUserAdapter, error);

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-error')).toBeInTheDocument();
    });

    // Error message should be visible
    expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
  });

  test('renders empty state for new users with no profile data', async () => {
    // Return empty/minimal profile indicating new user
    const emptyProfile = createMockProfile({ name: '' });

    mockUserAdapter.getProfile.mockResolvedValueOnce(emptyProfile);
    mockUserAdapter.getPreferences.mockResolvedValueOnce(mockPreferences);

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
    makeAdapterFail(mockUserAdapter, error);

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-error')).toBeInTheDocument();
    });

    // Simulate retry by clicking retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    // Mock successful response for retry
    mockUserAdapter.getProfile.mockResolvedValueOnce(mockProfile);
    mockUserAdapter.getPreferences.mockResolvedValueOnce(mockPreferences);

    // Click retry and verify new fetch is attempted
    retryButton.click();

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
