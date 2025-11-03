'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAVIGATION_ITEMS, type NavigationItem } from '@/lib/navigation'
import { cn } from '@/lib/utils'

function isCurrent(pathname: string, item: NavigationItem) {
  if (item.href === '/') {
    return pathname === '/'
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

export function GlobalNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Primary" className="hidden md:flex">
      <ul className="flex items-center gap-1">
        {NAVIGATION_ITEMS.map((item) => {
          const active = isCurrent(pathname, item)

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  active
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
