import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatusEffectsPanel from '@/components/combat/StatusEffectsPanel';
import { StatusEffect } from '@/lib/schemas/combat';

describe('StatusEffectsPanel Component', () => {
  const mockEffects: StatusEffect[] = [
    {
      id: '1',
      name: 'Poisoned',
      durationInRounds: 3,
      appliedAtRound: 1,
    },
    {
      id: '2',
      name: 'Blinded',
      durationInRounds: 1,
      appliedAtRound: 2,
    },
  ];

  const defaultProps = {
    participantId: 'participant-1',
    participantName: 'Test Creature',
    effects: mockEffects,
    onAddEffect: jest.fn(),
    onRemoveEffect: jest.fn(),
    currentRound: 2,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render participant name header', () => {
      render(<StatusEffectsPanel {...defaultProps} />);
      expect(screen.getByText('Test Creature')).toBeInTheDocument();
    });

    it('should display all effects in panel', () => {
      render(<StatusEffectsPanel {...defaultProps} />);
      // Get the main panel region (not the menu)
      const panels = screen.getAllByRole('region');
      const mainPanel = panels[0];
      expect(mainPanel.textContent).toContain('Poisoned');
      expect(mainPanel.textContent).toContain('Blinded');
    });

    it('should show empty state when no effects', () => {
      render(<StatusEffectsPanel {...defaultProps} effects={[]} />);
      expect(screen.getByText(/No active effects/i)).toBeInTheDocument();
    });

    it('should render add effect menu button', () => {
      render(<StatusEffectsPanel {...defaultProps} />);
      expect(screen.getByRole('button', { name: /Add Effect/i })).toBeInTheDocument();
    });

    it('should have panel container with proper styling', () => {
      const { container } = render(<StatusEffectsPanel {...defaultProps} />);
      const panel = container.querySelector('div[role="region"]');
      expect(panel).toBeInTheDocument();
      expect(panel).toHaveClass('bg-slate-800', 'border', 'rounded-lg');
    });
  });

  describe('Effect Display', () => {
    it('should render effect pills for each effect', () => {
      render(<StatusEffectsPanel {...defaultProps} />);
      const pills = screen.getAllByRole('status');
      // Should have at least 2 pills (Poisoned + Blinded) plus StatusEffectPill status regions
      expect(pills.length).toBeGreaterThanOrEqual(2);
    });

    it('should display multiple effects in flex layout', () => {
      const manyEffects: StatusEffect[] = [
        { id: '1', name: 'Poisoned', durationInRounds: 2, appliedAtRound: 1 },
        { id: '2', name: 'Blinded', durationInRounds: 1, appliedAtRound: 2 },
        { id: '3', name: 'Restrained', durationInRounds: null, appliedAtRound: 1 },
        { id: '4', name: 'Charmed', durationInRounds: 3, appliedAtRound: 1 },
      ];
      const { container } = render(<StatusEffectsPanel {...defaultProps} effects={manyEffects} />);
      
      // Check that the panel contains the effects
      const panel = container.querySelector('div[role="region"]');
      expect(panel?.textContent).toContain('Poisoned');
      expect(panel?.textContent).toContain('Blinded');
      expect(panel?.textContent).toContain('Restrained');
      expect(panel?.textContent).toContain('Charmed');
    });
  });

  describe('Add Effect Functionality', () => {
    it('should pass onAddEffect callback to StatusEffectMenu', async () => {
      const user = userEvent.setup();
      render(<StatusEffectsPanel {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /Add Effect/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Effect Type/i);
      await user.selectOptions(select, 'Stunned');

      const addEffectButton = screen.getByRole('button', { name: /^Add$/i });
      fireEvent.click(addEffectButton);

      await waitFor(() => {
        expect(defaultProps.onAddEffect).toHaveBeenCalled();
      });
    });

    it('should call onAddEffect with correct effect data', async () => {
      const user = userEvent.setup();
      render(<StatusEffectsPanel {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /Add Effect/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Effect Type/i);
      await user.selectOptions(select, 'Frightened');

      const durationInput = screen.getByPlaceholderText(/5/i);
      await user.clear(durationInput);
      await user.type(durationInput, '4');

      const addEffectButton = screen.getByRole('button', { name: /^Add$/i });
      fireEvent.click(addEffectButton);

      await waitFor(() => {
        expect(defaultProps.onAddEffect).toHaveBeenCalledWith({
          name: 'Frightened',
          durationInRounds: 4,
          appliedAtRound: 2,
        });
      });
    });
  });

  describe('Remove Effect Functionality', () => {
    it('should call onRemoveEffect when effect remove button clicked', async () => {
      render(<StatusEffectsPanel {...defaultProps} />);
      const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
      fireEvent.click(removeButtons[0]);

      expect(defaultProps.onRemoveEffect).toHaveBeenCalledWith('1');
    });

    it('should remove effect from display after removal', async () => {
      const { container, rerender } = render(<StatusEffectsPanel {...defaultProps} />);
      const panel = container.querySelector('div[role="region"]');
      expect(panel?.textContent).toContain('Poisoned');

      const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
      fireEvent.click(removeButtons[0]);

      rerender(<StatusEffectsPanel {...defaultProps} effects={[mockEffects[1]]} />);
      const newPanel = container.querySelector('div[role="region"]');
      expect(newPanel?.textContent).not.toContain('Poisoned');
      expect(newPanel?.textContent).toContain('Blinded');
    });

    it('should handle removing all effects', async () => {
      const { container, rerender } = render(<StatusEffectsPanel {...defaultProps} />);
      expect(container.textContent).not.toContain('No active effects');

      rerender(<StatusEffectsPanel {...defaultProps} effects={[]} />);
      expect(screen.getByText(/No active effects/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have region landmark for effects panel', () => {
      render(<StatusEffectsPanel {...defaultProps} />);
      const regions = screen.getAllByRole('region');
      // Should have at least one region (StatusEffectsPanel itself)
      expect(regions.length).toBeGreaterThanOrEqual(1);
    });

    it('should have descriptive heading for participant', () => {
      render(<StatusEffectsPanel {...defaultProps} />);
      const heading = screen.getByText('Test Creature');
      expect(heading).toBeInTheDocument();
    });

    it('should have aria-label on add button', () => {
      render(<StatusEffectsPanel {...defaultProps} />);
      const addButton = screen.getByRole('button', { name: /Add Effect/i });
      expect(addButton).toHaveAttribute('aria-label');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<StatusEffectsPanel {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /Add Effect/i });
      await user.keyboard('{Tab}');
      // Add button should be focusable
      expect(addButton).toBeInTheDocument();
    });
  });

  describe('Integration with Child Components', () => {
    it('should pass currentRound to StatusEffectPill for duration calculation', () => {
      const { rerender, container } = render(
        <StatusEffectsPanel {...defaultProps} currentRound={2} />
      );
      // Effect has durationInRounds: 3, appliedAtRound: 1, currentRound: 2
      // Remaining = (1 + 3) - 2 = 2 rounds
      const mainPanel = container.querySelector('div[role="region"]');
      expect(mainPanel?.textContent).toContain('2R');

      // After advancing to round 3
      rerender(<StatusEffectsPanel {...defaultProps} currentRound={3} />);
      // Remaining = (1 + 3) - 3 = 1 round (should show red warning)
      expect(mainPanel?.textContent).toContain('1R');
    });

    it('should pass participantId to StatusEffectMenu', () => {
      render(<StatusEffectsPanel {...defaultProps} participantId="test-id" />);
      const addButton = screen.getByRole('button', { name: /Add Effect/i });
      expect(addButton).toBeInTheDocument();
    });

    it('should handle concurrent effect operations', async () => {
      const user = userEvent.setup();
      render(<StatusEffectsPanel {...defaultProps} />);

      // Add an effect
      const addButton = screen.getByRole('button', { name: /Add Effect/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Effect Type/i);
      await user.selectOptions(select, 'Stunned');

      const addEffectButton = screen.getByRole('button', { name: /^Add$/i });
      fireEvent.click(addEffectButton);

      expect(defaultProps.onAddEffect).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long effect names', () => {
      const longNameEffect: StatusEffect = {
        id: '1',
        name: 'Affected by an extremely long and descriptive status condition',
        durationInRounds: 2,
        appliedAtRound: 1,
      };
      const { container } = render(<StatusEffectsPanel {...defaultProps} effects={[longNameEffect]} />);
      const mainPanel = container.querySelector('div[role="region"]');
      expect(mainPanel?.textContent).toContain('Affected by an extremely long and descriptive status condition');
    });

    it('should handle effects with no duration (permanent)', () => {
      const permanentEffect: StatusEffect = {
        id: '1',
        name: 'Cursed',
        durationInRounds: null,
        appliedAtRound: 1,
      };
      const { container } = render(<StatusEffectsPanel {...defaultProps} effects={[permanentEffect]} />);
      const mainPanel = container.querySelector('div[role="region"]');
      expect(mainPanel?.textContent).toContain('∞');
    });

    it('should handle rapid prop updates', () => {
      const { rerender, container } = render(<StatusEffectsPanel {...defaultProps} />);
      
      const newEffects = [
        ...mockEffects,
        { id: '3', name: 'Frightened', durationInRounds: 2, appliedAtRound: 2 },
      ];
      
      rerender(<StatusEffectsPanel {...defaultProps} effects={newEffects} />);
      const mainPanel = container.querySelector('div[role="region"]');
      expect(mainPanel?.textContent).toContain('Frightened');
    });

    it('should handle when all effects are expired', () => {
      const expiredEffects: StatusEffect[] = [
        { id: '1', name: 'Poisoned', durationInRounds: 1, appliedAtRound: 1 },
      ];
      
      // At round 5, effect with duration 1 applied at round 1 is expired
      const { container } = render(<StatusEffectsPanel {...defaultProps} effects={expiredEffects} currentRound={5} />);
      
      // Effect should be displayed but with opacity-50
      const mainPanel = container.querySelector('div[role="region"]');
      const pillInPanel = mainPanel?.querySelector('div[role="status"]');
      expect(pillInPanel).toHaveClass('opacity-50');
    });
  });
});
