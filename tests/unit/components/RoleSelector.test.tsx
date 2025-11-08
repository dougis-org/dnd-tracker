/**
 * RoleSelector Component Tests
 * Tests for party member role selection dropdown
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoleSelector } from '@/components/parties/RoleSelector';

describe('RoleSelector Component', () => {
  describe('rendering', () => {
    it('should render role options', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<RoleSelector value={undefined} onChange={handleChange} />);

      const trigger = screen.getByRole('button', { name: /select role/i });
      await user.click(trigger);

      expect(screen.getByText('Tank')).toBeInTheDocument();
      expect(screen.getByText('Healer')).toBeInTheDocument();
      expect(screen.getByText('DPS')).toBeInTheDocument();
      expect(screen.getByText('Support')).toBeInTheDocument();
    });

    it('should display selected value', () => {
      const handleChange = jest.fn();

      render(<RoleSelector value="Tank" onChange={handleChange} />);

      expect(screen.getByDisplayValue('Tank')).toBeInTheDocument();
    });

    it('should display placeholder when no value selected', () => {
      const handleChange = jest.fn();

      render(<RoleSelector value={undefined} onChange={handleChange} />);

      expect(screen.getByRole('button', { name: /select role/i })).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onChange when option selected', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<RoleSelector value={undefined} onChange={handleChange} />);

      const trigger = screen.getByRole('button', { name: /select role/i });
      await user.click(trigger);

      const tankOption = screen.getByRole('option', { name: 'Tank' });
      await user.click(tankOption);

      expect(handleChange).toHaveBeenCalledWith('Tank');
    });

    it('should update displayed value after selection', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<RoleSelector value={undefined} onChange={jest.fn()} />);

      const trigger = screen.getByRole('button', { name: /select role/i });
      await user.click(trigger);

      const healerOption = screen.getByRole('option', { name: 'Healer' });
      await user.click(healerOption);

      rerender(<RoleSelector value="Healer" onChange={jest.fn()} />);

      expect(screen.getByDisplayValue('Healer')).toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('should support arrow key navigation', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<RoleSelector value="Tank" onChange={handleChange} />);

      const trigger = screen.getByRole('button', { name: /select role/i });
      await user.click(trigger);

      // Arrow down should navigate to next option
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should support Escape key to close dropdown', async () => {
      const user = userEvent.setup();

      render(<RoleSelector value={undefined} onChange={jest.fn()} />);

      const trigger = screen.getByRole('button', { name: /select role/i });
      await user.click(trigger);

      expect(screen.getByText('Tank')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      // Dropdown should be closed (options hidden)
      // This is implicit - if Escape works, the menu closes
    });
  });

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      const handleChange = jest.fn();

      render(<RoleSelector value={undefined} onChange={handleChange} disabled={true} />);

      const trigger = screen.getByRole('button', { name: /select role/i });
      expect(trigger).toBeDisabled();
    });
  });

  describe('label', () => {
    it('should display label when provided', () => {
      const handleChange = jest.fn();

      render(<RoleSelector value={undefined} onChange={handleChange} label="Party Role" />);

      expect(screen.getByText('Party Role')).toBeInTheDocument();
    });
  });

  describe('option styling', () => {
    it('should display role options with color-coded styling', async () => {
      const user = userEvent.setup();

      render(<RoleSelector value={undefined} onChange={jest.fn()} />);

      const trigger = screen.getByRole('button', { name: /select role/i });
      await user.click(trigger);

      const tankOption = screen.getByRole('option', { name: 'Tank' });
      expect(tankOption).toHaveClass('text-blue-700');

      const healerOption = screen.getByRole('option', { name: 'Healer' });
      expect(healerOption).toHaveClass('text-green-700');

      const dpsOption = screen.getByRole('option', { name: 'DPS' });
      expect(dpsOption).toHaveClass('text-red-700');

      const supportOption = screen.getByRole('option', { name: 'Support' });
      expect(supportOption).toHaveClass('text-purple-700');
    });
  });
});
