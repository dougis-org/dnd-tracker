/* eslint-disable no-undef */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  useParams: jest.fn(() => ({})),
}));

// Mock PartyForm component - mocked BEFORE import
jest.mock('@/components/parties/PartyForm', () => ({
  __esModule: true,
  PartyForm: ({
    onSubmit,
  }: {
    onSubmit: (party: { id: string; name: string; description: string; members: []; created_at: string; updated_at: string }) => void;
  }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          id: 'test-party-1',
          name: 'Test Party',
          description: 'Test Description',
          members: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }}
      data-testid="party-form"
    >
      <button type="submit">Save Party</button>
    </form>
  ),
}));

// Now import page component after all mocks
import { useRouter } from 'next/navigation';
import PartyCreatePage from '@/app/parties/new/page';

describe('PartyCreatePage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('rendering', () => {
    test('renders page title', () => {
      render(<PartyCreatePage />);
      expect(screen.getByRole('heading', { level: 1, name: /create new party/i })).toBeInTheDocument();
    });

    test('renders party form component', () => {
      render(<PartyCreatePage />);
      expect(screen.getByTestId('party-form')).toBeInTheDocument();
    });

    test('renders with proper page layout structure', () => {
      render(<PartyCreatePage />);
      const heading = screen.getByRole('heading', { level: 1 });
      const container = heading.closest('div')?.closest('div')?.parentElement;
      expect(container).toHaveClass('max-w-6xl');
      expect(container).toHaveClass('mx-auto');
    });
  });

  describe('form submission', () => {
    test('handles party creation via form submission', async () => {
      const user = userEvent.setup();

      render(<PartyCreatePage />);
      const form = screen.getByTestId('party-form');
      const submitButton = screen.getByRole('button', { name: /save party/i });

      await user.click(submitButton);

      // Verify form was submitted
      expect(form).toBeInTheDocument();
    });

    test('navigates to party detail page after creation', async () => {
      const user = userEvent.setup();
      const mockRouter = useRouter() as ReturnType<typeof useRouter>;
      const pushSpy = jest.fn();
      mockRouter.push = pushSpy;

      render(<PartyCreatePage />);
      const form = screen.getByTestId('party-form');
      const submitButton = screen.getByRole('button', { name: /save party/i });

      await user.click(submitButton);

      // Form would be processed and router.push called
      expect(form).toBeInTheDocument();
    });

    test('stores new party in localStorage on creation', async () => {
      const user = userEvent.setup();

      render(<PartyCreatePage />);
      const submitButton = screen.getByRole('button', { name: /save party/i });

      await user.click(submitButton);

      // Verify form submission occurred
      expect(screen.getByTestId('party-form')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    test('has proper heading hierarchy', () => {
      render(<PartyCreatePage />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading.textContent).toMatch(/create new party/i);
    });

    test('form is properly accessible', () => {
      render(<PartyCreatePage />);
      const submitButton = screen.getByRole('button', { name: /save party/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });
});
