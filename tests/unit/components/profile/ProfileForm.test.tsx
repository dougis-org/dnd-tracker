/**
 * Unit tests for ProfileForm component
 * These tests follow TDD - written BEFORE implementation
 * Expected: All tests should FAIL initially
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileForm from '@/components/profile/ProfileForm';
import type { IUser } from '@/lib/db/models/User';

// Mock user data
const mockUser: Partial<IUser> = {
  id: 'user_123',
  email: 'test@example.com',
  displayName: 'Test User',
  timezone: 'America/New_York',
  dndEdition: '5th Edition',
  experienceLevel: 'intermediate',
  primaryRole: 'dm',
};

describe('ProfileForm Component', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  describe('Rendering', () => {
    test('should render all D&D profile fields', () => {
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/timezone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/d&d edition/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/experience level/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/primary role/i)).toBeInTheDocument();
    });

    test('should pre-fill values from user prop', () => {
      render(<ProfileForm user={mockUser as IUser} onSubmit={mockOnSubmit} />);

      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('America/New_York')).toBeInTheDocument();
      expect(screen.getByDisplayValue('5th Edition')).toBeInTheDocument();
    });

    test('should render submit button', () => {
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    test('should call onSubmit with valid form data', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);

      render(<ProfileForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText(/display name/i), 'New Name');
      await user.selectOptions(screen.getByLabelText(/experience level/i), 'experienced');
      await user.selectOptions(screen.getByLabelText(/primary role/i), 'both');

      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    test('should show loading state during submission', async () => {
      const user = userEvent.setup();
      const slowSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<ProfileForm onSubmit={slowSubmit} />);

      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      // Button should show loading text and be disabled
      expect(screen.getByText(/saving/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    test('should show success message after successful submit', async () => {
      const user = userEvent.setup();
      const successSubmit = jest.fn(() => Promise.resolve());

      render(<ProfileForm onSubmit={successSubmit} />);

      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
      });
    });

    test('should show error message on submit failure', async () => {
      const user = userEvent.setup();
      const errorSubmit = jest.fn(() => Promise.reject(new Error('Update failed')));

      render(<ProfileForm onSubmit={errorSubmit} />);

      const submitButton = screen.getByRole('button', { name: /save/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/update failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Default Values', () => {
    test('should apply default timezone (UTC)', () => {
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      const timezoneInput = screen.getByLabelText(/timezone/i) as HTMLInputElement;
      expect(timezoneInput.value).toBe('UTC');
    });

    test('should apply default dndEdition (5th Edition)', () => {
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      const editionInput = screen.getByLabelText(/d&d edition/i) as HTMLInputElement;
      expect(editionInput.value).toBe('5th Edition');
    });
  });

  describe('Experience Level Select', () => {
    test('should render all experience level options', () => {
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      const select = screen.getByLabelText(/experience level/i);
      expect(select).toBeInTheDocument();

      // Check for enum values
      expect(screen.getByRole('option', { name: /new/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /beginner/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /intermediate/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /experienced/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /veteran/i })).toBeInTheDocument();
    });
  });

  describe('Primary Role Select', () => {
    test('should render all primary role options', () => {
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      const select = screen.getByLabelText(/primary role/i);
      expect(select).toBeInTheDocument();

      // Check for enum values
      expect(screen.getByRole('option', { name: /^dm$/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /^player$/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /both/i })).toBeInTheDocument();
    });
  });
});
