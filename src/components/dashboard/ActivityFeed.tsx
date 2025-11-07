import React from 'react'
import Link from 'next/link'

export type ActivityItem = {
  id: string
  type: string
  timestamp: string
  description: string
  targetUrl?: string
}

export function ActivityFeed({ items = [] }: { items?: ActivityItem[] }) {
  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it.id}>
          {it.targetUrl ? (
            <Link href={{ pathname: it.targetUrl }} className="text-sm text-primary">
              {it.description}
            </Link>
          ) : (
            <span className="text-sm">{it.description}</span>
          )}
        </li>
      ))}
    </ul>
  )
}

export default ActivityFeed
