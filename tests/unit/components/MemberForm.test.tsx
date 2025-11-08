import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberForm } from '@/components/parties/MemberForm';
import { createTestMember } from '../../../tests/test-helpers/partyFactories';

/**
 * MemberForm Component Tests
 * Tests for member add/edit form with validation
 */

describe('MemberForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render form title for adding member', () => {
      render(<MemberForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/Add Member/i);
    });

    it('should render form title for editing member', () => {
      const member = createTestMember({ characterName: 'Theron' });

      render(<MemberForm member={member} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/Edit Member/i);
    });

    it('should render character name field', () => {
      render(<MemberForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText(/Character Name/i)).toBeInTheDocument();
    });

    it('should render class select field', () => {
      render(<MemberForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText(/^Class$/i)).toBeInTheDocument();
    });

    it('should render race select field', () => {
      render(<MemberForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText(/^Race$/i)).toBeInTheDocument();
    });

    it('should render level field', () => {
      render(<MemberForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const levelLabel = screen.getByText(/Level/);
      const levelInput = levelLabel.parentElement?.querySelector('input[type="number"]');
      expect(levelInput).toBeInTheDocument();
    });

    it('should prefill form fields when editing', () => {
      const member = createTestMember({
        characterName: 'Elara',
        class: 'Cleric',
        race: 'Elf',
        level: 5,
        ac: 16,
        hp: 28,
      });

      render(<MemberForm member={member} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByDisplayValue('Elara')).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('should call onSubmit with form data when submitted', async () => {
      const user = userEvent.setup();

      render(<MemberForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await user.type(screen.getByLabelText(/Character Name/i), 'Kess');
      await user.selectOptions(screen.getByLabelText(/^Class$/i), 'Rogue');
      await user.selectOptions(screen.getByLabelText(/^Race$/i), 'Halfling');

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          characterName: 'Kess',
          class: 'Rogue',
          race: 'Halfling',
        })
      );
    });

    it('should not submit form with empty required fields', async () => {
      const user = userEvent.setup();

      render(<MemberForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show validation error for empty character name', async () => {
      const user = userEvent.setup();

      render(<MemberForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      expect(screen.getByText(/Character name is required/i)).toBeInTheDocument();
    });

    it('should show validation error for missing class', async () => {
      const user = userEvent.setup();

      render(<MemberForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await user.type(screen.getByLabelText(/Character Name/i), 'Test');

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      expect(screen.getByText(/Class is required/i)).toBeInTheDocument();
    });

    it('should accept valid form submission', async () => {
      const user = userEvent.setup();

      render(<MemberForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await user.type(screen.getByLabelText(/Character Name/i), 'Valid Character');
      await user.selectOptions(screen.getByLabelText(/^Class$/i), 'Fighter');
      await user.selectOptions(screen.getByLabelText(/^Race$/i), 'Human');

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  describe('form actions', () => {
    it('should call onCancel when Cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(<MemberForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should reset form when Reset button is clicked', async () => {
      const user = userEvent.setup();

      render(<MemberForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await user.type(screen.getByLabelText(/Character Name/i), 'TestName');
      expect(screen.getByDisplayValue('TestName')).toBeInTheDocument();

      const resetButton = screen.getByRole('button', { name: /Reset/i });
      await user.click(resetButton);

      expect(screen.queryByDisplayValue('TestName')).not.toBeInTheDocument();
    });
  });

  describe('field options', () => {
    it('should have all class options', async () => {
      render(<MemberForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const classSelect = screen.getByLabelText(/Class/i) as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const options = Array.from(classSelect.options).map((opt: any) => opt.value);

      expect(options).toContain('Barbarian');
      expect(options).toContain('Bard');
      expect(options).toContain('Cleric');
      expect(options).toContain('Druid');
      expect(options).toContain('Fighter');
      expect(options).toContain('Monk');
      expect(options).toContain('Paladin');
      expect(options).toContain('Ranger');
      expect(options).toContain('Rogue');
      expect(options).toContain('Sorcerer');
      expect(options).toContain('Warlock');
      expect(options).toContain('Wizard');
    });

    it('should have all race options', async () => {
      render(<MemberForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raceSelect = screen.getByLabelText(/Race/i) as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const options = Array.from(raceSelect.options).map((opt: any) => opt.value);

      expect(options).toContain('Human');
      expect(options).toContain('Elf');
      expect(options).toContain('Dwarf');
      expect(options).toContain('Halfling');
      expect(options).toContain('Dragonborn');
      expect(options).toContain('Gnome');
      expect(options).toContain('Half-Orc');
      expect(options).toContain('Half-Elf');
      expect(options).toContain('Tiefling');
    });
  });

  describe('accessibility', () => {
    it('should have proper form labels', () => {
      render(<MemberForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText(/Character Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Class$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Race$/i)).toBeInTheDocument();
    });

    it('should have semantic form structure', () => {
      render(<MemberForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const form = screen.getByRole('button', { name: /Submit/i }).closest('form');
      expect(form).toBeInTheDocument();
    });

    it('should display error messages with role alert', async () => {
      const user = userEvent.setup();

      render(<MemberForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      const errorMessage = screen.getByText(/Character name is required/i);
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });
  });
});
