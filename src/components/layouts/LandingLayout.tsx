import React from 'react';
import { Footer } from '@/components/Footer';

interface LandingLayoutProps {
  children: React.ReactNode;
}

/**
 * LandingLayout - Wrapper component for landing page
 *
 * Provides consistent spacing, header/footer layout for the landing page.
 * Uses the app's Footer component and provides standardized spacing around content.
 *
 * @param children - React components to render within the layout
 * @returns Rendered layout with header/footer and content area
 */
export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - can be extended with navigation as needed */}
      <header className="w-full" />

      {/* Main content area with padding */}
      <main className="flex-1 w-full">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
