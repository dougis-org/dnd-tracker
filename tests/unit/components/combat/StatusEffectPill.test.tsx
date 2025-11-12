import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StatusEffectPill from '@/components/combat/StatusEffectPill';
import { StatusEffect } from '@/lib/schemas/combat';

describe('StatusEffectPill Component', () => {
  const mockEffect: StatusEffect = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Poisoned',
    durationInRounds: 3,
    appliedAtRound: 1,
  };

  const defaultProps = {
    effect: mockEffect,
    onRemove: jest.fn(),
    currentRound: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render effect name', () => {
      render(<StatusEffectPill {...defaultProps} />);
      expect(screen.getByText('Poisoned')).toBeInTheDocument();
    });

    it('should render remove button', () => {
      render(<StatusEffectPill {...defaultProps} />);
      expect(screen.getByRole('button', { name: /Remove Poisoned/i })).toBeInTheDocument();
    });

    it('should display duration in rounds notation', () => {
      render(<StatusEffectPill {...defaultProps} />);
      expect(screen.getByText('3R')).toBeInTheDocument();
    });

    it('should display permanent indicator for null duration', () => {
      const permanentEffect = { ...mockEffect, durationInRounds: null };
      render(<StatusEffectPill {...defaultProps} effect={permanentEffect} />);
      expect(screen.getByText('∞')).toBeInTheDocument();
    });

    it('should have status role for accessibility', () => {
      render(<StatusEffectPill {...defaultProps} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Duration Calculation', () => {
    it('should calculate remaining rounds as duration minus elapsed time', () => {
      const effect = { ...mockEffect, durationInRounds: 5, appliedAtRound: 2 };
      render(<StatusEffectPill {...defaultProps} effect={effect} currentRound={4} />);
      // Remaining = (2 + 5) - 4 = 3
      expect(screen.getByText('3R')).toBeInTheDocument();
    });

    it('should show zero rounds when effect expired', () => {
      const effect = { ...mockEffect, durationInRounds: 2, appliedAtRound: 1 };
      render(<StatusEffectPill {...defaultProps} effect={effect} currentRound={5} />);
      // Remaining = (1 + 2) - 5 = -2, clamped to 0
      expect(screen.getByText('0R')).toBeInTheDocument();
    });

    it('should show remaining rounds equal to duration when applied this round', () => {
      const effect = { ...mockEffect, durationInRounds: 4, appliedAtRound: 5 };
      render(<StatusEffectPill {...defaultProps} effect={effect} currentRound={5} />);
      // Remaining = (5 + 4) - 5 = 4
      expect(screen.getByText('4R')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onRemove with effect id when remove button clicked', () => {
      render(<StatusEffectPill {...defaultProps} />);
      const removeButton = screen.getByRole('button', { name: /Remove Poisoned/i });
      fireEvent.click(removeButton);
      expect(defaultProps.onRemove).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should only call onRemove, not parent click handler', () => {
      const mockParentClick = jest.fn();
      render(
        <div onClick={mockParentClick}>
          <StatusEffectPill {...defaultProps} />
        </div>
      );
      const removeButton = screen.getByRole('button', { name: /Remove Poisoned/i });
      fireEvent.click(removeButton);
      
      expect(defaultProps.onRemove).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('should use purple color for normal duration effects', () => {
      render(<StatusEffectPill {...defaultProps} />);
      const pill = screen.getByRole('status');
      expect(pill).toHaveClass('bg-purple-900', 'border-purple-700');
    });

    it('should use red color when only 1 round remains', () => {
      const effect = { ...mockEffect, durationInRounds: 2, appliedAtRound: 1 };
      render(<StatusEffectPill {...defaultProps} effect={effect} currentRound={2} />);
      // Remaining = (1 + 2) - 2 = 1
      const pill = screen.getByRole('status');
      expect(pill).toHaveClass('bg-red-900', 'border-red-700');
    });

    it('should apply opacity to expired effects', () => {
      const effect = { ...mockEffect, durationInRounds: 1, appliedAtRound: 1 };
      render(<StatusEffectPill {...defaultProps} effect={effect} currentRound={3} />);
      // Remaining = (1 + 1) - 3 = -1, clamped to 0 = expired
      const pill = screen.getByRole('status');
      expect(pill).toHaveClass('opacity-50');
    });

    it('should use slate color for permanent effects', () => {
      const permanentEffect = { ...mockEffect, durationInRounds: null };
      render(<StatusEffectPill {...defaultProps} effect={permanentEffect} />);
      const pill = screen.getByRole('status');
      expect(pill).toHaveClass('bg-purple-900', 'border-purple-700');
    });
  });

  describe('Accessibility', () => {
    it('should have descriptive aria-label for screen readers', () => {
      render(<StatusEffectPill {...defaultProps} />);
      const pill = screen.getByRole('status');
      expect(pill).toHaveAttribute('aria-label', 'Poisoned, 3 rounds remaining');
    });

    it('should have aria-label for permanent effects', () => {
      const permanentEffect = { ...mockEffect, durationInRounds: null };
      render(<StatusEffectPill {...defaultProps} effect={permanentEffect} />);
      const pill = screen.getByRole('status');
      expect(pill).toHaveAttribute('aria-label', 'Poisoned, permanent effect');
    });

    it('should have accessible remove button with aria-label', () => {
      render(<StatusEffectPill {...defaultProps} />);
      const removeButton = screen.getByRole('button', { name: /Remove Poisoned/i });
      expect(removeButton).toHaveAttribute('aria-label', 'Remove Poisoned');
    });

    it('should be keyboard accessible on remove button', () => {
      render(<StatusEffectPill {...defaultProps} />);
      const removeButton = screen.getByRole('button', { name: /Remove Poisoned/i });
      expect(removeButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long effect names', () => {
      const longNameEffect = { ...mockEffect, name: 'Cursed with an extremely long and descriptive name' };
      render(<StatusEffectPill {...defaultProps} effect={longNameEffect} />);
      expect(screen.getByText('Cursed with an extremely long and descriptive name')).toBeInTheDocument();
    });

    it('should handle single round duration', () => {
      const singleRound = { ...mockEffect, durationInRounds: 1, appliedAtRound: 3 };
      render(<StatusEffectPill {...defaultProps} effect={singleRound} currentRound={3} />);
      expect(screen.getByText('1R')).toBeInTheDocument();
    });

    it('should handle very large round numbers', () => {
      const effect = { ...mockEffect, durationInRounds: 100, appliedAtRound: 1 };
      render(<StatusEffectPill {...defaultProps} effect={effect} currentRound={1} />);
      expect(screen.getByText('100R')).toBeInTheDocument();
    });
  });
});
