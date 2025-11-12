import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsPage from '@/components/settings/SettingsPage';

// Mock userAdapter to avoid network calls
jest.mock('@/lib/adapters/userAdapter', () => ({
  userAdapter: {
    getProfile: jest.fn().mockResolvedValue({
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date('2025-01-01'),
    }),
    getPreferences: jest.fn().mockResolvedValue({
      experienceLevel: 'Intermediate',
      preferredRole: 'Player',
      ruleset: '5e',
    }),
    getNotifications: jest.fn().mockResolvedValue({
      emailNotifications: true,
      partyUpdates: false,
      encounterReminders: true,
    }),
  },
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all settings sections (Account, Preferences, Notifications, Data)', async () => {
    render(<SettingsPage />);

    // Wait for sections to load and buttons to appear
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /account/i }, { hidden: true })
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole('button', { name: /preferences/i }, { hidden: true })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /notifications/i }, { hidden: true })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /data/i }, { hidden: true })
    ).toBeInTheDocument();
  });

  it('should initially display Account Settings section', async () => {
    render(<SettingsPage />);

    // Account section should be visible by default
    expect(
      await screen.findByText(/account information/i)
    ).toBeInTheDocument();
  });

  it('should switch to Preferences section when Preferences tab is clicked', async () => {
    render(<SettingsPage />);

    // Wait for initial load
    await screen.findByText(/account information/i);

    const preferencesTab = screen.getByRole('button', { name: /preferences/i }, { hidden: true });
    fireEvent.click(preferencesTab);

    // Preferences section should become visible
    expect(
      await screen.findByText(/d&d preferences/i)
    ).toBeInTheDocument();
  });

  it('should handle errors gracefully', async () => {
    const { userAdapter: mockAdapter } = require('@/lib/adapters/userAdapter');
    mockAdapter.getProfile.mockRejectedValueOnce(
      new Error('Failed to load profile')
    );

    render(<SettingsPage />);

    // Error should be displayed
    expect(
      await screen.findByText(/error loading settings/i)
    ).toBeInTheDocument();
  });

  it('should provide a retry button after error', async () => {
    const { userAdapter: mockAdapter } = require('@/lib/adapters/userAdapter');
    mockAdapter.getProfile.mockRejectedValueOnce(
      new Error('Failed to load')
    );

    render(<SettingsPage />);

    await screen.findByText(/error loading settings/i);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    // Setup successful response for retry
    mockAdapter.getProfile.mockResolvedValueOnce({
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date('2025-01-01'),
    });
    mockAdapter.getPreferences.mockResolvedValueOnce({
      experienceLevel: 'Intermediate',
      preferredRole: 'Player',
      ruleset: '5e',
    });
    mockAdapter.getNotifications.mockResolvedValueOnce({
      emailNotifications: true,
      partyUpdates: false,
      encounterReminders: true,
    });

    fireEvent.click(retryButton);

    // Should now show account info
    expect(
      await screen.findByText(/account information/i)
    ).toBeInTheDocument();
  });
});
