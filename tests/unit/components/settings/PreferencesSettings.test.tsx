import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PreferencesSettings from '@/components/settings/PreferencesSettings';

jest.mock('@/lib/adapters/userAdapter', () => ({
  userAdapter: {
    updatePreferences: jest.fn().mockResolvedValue({ success: true }),
  },
}));

describe('PreferencesSettings', () => {
  const mockPreferences = {
    experienceLevel: 'Intermediate',
    preferredRole: 'Player',
    ruleset: '5e',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render preferences form', () => {
    render(<PreferencesSettings preferences={mockPreferences} />);

    expect(screen.getByText(/d&d preferences/i)).toBeInTheDocument();
  });

  it('should display dropdown selects for experience level, role, and ruleset', () => {
    render(<PreferencesSettings preferences={mockPreferences} />);

    expect(screen.getByLabelText(/experience level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/preferred role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ruleset/i)).toBeInTheDocument();
  });

  it('should pre-populate form fields with current preferences', () => {
    render(<PreferencesSettings preferences={mockPreferences} />);

    expect(
      (screen.getByLabelText(/experience level/i) as HTMLSelectElement).value
    ).toBe('Intermediate');
    expect(
      (screen.getByLabelText(/preferred role/i) as HTMLSelectElement).value
    ).toBe('Player');
    expect((screen.getByLabelText(/ruleset/i) as HTMLSelectElement).value).toBe(
      '5e'
    );
  });

  it('should allow user to change preferences', () => {
    render(<PreferencesSettings preferences={mockPreferences} />);

    const experienceLevelSelect = screen.getByLabelText(/experience level/i);
    fireEvent.change(experienceLevelSelect, { target: { value: 'Advanced' } });

    expect(
      (experienceLevelSelect as HTMLSelectElement).value
    ).toBe('Advanced');
  });

  it('should show save button', () => {
    render(<PreferencesSettings preferences={mockPreferences} />);

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('should disable save button while saving', async () => {
    render(<PreferencesSettings preferences={mockPreferences} />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(saveButton).toBeDisabled();
    });
  });

  it('should show success message after saving', async () => {
    render(<PreferencesSettings preferences={mockPreferences} />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(
      await screen.findByText(/preferences saved successfully/i)
    ).toBeInTheDocument();
  });

  it('should call adapter with updated preferences on save', async () => {
    const { userAdapter: mockAdapter } = require('@/lib/adapters/userAdapter');
    render(<PreferencesSettings preferences={mockPreferences} />);

    const experienceLevelSelect = screen.getByLabelText(/experience level/i);
    fireEvent.change(experienceLevelSelect, { target: { value: 'Advanced' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockAdapter.updatePreferences).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({ experienceLevel: 'Advanced' })
      );
    });
  });

  it('should show error message if save fails', async () => {
    const { userAdapter: mockAdapter } = require('@/lib/adapters/userAdapter');
    mockAdapter.updatePreferences.mockRejectedValueOnce(
      new Error('Failed to save')
    );

    render(<PreferencesSettings preferences={mockPreferences} />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(
      await screen.findByText(/error saving preferences/i)
    ).toBeInTheDocument();
  });

  it('should revert changes on save error', async () => {
    const { userAdapter: mockAdapter } = require('@/lib/adapters/userAdapter');
    mockAdapter.updatePreferences.mockRejectedValueOnce(
      new Error('Failed to save')
    );

    render(<PreferencesSettings preferences={mockPreferences} />);

    const experienceLevelSelect = screen.getByLabelText(/experience level/i);
    fireEvent.change(experienceLevelSelect, { target: { value: 'Advanced' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      // After error, should revert to original value
      expect(
        (experienceLevelSelect as HTMLSelectElement).value
      ).toBe('Intermediate');
    });
  });
});
