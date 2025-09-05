'use client';

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import Navigation from './Navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background font-sans" data-testid="layout-container">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-muted/40 backdrop-blur">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className={cn("text-xl font-bold font-serif")}>D&D Combat Tracker</span>
            </Link>
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
        <aside className="hidden md:block md:w-64 md:border-r bg-muted/40" data-testid="sidebar">
          <div className="p-4">
            <Navigation aria-label="Main navigation" />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}