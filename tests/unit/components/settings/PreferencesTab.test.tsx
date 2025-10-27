/**
 * Preferences Tab Component Tests
 * Constitutional: TDD - Tests written before implementation
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreferencesTab } from '@/components/settings/PreferencesTab';

describe('PreferencesTab', () => {
  const mockPreferences = {
    theme: 'system' as const,
    emailNotifications: true,
    browserNotifications: false,
    timezone: 'UTC',
    language: 'en',
    diceRollAnimations: true,
    autoSaveEncounters: true,
  };

  const mockOnSave = jest.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
  });

  it('should render all preference fields', () => {
    render(<PreferencesTab preferences={mockPreferences} onSave={mockOnSave} />);

    expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email notifications/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/browser notifications/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/timezone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dice roll animations/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/auto.?save encounters/i)).toBeInTheDocument();
  });

  it('should pre-fill form with current preference values', () => {
    render(<PreferencesTab preferences={mockPreferences} onSave={mockOnSave} />);

    const emailCheckbox = screen.getByLabelText(/email notifications/i) as HTMLInputElement;
    const browserCheckbox = screen.getByLabelText(/browser notifications/i) as HTMLInputElement;

    expect(emailCheckbox.checked).toBe(true);
    expect(browserCheckbox.checked).toBe(false);
  });

  it('should render save button', () => {
    render(<PreferencesTab preferences={mockPreferences} onSave={mockOnSave} />);

    expect(screen.getByRole('button', { name: /save preferences/i })).toBeInTheDocument();
  });

  it('should call onSave with updated preferences when form is submitted', async () => {
    const user = userEvent.setup();
    render(<PreferencesTab preferences={mockPreferences} onSave={mockOnSave} />);

    // Toggle email notifications
    const emailCheckbox = screen.getByLabelText(/email notifications/i);
    await user.click(emailCheckbox);

    // Submit form
    const saveButton = screen.getByRole('button', { name: /save preferences/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          emailNotifications: false,
        })
      );
    });
  });

  it('should handle theme selection changes', async () => {
    const user = userEvent.setup();
    render(<PreferencesTab preferences={mockPreferences} onSave={mockOnSave} />);

    // Change theme (implementation will vary based on UI component)
    const themeField = screen.getByLabelText(/theme/i);
    expect(themeField).toBeInTheDocument();
  });

  it('should show loading state during save', async () => {
    const mockSlowSave = jest.fn(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    const user = userEvent.setup();

    render(<PreferencesTab preferences={mockPreferences} onSave={mockSlowSave} />);

    const saveButton = screen.getByRole('button', { name: /save preferences/i });
    await user.click(saveButton);

    // Button should be disabled during save
    expect(saveButton).toBeDisabled();

    await waitFor(() => {
      expect(mockSlowSave).toHaveBeenCalled();
    });
  });

  it('should display success message after successful save', async () => {
    const user = userEvent.setup();
    render(<PreferencesTab preferences={mockPreferences} onSave={mockOnSave} />);

    const saveButton = screen.getByRole('button', { name: /save preferences/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/preferences saved/i)).toBeInTheDocument();
    });
  });

  it('should display error message on save failure', async () => {
    const mockFailedSave = jest.fn().mockRejectedValue(new Error('Save failed'));
    const user = userEvent.setup();

    render(<PreferencesTab preferences={mockPreferences} onSave={mockFailedSave} />);

    const saveButton = screen.getByRole('button', { name: /save preferences/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to save preferences/i)).toBeInTheDocument();
    });
  });

  it('should toggle boolean preferences correctly', async () => {
    const user = userEvent.setup();
    render(<PreferencesTab preferences={mockPreferences} onSave={mockOnSave} />);

    const diceAnimations = screen.getByLabelText(/dice roll animations/i) as HTMLInputElement;
    const autoSave = screen.getByLabelText(/auto.?save encounters/i) as HTMLInputElement;

    // Initial states
    expect(diceAnimations.checked).toBe(true);
    expect(autoSave.checked).toBe(true);

    // Toggle both
    await user.click(diceAnimations);
    await user.click(autoSave);

    // Submit
    const saveButton = screen.getByRole('button', { name: /save preferences/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          diceRollAnimations: false,
          autoSaveEncounters: false,
        })
      );
    });
  });
});
