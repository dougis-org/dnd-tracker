import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HPTracker from '@/components/combat/HPTracker';
import {
  createHPTrackerDefaultProps,
  createParticipantWithHP,
  createParticipantWithTempHP,
  createUnconsciousParticipant,
} from '@test-helpers/combatTestHelpers';
import {
  testInputValidationError,
  testInputSubmission,
  testInputClearsAfterSubmission,
  testSubmissionShowsMessage,
  testButtonDisabledWhenEmpty,
  testButtonEnabledWithInput,
  testAccessibilityAttribute,
} from '@test-helpers/testPatterns';

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

  describe('Damage Input Validation', () => {
    it('should not allow empty damage input', () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      testButtonDisabledWhenEmpty(/Apply Damage/);
    });

    it('should enable apply button when valid damage entered', async () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      await testButtonEnabledWithInput(/Damage/, /Apply Damage/, '10');
    });

    it('should show error for negative damage', async () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      await testInputValidationError(
        'negative damage',
        /Damage/,
        /Apply Damage/,
        '-5',
        /Damage must be greater than 0/,
      );
    });

    it('should show error for zero damage', async () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      await testInputValidationError(
        'zero damage',
        /Damage/,
        /Apply Damage/,
        '0',
        /Damage must be greater than 0/,
      );
    });
  });

  describe('Healing Input Validation', () => {
    it('should not allow empty healing input', () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      testButtonDisabledWhenEmpty(/Apply Healing/);
    });

    it('should enable healing button when valid amount entered', async () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      await testButtonEnabledWithInput(/Healing/, /Apply Healing/, '5');
    });

    it('should show error for negative healing', async () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      await testInputValidationError(
        'negative healing',
        /Healing/,
        /Apply Healing/,
        '-5',
        /Healing must be greater than 0/,
      );
    });

    it('should show error for zero healing', async () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      await testInputValidationError(
        'zero healing',
        /Healing/,
        /Apply Healing/,
        '0',
        /Healing must be greater than 0/,
      );
    });
  });

  describe('Damage Application', () => {
    it('should call onApplyDamage with correct damage amount', async () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      await testInputSubmission(/Damage/, /Apply Damage/, '15', props.onApplyDamage, 15);
    });

    it('should clear damage input after applying', async () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      await testInputClearsAfterSubmission(/Damage/, /Apply Damage/, '10');
    });

    it('should show success message after applying damage', async () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      await testSubmissionShowsMessage(/Damage/, /Apply Damage/, '8', /damage applied/i);
    });
  });

  describe('Healing Application', () => {
    it('should call onApplyHealing with correct healing amount', async () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      await testInputSubmission(/Healing/, /Apply Healing/, '20', props.onApplyHealing, 20);
    });

    it('should clear healing input after applying', async () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      await testInputClearsAfterSubmission(/Healing/, /Apply Healing/, '10');
    });

    it('should show success message after applying healing', async () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      await testSubmissionShowsMessage(/Healing/, /Apply Healing/, '12', /healing applied/i);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on HP display region', () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      const hpDisplay = screen.getByRole('region');
      expect(hpDisplay).toHaveAttribute('aria-label');
    });

    it('should have aria-label on damage input', () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      testAccessibilityAttribute(/Damage/, 'aria-label');
    });

    it('should have aria-label on healing input', () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      testAccessibilityAttribute(/Healing/, 'aria-label');
    });

    it('should have aria-live region for status messages', async () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      // Apply damage to trigger status message
      const user = userEvent.setup();
      const input = screen.getByPlaceholderText(/Damage/);
      const button = screen.getByRole('button', { name: /Apply Damage/ });

      await user.type(input, '10');
      fireEvent.click(button);

      // Now the status region should exist with aria-live="polite"
      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Edge Cases', () => {
    it('should handle damage greater than current HP', async () => {
      const props = createHPTrackerDefaultProps();
      const lowHPParticipant = createParticipantWithHP(5);

      render(<HPTracker {...props} participant={lowHPParticipant} />);

      await testInputSubmission(/Damage/, /Apply Damage/, '20', props.onApplyDamage, 20);
    });

    it('should accept large healing amounts', async () => {
      const props = createHPTrackerDefaultProps();
      const damagedParticipant = createParticipantWithHP(props.participant.maxHP - 5);

      render(<HPTracker {...props} participant={damagedParticipant} />);

      await testInputSubmission(/Healing/, /Apply Healing/, '100', props.onApplyHealing, 100);
    });

    it('should handle float damage values', async () => {
      const props = createHPTrackerDefaultProps();
      render(<HPTracker {...props} />);

      await testInputSubmission(/Damage/, /Apply Damage/, '3.5', props.onApplyDamage, 3.5);
    });
  });
});
