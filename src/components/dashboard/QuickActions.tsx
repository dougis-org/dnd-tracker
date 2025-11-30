'use client';

/**
 * Quick Actions Component
 *
 * Shows CTA buttons for quick navigation.
 * Supports both:
 * - Feature 004: Dashboard page (with configurable actions prop)
 * - Feature 016: Real data dashboard (default hardcoded Feature 016 routes)
 */

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export interface QuickActionItem {
  label: string;
  href: string;
  icon?: string;
}

interface QuickActionsProps {
  /**
   * Optional custom actions to display.
   * If not provided, defaults to Feature 016 actions (characters/parties/encounters).
   */
  actions?: QuickActionItem[];
}

// Feature 016 default quick actions
const FEATURE_016_ACTIONS: QuickActionItem[] = [
  {
    label: 'New Character',
    href: '/characters/new',
    icon: '👤',
  },
  {
    label: 'New Party',
    href: '/parties/new',
    icon: '👥',
  },
  {
    label: 'New Encounter',
    href: '/encounters/new',
    icon: '⚔️',
  },
];

/**
 * Quick actions buttons for creating new resources
 */
export function QuickActions({ actions = FEATURE_016_ACTIONS }: QuickActionsProps): React.ReactElement {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {actions.map((action) => (
        <Link key={action.href} href={action.href}>
          <Button variant="outline" className="w-full h-auto py-3">
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
          </Button>
        </Link>
      ))}
    </div>
  );
}

export default QuickActions;
