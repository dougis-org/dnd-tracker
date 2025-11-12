import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileError from '@/components/profile/ProfileError';

describe('ProfileError', () => {
  test('renders error message and retry button', () => {
    const error = new Error('Test error message');
    const mockRetry = jest.fn();

    render(
      <ProfileError error={error} onRetry={mockRetry} data-testid="profile-error" />
    );

    expect(screen.getByTestId('profile-error')).toBeInTheDocument();
    expect(screen.getByText(/test error message/i)).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });
});
