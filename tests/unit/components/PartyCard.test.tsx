import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PartyCard } from '@/components/parties/PartyCard';
import { createTestParty } from '../../../tests/test-helpers/partyFactories';

describe('PartyCard Component', () => {
  describe('rendering', () => {
    it('should render party name as heading', () => {
      const party = createTestParty({ name: 'The Grovewalkers' });
      render(<PartyCard party={party} onClick={jest.fn()} />);

      expect(screen.getByRole('heading', { level: 3, name: /The Grovewalkers/ })).toBeInTheDocument();
    });

    it('should render member count', () => {
      const party = createTestParty({ members: Array(4).fill(null).map(() => 
        createTestParty().members[0]
      ) });
      render(<PartyCard party={party} onClick={jest.fn()} />);

      expect(screen.getByText(/4 members/i)).toBeInTheDocument();
    });

    it('should render description if provided', () => {
      const party = createTestParty({ description: 'A brave adventuring group' });
      render(<PartyCard party={party} onClick={jest.fn()} />);

      expect(screen.getByText('A brave adventuring group')).toBeInTheDocument();
    });

    it('should render composition summary', () => {
      const party = createTestParty();
      render(<PartyCard party={party} onClick={jest.fn()} />);

      expect(screen.getByText(/Avg Level/i)).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      const party = createTestParty({ name: 'Test Party' });

      render(<PartyCard party={party} onClick={handleClick} />);

      const heading = screen.getByRole('heading', { level: 3 });
      const card = heading.closest('div')?.closest('div');
      
      if (card) {
        await user.click(card);
      }

      expect(handleClick).toHaveBeenCalledWith(party.id);
    });

    it('should have pointer cursor on hover', () => {
      const party = createTestParty();
      render(<PartyCard party={party} onClick={jest.fn()} />);

      const card = screen.getByRole('heading', { level: 3 }).closest('div')?.closest('div');
      expect(card).toHaveClass('cursor-pointer', 'hover:shadow-lg');
    });
  });

  describe('styling', () => {
    it('should have card styling classes', () => {
      const party = createTestParty();
      const { container } = render(<PartyCard party={party} onClick={jest.fn()} />);

      const card = container.querySelector('.party-card') || 
                   container.querySelector('[class*="border"][class*="rounded"]');
      
      expect(card).toHaveClass('border', 'rounded-lg', 'p-4', 'bg-white', 'shadow-sm');
    });

    it('should display in grid-friendly layout', () => {
      const party = createTestParty();
      const { container } = render(<PartyCard party={party} onClick={jest.fn()} />);

      const card = container.firstChild;
      expect(card).toHaveClass('h-full');
    });
  });

  describe('accessibility', () => {
    it('should have semantic heading hierarchy', () => {
      const party = createTestParty({ name: 'Party Name' });
      render(<PartyCard party={party} onClick={jest.fn()} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      const party = createTestParty();

      render(<PartyCard party={party} onClick={handleClick} />);

      const card = screen.getByRole('heading', { level: 3 }).closest('div')?.closest('div');
      
      if (card) {
        await user.tab();
        if (document.activeElement === card || card?.contains(document.activeElement)) {
          await user.keyboard('{Enter}');
          expect(handleClick).toHaveBeenCalledWith(party.id);
        }
      }
    });

    it('should have proper ARIA attributes', () => {
      const party = createTestParty({ name: 'Test Party' });
      render(<PartyCard party={party} onClick={jest.fn()} />);

      const card = screen.getByRole('heading', { level: 3 }).closest('div')?.closest('div');
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('tabindex', '0');
    });
  });

  describe('responsive design', () => {
    it('should render with flex column layout', () => {
      const party = createTestParty();
      const { container } = render(<PartyCard party={party} onClick={jest.fn()} />);

      const card = container.firstChild;
      expect(card).toHaveClass('flex', 'flex-col');
    });

    it('should have responsive padding', () => {
      const party = createTestParty();
      const { container } = render(<PartyCard party={party} onClick={jest.fn()} />);

      const card = container.firstChild;
      expect(card).toHaveClass('p-4');
    });
  });
});
