'use client';

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background" data-testid="layout-container">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">D&D Combat Tracker</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
        {/* Mobile Navigation */}
        <div className="md:hidden border-t px-4 py-2">
<Navigation aria-label="Mobile navigation" />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar for larger screens */}
        <aside className="hidden md:block md:w-64 md:border-r bg-card" data-testid="sidebar">
          <div className="p-4">
            <Navigation />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}