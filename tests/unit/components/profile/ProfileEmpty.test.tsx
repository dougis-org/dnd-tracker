import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileEmpty from '@/components/profile/ProfileEmpty';

describe('ProfileEmpty', () => {
  test('renders empty state message for new users', () => {
    render(<ProfileEmpty data-testid="profile-empty" />);

    const empty = screen.getByTestId('profile-empty');
    expect(empty).toBeInTheDocument();

    expect(screen.getByText(/complete your profile/i)).toBeInTheDocument();
    expect(screen.getByText(/configur|personalize/i)).toBeInTheDocument();
  });
});
