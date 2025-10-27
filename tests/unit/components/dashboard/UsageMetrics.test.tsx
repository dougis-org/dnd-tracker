/**
 * Usage Metrics Component Tests
 * Constitutional: TDD - Tests written before implementation
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { UsageMetrics } from '@/components/dashboard/UsageMetrics';

describe('UsageMetrics', () => {
  const mockMetrics = {
    subscription: {
      tier: 'free',
      usage: {
        parties: 1,
        encounters: 2,
        characters: 5,
      },
      limits: {
        parties: 1,
        encounters: 3,
        characters: 10,
        maxParticipants: 6,
      },
      percentages: {
        parties: 100,
        encounters: 66.67,
        characters: 50,
      },
      warnings: [],
    },
  };

  it('should render all four metric cards', () => {
    render(<UsageMetrics metrics={mockMetrics} />);

    expect(screen.getByText('Parties')).toBeInTheDocument();
    expect(screen.getByText('Encounters')).toBeInTheDocument();
    expect(screen.getByText('Creatures')).toBeInTheDocument();
    expect(screen.getByText('Tier')).toBeInTheDocument();
  });

  it('should display parties usage correctly', () => {
    render(<UsageMetrics metrics={mockMetrics} />);
    expect(screen.getByText('1/1')).toBeInTheDocument();
    expect(screen.getByText('parties used')).toBeInTheDocument();
  });

  it('should display encounters usage correctly', () => {
    render(<UsageMetrics metrics={mockMetrics} />);
    expect(screen.getByText('2/3')).toBeInTheDocument();
    expect(screen.getByText('encounters saved')).toBeInTheDocument();
  });

  it('should display creatures usage correctly', () => {
    render(<UsageMetrics metrics={mockMetrics} />);
    expect(screen.getByText('5/10')).toBeInTheDocument();
    expect(screen.getByText('creatures created')).toBeInTheDocument();
  });

  it('should display subscription tier', () => {
    render(<UsageMetrics metrics={mockMetrics} />);
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('should handle seasoned tier', () => {
    const seasonedMetrics = {
      ...mockMetrics,
      subscription: {
        ...mockMetrics.subscription,
        tier: 'seasoned',
        limits: { parties: 3, encounters: 15, characters: 50, maxParticipants: 10 },
      },
    };
    render(<UsageMetrics metrics={seasonedMetrics} />);
    expect(screen.getByText('Seasoned')).toBeInTheDocument();
  });

  it('should handle guild tier with infinite symbol', () => {
    const guildMetrics = {
      ...mockMetrics,
      subscription: {
        ...mockMetrics.subscription,
        tier: 'guild',
        usage: { parties: 100, encounters: 500, characters: 1000 },
        limits: { parties: Infinity, encounters: Infinity, characters: Infinity, maxParticipants: 50 },
      },
    };
    render(<UsageMetrics metrics={guildMetrics} />);
    expect(screen.getByText('Guild')).toBeInTheDocument();
    // Should show infinity symbol (∞) for guild tier
    const infinityElements = screen.getAllByText(/100\/∞|500\/∞|1000\/∞/);
    expect(infinityElements.length).toBeGreaterThan(0);
  });
});
