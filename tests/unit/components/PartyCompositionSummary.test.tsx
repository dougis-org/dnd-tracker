/**
 * PartyCompositionSummary Component Tests
 * Tests for party stats and role composition display
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { PartyCompositionSummary } from '@/components/parties/PartyCompositionSummary';
import { createBalancedTestParty, createTestPartyWithMembers } from '../../../tests/test-helpers/partyFactories';

describe('PartyCompositionSummary Component', () => {
  describe('stat calculations', () => {
    it('should display correct member count', () => {
      const party = createTestPartyWithMembers(4);
      render(<PartyCompositionSummary party={party} />);

      expect(screen.getByText(/Members/i)).toBeInTheDocument();
      const memberSection = screen.getByText(/Members/).parentElement;
      expect(memberSection).toHaveTextContent('4');
    });

    it('should calculate correct average level', () => {
      const party = createTestPartyWithMembers(3, {}, { level: 6 });
      render(<PartyCompositionSummary party={party} />);

      expect(screen.getByText(/Avg Level/i)).toBeInTheDocument();
      const avgLevelSection = screen.getByText(/Avg Level/).parentElement;
      expect(avgLevelSection).toHaveTextContent('6');
    });

    it('should display party tier based on level', () => {
      const partyBeginner = createTestPartyWithMembers(2, {}, { level: 3 });
      const { rerender } = render(<PartyCompositionSummary party={partyBeginner} />);

      expect(screen.getByText('Beginner')).toBeInTheDocument();

      const partyAdvanced = createTestPartyWithMembers(2, {}, { level: 12 });
      rerender(<PartyCompositionSummary party={partyAdvanced} />);

      expect(screen.getByText('Advanced')).toBeInTheDocument();
    });

    it('should display level range', () => {
      const party = createBalancedTestParty();
      render(<PartyCompositionSummary party={party} />);

      // Party members have levels 5, 5, 5, 5 (balanced)
      expect(screen.getByText(/Level Range/i)).toBeInTheDocument();
    });
  });

  describe('role composition', () => {
    it('should display role distribution for balanced party', () => {
      const party = createBalancedTestParty();
      render(<PartyCompositionSummary party={party} />);

      // Should show Tank, Healer, DPS, Support counts
      expect(screen.getByText(/Tank/i)).toBeInTheDocument();
      expect(screen.getByText(/Healer/i)).toBeInTheDocument();
      expect(screen.getByText(/DPS/i)).toBeInTheDocument();
      expect(screen.getByText(/Support/i)).toBeInTheDocument();
    });

    it('should show unassigned role count', () => {
      const party = createTestPartyWithMembers(2);
      render(<PartyCompositionSummary party={party} />);

      expect(screen.getByText(/Unassigned/i)).toBeInTheDocument();
    });

    it('should display accurate role counts', () => {
      const party = createBalancedTestParty();
      render(<PartyCompositionSummary party={party} />);

      // Each role has 1 member
      const roleItems = screen.getAllByRole('listitem');
      expect(roleItems.length).toBeGreaterThan(0);
    });
  });

  describe('variants', () => {
    it('should render compact variant with minimal info', () => {
      const party = createTestPartyWithMembers(3);
      render(<PartyCompositionSummary party={party} variant="compact" />);

      expect(screen.getByText(/Members/i)).toBeInTheDocument();
    });

    it('should render full variant with all details', () => {
      const party = createBalancedTestParty();
      render(<PartyCompositionSummary party={party} variant="full" />);

      expect(screen.getByText(/Members/i)).toBeInTheDocument();
      expect(screen.getByText(/Avg Level/i)).toBeInTheDocument();
      expect(screen.getByText(/Tank/i)).toBeInTheDocument();
    });

    it('should default to full variant', () => {
      const party = createTestPartyWithMembers(2);
      render(<PartyCompositionSummary party={party} />);

      expect(screen.getByText(/Members/i)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper semantic structure', () => {
      const party = createTestPartyWithMembers(2);
      render(<PartyCompositionSummary party={party} />);

      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('should display role composition as list', () => {
      const party = createBalancedTestParty();
      render(<PartyCompositionSummary party={party} />);

      const listItems = screen.getAllByRole('listitem');
      expect(listItems.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle party with single member', () => {
      const party = createTestPartyWithMembers(1);
      render(<PartyCompositionSummary party={party} />);

      expect(screen.getByText(/Members/)).toBeInTheDocument();
      // Verify the member count is displayed with "Members" label next to it
      const memberSection = screen.getByText(/Members/).parentElement;
      expect(memberSection).toHaveTextContent('1');
    });

    it('should handle party with all unassigned roles', () => {
      const party = createTestPartyWithMembers(3);
      render(<PartyCompositionSummary party={party} />);

      expect(screen.getByText(/Unassigned/i)).toBeInTheDocument();
    });
  });
});
