import React from 'react';
import { render, screen } from '@testing-library/react';
import HPBar from '@/components/combat/HPBar';

describe('HPBar Component', () => {
  const defaultProps = {
    currentHP: 50,
    maxHP: 100,
    temporaryHP: 0,
  };

  describe('Rendering', () => {
    it('should render HP bar container', () => {
      const { container } = render(<HPBar {...defaultProps} />);

      const bar = container.querySelector('[data-testid="hp-bar"]');
      expect(bar).toBeInTheDocument();
    });

    it('should render progress bar element', () => {
      const { container } = render(<HPBar {...defaultProps} />);

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should display HP percentage text', () => {
      render(<HPBar {...defaultProps} />);

      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should set aria-valuemin to 0', () => {
      const { container } = render(<HPBar {...defaultProps} />);

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    });

    it('should set aria-valuemax to maxHP', () => {
      const { container } = render(<HPBar {...defaultProps} />);

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should set aria-valuenow to currentHP', () => {
      const { container } = render(<HPBar {...defaultProps} />);

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    });

    it('should set aria-label for screen readers', () => {
      const { container } = render(<HPBar {...defaultProps} />);

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('aria-label');
      expect(progressBar?.getAttribute('aria-label')).toMatch(/50.*100/);
    });
  });

  describe('Color Coding', () => {
    it('should be green when HP > 50%', () => {
      const { container } = render(<HPBar {...defaultProps} currentHP={75} />);

      const bar = container.querySelector('[data-testid="hp-bar"]');
      expect(bar).toHaveClass('bg-green-500');
    });

    it('should be yellow when HP 25-50%', () => {
      const { container } = render(<HPBar {...defaultProps} currentHP={40} />);

      const bar = container.querySelector('[data-testid="hp-bar"]');
      expect(bar).toHaveClass('bg-yellow-500');
    });

    it('should be red when HP < 25%', () => {
      const { container } = render(<HPBar {...defaultProps} currentHP={20} />);

      const bar = container.querySelector('[data-testid="hp-bar"]');
      expect(bar).toHaveClass('bg-red-500');
    });

    it('should be red when HP <= 0', () => {
      const { container } = render(<HPBar {...defaultProps} currentHP={0} />);

      const bar = container.querySelector('[data-testid="hp-bar"]');
      expect(bar).toHaveClass('bg-red-600');
    });
  });

  describe('Width Calculation', () => {
    it('should calculate width percentage correctly', () => {
      const { container } = render(<HPBar {...defaultProps} currentHP={50} maxHP={100} />);

      const bar = container.querySelector('[data-testid="hp-bar"]');
      expect(bar).toHaveStyle({ width: '50%' });
    });

    it('should handle full HP', () => {
      const { container } = render(<HPBar {...defaultProps} currentHP={100} maxHP={100} />);

      const bar = container.querySelector('[data-testid="hp-bar"]');
      expect(bar).toHaveStyle({ width: '100%' });
    });

    it('should handle zero HP', () => {
      const { container } = render(<HPBar {...defaultProps} currentHP={0} maxHP={100} />);

      const bar = container.querySelector('[data-testid="hp-bar"]');
      expect(bar).toHaveStyle({ width: '0%' });
    });

    it('should handle negative HP (show 0)', () => {
      const { container } = render(<HPBar {...defaultProps} currentHP={-10} maxHP={100} />);

      const bar = container.querySelector('[data-testid="hp-bar"]');
      expect(bar).toHaveStyle({ width: '0%' });
    });

    it('should handle fractional HP values', () => {
      const { container } = render(<HPBar {...defaultProps} currentHP={33} maxHP={100} />);

      const bar = container.querySelector('[data-testid="hp-bar"]');
      // 33/100 = 33%
      expect(bar).toHaveStyle({ width: '33%' });
    });
  });

  describe('Temporary HP Display', () => {
    it('should display temp HP section when temporaryHP > 0', () => {
      render(<HPBar {...defaultProps} temporaryHP={15} />);

      const tempHPElement = screen.getByText(/15/);
      expect(tempHPElement.textContent).toContain('15');
    });

    it('should not display temp HP section when temporaryHP = 0', () => {
      render(<HPBar {...defaultProps} temporaryHP={0} />);

      expect(screen.queryByText(/temp/i)).not.toBeInTheDocument();
    });

    it('should include temp HP in aria-label', () => {
      const { container } = render(<HPBar {...defaultProps} temporaryHP={10} />);

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar?.getAttribute('aria-label')).toMatch(/temp.*10/i);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small maxHP', () => {
      const { container } = render(<HPBar {...defaultProps} currentHP={1} maxHP={3} />);

      const bar = container.querySelector('[data-testid="hp-bar"]');
      // 1/3 = 33.333... rounded to 33.33
      expect(bar).toHaveStyle({ width: '33.33%' });
    });

    it('should handle very large maxHP', () => {
      const { container } = render(<HPBar {...defaultProps} currentHP={5000} maxHP={10000} />);

      const bar = container.querySelector('[data-testid="hp-bar"]');
      expect(bar).toHaveStyle({ width: '50%' });
    });

    it('should cap width at 100% when currentHP exceeds maxHP', () => {
      const { container } = render(<HPBar currentHP={150} maxHP={100} temporaryHP={0} />);

      const bar = container.querySelector('[data-testid="hp-bar"]');
      expect(bar).toHaveStyle({ width: '100%' });
    });
  });
});
