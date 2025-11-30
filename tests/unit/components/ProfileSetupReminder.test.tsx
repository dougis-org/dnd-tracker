/**
 * Unit Tests: ProfileSetupReminder Component (T018)
 *
 * Tests for the dismissible reminder banner shown on profile settings page
 * when setup is incomplete (completedSetup = false).
 *
 * Test Coverage:
 * - T018.1: Renders when setup incomplete (isVisible=true)
 * - T018.2: Hidden when setup complete (isVisible=false)
 * - T018.3: Dismiss button hides banner and calls onDismiss callback
 * - T018.4: Banner text and link present
 * - T018.5: Reappears on next visit if setup remains incomplete (localStorage check)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileSetupReminder from '@/components/ProfileSetupReminder';

describe('ProfileSetupReminder Component', () => {
  const defaultProps = {
    isVisible: true,
    onStartWizard: jest.fn(),
    onDismiss: jest.fn(),
    canDismiss: true,
  };

  beforeEach(() => {
    // Clear jest mocks for component callbacks
    jest.clearAllMocks();
    // Manually clear localStorage data and reset spies
    Object.defineProperty(global, 'localStorage', {
      value: {
        store: {},
        getItem: jest.fn(function(key) {
          return this.store[key] || null;
        }),
        setItem: jest.fn(function(key, value) {
          this.store[key] = String(value);
        }),
        removeItem: jest.fn(function(key) {
          delete this.store[key];
        }),
        clear: jest.fn(function() {
          this.store = {};
        }),
        key(index) {
          const keys = Object.keys(this.store);
          return keys[index] || null;
        },
        get length() {
          return Object.keys(this.store).length;
        },
      },
      writable: true,
    });
  });

  describe('Rendering', () => {
    // T018.1: Renders when setup incomplete
    test('T018.1 should render banner when isVisible is true', () => {
      render(
        <ProfileSetupReminder
          {...defaultProps}
          isVisible={true}
        />
      );

      expect(screen.getByTestId('profile-setup-reminder')).toBeInTheDocument();
    });

    // T018.2: Hidden when setup complete
    test('T018.2 should not render when isVisible is false', () => {
      const { container } = render(
        <ProfileSetupReminder
          {...defaultProps}
          isVisible={false}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    // T018.4: Banner text and link present
    test('T018.4 should display banner text and complete setup link', () => {
      render(
        <ProfileSetupReminder
          {...defaultProps}
          isVisible={true}
        />
      );

      // Check for banner heading
      expect(screen.getByText(/complete your profile/i)).toBeInTheDocument();

      // Check for descriptive text
      expect(screen.getByText(/personalize your experience/i)).toBeInTheDocument();

      // Check for "Complete Setup" link/button
      const completeButton = screen.getByRole('button', { name: /complete setup|get started/i });
      expect(completeButton).toBeInTheDocument();
    });
  });

  describe('Dismiss Functionality', () => {
    // T018.3: Dismiss button hides banner and calls onDismiss callback
    test('T018.3 should call onDismiss when dismiss button clicked', () => {
      const onDismiss = jest.fn();
      render(
        <ProfileSetupReminder
          {...defaultProps}
          isVisible={true}
          onDismiss={onDismiss}
          canDismiss={true}
        />
      );

      const dismissButton = screen.getByRole('button', { name: /dismiss|close/i });
      fireEvent.click(dismissButton);

      expect(onDismiss).toHaveBeenCalled();
    });

    // T018.3b: Dismiss button not shown when canDismiss=false
    test('T018.3b should not show dismiss button when canDismiss is false', () => {
      render(
        <ProfileSetupReminder
          {...defaultProps}
          isVisible={true}
          canDismiss={false}
        />
      );

      const dismissButton = screen.queryByRole('button', { name: /dismiss|close/i });
      expect(dismissButton).not.toBeInTheDocument();
    });
  });

  describe('Action Callbacks', () => {
    // T018.4b: "Complete Setup" button triggers onStartWizard
    test('T018.4b should call onStartWizard when "Complete Setup" button clicked', () => {
      const onStartWizard = jest.fn();
      render(
        <ProfileSetupReminder
          {...defaultProps}
          isVisible={true}
          onStartWizard={onStartWizard}
        />
      );

      const completeButton = screen.getByRole('button', { name: /complete setup|get started/i });
      fireEvent.click(completeButton);

      expect(onStartWizard).toHaveBeenCalled();
    });
  });

  describe('Styling & Accessibility', () => {
    // T018.5a: Banner has appropriate ARIA attributes
    test('T018.5a should have appropriate ARIA attributes for accessibility', () => {
      render(
        <ProfileSetupReminder
          {...defaultProps}
          isVisible={true}
        />
      );

      const banner = screen.getByTestId('profile-setup-reminder');
      
      // Should have role="alert" or similar
      expect(banner).toHaveAttribute('role', 'alert');
    });

    // T018.5b: Banner uses warning/info styling (info background)
    test('T018.5b should have info/warning styling', () => {
      render(
        <ProfileSetupReminder
          {...defaultProps}
          isVisible={true}
        />
      );

      const banner = screen.getByTestId('profile-setup-reminder');
      
      // Should contain bg-blue or bg-amber (info/warning colors)
      const className = banner.className || '';
      expect(className).toMatch(/bg-(blue|amber|yellow|sky)/);
    });

    // T018.5c: Banner contains icon for visual cues
    test('T018.5c should display icon or visual indicator', () => {
      render(
        <ProfileSetupReminder
          {...defaultProps}
          isVisible={true}
        />
      );

      // Check for SVG or icon element
      const svg = screen.getByTestId('profile-setup-reminder').querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('localStorage Persistence (Dismissal)', () => {
    // T018.5d: Dismissed state persists in localStorage
    test('T018.5d should store dismissal state in localStorage', () => {
      const onDismiss = jest.fn();
      render(
        <ProfileSetupReminder
          {...defaultProps}
          isVisible={true}
          onDismiss={onDismiss}
          canDismiss={true}
        />
      );

      // Click dismiss
      const dismissButton = screen.getByRole('button', { name: /dismiss|close/i });
      fireEvent.click(dismissButton);

      // Check localStorage was written to
      // (Implementation should write to localStorage on dismiss)
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    // T018.5e: Reminder reappears on next session if setup still incomplete
    test('T018.5e should reappear on next visit if setup remains incomplete', () => {
      // First render - banner visible
      const { unmount } = render(
        <ProfileSetupReminder
          {...defaultProps}
          isVisible={true}
        />
      );

      expect(screen.getByTestId('profile-setup-reminder')).toBeInTheDocument();

      // Simulate dismissal
      const dismissButton = screen.getByRole('button', { name: /dismiss|close/i });
      fireEvent.click(dismissButton);

      unmount();

      // Re-render with isVisible=true (simulating next visit with setup still incomplete)
      render(
        <ProfileSetupReminder
          {...defaultProps}
          isVisible={true}
        />
      );

      // Banner should reappear
      expect(screen.getByTestId('profile-setup-reminder')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    // T018.6a: No crash if onDismiss not provided
    test('T018.6a should not crash if onDismiss callback not provided', () => {
      render(
        <ProfileSetupReminder
          {...defaultProps}
          isVisible={true}
          onDismiss={undefined}
          canDismiss={true}
        />
      );

      const dismissButton = screen.getByRole('button', { name: /dismiss|close/i });
      expect(() => fireEvent.click(dismissButton)).not.toThrow();
    });

    // T018.6b: No crash if onStartWizard not provided
    test('T018.6b should not crash if onStartWizard callback not provided', () => {
      render(
        <ProfileSetupReminder
          {...defaultProps}
          isVisible={true}
          onStartWizard={undefined}
        />
      );

      const completeButton = screen.getByRole('button', { name: /complete setup|get started/i });
      expect(() => fireEvent.click(completeButton)).not.toThrow();
    });

    // T018.6c: Handles rapid dismiss/show toggles
    test('T018.6c should handle rapid visibility toggles', () => {
      const { rerender } = render(
        <ProfileSetupReminder
          {...defaultProps}
          isVisible={true}
        />
      );

      expect(screen.getByTestId('profile-setup-reminder')).toBeInTheDocument();

      // Hide
      rerender(
        <ProfileSetupReminder
          {...defaultProps}
          isVisible={false}
        />
      );

      expect(screen.queryByTestId('profile-setup-reminder')).not.toBeInTheDocument();

      // Show again
      rerender(
        <ProfileSetupReminder
          {...defaultProps}
          isVisible={true}
        />
      );

      expect(screen.getByTestId('profile-setup-reminder')).toBeInTheDocument();
    });
  });
});
