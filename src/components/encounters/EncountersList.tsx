'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { EncounterPayload } from '../../lib/api/encounters'
import adapter from '../../lib/api/encounters'

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
            <div
              key={encounter.id}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Link
                    href={`/encounters/${encounter.id}`}
                    className="text-lg font-semibold text-blue-600 hover:underline"
                  >
                    {encounter.name}
                  </Link>
                  {encounter.description && (
                    <p className="text-gray-600 text-sm mt-1">{encounter.description}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>
                      {encounter.participants.length}{' '}
                      {encounter.participants.length === 1 ? 'participant' : 'participants'}
                    </span>
                    {encounter.participants.length > 0 && (
                      <span>
                        {encounter.participants.reduce((sum, p) => sum + p.quantity, 0)} total
                      </span>
                    )}
                    {encounter.created_at && (
                      <span>
                        Created{' '}
                        {new Date(encounter.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/encounters/${encounter.id}`}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
