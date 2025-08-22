'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Route } from 'next';

interface NavigationItem {
  name: string;
  href: Route;
}

const navigationItems: NavigationItem[] = [
  { name: 'Dashboard', href: '/' },
  { name: 'Characters', href: '/characters' },
  { name: 'Parties', href: '/parties' },
  { name: 'Encounters', href: '/encounters' },
  { name: 'Combat', href: '/combat' },
];

interface NavigationProps {
  className?: string;
}

export default function Navigation({ className }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav className={cn('flex flex-col space-y-2', className)} role="navigation">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground',
              isActive 
                ? 'bg-primary text-primary-foreground active' 
                : 'text-muted-foreground'
            )}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}