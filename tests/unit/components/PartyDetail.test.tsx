import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PartyDetail, { PartyDetailProps } from '@/components/parties/PartyDetail';
import { createTestParty, createTestMember } from '../../../tests/test-helpers/partyFactories';
import { Party, PartyMember } from '@/types/party';

// Mock child components
jest.mock('@/components/parties/PartyCompositionSummary', () => {
  return function MockPartyCompositionSummary({
    party,
    variant,
  }: {
    party: Party;
    variant: string;
  }) {
    return (
      <div data-testid="party-composition-summary">
        Composition {variant} - {party?.name}
      </div>
    );
  };
});

jest.mock('@/components/parties/MemberCard', () => {
  return function MockMemberCard({
    member,
    onEdit,
    onDelete,
  }: {
    member: PartyMember;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
  }) {
    return (
      <div data-testid="member-card">
        <span>{member?.characterName}</span>
        <button onClick={() => onEdit(member.id)}>Edit</button>
        <button onClick={() => onDelete(member.id)}>Delete</button>
      </div>
    );
  };
});

jest.mock('@/components/parties/DeleteConfirmModal', () => {
  return function MockDeleteConfirmModal({
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
      <div data-testid="delete-confirm-modal">
        <p>Confirm delete: {itemName}</p>
        <button onClick={onClose}>Cancel</button>
        <button onClick={onConfirm}>Confirm</button>
      </div>
    );
  };
});

describe('PartyDetail Component', () => {
  const mockOnEditMember = jest.fn();
  const mockOnDeleteMember = jest.fn();
  const mockOnBack = jest.fn();

  const defaultProps: PartyDetailProps = {
    party: createTestParty({
      name: 'Adventurers Guild',
      description: 'A group of brave heroes',
    }),
    onEditMember: mockOnEditMember,
    onDeleteMember: mockOnDeleteMember,
    onBack: mockOnBack,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render party name as heading', () => {
      render(<PartyDetail {...defaultProps} />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Adventurers Guild'
      );
    });

    it('should render party description', () => {
      render(<PartyDetail {...defaultProps} />);
      expect(screen.getByText('A group of brave heroes')).toBeInTheDocument();
    });

    it('should render back button', () => {
      render(<PartyDetail {...defaultProps} />);
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });

    it('should render PartyCompositionSummary in full variant', () => {
      render(<PartyDetail {...defaultProps} />);
      expect(screen.getByTestId('party-composition-summary')).toHaveTextContent(
        'Composition full'
      );
    });

    it('should render all members as MemberCards', () => {
      const partyWithMembers = createTestParty({
        members: [
          createTestMember({ characterName: 'Hero One' }),
          createTestMember({ characterName: 'Hero Two' }),
        ],
      });
      render(
        <PartyDetail {...defaultProps} party={partyWithMembers} />
      );

      const memberCards = screen.getAllByTestId('member-card');
      expect(memberCards).toHaveLength(2);
      expect(screen.getByText('Hero One')).toBeInTheDocument();
      expect(screen.getByText('Hero Two')).toBeInTheDocument();
    });

    it('should show empty state when no members', () => {
      const emptyParty = createTestParty({ members: [] });
      render(
        <PartyDetail {...defaultProps} party={emptyParty} />
      );

      expect(screen.getByText(/no members/i)).toBeInTheDocument();
    });
  });

  describe('member interactions', () => {
    it('should call onEditMember when edit button clicked', async () => {
      const user = userEvent.setup();
      const partyWithMembers = createTestParty({
        members: [
          createTestMember({ id: 'member-1', characterName: 'Hero' }),
        ],
      });

      render(
        <PartyDetail {...defaultProps} party={partyWithMembers} />
      );

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      expect(mockOnEditMember).toHaveBeenCalledWith('member-1');
    });

    it('should open delete confirmation when delete button clicked', async () => {
      const user = userEvent.setup();
      const partyWithMembers = createTestParty({
        members: [
          createTestMember({ id: 'member-1', characterName: 'Hero' }),
        ],
      });

      render(
        <PartyDetail {...defaultProps} party={partyWithMembers} />
      );

      const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('delete-confirm-modal')).toBeInTheDocument();
      });
    });

    it('should close delete modal on cancel', async () => {
      const user = userEvent.setup();
      const partyWithMembers = createTestParty({
        members: [
          createTestMember({ id: 'member-1', characterName: 'Hero' }),
        ],
      });

      render(
        <PartyDetail {...defaultProps} party={partyWithMembers} />
      );

      const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('delete-confirm-modal')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(
          screen.queryByTestId('delete-confirm-modal')
        ).not.toBeInTheDocument();
      });
    });

    it('should call onDeleteMember on confirmation', async () => {
      const user = userEvent.setup();
      const partyWithMembers = createTestParty({
        members: [
          createTestMember({ id: 'member-1', characterName: 'Hero' }),
        ],
      });

      render(
        <PartyDetail {...defaultProps} party={partyWithMembers} />
      );

      const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('delete-confirm-modal')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      expect(mockOnDeleteMember).toHaveBeenCalledWith('member-1');
    });
  });

  describe('back button', () => {
    it('should call onBack when back button clicked', async () => {
      const user = userEvent.setup();
      render(<PartyDetail {...defaultProps} />);

      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  describe('styling', () => {
    it('should have proper container structure', () => {
      const { container } = render(<PartyDetail {...defaultProps} />);
      const mainContainer = container.querySelector('main');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should render member list with proper layout', () => {
      const partyWithMembers = createTestParty({
        members: [
          createTestMember({ characterName: 'Hero One' }),
          createTestMember({ characterName: 'Hero Two' }),
        ],
      });
      const { container } = render(
        <PartyDetail {...defaultProps} party={partyWithMembers} />
      );

      const memberList = container.querySelector('[class*="space-y"]');
      expect(memberList).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<PartyDetail {...defaultProps} />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      render(<PartyDetail {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeVisible();
        expect(button).toHaveAccessibleName();
      });
    });

    it('should have semantic structure', () => {
      const { container } = render(<PartyDetail {...defaultProps} />);
      expect(container.querySelector('main')).toBeInTheDocument();
    });
  });
});
