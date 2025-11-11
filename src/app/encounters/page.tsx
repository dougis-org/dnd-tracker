'use client'

import Link from 'next/link'
import EncountersList from '../../components/encounters/EncountersList'

/**
 * T021: Encounters list page
 *
 * Main page for viewing all saved encounters
 */

export default function EncountersPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Encounters</h1>
        <Link
          href="/encounters/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          New Encounter
        </Link>
      </div>

      <EncountersList userId="user-001" />
    </div>
  )
}

