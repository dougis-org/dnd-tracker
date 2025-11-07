import React from 'react'
import { MainLayout } from '@/components/layouts/MainLayout'
import { StatCard } from '@/components/dashboard/StatCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'

const widgets = [
  { id: 'active_parties', label: 'Active Parties', value: 3, detailUrl: '/parties' },
  { id: 'encounters', label: 'Encounters', value: 1200 },
]

const actions = [
  { label: 'New Party', href: '/parties/new' },
  { label: 'Start Session', href: '/combat' },
]

const recentActivity = [
  { id: 'a1', type: 'session', timestamp: '2025-11-05T12:34:56Z', description: "Combat 'Goblin Ambush' ended", targetUrl: '/combat/123' },
]

export default function DashboardPage() {
  return (
    <MainLayout>
      <section className="container py-8">
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {widgets.map((w) => (
            <StatCard key={w.id} label={w.label} value={w.value as number | string} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
            <ActivityFeed items={recentActivity} />
          </div>
          <aside>
            <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
            <QuickActions actions={actions} />
          </aside>
        </div>
      </section>
    </MainLayout>
  )
}

