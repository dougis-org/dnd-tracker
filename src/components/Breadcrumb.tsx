'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { buildBreadcrumbSegments } from '@/lib/navigation'
import { cn } from '@/lib/utils'

export interface BreadcrumbProps {
  className?: string
}

export function Breadcrumb({ className }: BreadcrumbProps) {
  const pathname = usePathname()
  const segments = buildBreadcrumbSegments(pathname)

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-sm text-muted-foreground', className)}
    >
      <ol className="flex flex-wrap items-center gap-2">
        {segments.map((segment, index) => {
          const isFirst = index === 0
          const isCurrent = segment.href === undefined

          return (
            <li key={`${segment.label}-${index}`} className="flex items-center gap-2">
              {!isFirst && <span aria-hidden className="text-muted-foreground/60">/</span>}
              {segment.href ? (
                <Link
                  className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  href={segment.href}
                >
                  {segment.label}
                </Link>
              ) : (
                <span aria-current={isCurrent ? 'page' : undefined} className="font-medium text-foreground">
                  {segment.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
