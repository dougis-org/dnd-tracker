import React from 'react'
import Link from 'next/link'

export type QuickAction = { label: string; href: string }

export function QuickActions({ actions = [] }: { actions?: QuickAction[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((a) => (
        <Link key={a.href} href={{ pathname: a.href }}>
          <button className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950">
            {a.label}
          </button>
        </Link>
      ))}
    </div>
  )
}

export default QuickActions
