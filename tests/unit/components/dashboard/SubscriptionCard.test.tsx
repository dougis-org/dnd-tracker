/**
 * Subscription Card Component Tests
 * Constitutional: TDD - Tests written before implementation
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard';

describe('SubscriptionCard', () => {
  const freeTierMetrics = {
    subscription: {
      tier: 'free',
      limits: {
        parties: 1,
        encounters: 3,
        characters: 10,
        maxParticipants: 6,
      },
    },
  };

  it('should render subscription tier title', () => {
    render(<SubscriptionCard metrics={freeTierMetrics} />);
    expect(screen.getByText(/Free Adventurer/i)).toBeInTheDocument();
  });

  it('should render subscription description', () => {
    render(<SubscriptionCard metrics={freeTierMetrics} />);
    expect(screen.getByText(/Your current subscription tier/i)).toBeInTheDocument();
  });

  it('should display all tier limits for free tier', () => {
    render(<SubscriptionCard metrics={freeTierMetrics} />);

    expect(screen.getByText('1 Party')).toBeInTheDocument();
    expect(screen.getByText('3 Encounters')).toBeInTheDocument();
    expect(screen.getByText('10 Creatures')).toBeInTheDocument();
    expect(screen.getByText('6 Max Participants')).toBeInTheDocument();
  });

  it('should display limit descriptions', () => {
    render(<SubscriptionCard metrics={freeTierMetrics} />);

    expect(screen.getByText(/up to 6 members/i)).toBeInTheDocument();
    expect(screen.getByText(/saved encounters/i)).toBeInTheDocument();
    expect(screen.getByText(/custom creatures/i)).toBeInTheDocument();
    expect(screen.getByText(/per encounter/i)).toBeInTheDocument();
  });

  it('should render upgrade button for free tier', () => {
    render(<SubscriptionCard metrics={freeTierMetrics} />);
    expect(screen.getByRole('button', { name: /Upgrade for More/i })).toBeInTheDocument();
  });

  it('should handle seasoned tier correctly', () => {
    const seasonedMetrics = {
      subscription: {
        tier: 'seasoned',
        limits: {
          parties: 3,
          encounters: 15,
          characters: 50,
          maxParticipants: 10,
        },
      },
    };
    render(<SubscriptionCard metrics={seasonedMetrics} />);

    expect(screen.getByText(/Seasoned Adventurer/i)).toBeInTheDocument();
    expect(screen.getByText('3 Parties')).toBeInTheDocument();
    expect(screen.getByText('15 Encounters')).toBeInTheDocument();
    expect(screen.getByText('50 Creatures')).toBeInTheDocument();
    expect(screen.getByText('10 Max Participants')).toBeInTheDocument();
  });

  it('should handle guild tier with infinite limits', () => {
    const guildMetrics = {
      subscription: {
        tier: 'guild',
        limits: {
          parties: Infinity,
          encounters: Infinity,
          characters: Infinity,
          maxParticipants: 50,
        },
      },
    };
    render(<SubscriptionCard metrics={guildMetrics} />);

    expect(screen.getByText(/Guild Adventurer/i)).toBeInTheDocument();
    expect(screen.getByText('Unlimited Parties')).toBeInTheDocument();
    expect(screen.getByText('Unlimited Encounters')).toBeInTheDocument();
    expect(screen.getByText('Unlimited Creatures')).toBeInTheDocument();
  });

  it('should pluralize correctly for single party', () => {
    render(<SubscriptionCard metrics={freeTierMetrics} />);
    expect(screen.getByText('1 Party')).toBeInTheDocument();
  });

  it('should pluralize correctly for multiple parties', () => {
    const multiPartyMetrics = {
      subscription: {
        tier: 'seasoned',
        limits: {
          parties: 3,
          encounters: 15,
          characters: 50,
          maxParticipants: 10,
        },
      },
    };
    render(<SubscriptionCard metrics={multiPartyMetrics} />);
    expect(screen.getByText('3 Parties')).toBeInTheDocument();
  });
});
