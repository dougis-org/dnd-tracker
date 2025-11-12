import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationSettings from '@/components/settings/NotificationSettings';

jest.mock('@/lib/adapters/userAdapter', () => ({
  userAdapter: {
    updateNotifications: jest.fn().mockResolvedValue({ success: true }),
  },
}));

describe('NotificationSettings', () => {
  const mockNotifications = {
    emailNotifications: true,
    partyUpdates: false,
    encounterReminders: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render notification settings section', () => {
    render(<NotificationSettings notifications={mockNotifications} />);

    expect(screen.getByText(/notification preferences/i)).toBeInTheDocument();
  });

  it('should display toggle switches for email notifications', () => {
    render(<NotificationSettings notifications={mockNotifications} />);

    expect(
      screen.getByRole('checkbox', { name: /email notifications/i })
    ).toBeInTheDocument();
  });

  it('should display toggle switches for party updates', () => {
    render(<NotificationSettings notifications={mockNotifications} />);

    expect(
      screen.getByRole('checkbox', { name: /party updates/i })
    ).toBeInTheDocument();
  });

  it('should display toggle switches for encounter reminders', () => {
    render(<NotificationSettings notifications={mockNotifications} />);

    expect(
      screen.getByRole('checkbox', { name: /encounter reminders/i })
    ).toBeInTheDocument();
  });

  it('should pre-populate toggle switches with current settings', () => {
    render(<NotificationSettings notifications={mockNotifications} />);

    expect(
      (screen.getByRole('checkbox', {
        name: /email notifications/i,
      }) as HTMLInputElement).checked
    ).toBe(true);
    expect(
      (screen.getByRole('checkbox', { name: /party updates/i }) as HTMLInputElement)
        .checked
    ).toBe(false);
    expect(
      (screen.getByRole('checkbox', {
        name: /encounter reminders/i,
      }) as HTMLInputElement).checked
    ).toBe(true);
  });

  it('should change toggle immediately when clicked', () => {
    render(<NotificationSettings notifications={mockNotifications} />);

    const emailToggle = screen.getByRole('checkbox', {
      name: /email notifications/i,
    });
    fireEvent.click(emailToggle);

    expect((emailToggle as HTMLInputElement).checked).toBe(false);
  });

  it('should show save button', () => {
    render(<NotificationSettings notifications={mockNotifications} />);

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('should disable save button while saving', async () => {
    render(<NotificationSettings notifications={mockNotifications} />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(saveButton).toBeDisabled();
    });
  });

  it('should call adapter with updated notifications on save', async () => {
    const { userAdapter: mockAdapter } = require('@/lib/adapters/userAdapter');
    render(<NotificationSettings notifications={mockNotifications} />);

    const emailToggle = screen.getByRole('checkbox', {
      name: /email notifications/i,
    });
    fireEvent.click(emailToggle);

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockAdapter.updateNotifications).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({ emailNotifications: false })
      );
    });
  });

  it('should show success message after saving', async () => {
    render(<NotificationSettings notifications={mockNotifications} />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(
      await screen.findByText(/notifications updated successfully/i)
    ).toBeInTheDocument();
  });

  it('should show error message if save fails', async () => {
    const { userAdapter: mockAdapter } = require('@/lib/adapters/userAdapter');
    mockAdapter.updateNotifications.mockRejectedValueOnce(
      new Error('Failed to save')
    );

    render(<NotificationSettings notifications={mockNotifications} />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(
      await screen.findByText(/error updating notifications/i)
    ).toBeInTheDocument();
  });

  it('should revert changes on save error', async () => {
    const { userAdapter: mockAdapter } = require('@/lib/adapters/userAdapter');
    mockAdapter.updateNotifications.mockRejectedValueOnce(
      new Error('Failed to save')
    );

    render(<NotificationSettings notifications={mockNotifications} />);

    const emailToggle = screen.getByRole('checkbox', {
      name: /email notifications/i,
    });
    fireEvent.click(emailToggle);

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      // After error, should revert to original value
      expect((emailToggle as HTMLInputElement).checked).toBe(true);
    });
  });
});
