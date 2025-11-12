import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ProfileForm from '@/components/profile/ProfileForm';
import { UserProfile, UserPreferences } from '@/types/user';
import * as userAdapter from '@/lib/adapters/userAdapter';

jest.mock('@/lib/adapters/userAdapter');

describe('ProfileForm', () => {
  const mockProfile: UserProfile = {
    id: 'user-123',
    name: 'Alice Adventurer',
    email: 'alice@example.com',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-11-01'),
  };

  const mockPreferences: UserPreferences = {
    userId: 'user-123',
    experienceLevel: 'Intermediate',
    preferredRole: 'Player',
    ruleset: '5e',
    updatedAt: new Date('2025-11-01'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form with pre-populated fields', () => {
    render(<ProfileForm profile={mockProfile} preferences={mockPreferences} />);

    const nameInput = screen.getByDisplayValue('Alice Adventurer');
    expect(nameInput).toBeInTheDocument();

    const emailInput = screen.getByDisplayValue('alice@example.com');
    expect(emailInput).toBeInTheDocument();
  });

  test('displays validation errors on field blur with invalid email', async () => {
    const user = userEvent.setup();
    render(<ProfileForm profile={mockProfile} preferences={mockPreferences} />);

    const emailInput = screen.getByDisplayValue('alice@example.com');

    // Clear and enter invalid email
    await user.tripleClick(emailInput);
    await user.keyboard('invalid-email');

    // Blur the field
    fireEvent.blur(emailInput);

    // Error message should appear
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  test('disables save button during submission', async () => {
    (userAdapter.updateProfile as jest.Mock).mockImplementationOnce(
      () =>
        new Promise(() => {
          /* never resolves */
        })
    );
    (userAdapter.updatePreferences as jest.Mock).mockImplementationOnce(
      () =>
        new Promise(() => {
          /* never resolves */
        })
    );

    const user = userEvent.setup();
    render(<ProfileForm profile={mockProfile} preferences={mockPreferences} />);

    const saveButton = screen.getByRole('button', { name: /save/i });

    // Click save
    await user.click(saveButton);

    // Button should be disabled during submission
    expect(saveButton).toBeDisabled();
  });

  test('shows success toast on successful save', async () => {
    (userAdapter.updateProfile as jest.Mock).mockResolvedValueOnce(mockProfile);
    (userAdapter.updatePreferences as jest.Mock).mockResolvedValueOnce(mockPreferences);

    const user = userEvent.setup();
    render(<ProfileForm profile={mockProfile} preferences={mockPreferences} />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Success toast should appear
    await waitFor(() => {
      expect(
        screen.getByText(/saved successfully|changes saved/i)
      ).toBeInTheDocument();
    });
  });

  test('reverts form and shows error toast on save failure', async () => {
    const error = new Error('Save failed');
    (userAdapter.updateProfile as jest.Mock).mockRejectedValueOnce(error);

    const user = userEvent.setup();
    render(<ProfileForm profile={mockProfile} preferences={mockPreferences} />);

    const nameInput = screen.getByDisplayValue('Alice Adventurer') as HTMLInputElement;
    const saveButton = screen.getByRole('button', { name: /save/i });

    // Change name
    await user.tripleClick(nameInput);
    await user.keyboard('New Name');

    expect(nameInput.value).toBe('New Name');

    // Try to save - should fail
    await user.click(saveButton);

    // Error toast should appear
    await waitFor(() => {
      expect(screen.getByText(/failed to save|error/i)).toBeInTheDocument();
    });

    // Form should revert to original value
    expect(nameInput.value).toBe('Alice Adventurer');
  });

  test('optimistic updates show new values immediately', async () => {
    (userAdapter.updateProfile as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          // eslint-disable-next-line no-undef -- setTimeout is available in Node.js
          setTimeout(() => {
            resolve(mockProfile);
          }, 100);
        })
    );
    (userAdapter.updatePreferences as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          // eslint-disable-next-line no-undef -- setTimeout is available in Node.js
          setTimeout(() => {
            resolve(mockPreferences);
          }, 100);
        })
    );

    const user = userEvent.setup();
    render(<ProfileForm profile={mockProfile} preferences={mockPreferences} />);

    const nameInput = screen.getByDisplayValue('Alice Adventurer') as HTMLInputElement;

    // Change name
    await user.tripleClick(nameInput);
    await user.keyboard('New Name');

    // Value should change immediately (optimistic update)
    expect(nameInput.value).toBe('New Name');

    // Click save
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Value should persist (remains as optimistic update)
    expect(nameInput.value).toBe('New Name');
  });

  test('displays validation errors for name field (required, max 100 chars)', async () => {
    const user = userEvent.setup();
    render(<ProfileForm profile={mockProfile} preferences={mockPreferences} />);

    const nameInput = screen.getByDisplayValue('Alice Adventurer') as HTMLInputElement;

    // Clear name - should show "required" error
    await user.tripleClick(nameInput);
    await user.keyboard('');
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByText(/required|cannot be empty/i)).toBeInTheDocument();
    });

    // Enter 101 character name
    await user.tripleClick(nameInput);
    await user.keyboard('a'.repeat(101));
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByText(/100 characters|too long/i)).toBeInTheDocument();
    });
  });
});

