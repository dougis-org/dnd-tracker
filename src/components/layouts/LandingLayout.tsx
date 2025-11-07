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
 * Note: The app layout already provides the main#main-content element,
 * so we only provide a wrapper div here to avoid duplicate main landmarks.
 *
 * @param children - React components to render within the layout
 * @returns Rendered layout with footer and content area
 */
export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Content area - note: app layout provides the main#main-content wrapper */}
      <div className="flex-1 w-full">{children}</div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
