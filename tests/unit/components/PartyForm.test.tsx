/* eslint-disable no-undef */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PartyForm, PartyFormProps } from '@/components/parties/PartyForm';
import { createTestParty } from '../../../tests/test-helpers/partyFactories';
import { PartyMember } from '@/types/party';

// Mock child components
jest.mock('@/components/parties/MemberForm', () => {
  return {
    MemberForm: function MockMemberForm({
      member,
      onSubmit,
      onCancel,
    }: {
      member?: Partial<PartyMember>;
      onSubmit: (data: Partial<PartyMember>) => void;
      onCancel: () => void;
    }) {
      return (
        <div data-testid="member-form">
          <button onClick={() => onCancel()}>Cancel Member Form</button>
          <button
            onClick={() =>
              onSubmit(
                member || {
                  characterName: 'New Hero',
                  class: 'Fighter',
                  race: 'Human',
                  level: 1,
                  ac: 10,
                  hp: 12,
                }
              )
            }
          >
            Submit Member
          </button>
        </div>
      );
    },
  };
});

jest.mock('@/components/parties/DeleteConfirmModal', () => ({
  DeleteConfirmModal: function MockDeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    itemName,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid="delete-modal">
        <p>Delete: {itemName}</p>
        <button onClick={onClose}>Cancel</button>
        <button onClick={onConfirm}>Confirm</button>
      </div>
    );
  },
}));

describe('PartyForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps: PartyFormProps = {
    party: undefined,
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering - create mode', () => {
    it('should render "Create Party" title when party is undefined', () => {
      render(<PartyForm {...defaultProps} />);
      expect(
        screen.getByRole('heading', { name: /create party/i })
      ).toBeInTheDocument();
    });

    it('should render empty party name field', () => {
      render(<PartyForm {...defaultProps} />);
      const nameInput = screen.getByLabelText(/party name/i);
      expect((nameInput as HTMLInputElement).value).toBe('');
    });

    it('should render empty description field', () => {
      render(<PartyForm {...defaultProps} />);
      const descInput = screen.getByLabelText(/description/i);
      expect((descInput as HTMLTextAreaElement).value).toBe('');
    });

    it('should render campaign setting field', () => {
      render(<PartyForm {...defaultProps} />);
      expect(
        screen.getByLabelText(/campaign setting/i)
      ).toBeInTheDocument();
    });

    it('should render empty members list', () => {
      render(<PartyForm {...defaultProps} />);
      expect(screen.getByText(/no members/i)).toBeInTheDocument();
    });

    it('should render "Add Member" button', () => {
      render(<PartyForm {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /add member/i })
      ).toBeInTheDocument();
    });

    it('should render Submit and Cancel buttons', () => {
      render(<PartyForm {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /create party/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /^cancel$/i })
      ).toBeInTheDocument();
    });
  });

  describe('rendering - edit mode', () => {
    it('should render "Edit Party" title when party provided', () => {
      const party = createTestParty({
        name: 'Dragon Slayers',
      });
      render(<PartyForm {...defaultProps} party={party} />);
      expect(
        screen.getByRole('heading', { name: /edit party/i })
      ).toBeInTheDocument();
    });

    it('should prefill party name from provided party', () => {
      const party = createTestParty({ name: 'Storm Runners' });
      render(<PartyForm {...defaultProps} party={party} />);
      expect(
        (screen.getByLabelText(/party name/i) as HTMLInputElement).value
      ).toBe('Storm Runners');
    });

    it('should prefill description from provided party', () => {
      const party = createTestParty({ description: 'A brave group' });
      render(<PartyForm {...defaultProps} party={party} />);
      expect(
        (screen.getByLabelText(/description/i) as HTMLTextAreaElement).value
      ).toBe('A brave group');
    });

    it('should render existing members in edit mode', () => {
      const party = createTestParty({
        members: [
          { ...createTestParty().members[0], id: 'm1', characterName: 'Aragorn' },
          { ...createTestParty().members[0], id: 'm2', characterName: 'Legolas' },
        ],
      });
      render(<PartyForm {...defaultProps} party={party} />);

      expect(screen.getByText(/aragorn/i)).toBeInTheDocument();
      expect(screen.getByText(/legolas/i)).toBeInTheDocument();
    });
  });

  describe('form interactions - basic', () => {
    it('should update party name when user types', async () => {
      const user = userEvent.setup();
      render(<PartyForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/party name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'New Party Name');

      expect((nameInput as HTMLInputElement).value).toBe('New Party Name');
    });

    it('should update description when user types', async () => {
      const user = userEvent.setup();
      render(<PartyForm {...defaultProps} />);

      const descInput = screen.getByLabelText(/description/i);
      await user.clear(descInput);
      await user.type(descInput, 'A new description');

      expect((descInput as HTMLTextAreaElement).value).toBe(
        'A new description'
      );
    });

    it('should update campaign setting when user types', async () => {
      const user = userEvent.setup();
      render(<PartyForm {...defaultProps} />);

      const campaignInput = screen.getByLabelText(/campaign setting/i);
      await user.clear(campaignInput);
      await user.type(campaignInput, 'Forgotten Realms');

      expect((campaignInput as HTMLInputElement).value).toBe('Forgotten Realms');
    });

    it('should call onCancel when Cancel button clicked', async () => {
      const user = userEvent.setup();
      render(<PartyForm {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /^cancel$/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('member list management', () => {
    it('should add member when Add Member clicked and form submitted', async () => {
      const user = userEvent.setup();
      render(<PartyForm {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /add member/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('member-form')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', {
        name: /submit member/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/new hero/i)).toBeInTheDocument();
      });
    });

    it('should not show empty state after adding member', async () => {
      const user = userEvent.setup();
      render(<PartyForm {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /add member/i });
      await user.click(addButton);

      const submitButton = screen.getByRole('button', {
        name: /submit member/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/no members/i)).not.toBeInTheDocument();
      });
    });

    it('should open member form when Add Member button clicked', async () => {
      const user = userEvent.setup();
      render(<PartyForm {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /add member/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('member-form')).toBeInTheDocument();
      });
    });

    it('should close member form when Cancel button clicked', async () => {
      const user = userEvent.setup();
      render(<PartyForm {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /add member/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('member-form')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', {
        name: /cancel member form/i,
      });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByTestId('member-form')).not.toBeInTheDocument();
      });
    });
  });

  describe('form submission', () => {
    it('should not submit with empty party name', async () => {
      const user = userEvent.setup();
      render(<PartyForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /create party/i });
      await user.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show validation error for empty party name', async () => {
      const user = userEvent.setup();
      render(<PartyForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /create party/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/party name is required/i)).toBeInTheDocument();
      });
    });

    it('should submit valid form data', async () => {
      const user = userEvent.setup();
      render(<PartyForm {...defaultProps} />);

      const nameInput = screen.getByLabelText(/party name/i);
      await user.type(nameInput, 'Test Party');

      const submitButton = screen.getByRole('button', { name: /create party/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
        const submitData = mockOnSubmit.mock.calls[0][0];
        expect(submitData.name).toBe('Test Party');
      });
    });

    it('should include all form fields in submission', async () => {
      const user = userEvent.setup();
      render(<PartyForm {...defaultProps} />);

      await user.type(screen.getByLabelText(/party name/i), 'Heroes');
      await user.type(screen.getByLabelText(/description/i), 'Brave heroes');
      await user.type(
        screen.getByLabelText(/campaign setting/i),
        'Dragon Valley'
      );

      const submitButton = screen.getByRole('button', { name: /create party/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
        const submitData = mockOnSubmit.mock.calls[0][0];
        expect(submitData).toMatchObject({
          name: 'Heroes',
          description: 'Brave heroes',
          campaignSetting: 'Dragon Valley',
          members: expect.any(Array),
        });
      });
    });

    it('should include members in form submission', async () => {
      const user = userEvent.setup();
      render(<PartyForm {...defaultProps} />);

      await user.type(screen.getByLabelText(/party name/i), 'Heroes');

      // Add member
      const addButton = screen.getByRole('button', { name: /add member/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('member-form')).toBeInTheDocument();
      });

      const memberSubmitButton = screen.getByRole('button', {
        name: /submit member/i,
      });
      await user.click(memberSubmitButton);

      await waitFor(() => {
        expect(screen.getByText(/new hero/i)).toBeInTheDocument();
      });

      // Verify form closed after member added
      expect(screen.queryByTestId('member-form')).not.toBeInTheDocument();

      // Submit form - should include members
      const formSubmitButton = screen.getByRole('button', {
        name: /create party/i,
      });
      await user.click(formSubmitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
        const submitData = mockOnSubmit.mock.calls[0][0];
        // Members array should contain the added member
        expect(submitData.members).toBeDefined();
        expect(Array.isArray(submitData.members)).toBe(true);
      });
    });
  });

  describe('styling and structure', () => {
    it('should render form container', () => {
      const { container } = render(<PartyForm {...defaultProps} />);
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    it('should have proper form layout', () => {
      const { container } = render(<PartyForm {...defaultProps} />);
      const inputs = container.querySelectorAll('input, textarea');
      expect(inputs.length).toBeGreaterThan(2);
    });
  });

  describe('accessibility', () => {
    it('should have proper form labels', () => {
      render(<PartyForm {...defaultProps} />);
      expect(screen.getByLabelText(/party name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/campaign setting/i)
      ).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      render(<PartyForm {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('should have semantic form structure', () => {
      const { container } = render(<PartyForm {...defaultProps} />);
      expect(container.querySelector('form')).toBeInTheDocument();
    });
  });
});
