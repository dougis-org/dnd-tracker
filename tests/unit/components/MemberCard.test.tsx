/**
 * MemberCard Component Tests
 * Tests for member display component with multiple variants
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberCard } from '@/components/parties/MemberCard';
import { createTestMember, createTestMemberWithRole } from '../../../tests/test-helpers/partyFactories';

describe('MemberCard Component', () => {
  describe('rendering', () => {
    it('should render member with basic info', () => {
      const member = createTestMember({
        characterName: 'Theron',
        class: 'Paladin',
        race: 'Half-Orc',
        level: 5,
      });

      render(<MemberCard member={member} />);

      expect(screen.getByText('Theron')).toBeInTheDocument();
      expect(screen.getByText(/Paladin/)).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should display AC and HP in detail variant', () => {
      const member = createTestMember({
        characterName: 'Elara',
        ac: 17,
        hp: 38,
      });

      render(<MemberCard member={member} variant="detail" />);

      expect(screen.getByText('17')).toBeInTheDocument();
      expect(screen.getByText('38')).toBeInTheDocument();
    });

    it('should display role badge when role assigned', () => {
      const member = createTestMemberWithRole('Tank', {
        characterName: 'Theron',
      });

      render(<MemberCard member={member} />);

      expect(screen.getByText('Tank')).toBeInTheDocument();
    });

    it('should display Unassigned when no role', () => {
      const member = createTestMember({
        characterName: 'NoRole Hero',
        role: undefined,
      });

      render(<MemberCard member={member} />);

      // Component should show Unassigned or question mark icon
      expect(screen.getByText('NoRole Hero')).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('should render detail variant with all stats', () => {
      const member = createTestMember({
        characterName: 'Kess',
        race: 'Halfling',
        ac: 15,
        hp: 28,
      });

      render(<MemberCard member={member} variant="detail" />);

      expect(screen.getByText(/Halfling/)).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('28')).toBeInTheDocument();
    });

    it('should render edit variant with delete button', () => {
      const member = createTestMember({ characterName: 'Bron' });
      const handleRemove = jest.fn();

      render(<MemberCard member={member} variant="edit" onRemove={handleRemove} />);

      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    });

    it('should render preview variant with minimal info', () => {
      const member = createTestMember({
        characterName: 'Preview Member',
        class: 'Rogue',
      });

      render(<MemberCard member={member} variant="preview" />);

      expect(screen.getByText('Preview Member')).toBeInTheDocument();
      expect(screen.getByText(/Rogue/)).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onRemove when remove button clicked', async () => {
      const user = userEvent.setup();
      const member = createTestMember({ characterName: 'Removable' });
      const handleRemove = jest.fn();

      render(<MemberCard member={member} variant="edit" onRemove={handleRemove} />);

      const removeButton = screen.getByRole('button', { name: /remove/i });
      await user.click(removeButton);

      expect(handleRemove).toHaveBeenCalledWith(member.id);
    });
  });

  describe('accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const member = createTestMember({ characterName: 'Accessible Member' });

      render(<MemberCard member={member} />);

      const heading = screen.getByRole('heading', { name: 'Accessible Member' });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible buttons in edit variant', () => {
      const member = createTestMember();
      const handleRemove = jest.fn();

      render(<MemberCard member={member} variant="edit" onRemove={handleRemove} />);

      const removeButton = screen.getByRole('button', { name: /remove/i });
      expect(removeButton).toHaveAttribute('aria-label');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      const member = createTestMember();
      const handleRemove = jest.fn();

      render(<MemberCard member={member} variant="edit" onRemove={handleRemove} />);

      const removeButton = screen.getByRole('button', { name: /remove/i });
      removeButton.focus();
      expect(removeButton).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(handleRemove).toHaveBeenCalled();
    });
  });

  describe('role badge colors', () => {
    it('should display Tank role with tank color', () => {
      const member = createTestMemberWithRole('Tank', { characterName: 'Tank Hero' });

      render(<MemberCard member={member} />);

      const roleBadge = screen.getByText('Tank');
      expect(roleBadge).toHaveClass('text-blue-800');
    });

    it('should display Healer role with healer color', () => {
      const member = createTestMemberWithRole('Healer', { characterName: 'Healer Hero' });

      render(<MemberCard member={member} />);

      const roleBadge = screen.getByText('Healer');
      expect(roleBadge).toHaveClass('text-green-800');
    });

    it('should display DPS role with dps color', () => {
      const member = createTestMemberWithRole('DPS', { characterName: 'DPS Hero' });

      render(<MemberCard member={member} />);

      const roleBadge = screen.getByText('DPS');
      expect(roleBadge).toHaveClass('text-red-800');
    });

    it('should display Support role with support color', () => {
      const member = createTestMemberWithRole('Support', { characterName: 'Support Hero' });

      render(<MemberCard member={member} />);

      const roleBadge = screen.getByText('Support');
      expect(roleBadge).toHaveClass('text-purple-800');
    });
  });

  describe('HP display', () => {
    it('should display HP bar with correct percentage', () => {
      const member = createTestMember({
        characterName: 'Member With HP',
        hp: 30,
      });

      const { container } = render(<MemberCard member={member} variant="detail" />);

      const hpBar = container.querySelector('[data-testid="hp-bar"]');
      expect(hpBar).toBeInTheDocument();
    });
  });
});
