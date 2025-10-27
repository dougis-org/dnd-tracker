/**
 * Dashboard Header Component Tests
 * Constitutional: TDD - Tests written before implementation
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

describe('DashboardHeader', () => {
  it('should render dashboard title', () => {
    render(<DashboardHeader displayName="Test User" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should render personalized welcome message with user name', () => {
    render(<DashboardHeader displayName="John Doe" />);
    expect(
      screen.getByText(/Welcome back, John Doe/i)
    ).toBeInTheDocument();
  });

  it('should render default welcome message when no name provided', () => {
    render(<DashboardHeader displayName="" />);
    expect(
      screen.getByText(/Welcome back, Dungeon Master/i)
    ).toBeInTheDocument();
  });

  it('should render subtitle about adventures', () => {
    render(<DashboardHeader displayName="Test User" />);
    expect(
      screen.getByText(/Ready for your next adventure/i)
    ).toBeInTheDocument();
  });
});
