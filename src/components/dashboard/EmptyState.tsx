'use client';

/**
 * Empty State Component (T015)
 *
 * Displays when user has no resources created (all counts = 0).
 * Shows:
 * - Welcome message with user name
 * - Three CTA buttons to create first resources
 *
 * Feature 016: User Dashboard with Real Data
 */

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  /**
   * User's display name for personalized welcome message
   */
  userName: string;
}

/**
 * Empty state component shown when user has no resources
 */
function EmptyState({ userName }: EmptyStateProps): React.ReactElement {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            Welcome, {userName}! 🎲
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-gray-600">
            Start your adventure by creating your first character, party, or encounter.
          </p>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Get Started</h3>
            <div className="grid grid-cols-1 gap-3">
              <Link href="/characters/new">
                <Button variant="default" className="w-full">
                  <span className="mr-2">👤</span>
                  Create Character
                </Button>
              </Link>
              <Link href="/parties/new">
                <Button variant="outline" className="w-full">
                  <span className="mr-2">👥</span>
                  Create Party
                </Button>
              </Link>
              <Link href="/encounters/new">
                <Button variant="outline" className="w-full">
                  <span className="mr-2">⚔️</span>
                  Create Encounter
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-xs text-center text-gray-500">
            You can create multiple resources depending on your subscription tier.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default EmptyState;
