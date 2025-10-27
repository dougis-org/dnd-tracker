/**
 * Settings Tabs Component
 * Tabbed navigation for settings sections with active state indicator
 * Constitutional: Max 100 lines
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { name: 'Profile', href: '/settings/profile' },
  { name: 'Preferences', href: '/settings/preferences' },
  { name: 'Account', href: '/settings/account' },
];

export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-6">
      <div role="tablist" className="border-b border-border">
        <nav className="-mb-px flex space-x-8" aria-label="Settings">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;

            return (
              <Link
                key={tab.name}
                href={tab.href}
                role="tab"
                aria-selected={isActive}
                className={cn(
                  'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground'
                )}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
