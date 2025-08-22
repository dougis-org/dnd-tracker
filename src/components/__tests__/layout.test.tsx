import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Layout from '../Layout';
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

// Mock Clerk components
jest.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="clerk-provider">{children}</div>,
  SignInButton: () => <button>Sign In</button>,
  SignUpButton: () => <button>Sign Up</button>,
  SignedIn: ({ children }: { children: React.ReactNode }) => <div data-testid="signed-in">{children}</div>,
  SignedOut: ({ children }: { children: React.ReactNode }) => <div data-testid="signed-out">{children}</div>,
  UserButton: () => <div data-testid="user-button">User</div>,
}));

// Mock Navigation component
jest.mock('../Navigation', () => {
  return function MockNavigation() {
    return <nav data-testid="navigation" role="navigation">Navigation</nav>;
  };
});

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}));

function TestChild() {
  return <div data-testid="test-child">Test Child</div>;
}

describe('Layout', () => {
  it('renders with proper structure including header, navigation, and main content', () => {
    render(
      <ClerkProvider>
        <Layout>
          <TestChild />
        </Layout>
      </ClerkProvider>
    );
    
    expect(screen.getByRole('banner')).toBeInTheDocument(); // header
    expect(screen.getAllByTestId('navigation')).toHaveLength(2); // mobile and desktop nav
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('renders Clerk authentication components in header', () => {
    render(
      <ClerkProvider>
        <Layout>
          <TestChild />
        </Layout>
      </ClerkProvider>
    );
    
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByTestId('user-button')).toBeInTheDocument();
  });

  it('applies proper responsive classes', () => {
    render(
      <ClerkProvider>
        <Layout>
          <TestChild />
        </Layout>
      </ClerkProvider>
    );
    
    const layoutContainer = screen.getByTestId('layout-container');
    expect(layoutContainer).toHaveClass('min-h-screen');
  });

  it('renders navigation in sidebar on larger screens', () => {
    render(
      <ClerkProvider>
        <Layout>
          <TestChild />
        </Layout>
      </ClerkProvider>
    );
    
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveClass('hidden', 'md:block');
  });
});