import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HPTracker from '@/components/combat/HPTracker';
import {
  createHPTrackerDefaultProps,
  createParticipantWithHP,
  createParticipantWithTempHP,
  createUnconsciousParticipant,
} from '@test-helpers/combatTestHelpers';

describe('HPTracker Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render participant name and HP display', () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      expect(screen.getByText(props.participant.name)).toBeInTheDocument();
      expect(
        screen.getByText(`${props.participant.currentHP} / ${props.participant.maxHP}`),
      ).toBeInTheDocument();
    });

    it('should display temp HP when present', () => {
      const props = createHPTrackerDefaultProps();
      const participant = createParticipantWithTempHP(10);

      render(<HPTracker {...props} participant={participant} />);

      const matches = screen.getAllByText(/Temp HP:/);
      expect(matches.length).toBeGreaterThan(0);
      expect(screen.getAllByText('10').length).toBeGreaterThan(0);
    });

    it('should show unconscious label when HP <= 0', () => {
      const props = createHPTrackerDefaultProps();
      const participant = createUnconsciousParticipant(-5);

      render(<HPTracker {...props} participant={participant} />);

      expect(screen.getByText(/Unconscious/)).toBeInTheDocument();
    });

    it('should apply unconscious styling when HP <= 0', () => {
      const props = createHPTrackerDefaultProps();
      const participant = createUnconsciousParticipant(0);

      const { container } = render(<HPTracker {...props} participant={participant} />);

      const hpSection = container.querySelector('[data-testid="hp-display"]');
      expect(hpSection).toHaveClass('opacity-50', 'grayscale');
    });

    it('should render damage and healing input fields', () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      expect(screen.getByPlaceholderText(/Damage/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Healing/)).toBeInTheDocument();
    });

    it('should render apply buttons for damage and healing', () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      expect(screen.getByRole('button', { name: /Apply Damage/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Apply Healing/ })).toBeInTheDocument();
    });
  });

  describe('Input Validation', () => {
    it('should not allow empty damage input', () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      const applyButton = screen.getByRole('button', { name: /Apply Damage/ });
      expect(applyButton).toBeDisabled();
    });

    it('should enable button when valid damage entered', async () => {
      const user = userEvent.setup();
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      const damageInput = screen.getByPlaceholderText(/Damage/);
      const applyButton = screen.getByRole('button', { name: /Apply Damage/ });

      await user.type(damageInput, '10');

      expect(applyButton).toBeEnabled();
    });

    it('should show error for negative damage', async () => {
      const user = userEvent.setup();
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      const damageInput = screen.getByPlaceholderText(/Damage/);
      const applyButton = screen.getByRole('button', { name: /Apply Damage/ });

      await user.type(damageInput, '-5');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText(/Damage must be greater than 0/)).toBeInTheDocument();
      });
    });

    it('should show error for zero damage', async () => {
      const user = userEvent.setup();
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      const damageInput = screen.getByPlaceholderText(/Damage/);
      const applyButton = screen.getByRole('button', { name: /Apply Damage/ });

      await user.type(damageInput, '0');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText(/Damage must be greater than 0/)).toBeInTheDocument();
      });
    });

    it('should not allow empty healing input', () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      const applyButton = screen.getByRole('button', { name: /Apply Healing/ });
      expect(applyButton).toBeDisabled();
    });

    it('should enable healing button with valid amount', async () => {
      const user = userEvent.setup();
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      const healingInput = screen.getByPlaceholderText(/Healing/);
      const applyButton = screen.getByRole('button', { name: /Apply Healing/ });

      await user.type(healingInput, '5');

      expect(applyButton).toBeEnabled();
    });

    it('should show error for negative healing', async () => {
      const user = userEvent.setup();
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      const healingInput = screen.getByPlaceholderText(/Healing/);
      const applyButton = screen.getByRole('button', { name: /Apply Healing/ });

      await user.type(healingInput, '-5');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText(/Healing must be greater than 0/)).toBeInTheDocument();
      });
    });

    it('should show error for zero healing', async () => {
      const user = userEvent.setup();
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      const healingInput = screen.getByPlaceholderText(/Healing/);
      const applyButton = screen.getByRole('button', { name: /Apply Healing/ });

      await user.type(healingInput, '0');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText(/Healing must be greater than 0/)).toBeInTheDocument();
      });
    });
  });

  describe('Damage Application', () => {
    it('should call onApplyDamage with correct amount', async () => {
      const user = userEvent.setup();
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      const damageInput = screen.getByPlaceholderText(/Damage/);
      const applyButton = screen.getByRole('button', { name: /Apply Damage/ });

      await user.type(damageInput, '15');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(props.onApplyDamage).toHaveBeenCalledWith(15);
      });
    });

    it('should clear input after applying damage', async () => {
      const user = userEvent.setup();
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      const damageInput = screen.getByPlaceholderText(/Damage/) as HTMLInputElement;
      const applyButton = screen.getByRole('button', { name: /Apply Damage/ });

      await user.type(damageInput, '10');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(damageInput.value).toBe('');
      });
    });

    it('should show success message after applying damage', async () => {
      const user = userEvent.setup();
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      const damageInput = screen.getByPlaceholderText(/Damage/);
      const applyButton = screen.getByRole('button', { name: /Apply Damage/ });

      await user.type(damageInput, '8');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText(/damage applied/i)).toBeInTheDocument();
      });
    });
  });

  describe('Healing Application', () => {
    it('should call onApplyHealing with correct amount', async () => {
      const user = userEvent.setup();
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      const healingInput = screen.getByPlaceholderText(/Healing/);
      const applyButton = screen.getByRole('button', { name: /Apply Healing/ });

      await user.type(healingInput, '20');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(props.onApplyHealing).toHaveBeenCalledWith(20);
      });
    });

    it('should clear input after applying healing', async () => {
      const user = userEvent.setup();
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      const healingInput = screen.getByPlaceholderText(/Healing/) as HTMLInputElement;
      const applyButton = screen.getByRole('button', { name: /Apply Healing/ });

      await user.type(healingInput, '10');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(healingInput.value).toBe('');
      });
    });

    it('should show success message after applying healing', async () => {
      const user = userEvent.setup();
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      const healingInput = screen.getByPlaceholderText(/Healing/);
      const applyButton = screen.getByRole('button', { name: /Apply Healing/ });

      await user.type(healingInput, '12');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText(/healing applied/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on HP display region', () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      const hpDisplay = screen.getByRole('region');
      expect(hpDisplay).toHaveAttribute('aria-label');
    });

    it('should have aria-label on inputs', () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      const damageInput = screen.getByPlaceholderText(/Damage/);
      const healingInput = screen.getByPlaceholderText(/Healing/);

      expect(damageInput).toHaveAttribute('aria-label');
      expect(healingInput).toHaveAttribute('aria-label');
    });

    it('should have aria-live region for status messages', async () => {
      const user = userEvent.setup();
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      const damageInput = screen.getByPlaceholderText(/Damage/);
      const applyButton = screen.getByRole('button', { name: /Apply Damage/ });

      await user.type(damageInput, '10');
      fireEvent.click(applyButton);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Edge Cases', () => {
    it('should handle damage greater than HP', async () => {
      const user = userEvent.setup();
      const props = createHPTrackerDefaultProps();
      const lowHPParticipant = createParticipantWithHP(5);

      render(<HPTracker {...props} participant={lowHPParticipant} />);

      const damageInput = screen.getByPlaceholderText(/Damage/);
      const applyButton = screen.getByRole('button', { name: /Apply Damage/ });

      await user.type(damageInput, '20');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(props.onApplyDamage).toHaveBeenCalledWith(20);
      });
    });

    it('should accept large healing amounts', async () => {
      const user = userEvent.setup();
      const props = createHPTrackerDefaultProps();
      const damagedParticipant = createParticipantWithHP(props.participant.maxHP - 5);

      render(<HPTracker {...props} participant={damagedParticipant} />);

      const healingInput = screen.getByPlaceholderText(/Healing/);
      const applyButton = screen.getByRole('button', { name: /Apply Healing/ });

      await user.type(healingInput, '100');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(props.onApplyHealing).toHaveBeenCalledWith(100);
      });
    });

    it('should handle float damage values', async () => {
      const user = userEvent.setup();
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      const damageInput = screen.getByPlaceholderText(/Damage/);
      const applyButton = screen.getByRole('button', { name: /Apply Damage/ });

      await user.type(damageInput, '3.5');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(props.onApplyDamage).toHaveBeenCalledWith(3.5);
      });
    });
  });
});
