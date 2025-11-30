/**
 * TierInfo Component Unit Tests (T018)
 *
 * Tests for the TierInfo component displaying subscription tier information
 *
 * Feature 016: User Dashboard with Real Data
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TierInfo from '@/components/dashboard/TierInfo';
import { TierLimits } from '@/types/subscription';

describe('TierInfo Component (T018)', () => {
  const mockDisplayName = 'John Dungeon Master';
  const mockEmail = 'john@example.com';

  describe('Rendering', () => {
    it('should render the component', () => {
      render(
        <TierInfo
          tier="free_adventurer"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.free_adventurer}
        />
      );

      expect(screen.getByText('Your Subscription')).toBeInTheDocument();
    });

    it('should display the user display name', () => {
      render(
        <TierInfo
          tier="free_adventurer"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.free_adventurer}
        />
      );

      expect(screen.getByText('John Dungeon Master')).toBeInTheDocument();
    });

    it('should display the subscription tier name', () => {
      render(
        <TierInfo
          tier="free_adventurer"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.free_adventurer}
        />
      );

      expect(screen.getByText('Free Adventurer')).toBeInTheDocument();
    });

    it('should render the resource limits table', () => {
      render(
        <TierInfo
          tier="free_adventurer"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.free_adventurer}
        />
      );

      expect(screen.getByText('Resource Limits')).toBeInTheDocument();
      expect(screen.getByText('Parties')).toBeInTheDocument();
      expect(screen.getByText('Characters')).toBeInTheDocument();
      expect(screen.getByText('Encounters')).toBeInTheDocument();
    });
  });

  describe('Tier Display Formatting', () => {
    it('should format free_adventurer tier name correctly', () => {
      render(
        <TierInfo
          tier="free_adventurer"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.free_adventurer}
        />
      );

      expect(screen.getByText('Free Adventurer')).toBeInTheDocument();
    });

    it('should format seasoned_adventurer tier name correctly', () => {
      render(
        <TierInfo
          tier="seasoned_adventurer"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.seasoned_adventurer}
        />
      );

      expect(screen.getByText('Seasoned Adventurer')).toBeInTheDocument();
    });

    it('should format legendary_hero tier name correctly', () => {
      render(
        <TierInfo
          tier="legendary_hero"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.legendary_hero}
        />
      );

      expect(screen.getByText('Legendary Hero')).toBeInTheDocument();
    });

    it('should format epic_overlord tier name correctly', () => {
      render(
        <TierInfo
          tier="epic_overlord"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.epic_overlord}
        />
      );

      expect(screen.getByText('Epic Overlord')).toBeInTheDocument();
    });

    it('should format guild_master tier name correctly', () => {
      render(
        <TierInfo
          tier="guild_master"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.guild_master}
        />
      );

      expect(screen.getByText('Guild Master')).toBeInTheDocument();
    });
  });

  describe('Limits Table Display', () => {
    it('should display all resource limits for free tier', () => {
      render(
        <TierInfo
          tier="free_adventurer"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.free_adventurer}
        />
      );

      expect(screen.getByText('Parties')).toBeInTheDocument();
      expect(screen.getByText('Characters')).toBeInTheDocument();
      expect(screen.getByText('Encounters')).toBeInTheDocument();
    });

    it('should display correct limits for free_adventurer tier', () => {
      render(
        <TierInfo
          tier="free_adventurer"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.free_adventurer}
        />
      );

      // Free tier limits: 1 party, 3 characters, 5 encounters
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should display correct limits for seasoned_adventurer tier', () => {
      render(
        <TierInfo
          tier="seasoned_adventurer"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.seasoned_adventurer}
        />
      );

      // Should display higher limits
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('should display correct limits for legendary_hero tier', () => {
      render(
        <TierInfo
          tier="legendary_hero"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.legendary_hero}
        />
      );

      // Should display even higher limits
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('should display correct limits for epic_overlord tier', () => {
      render(
        <TierInfo
          tier="epic_overlord"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.epic_overlord}
        />
      );

      // Should display high limits
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should display unlimited notation for guild_master tier', () => {
      render(
        <TierInfo
          tier="guild_master"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.guild_master}
        />
      );

      // Guild master has unlimited (∞ notation)
      expect(screen.getByText('∞')).toBeInTheDocument();
    });
  });

  describe('Email Fallback', () => {
    it('should display displayName when available', () => {
      render(
        <TierInfo
          tier="free_adventurer"
          displayName="John Dungeon Master"
          email="john@example.com"
          limits={TierLimits.free_adventurer}
        />
      );

      expect(screen.getByText('John Dungeon Master')).toBeInTheDocument();
    });

    it('should fall back to email when displayName is empty', () => {
      render(
        <TierInfo
          tier="free_adventurer"
          displayName=""
          email="john@example.com"
          limits={TierLimits.free_adventurer}
        />
      );

      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('should handle email-only users', () => {
      render(
        <TierInfo
          tier="free_adventurer"
          displayName=""
          email="newuser@example.com"
          limits={TierLimits.free_adventurer}
        />
      );

      expect(screen.getByText('newuser@example.com')).toBeInTheDocument();
    });
  });

  describe('All Five Tier Progressions', () => {
    it('should show tier progression from free to seasoned', () => {
      const { rerender } = render(
        <TierInfo
          tier="free_adventurer"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.free_adventurer}
        />
      );

      expect(screen.getByText('1')).toBeInTheDocument();

      rerender(
        <TierInfo
          tier="seasoned_adventurer"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.seasoned_adventurer}
        />
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should show tier progression from seasoned to legendary', () => {
      const { rerender } = render(
        <TierInfo
          tier="seasoned_adventurer"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.seasoned_adventurer}
        />
      );

      expect(screen.getByText('10')).toBeInTheDocument();

      rerender(
        <TierInfo
          tier="legendary_hero"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.legendary_hero}
        />
      );

      expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('should show tier progression from legendary to epic', () => {
      const { rerender } = render(
        <TierInfo
          tier="legendary_hero"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.legendary_hero}
        />
      );

      expect(screen.getByText('50')).toBeInTheDocument();

      rerender(
        <TierInfo
          tier="epic_overlord"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.epic_overlord}
        />
      );

      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should show tier progression from epic to guild_master', () => {
      const { rerender } = render(
        <TierInfo
          tier="epic_overlord"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.epic_overlord}
        />
      );

      expect(screen.getByText('100')).toBeInTheDocument();

      rerender(
        <TierInfo
          tier="guild_master"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.guild_master}
        />
      );

      // Guild master should show unlimited
      expect(screen.getByText('∞')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(
        <TierInfo
          tier="free_adventurer"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.free_adventurer}
        />
      );

      expect(screen.getByText('Your Subscription')).toBeInTheDocument();
      expect(screen.getByText('Resource Limits')).toBeInTheDocument();
    });

    it('should display all key information clearly', () => {
      render(
        <TierInfo
          tier="free_adventurer"
          displayName={mockDisplayName}
          email={mockEmail}
          limits={TierLimits.free_adventurer}
        />
      );

      // All key information should be visible
      expect(screen.getByText('John Dungeon Master')).toBeInTheDocument();
      expect(screen.getByText('Free Adventurer')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long display names', () => {
      const longName = 'A'.repeat(100);

      render(
        <TierInfo
          tier="free_adventurer"
          displayName={longName}
          email={mockEmail}
          limits={TierLimits.free_adventurer}
        />
      );

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('should handle special characters in display name', () => {
      const specialName = "John O'Brien-Smith @Lvl20";

      render(
        <TierInfo
          tier="free_adventurer"
          displayName={specialName}
          email={mockEmail}
          limits={TierLimits.free_adventurer}
        />
      );

      expect(screen.getByText(specialName)).toBeInTheDocument();
    });

    it('should handle unicode characters in display name', () => {
      const unicodeName = 'José María 🐉';

      render(
        <TierInfo
          tier="free_adventurer"
          displayName={unicodeName}
          email={mockEmail}
          limits={TierLimits.free_adventurer}
        />
      );

      expect(screen.getByText(unicodeName)).toBeInTheDocument();
    });

    it('should handle whitespace-only display name', () => {
      render(
        <TierInfo
          tier="free_adventurer"
          displayName="   "
          email="john@example.com"
          limits={TierLimits.free_adventurer}
        />
      );

      // Should fall back to email if displayName is whitespace
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });
});
