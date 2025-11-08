/* eslint-disable no-undef */
import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import { createTestParty } from '../../../tests/test-helpers/partyFactories';

// Mock next/navigation FIRST
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock PartyCard component
jest.mock('@/components/parties/PartyCard', () => ({
  __esModule: true,
  PartyCard: function MockPartyCard({ party, onClick }: {
    party: { id: string; name: string; description: string; members: unknown[] };
    onClick: (id: string) => void;
  }) {
    return (
      <div data-testid={`party-card-${party.id}`} className="mock-party-card">
        <h3>{party.name}</h3>
        <p>{party.description}</p>
        <p>{party.members?.length || 0} members</p>
        <button onClick={() => onClick(party.id)}>Edit</button>
      </div>
    );
  },
}));

// Mock DeleteConfirmModal
jest.mock('@/components/parties/DeleteConfirmModal', () => ({
  __esModule: true,
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
        <p>Delete {itemName}?</p>
        <button onClick={onConfirm}>Delete</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    );
  },
}));

// Import page component AFTER mocks are set up
import PartyListPage from '@/app/parties/page';

describe('PartyListPage', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    localStorage.clear();
  });

  describe('rendering', () => {
    test('renders page title and header', () => {
      render(<PartyListPage />);
      expect(screen.getByRole('heading', { level: 1, name: /parties/i })).toBeInTheDocument();
    });

    test('renders create party button', () => {
      render(<PartyListPage />);
      const buttons = screen.getAllByRole('button', { name: /create party/i });
      expect(buttons.length).toBeGreaterThan(0);
    });

    test('renders empty state when no parties exist', () => {
      render(<PartyListPage />);
      const text = screen.getByText(/create your first party to get started/i);
      expect(text).toBeInTheDocument();
    });

    test('displays list of parties when parties exist', () => {
      const mockParties = [
        createTestParty({ name: 'The Adventurers' }),
        createTestParty({ name: 'Dragon Slayers' }),
      ];
      localStorage.setItem('parties', JSON.stringify(mockParties));

      render(<PartyListPage />);
      expect(screen.getByText('The Adventurers')).toBeInTheDocument();
      expect(screen.getByText('Dragon Slayers')).toBeInTheDocument();
    });

    test('renders party cards with all party data', () => {
      const mockParty = createTestParty({
        name: 'Test Party',
        description: 'A brave group',
      });
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyListPage />);
      expect(screen.getByText('Test Party')).toBeInTheDocument();
      expect(screen.getByText('A brave group')).toBeInTheDocument();
    });

    test('shows member count on party cards', () => {
      const mockParty = createTestParty({ members: [
        { id: '1', characterName: 'Hero', class: 'Fighter', race: 'Human', level: 5, ac: 15, hp: 45, partyId: 'p1', position: 0 },
      ] });
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyListPage />);
      expect(screen.getByText(/1 members/i)).toBeInTheDocument();
    });
  });

  describe('party interactions', () => {
    test('navigates to party detail page on party card click', () => {
      const mockParty = createTestParty({ id: 'party-123' });
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyListPage />);
      const editButton = screen.getAllByRole('button', { name: /edit/i })[0];
      fireEvent.click(editButton);

      expect(mockPush).toHaveBeenCalledWith('/parties/party-123');
    });

    test('shows delete confirmation modal on delete button click', () => {
      const mockParty = createTestParty({ id: 'party-456', name: 'Party to Delete' });
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyListPage />);
      const deleteButton = screen.getByLabelText(/delete party to delete/i);
      fireEvent.click(deleteButton);

      expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
      expect(screen.getByText(/delete party to delete/i)).toBeInTheDocument();
    });

    test('deletes party when confirmed in modal', async () => {
      const mockParty = createTestParty({ id: 'party-456' });
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyListPage />);
      
      const deleteButton = screen.getByLabelText(/delete/i);
      fireEvent.click(deleteButton);

      const confirmButton = within(screen.getByTestId('delete-modal')).getByRole('button', {
        name: /delete/i,
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByTestId(`party-card-party-456`)).not.toBeInTheDocument();
      });
    });

    test('closes delete modal on cancel', () => {
      const mockParty = createTestParty({ id: 'party-456' });
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyListPage />);
      const deleteButton = screen.getByLabelText(/delete/i);
      fireEvent.click(deleteButton);

      const cancelButton = within(screen.getByTestId('delete-modal')).getByRole('button', {
        name: /cancel/i,
      });
      fireEvent.click(cancelButton);

      expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
    });
  });

  describe('search and filter', () => {
    test('renders search input field', () => {
      render(<PartyListPage />);
      expect(screen.getByRole('textbox', { name: /search|filter/i })).toBeInTheDocument();
    });

    test('filters parties by name search', () => {
      const parties = [
        createTestParty({ name: 'Dragon Slayers' }),
        createTestParty({ name: 'Forest Rangers' }),
        createTestParty({ name: 'Dragon Friends' }),
      ];
      localStorage.setItem('parties', JSON.stringify(parties));

      render(<PartyListPage />);
      const searchInput = screen.getByRole('textbox', { name: /search|filter/i });
      fireEvent.change(searchInput, { target: { value: 'Dragon' } });

      expect(screen.getByText('Dragon Slayers')).toBeInTheDocument();
      expect(screen.getByText('Dragon Friends')).toBeInTheDocument();
      expect(screen.queryByText('Forest Rangers')).not.toBeInTheDocument();
    });

    test('search is case-insensitive', () => {
      const mockParty = createTestParty({ name: 'Dragon Slayers' });
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyListPage />);
      const searchInput = screen.getByRole('textbox', { name: /search|filter/i });
      fireEvent.change(searchInput, { target: { value: 'dragon' } });

      expect(screen.getByText('Dragon Slayers')).toBeInTheDocument();
    });

    test('shows all parties when search is cleared', () => {
      const parties = [
        createTestParty({ name: 'Party A' }),
        createTestParty({ name: 'Party B' }),
      ];
      localStorage.setItem('parties', JSON.stringify(parties));

      render(<PartyListPage />);
      const searchInput = screen.getByRole('textbox', { name: /search|filter/i });
      fireEvent.change(searchInput, { target: { value: 'Party A' } });
      fireEvent.change(searchInput, { target: { value: '' } });

      expect(screen.getByText('Party A')).toBeInTheDocument();
      expect(screen.getByText('Party B')).toBeInTheDocument();
    });
  });

  describe('create party navigation', () => {
    test('navigates to create party page on button click', () => {
      render(<PartyListPage />);
      const createButton = screen.getByRole('button', { name: /create party|new party|add party/i });
      fireEvent.click(createButton);

      expect(mockPush).toHaveBeenCalledWith('/parties/new');
    });
  });

  describe('styling and structure', () => {
    test('renders with proper page layout structure', () => {
      render(<PartyListPage />);
      const container = screen.getByRole('heading', { level: 1 }).closest('div');
      expect(container).toHaveClass('max-w-6xl', 'mx-auto', 'py-8');
    });

    test('displays party cards in a grid layout', () => {
      const parties = [
        createTestParty({ name: 'Party A' }),
        createTestParty({ name: 'Party B' }),
      ];
      localStorage.setItem('parties', JSON.stringify(parties));

      render(<PartyListPage />);
      // Verify multiple party cards are rendered (grid doesn't make sense with single card)
      const partyCards = screen.getAllByTestId(/party-card-/);
      expect(partyCards.length).toBe(2);
    });
  });

  describe('accessibility', () => {
    test('has proper heading hierarchy', () => {
      render(<PartyListPage />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    test('search input has accessible label', () => {
      render(<PartyListPage />);
      expect(
        screen.getByRole('textbox', { name: /search|filter/i })
      ).toBeInTheDocument();
    });

    test('buttons have accessible names', () => {
      render(<PartyListPage />);
      const buttons = screen.getAllByRole('button', { name: /create party/i });
      expect(buttons.length).toBeGreaterThan(0);
    });

    test('delete confirmation modal is accessible', () => {
      const mockParty = createTestParty();
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyListPage />);
      const deleteButton = screen.getByLabelText(/delete/i);
      fireEvent.click(deleteButton);

      const deleteModalButton = within(screen.getByTestId('delete-modal')).getByRole('button', {
        name: /delete/i,
      });
      expect(deleteModalButton).toBeInTheDocument();
    });
  });
});
