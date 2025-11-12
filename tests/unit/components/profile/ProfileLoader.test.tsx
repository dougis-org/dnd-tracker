import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileLoader from '@/components/profile/ProfileLoader';

describe('ProfileLoader', () => {
  test('renders skeleton structure', () => {
    render(<ProfileLoader data-testid="profile-loader" />);

    const skeleton = screen.getByTestId('profile-loader');
    expect(skeleton).toBeInTheDocument();

    // Should have multiple skeleton elements (one for each field)
    const elements = skeleton.querySelectorAll('[class*="animate-pulse"]');
    expect(elements.length).toBeGreaterThan(0);
  });
});
