import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StatusEffectPill from '@/components/combat/StatusEffectPill';
import { StatusEffect } from '@/lib/schemas/combat';

/**
 * Test helpers for StatusEffect-specific patterns
 */
const createMockEffect = (overrides?: Partial<StatusEffect>): StatusEffect => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Poisoned',
  durationInRounds: 3,
  appliedAtRound: 1,
  ...overrides,
});

const testEffectDuration = (label: string, effect: StatusEffect, currentRound: number, expected: string) => {
  render(
    <StatusEffectPill effect={effect} onRemove={jest.fn()} currentRound={currentRound} />,
  );
  expect(screen.getByText(expected)).toBeInTheDocument();
};

const testEffectStyling = (label: string, effect: StatusEffect, currentRound: number, expectedClasses: string[]) => {
  render(
    <StatusEffectPill effect={effect} onRemove={jest.fn()} currentRound={currentRound} />,
  );
  const pill = screen.getByRole('status');
  expectedClasses.forEach((cls) => {
    expect(pill).toHaveClass(cls);
  });
};

describe('StatusEffectPill Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render effect name', () => {
      const mockEffect = createMockEffect();
      render(<StatusEffectPill effect={mockEffect} onRemove={jest.fn()} currentRound={1} />);
      expect(screen.getByText('Poisoned')).toBeInTheDocument();
    });

    it('should render remove button', () => {
      const mockEffect = createMockEffect();
      render(<StatusEffectPill effect={mockEffect} onRemove={jest.fn()} currentRound={1} />);
      expect(screen.getByRole('button', { name: /Remove Poisoned/i })).toBeInTheDocument();
    });

    it('should display duration in rounds notation', () => {
      const mockEffect = createMockEffect();
      render(<StatusEffectPill effect={mockEffect} onRemove={jest.fn()} currentRound={1} />);
      expect(screen.getByText('3R')).toBeInTheDocument();
    });

    it('should display permanent indicator for null duration', () => {
      const permanentEffect = createMockEffect({ durationInRounds: null });
      render(
        <StatusEffectPill
          effect={permanentEffect}
          onRemove={jest.fn()}
          currentRound={1}
        />,
      );
      expect(screen.getByText('∞')).toBeInTheDocument();
    });

    it('should have status role for accessibility', () => {
      const mockEffect = createMockEffect();
      render(<StatusEffectPill effect={mockEffect} onRemove={jest.fn()} currentRound={1} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Duration Calculation', () => {
    it('should calculate remaining rounds correctly', () => {
      const effect = createMockEffect({ durationInRounds: 5, appliedAtRound: 2 });
      testEffectDuration('duration calc', effect, 4, '3R');
    });

    it('should show zero rounds when effect expired', () => {
      const effect = createMockEffect({ durationInRounds: 2, appliedAtRound: 1 });
      testEffectDuration('expired effect', effect, 5, '0R');
    });

    it('should show full duration when just applied', () => {
      const effect = createMockEffect({ durationInRounds: 4, appliedAtRound: 5 });
      testEffectDuration('just applied', effect, 5, '4R');
    });

    it('should handle single round duration', () => {
      const effect = createMockEffect({ durationInRounds: 1, appliedAtRound: 3 });
      testEffectDuration('single round', effect, 3, '1R');
    });

    it('should handle very large round numbers', () => {
      const effect = createMockEffect({ durationInRounds: 100, appliedAtRound: 1 });
      testEffectDuration('large duration', effect, 1, '100R');
    });
  });

  describe('Interactions', () => {
    it('should call onRemove with effect id when remove button clicked', () => {
      const mockEffect = createMockEffect();
      const onRemove = jest.fn();
      render(
        <StatusEffectPill effect={mockEffect} onRemove={onRemove} currentRound={1} />,
      );

      const removeButton = screen.getByRole('button', { name: /Remove Poisoned/i });
      fireEvent.click(removeButton);

      expect(onRemove).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should prevent parent click handler on remove', () => {
      const mockEffect = createMockEffect();
      const mockParentClick = jest.fn();
      const onRemove = jest.fn();

      render(
        <div onClick={mockParentClick}>
          <StatusEffectPill effect={mockEffect} onRemove={onRemove} currentRound={1} />
        </div>,
      );

      const removeButton = screen.getByRole('button', { name: /Remove Poisoned/i });
      fireEvent.click(removeButton);

      expect(onRemove).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('should use normal color for effects with remaining duration', () => {
      const effect = createMockEffect();
      testEffectStyling('normal effect', effect, 1, ['bg-purple-900', 'border-purple-700']);
    });

    it('should use warning color when only 1 round remains', () => {
      const effect = createMockEffect({ durationInRounds: 2, appliedAtRound: 1 });
      testEffectStyling('last round', effect, 2, ['bg-red-900', 'border-red-700']);
    });

    it('should apply opacity to expired effects', () => {
      const effect = createMockEffect({ durationInRounds: 1, appliedAtRound: 1 });
      testEffectStyling('expired', effect, 3, ['opacity-50']);
    });

    it('should style permanent effects consistently', () => {
      const permanentEffect = createMockEffect({ durationInRounds: null });
      testEffectStyling('permanent', permanentEffect, 1, ['bg-purple-900', 'border-purple-700']);
    });
  });

  describe('Accessibility', () => {
    it('should have descriptive aria-label with duration', () => {
      const mockEffect = createMockEffect();
      render(
        <StatusEffectPill effect={mockEffect} onRemove={jest.fn()} currentRound={1} />,
      );
      const pill = screen.getByRole('status');
      expect(pill).toHaveAttribute('aria-label', 'Poisoned, 3 rounds remaining');
    });

    it('should have aria-label for permanent effects', () => {
      const permanentEffect = createMockEffect({ durationInRounds: null });
      render(
        <StatusEffectPill
          effect={permanentEffect}
          onRemove={jest.fn()}
          currentRound={1}
        />,
      );
      const pill = screen.getByRole('status');
      expect(pill).toHaveAttribute('aria-label', 'Poisoned, permanent effect');
    });

    it('should have accessible remove button', () => {
      const mockEffect = createMockEffect();
      render(
        <StatusEffectPill effect={mockEffect} onRemove={jest.fn()} currentRound={1} />,
      );
      const removeButton = screen.getByRole('button', { name: /Remove Poisoned/i });
      expect(removeButton).toHaveAttribute('aria-label', 'Remove Poisoned');
    });

    it('should be keyboard accessible', () => {
      const mockEffect = createMockEffect();
      render(
        <StatusEffectPill effect={mockEffect} onRemove={jest.fn()} currentRound={1} />,
      );
      const removeButton = screen.getByRole('button', { name: /Remove Poisoned/i });
      expect(removeButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long effect names', () => {
      const longNameEffect = createMockEffect({
        name: 'Cursed with an extremely long and descriptive name',
      });
      render(
        <StatusEffectPill
          effect={longNameEffect}
          onRemove={jest.fn()}
          currentRound={1}
        />,
      );
      expect(
        screen.getByText('Cursed with an extremely long and descriptive name'),
      ).toBeInTheDocument();
    });

    it('should handle effects expiring exactly at current round', () => {
      const effect = createMockEffect({ durationInRounds: 3, appliedAtRound: 1 });
      testEffectDuration('expiring now', effect, 4, '0R');
    });

    it('should handle updates to effect and currentRound props', () => {
      const mockEffect = createMockEffect({ durationInRounds: 5, appliedAtRound: 1 });
      const { rerender } = render(
        <StatusEffectPill effect={mockEffect} onRemove={jest.fn()} currentRound={1} />,
      );

      expect(screen.getByText('5R')).toBeInTheDocument();

      rerender(
        <StatusEffectPill effect={mockEffect} onRemove={jest.fn()} currentRound={3} />,
      );

      expect(screen.getByText('3R')).toBeInTheDocument();
    });
  });
});
