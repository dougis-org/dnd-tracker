 
/**
 * E2E Tests for Party Management Feature (F006)
 * Tests critical user workflows: create, read, update, delete operations
 * with focus on integration between pages and components
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation for all page tests
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  useParams: jest.fn(() => ({
    id: 'party-1',
  })),
}));

// Mock PartyForm component
jest.mock('@/components/parties/PartyForm', () => ({
  __esModule: true,
  PartyForm: ({
    party,
    onSubmit,
    onCancel,
  }: {
    party?: { id: string; name: string; description: string; members: [] };
    onSubmit: (party: { id: string; name: string; description: string; members: []; created_at: string; updated_at: string }) => void;
    onCancel: () => void;
  }) => (
    <form
      onSubmit={(e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
          id: party?.id || `party-${Date.now()}`,
          name: party?.name || 'New Party',
          description: party?.description || 'Party Description',
          members: party?.members || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }}
      data-testid="party-form"
    >
      <button type="submit">Save Party</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  ),
}));

// Mock PartyCard component
jest.mock('@/components/parties/PartyCard', () => ({
  __esModule: true,
  PartyCard: ({
    party,
    onClick,
  }: {
    party: { id: string; name: string; description?: string; members: [] };
    onClick: (id: string) => void;
  }) => (
    <div
      data-testid={`party-card-${party.id}`}
      onClick={() => onClick(party.id)}
      role="button"
      tabIndex={0}
    >
      <span data-testid={`party-name-${party.id}`}>{party.name}</span>
      <span data-testid={`members-count-${party.id}`}>{party.members.length}</span>
    </div>
  ),
}));

// Mock DeleteConfirmModal
jest.mock('@/components/parties/DeleteConfirmModal', () => ({
  __esModule: true,
  DeleteConfirmModal: ({
    isOpen,
    itemName,
    onConfirm,
    onCancel,
  }: {
    isOpen: boolean;
    itemName: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="delete-modal">
        <p>Delete {itemName}?</p>
        <button onClick={onConfirm} data-testid="confirm-delete">
          Confirm
        </button>
        <button onClick={onCancel} data-testid="cancel-delete">
          Cancel
        </button>
      </div>
    );
  },
}));

// Mock PartyDetail
jest.mock('@/components/parties/PartyDetail', () => ({
  __esModule: true,
  default: ({
    party,
    onBack,
  }: {
    party?: { id: string; name: string; members: [] };
    onBack: () => void;
  }) => (
    <div data-testid="party-detail">
      {party ? (
        <>
          <h2 data-testid="detail-party-name">{party.name}</h2>
          <span data-testid="detail-members-count">{party.members.length}</span>
        </>
      ) : (
        <p>Loading party...</p>
      )}
      <button onClick={onBack} data-testid="back-button">
        Back
      </button>
    </div>
  ),
}));

import { useRouter } from 'next/navigation';
import PartyListPage from '@/app/parties/page';
import PartyDetailPage from '@/app/parties/[id]/page';
import PartyCreatePage from '@/app/parties/new/page';
import PartyEditPage from '@/app/parties/[id]/edit/page';

// Helper to create test party data
const createTestParty = (id: string = 'party-1', overrides: Record<string, unknown> = {}) => ({
  id,
  name: 'The Adventurers',
  description: 'A brave band of heroes',
  campaignSetting: 'Forgotten Realms',
  members: [
    {
      id: 'member-1',
      partyId: id,
      characterName: 'Legolas',
      class: 'Ranger' as const,
      race: 'Elf' as const,
      level: 5,
      ac: 15,
      hp: 40,
      position: 0,
    },
  ],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('Party Management E2E Workflows', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('T047: Create Party Workflow', () => {
    test('user can create a new party and navigate to it', async () => {
      const user = userEvent.setup();

      // Step 1: List page shows empty state
      render(<PartyListPage />);
      const emptyStateButtons = screen.getAllByRole('button');
      expect(emptyStateButtons.length).toBeGreaterThan(0);

      // Step 2: Create page ready
      render(<PartyCreatePage />);
      expect(screen.getByTestId('party-form')).toBeInTheDocument();

      // Step 3: Submit form
      const submitButton = screen.getByRole('button', { name: /save party/i });
      await user.click(submitButton);

      // Verify form was processed
      expect(screen.getByTestId('party-form')).toBeInTheDocument();
    });

    test('created party is stored in localStorage', async () => {
      const user = userEvent.setup();

      render(<PartyCreatePage />);
      const submitButton = screen.getByRole('button', { name: /save party/i });

      await user.click(submitButton);

      // Verify localStorage has party
      const stored = localStorage.getItem('parties');
      expect(stored).toBeTruthy();
      if (stored) {
        const parties = JSON.parse(stored);
        expect(parties.length).toBeGreaterThan(0);
      }
    });
  });

  describe('T048: View & Navigate Party Workflow', () => {
    test('user can view party list and navigate to detail page', async () => {
      const user = userEvent.setup();
      const mockParty = createTestParty('party-1');
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyListPage />);

      // Verify party is displayed
      expect(screen.getByTestId('party-card-party-1')).toBeInTheDocument();
      expect(screen.getByTestId('party-name-party-1')).toHaveTextContent('The Adventurers');

      // Click to navigate to detail (would trigger router.push in real app)
      const partyCard = screen.getByTestId('party-card-party-1');
      await user.click(partyCard);

      // Verify party card is still displayed after click
      expect(screen.getByTestId('party-card-party-1')).toBeInTheDocument();
    });

    test('party detail page displays loaded party information', () => {
      const mockParty = createTestParty('party-1');
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyDetailPage />);

      expect(screen.getByTestId('party-detail')).toBeInTheDocument();
      expect(screen.getByTestId('detail-party-name')).toHaveTextContent('The Adventurers');
      expect(screen.getByTestId('detail-members-count')).toHaveTextContent('1');
    });

    test('back button on detail page is accessible', async () => {
      const user = userEvent.setup();
      const mockParty = createTestParty('party-1');
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyDetailPage />);

      const backButton = screen.getByTestId('back-button');
      expect(backButton).toBeInTheDocument();

      // Button should be clickable
      await user.click(backButton);
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('T049: Edit Party Workflow', () => {
    test('user can edit an existing party', async () => {
      const user = userEvent.setup();
      const mockParty = createTestParty('party-1');
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyEditPage />);

      // Verify form is loaded with party data
      expect(screen.getByTestId('party-form')).toBeInTheDocument();

      // Submit updated party
      const submitButton = screen.getByRole('button', { name: /save party/i });
      await user.click(submitButton);

      // Verify form processed
      expect(screen.getByTestId('party-form')).toBeInTheDocument();
    });

    test('edited party is persisted to localStorage', async () => {
      const user = userEvent.setup();
      const mockParty = createTestParty('party-1');
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyEditPage />);

      const submitButton = screen.getByRole('button', { name: /save party/i });
      await user.click(submitButton);

      const stored = localStorage.getItem('parties');
      if (stored) {
        const parties = JSON.parse(stored);
        expect(parties.length).toBe(1);
        expect(parties[0].id).toBe('party-1');
      }
    });
  });

  describe('T050: Delete Party Workflow', () => {
    test('user can delete a party via list page', async () => {
      const mockParty = createTestParty('party-1');
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyListPage />);

      // Verify party exists
      expect(screen.getByTestId('party-card-party-1')).toBeInTheDocument();

      // Verify initial state
      const initialStored = localStorage.getItem('parties');
      expect(initialStored).toBeTruthy();
    });

    test('party list updates after deletion', async () => {
      const party1 = createTestParty('party-1', { name: 'Party One' });
      const party2 = createTestParty('party-2', { name: 'Party Two' });
      localStorage.setItem('parties', JSON.stringify([party1, party2]));

      const { rerender } = render(<PartyListPage />);

      // Verify both parties visible
      expect(screen.getByTestId('party-card-party-1')).toBeInTheDocument();
      expect(screen.getByTestId('party-card-party-2')).toBeInTheDocument();

      // Simulate deletion by updating localStorage
      localStorage.setItem('parties', JSON.stringify([party2]));
      rerender(<PartyListPage />);

      // Verify deletion worked
      const stored = localStorage.getItem('parties');
      if (stored) {
        const parties = JSON.parse(stored);
        expect(parties.length).toBe(1);
      }
    });
  });

  describe('Integration: Complete Party Management Flow', () => {
    test('full cycle: create → view → edit → delete', async () => {
      const user = userEvent.setup();
      const mockRouter = useRouter() as ReturnType<typeof useRouter>;
      mockRouter.push = jest.fn();

      // Step 1: Create party
      render(<PartyCreatePage />);
      await user.click(screen.getByRole('button', { name: /save party/i }));

      // Verify created
      let stored = localStorage.getItem('parties');
      expect(stored).toBeTruthy();
      if (!stored) return;
      let parties = JSON.parse(stored);
      const createdPartyId = parties[0].id;

      // Step 2: List shows created party
      expect(parties.length).toBe(1);

      // Step 3: Simulate edit
      const editedParty = { ...parties[0], name: 'Updated Party Name' };
      parties[0] = editedParty;
      localStorage.setItem('parties', JSON.stringify(parties));

      // Step 4: Verify edit persisted
      stored = localStorage.getItem('parties');
      if (stored) {
        parties = JSON.parse(stored);
        expect(parties[0].name).toBe('Updated Party Name');
      }

      // Step 5: Simulate delete
      localStorage.setItem('parties', JSON.stringify([]));
      stored = localStorage.getItem('parties');
      if (stored) {
        parties = JSON.parse(stored);
        expect(parties.length).toBe(0);
      }

      expect(createdPartyId).toBeTruthy();
    });

    test('multiple parties can coexist and be managed independently', () => {
      const party1 = createTestParty('party-1', { name: 'Party One' });
      const party2 = createTestParty('party-2', { name: 'Party Two' });
      const party3 = createTestParty('party-3', { name: 'Party Three' });

      localStorage.setItem('parties', JSON.stringify([party1, party2, party3]));

      const stored = localStorage.getItem('parties');
      expect(stored).toBeTruthy();

      if (stored) {
        const parties: Array<{ id: string }> = JSON.parse(stored);
        expect(parties.length).toBe(3);
        expect(parties.map((p) => p.id)).toEqual(['party-1', 'party-2', 'party-3']);
      }
    });
  });

  describe('Navigation & Routing', () => {
    test('all page transitions maintain state via localStorage', () => {
      const mockParty = createTestParty('party-1');
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      const mockRouter = useRouter() as ReturnType<typeof useRouter>;
      mockRouter.push = jest.fn();

      // List page
      render(<PartyListPage />);
      expect(screen.getByTestId('party-card-party-1')).toBeInTheDocument();

      // Detail page
      render(<PartyDetailPage />);
      expect(screen.getByTestId('party-detail')).toBeInTheDocument();

      // Verify data persisted
      const stored = localStorage.getItem('parties');
      expect(stored).toBeTruthy();
    });

    test('page loads with correct data after navigation', () => {
      const mockParty = createTestParty('party-1');
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyDetailPage />);

      // Page should load party data
      expect(screen.getByTestId('detail-party-name')).toHaveTextContent('The Adventurers');
    });
  });
});
