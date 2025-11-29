import React from 'react'
import Link from 'next/link'

export type QuickAction = { label: string; href: string }

export function QuickActions({ actions = [] }: { actions?: QuickAction[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((a) => (
        <Link key={a.href} href={{ pathname: a.href }}>
          <button className="w-full rounded-lg border px-3 py-2 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2">
            {a.label}
          </button>
        </Link>
      ))}
    </div>
  )
}

export default QuickActions
