import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatusEffectMenu from '@/components/combat/StatusEffectMenu';
import { StatusEffect } from '@/lib/schemas/combat';

describe('StatusEffectMenu Component', () => {
  const mockExistingEffects: StatusEffect[] = [
    {
      id: '1',
      name: 'Poisoned',
      durationInRounds: 3,
      appliedAtRound: 1,
    },
  ];

  const defaultProps = {
    _participantId: 'participant-1',
    existingEffects: mockExistingEffects,
    onAddEffect: jest.fn(),
    onRemoveEffect: jest.fn(),
    currentRound: 2,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render add effect button', () => {
      render(<StatusEffectMenu {...defaultProps} />);
      expect(screen.getByRole('button', { name: /Add Effect/i })).toBeInTheDocument();
    });

    it('should display existing effects', () => {
      render(<StatusEffectMenu {...defaultProps} />);
      expect(screen.getByText('Poisoned')).toBeInTheDocument();
    });

    it('should show empty state when no effects', () => {
      render(<StatusEffectMenu {...defaultProps} existingEffects={[]} />);
      expect(screen.getByText(/No effects/i)).toBeInTheDocument();
    });

    it('should render effects list region', () => {
      render(<StatusEffectMenu {...defaultProps} />);
      expect(screen.getByRole('region', { name: /Status Effects/i })).toBeInTheDocument();
    });
  });

  describe('Add Effect Dialog', () => {
    it('should show dialog when add button clicked', async () => {
      render(<StatusEffectMenu {...defaultProps} />);
      const addButton = screen.getByRole('button', { name: /Add Effect/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should display effect selection dropdown', async () => {
      render(<StatusEffectMenu {...defaultProps} />);
      const addButton = screen.getByRole('button', { name: /Add Effect/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/Effect Type/i)).toBeInTheDocument();
      });
    });

    it('should allow selecting an effect from dropdown', async () => {
      const user = userEvent.setup();
      render(<StatusEffectMenu {...defaultProps} />);
      const addButton = screen.getByRole('button', { name: /Add Effect/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Effect Type/i);
      await user.selectOptions(select, 'Stunned');
      expect(select).toHaveValue('Stunned');
    });

    it('should allow custom duration entry', async () => {
      const user = userEvent.setup();
      render(<StatusEffectMenu {...defaultProps} />);
      const addButton = screen.getByRole('button', { name: /Add Effect/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const durationInput = screen.getByPlaceholderText(/5/i);
      await user.clear(durationInput);
      await user.type(durationInput, '5');
      expect(durationInput).toHaveValue(5);
    });

    it('should allow permanent effect checkbox', async () => {
      const user = userEvent.setup();
      render(<StatusEffectMenu {...defaultProps} />);
      const addButton = screen.getByRole('button', { name: /Add Effect/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const permanentCheckbox = screen.getByRole('checkbox', { name: /Permanent effect/i });
      await user.click(permanentCheckbox);
      expect(permanentCheckbox).toBeChecked();
    });

    it('should disable duration input when permanent checked', async () => {
      const user = userEvent.setup();
      render(<StatusEffectMenu {...defaultProps} />);
      const addButton = screen.getByRole('button', { name: /Add Effect/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const permanentCheckbox = screen.getByRole('checkbox', { name: /Permanent effect/i });
      await user.click(permanentCheckbox);

      const durationInput = screen.getByPlaceholderText(/5/i) as HTMLInputElement;
      expect(durationInput.disabled).toBe(true);
    });

    it('should close dialog when cancel clicked', async () => {
      render(<StatusEffectMenu {...defaultProps} />);
      const addButton = screen.getByRole('button', { name: /Add Effect/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should not call onAddEffect when cancel clicked', async () => {
      render(<StatusEffectMenu {...defaultProps} />);
      const addButton = screen.getByRole('button', { name: /Add Effect/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(defaultProps.onAddEffect).not.toHaveBeenCalled();
    });

    it('should show error when adding effect without selection', async () => {
      render(<StatusEffectMenu {...defaultProps} />);
      const addButton = screen.getByRole('button', { name: /Add Effect/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const addEffectButton = screen.getByRole('button', { name: /^Add$/i });
      fireEvent.click(addEffectButton);

      await waitFor(() => {
        // Get all elements matching the error text, filter for visible ones in dialog
        const errors = screen.queryAllByText(/Please select an effect/i);
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Remove Effect', () => {
    it('should call onRemoveEffect when remove button clicked', async () => {
      render(<StatusEffectMenu {...defaultProps} />);
      const removeButton = screen.getByRole('button', { name: /Remove/i });
      fireEvent.click(removeButton);

      expect(defaultProps.onRemoveEffect).toHaveBeenCalledWith('1');
    });

    it('should display all effects from existingEffects array', () => {
      const multipleEffects = [
        { id: '1', name: 'Poisoned', durationInRounds: 2, appliedAtRound: 1 },
        { id: '2', name: 'Blinded', durationInRounds: 1, appliedAtRound: 1 },
      ];
      render(<StatusEffectMenu {...defaultProps} existingEffects={multipleEffects} />);
      expect(screen.getByText('Poisoned')).toBeInTheDocument();
      expect(screen.getByText('Blinded')).toBeInTheDocument();
    });
  });

  describe('Add Effect Functionality', () => {
    it('should call onAddEffect with correct effect data', async () => {
      const user = userEvent.setup();
      render(<StatusEffectMenu {...defaultProps} />);
      const addButton = screen.getByRole('button', { name: /Add Effect/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Effect Type/i);
      await user.selectOptions(select, 'Charmed');

      const durationInput = screen.getByPlaceholderText(/5/i);
      await user.clear(durationInput);
      await user.type(durationInput, '3');

      const addEffectButton = screen.getByRole('button', { name: /^Add$/i });
      fireEvent.click(addEffectButton);

      await waitFor(() => {
        expect(defaultProps.onAddEffect).toHaveBeenCalledWith({
          name: 'Charmed',
          durationInRounds: 3,
          appliedAtRound: 2,
        });
      });
    });

    it('should close dialog after adding effect', async () => {
      const user = userEvent.setup();
      render(<StatusEffectMenu {...defaultProps} />);
      const addButton = screen.getByRole('button', { name: /Add Effect/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Effect Type/i);
      await user.selectOptions(select, 'Restrained');

      const addEffectButton = screen.getByRole('button', { name: /^Add$/i });
      fireEvent.click(addEffectButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on add button', () => {
      render(<StatusEffectMenu {...defaultProps} />);
      const addButton = screen.getByRole('button', { name: /Add Effect/i });
      expect(addButton).toHaveAttribute('aria-label', 'Add Effect');
    });

    it('should have region landmark for effects list', () => {
      render(<StatusEffectMenu {...defaultProps} />);
      const region = screen.getByRole('region', { name: /Status Effects/i });
      expect(region).toBeInTheDocument();
    });

    it('should have live region for status messages', async () => {
      render(<StatusEffectMenu {...defaultProps} />);
      const liveRegions = screen.queryAllByRole('status');
      // StatusEffectMenu has its own aria-live region plus each StatusEffectPill is a status region
      // Just verify at least one has aria-live attribute  
      expect(liveRegions.some((region) => region.hasAttribute('aria-live'))).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple effects on same participant', () => {
      const multipleEffects: StatusEffect[] = [
        { id: '1', name: 'Poisoned', durationInRounds: 3, appliedAtRound: 1 },
        { id: '2', name: 'Blinded', durationInRounds: 1, appliedAtRound: 2 },
        { id: '3', name: 'Restrained', durationInRounds: null, appliedAtRound: 1 },
      ];
      render(<StatusEffectMenu {...defaultProps} existingEffects={multipleEffects} />);
      expect(screen.getByText('Poisoned')).toBeInTheDocument();
      expect(screen.getByText('Blinded')).toBeInTheDocument();
      expect(screen.getByText('Restrained')).toBeInTheDocument();
    });

    it('should use default duration of 1 when none specified', async () => {
      const user = userEvent.setup();
      render(<StatusEffectMenu {...defaultProps} />);
      const addButton = screen.getByRole('button', { name: /Add Effect/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Effect Type/i);
      await user.selectOptions(select, 'Frightened');

      // Don't enter duration, should default to 1
      const addEffectButton = screen.getByRole('button', { name: /^Add$/i });
      fireEvent.click(addEffectButton);

      await waitFor(() => {
        expect(defaultProps.onAddEffect).toHaveBeenCalledWith({
          name: 'Frightened',
          durationInRounds: 1,
          appliedAtRound: 2,
        });
      });
    });
  });
});
