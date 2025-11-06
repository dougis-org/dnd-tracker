import React from 'react'
import Link from 'next/link'

export type QuickAction = { label: string; href: string }

export function QuickActions({ actions = [] }: { actions?: QuickAction[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map((a) => (
        <Link key={a.href} href={{ pathname: a.href }} className="">
          <button className="w-full rounded border p-2 text-sm font-medium">{a.label}</button>
        </Link>
      ))}
    </div>
  )
}

export default QuickActions
