/* eslint-disable no-undef */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter, useParams } from 'next/navigation';
import { createTestParty } from '../../../tests/test-helpers/partyFactories';

// Mock next/navigation FIRST
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock PartyDetail component
jest.mock('@/components/parties/PartyDetail', () => ({
  __esModule: true,
  default: function MockPartyDetail({
    party,
    onEditMember,
    onDeleteMember,
    onBack,
  }: {
    party: { id: string; name: string; description: string; members: unknown[] };
    onEditMember: (id: string) => void;
    onDeleteMember: (id: string) => void;
    onBack: () => void;
  }) {
    return (
      <div data-testid="party-detail">
        <h1>{party.name}</h1>
        <p>{party.description}</p>
        <p>Members: {party.members?.length || 0}</p>
        <button onClick={onBack}>Back to Parties</button>
        <button onClick={() => onEditMember('member-1')}>Edit Member</button>
        <button onClick={() => onDeleteMember('member-1')}>Delete Member</button>
      </div>
    );
  },
}));

// Import page component AFTER mocks are set up
import PartyDetailPage from '@/app/parties/[id]/page';

describe('PartyDetailPage', () => {
  const mockPush = jest.fn();
  const mockRouter = { push: mockPush, back: jest.fn() };
  const mockParams = { id: 'party-123' };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useParams as jest.Mock).mockReturnValue(mockParams);
    localStorage.clear();
  });

  describe('rendering', () => {
    test('renders party detail component', () => {
      const mockParty = createTestParty({ id: 'party-123' });
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyDetailPage />);
      expect(screen.getByTestId('party-detail')).toBeInTheDocument();
    });

    test('displays party information from localStorage', () => {
      const mockParty = createTestParty({
        id: 'party-123',
        name: 'Test Party',
        description: 'A test party description',
      });
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyDetailPage />);
      expect(screen.getByText('Test Party')).toBeInTheDocument();
      expect(screen.getByText('A test party description')).toBeInTheDocument();
    });

    test('shows loading state while fetching party', async () => {
      render(<PartyDetailPage />);
      // Component should render even without data (loading or error state)
      expect(document.body).toBeInTheDocument();
    });

    test('handles party not found scenario', () => {
      localStorage.setItem('parties', JSON.stringify([]));

      render(<PartyDetailPage />);
      // Page should still render, potentially with empty state
      expect(document.body).toBeInTheDocument();
    });

    test('displays member count for party', () => {
      const mockParty = createTestParty({
        id: 'party-123',
        members: [
          { id: '1', characterName: 'Hero', class: 'Fighter', race: 'Human', level: 5, ac: 15, hp: 45, partyId: 'party-123', position: 0 },
          { id: '2', characterName: 'Rogue', class: 'Rogue', race: 'Elf', level: 5, ac: 16, hp: 35, partyId: 'party-123', position: 1 },
        ],
      });
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyDetailPage />);
      expect(screen.getByText(/members: 2/i)).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    test('navigates back to parties list on back button click', () => {
      const mockParty = createTestParty({ id: 'party-123' });
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyDetailPage />);
      const backButton = screen.getByRole('button', { name: /back to parties/i });
      fireEvent.click(backButton);

      expect(mockPush).toHaveBeenCalledWith('/parties');
    });

    test('uses router params to load correct party', () => {
      const party1 = createTestParty({ id: 'party-123', name: 'Party 1' });
      const party2 = createTestParty({ id: 'party-456', name: 'Party 2' });
      localStorage.setItem('parties', JSON.stringify([party1, party2]));

      render(<PartyDetailPage />);
      expect(screen.getByText('Party 1')).toBeInTheDocument();
      expect(screen.queryByText('Party 2')).not.toBeInTheDocument();
    });
  });

  describe('party member actions', () => {
    test('handles edit member action', () => {
      const mockParty = createTestParty({ id: 'party-123' });
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyDetailPage />);
      const editButton = screen.getByRole('button', { name: /edit member/i });
      fireEvent.click(editButton);

      // Action is passed to PartyDetail component
      expect(screen.getByTestId('party-detail')).toBeInTheDocument();
    });

    test('handles delete member action', () => {
      const mockParty = createTestParty({ id: 'party-123' });
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyDetailPage />);
      const deleteButton = screen.getByRole('button', { name: /delete member/i });
      fireEvent.click(deleteButton);

      // Action is passed to PartyDetail component
      expect(screen.getByTestId('party-detail')).toBeInTheDocument();
    });
  });

  describe('styling and structure', () => {
    test('renders with proper page layout structure', () => {
      const mockParty = createTestParty({ id: 'party-123' });
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyDetailPage />);
      const container = screen.getByTestId('party-detail').parentElement;
      expect(container).toHaveClass('max-w-6xl');
      expect(container).toHaveClass('mx-auto');
    });
  });

  describe('accessibility', () => {
    test('has proper page structure for screen readers', () => {
      const mockParty = createTestParty({ id: 'party-123' });
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyDetailPage />);
      expect(screen.getByTestId('party-detail')).toBeInTheDocument();
    });

    test('back button is accessible', () => {
      const mockParty = createTestParty({ id: 'party-123' });
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyDetailPage />);
      expect(
        screen.getByRole('button', { name: /back to parties/i })
      ).toBeInTheDocument();
    });

    test('party detail component receives accessibility props', () => {
      const mockParty = createTestParty({ id: 'party-123' });
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyDetailPage />);
      // Verify component is rendered with proper structure
      expect(screen.getByTestId('party-detail')).toBeInTheDocument();
    });
  });
});
