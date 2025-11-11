'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { EncounterPayload } from '../../lib/api/encounters'
import adapter from '../../lib/api/encounters'
import EncounterCard from './EncounterCard'

/**
 * T021: Encounters list component
 *
 * Displays all saved encounters for the current user
 * - Shows encounter name, participant count, creation date
 * - Links to view/edit each encounter
 * - Shows "Create New" button to start new encounter
 */

export interface EncountersListProps {
  userId?: string
}

export default function EncountersList({ userId = 'user-001' }: EncountersListProps) {
  const [encounters, setEncounters] = useState<EncounterPayload[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadEncounters = async () => {
      try {
        setIsLoading(true)
        const data = await adapter.list(userId)
        setEncounters(data)
        setError(null)
      } catch (err) {
        console.error('Failed to load encounters:', err)
        setError('Failed to load encounters')
      } finally {
        setIsLoading(false)
      }
    }

    loadEncounters()
  }, [userId])

  if (isLoading) {
    return <div className="text-center py-8">Loading encounters...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>
  }

  return (
    <div>
      {encounters.length === 0 ? (
        <div className="text-center py-8">
          <p className="mb-4">No encounters yet. Create one to get started!</p>
          <Link href="/encounters/new" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Create New Encounter
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {encounters.map((encounter) => (
            <EncounterCard key={encounter.id} encounter={encounter} />
          ))}
        </div>
      )}
    </div>
  )
}
