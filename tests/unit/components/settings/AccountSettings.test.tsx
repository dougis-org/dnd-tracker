import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AccountSettings from '@/components/settings/AccountSettings';

describe('AccountSettings', () => {
  // Use a specific date that won't have timezone issues
  const mockProfile = {
    name: 'John Doe',
    email: 'john@example.com',
    // Create date as ISO string to avoid timezone conversion
    createdAt: new Date(Date.UTC(2025, 0, 15)),
  };

  it('should render account information section', () => {
    render(<AccountSettings profile={mockProfile} />);

    expect(screen.getByText(/account information/i)).toBeInTheDocument();
  });

  it('should display user email', () => {
    render(<AccountSettings profile={mockProfile} />);

    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should display account creation date', () => {
    render(<AccountSettings profile={mockProfile} />);

    // Just check that a date string is rendered (avoid timezone issues)
    expect(screen.getByText(/2025/)).toBeInTheDocument();
  });

  it('should display user name', () => {
    render(<AccountSettings profile={mockProfile} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should render account information in read-only format', () => {
    const { container } = render(<AccountSettings profile={mockProfile} />);

    // Should not have editable form fields
    const inputs = container.querySelectorAll('input[type="text"]');
    const textareas = container.querySelectorAll('textarea');
    expect(inputs.length).toBe(0);
    expect(textareas.length).toBe(0);
  });

  it('should display a link to edit profile', () => {
    render(<AccountSettings profile={mockProfile} />);

    const editLink = screen.getByRole('link', { name: /edit profile/i });
    expect(editLink).toBeInTheDocument();
    expect(editLink).toHaveAttribute('href', '/profile');
  });
});
