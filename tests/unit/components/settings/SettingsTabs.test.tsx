/**
 * Settings Tabs Component Tests
 * Constitutional: TDD - Tests written before implementation
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SettingsTabs } from '@/components/settings/SettingsTabs';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

import { usePathname } from 'next/navigation';

describe('SettingsTabs', () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue('/settings/profile');
  });

  it('should render all three tab buttons', () => {
    render(<SettingsTabs />);

    expect(screen.getByRole('tab', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /preferences/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /account/i })).toBeInTheDocument();
  });

  it('should mark Profile tab as active when on /settings/profile', () => {
    (usePathname as jest.Mock).mockReturnValue('/settings/profile');
    render(<SettingsTabs />);

    const profileTab = screen.getByRole('tab', { name: /profile/i });
    expect(profileTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should mark Preferences tab as active when on /settings/preferences', () => {
    (usePathname as jest.Mock).mockReturnValue('/settings/preferences');
    render(<SettingsTabs />);

    const preferencesTab = screen.getByRole('tab', { name: /preferences/i });
    expect(preferencesTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should mark Account tab as active when on /settings/account', () => {
    (usePathname as jest.Mock).mockReturnValue('/settings/account');
    render(<SettingsTabs />);

    const accountTab = screen.getByRole('tab', { name: /account/i });
    expect(accountTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should have proper ARIA attributes for tab list', () => {
    render(<SettingsTabs />);

    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();
  });

  it('should render tabs with correct hrefs', () => {
    render(<SettingsTabs />);

    const profileTab = screen.getByRole('tab', { name: /profile/i });
    const preferencesTab = screen.getByRole('tab', { name: /preferences/i });
    const accountTab = screen.getByRole('tab', { name: /account/i });

    expect(profileTab.closest('a')).toHaveAttribute('href', '/settings/profile');
    expect(preferencesTab.closest('a')).toHaveAttribute('href', '/settings/preferences');
    expect(accountTab.closest('a')).toHaveAttribute('href', '/settings/account');
  });

  it('should only have one active tab at a time', () => {
    (usePathname as jest.Mock).mockReturnValue('/settings/preferences');
    render(<SettingsTabs />);

    const profileTab = screen.getByRole('tab', { name: /profile/i });
    const preferencesTab = screen.getByRole('tab', { name: /preferences/i });
    const accountTab = screen.getByRole('tab', { name: /account/i });

    expect(profileTab).toHaveAttribute('aria-selected', 'false');
    expect(preferencesTab).toHaveAttribute('aria-selected', 'true');
    expect(accountTab).toHaveAttribute('aria-selected', 'false');
  });
});
