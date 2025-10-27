/**
 * Quick Actions Component Tests
 * Constitutional: TDD - Tests written before implementation
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { QuickActions } from '@/components/dashboard/QuickActions';

describe('QuickActions', () => {
  it('should render card title', () => {
    render(<QuickActions />);
    expect(screen.getByText('Quick Start')).toBeInTheDocument();
  });

  it('should render card description', () => {
    render(<QuickActions />);
    expect(screen.getByText(/Get started with your first D&D session/i)).toBeInTheDocument();
  });

  it('should render Create Party button', () => {
    render(<QuickActions />);
    expect(screen.getByRole('button', { name: /Create Party/i })).toBeInTheDocument();
  });

  it('should render Build Encounter button', () => {
    render(<QuickActions />);
    expect(screen.getByRole('button', { name: /Build Encounter/i })).toBeInTheDocument();
  });

  it('should render Add Creature button', () => {
    render(<QuickActions />);
    expect(screen.getByRole('button', { name: /Add Creature/i })).toBeInTheDocument();
  });

  it('should render Create Party as primary dragon variant', () => {
    render(<QuickActions />);
    const button = screen.getByRole('button', { name: /Create Party/i });
    expect(button).toHaveClass('bg-dragon-red');
  });

  it('should render Build Encounter and Add Creature as outline variant', () => {
    render(<QuickActions />);
    const buildButton = screen.getByRole('button', { name: /Build Encounter/i });
    const addButton = screen.getByRole('button', { name: /Add Creature/i });

    expect(buildButton).toHaveClass('border', 'border-input');
    expect(addButton).toHaveClass('border', 'border-input');
  });

  it('should render all buttons as full width', () => {
    render(<QuickActions />);
    const buttons = screen.getAllByRole('button');

    buttons.forEach((button) => {
      expect(button).toHaveClass('w-full');
    });
  });
});
