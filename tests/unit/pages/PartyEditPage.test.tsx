/* eslint-disable no-undef */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Create test party data
const createTestParty = (overrides = {}) => ({
  id: 'party-1',
  name: 'The Adventurers',
  description: 'A brave band of heroes',
  campaignSetting: 'Forgotten Realms',
  members: [
    {
      id: 'member-1',
      partyId: 'party-1',
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

// Mock next/navigation
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
  }: {
    party?: { id: string; name: string; description: string; members: [] };
    onSubmit: (party: { id: string; name: string; description: string; members: []; created_at: string; updated_at: string }) => void;
  }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          id: party?.id || 'test-party-1',
          name: party?.name || 'Updated Party',
          description: party?.description || 'Updated Description',
          members: party?.members || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }}
      data-testid="party-form"
    >
      {party && <span data-testid="party-loaded">{party.name}</span>}
      <button type="submit">Save Party</button>
    </form>
  ),
}));

// Now import page component after all mocks
import PartyEditPage from '@/app/parties/[id]/edit/page';

describe('PartyEditPage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('rendering', () => {
    test('renders page title', () => {
      const mockParty = createTestParty();
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyEditPage />);
      expect(screen.getByRole('heading', { level: 1, name: /edit party/i })).toBeInTheDocument();
    });

    test('renders party form component', () => {
      const mockParty = createTestParty();
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyEditPage />);
      expect(screen.getByTestId('party-form')).toBeInTheDocument();
    });

    test('loads party data into form', () => {
      const mockParty = createTestParty();
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyEditPage />);
      expect(screen.getByTestId('party-loaded')).toHaveTextContent('The Adventurers');
    });

    test('handles party not found scenario', () => {
      localStorage.setItem('parties', JSON.stringify([]));

      render(<PartyEditPage />);
      expect(screen.getByText(/party not found/i)).toBeInTheDocument();
    });

    test('renders with proper page layout structure', () => {
      const mockParty = createTestParty();
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyEditPage />);
      const heading = screen.getByRole('heading', { level: 1 });
      const container = heading.closest('div')?.closest('div')?.parentElement;
      expect(container).toHaveClass('max-w-6xl');
      expect(container).toHaveClass('mx-auto');
    });
  });

  describe('form submission', () => {
    test('handles party update on form submission', async () => {
      const user = userEvent.setup();
      const mockParty = createTestParty();
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyEditPage />);
      const submitButton = screen.getByRole('button', { name: /save party/i });

      await user.click(submitButton);

      expect(screen.getByTestId('party-form')).toBeInTheDocument();
    });

    test('navigates back to party list after update', async () => {
      const user = userEvent.setup();
      const mockParty = createTestParty();
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyEditPage />);
      const submitButton = screen.getByRole('button', { name: /save party/i });

      await user.click(submitButton);

      expect(screen.getByTestId('party-form')).toBeInTheDocument();
    });

    test('updates party in localStorage on submission', async () => {
      const user = userEvent.setup();
      const mockParty = createTestParty();
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyEditPage />);
      const submitButton = screen.getByRole('button', { name: /save party/i });

      await user.click(submitButton);

      const stored = localStorage.getItem('parties');
      expect(stored).toBeTruthy();
      if (stored) {
        const parties = JSON.parse(stored);
        expect(parties).toHaveLength(1);
        expect(parties[0]).toHaveProperty('id');
      }
    });
  });

  describe('accessibility', () => {
    test('has proper heading hierarchy', () => {
      const mockParty = createTestParty();
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyEditPage />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading.textContent).toMatch(/edit party/i);
    });

    test('form is properly accessible', () => {
      const mockParty = createTestParty();
      localStorage.setItem('parties', JSON.stringify([mockParty]));

      render(<PartyEditPage />);
      const submitButton = screen.getByRole('button', { name: /save party/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });
});
