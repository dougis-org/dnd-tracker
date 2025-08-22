import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Clerk components to avoid ESM issues in Jest
// Set global flag to indicate Clerk components should be mocked.
// This is required for Jest to avoid ESM import issues with @clerk/nextjs.
globalThis.__CLERK_MOCK__ = true;
jest.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="clerk-provider">{children}</div>,
  SignInButton: () => <button>Sign In</button>,
  SignUpButton: () => <button>Sign Up</button>,
  SignedIn: ({ children }: { children: React.ReactNode }) => <div data-testid="signed-in">{children}</div>,
  SignedOut: ({ children }: { children: React.ReactNode }) => <div data-testid="signed-out">{children}</div>,
  UserButton: () => <div data-testid="user-button">User</div>,
}));

import RootLayout from '../app/layout';

function TestChild() {
  return <div data-testid="test-child">Test Child</div>;
}

describe('RootLayout', () => {
  it('renders Clerk UI components in the header', () => {
    render(<RootLayout>{<TestChild />}</RootLayout>);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByTestId('user-button')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<RootLayout>{<TestChild />}</RootLayout>);
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });
});
