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
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={it.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          {it.targetUrl ? (
            <Link href={{ pathname: it.targetUrl }} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              {it.description}
            </Link>
          ) : (
            <span className="text-sm ">{it.description}</span>
          )}
        </li>
      ))}
    </ul>
  )
}

export default ActivityFeed
