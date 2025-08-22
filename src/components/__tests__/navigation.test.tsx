import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navigation from '../Navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}));

describe('Navigation', () => {
  it('renders the main navigation menu', () => {
    render(<Navigation />);
    
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders core navigation links', () => {
    render(<Navigation />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Characters')).toBeInTheDocument();
    expect(screen.getByText('Parties')).toBeInTheDocument();
    expect(screen.getByText('Encounters')).toBeInTheDocument();
    expect(screen.getByText('Combat')).toBeInTheDocument();
  });

  it('renders navigation links with correct hrefs', () => {
    render(<Navigation />);
    
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Characters' })).toHaveAttribute('href', '/characters');
    expect(screen.getByRole('link', { name: 'Parties' })).toHaveAttribute('href', '/parties');
    expect(screen.getByRole('link', { name: 'Encounters' })).toHaveAttribute('href', '/encounters');
    expect(screen.getByRole('link', { name: 'Combat' })).toHaveAttribute('href', '/combat');
  });

  it('indicates active navigation item', () => {
    const { usePathname } = require('next/navigation');
    usePathname.mockReturnValue('/characters');
    
    render(<Navigation />);
    
    expect(screen.getByRole('link', { name: 'Characters' })).toHaveClass('active');
  });
});