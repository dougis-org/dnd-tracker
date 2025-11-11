import Link from 'next/link'
import type { EncounterPayload } from '../../lib/api/encounters'

export interface EncounterCardProps {
  encounter: EncounterPayload
}

/**
 * Individual encounter card component
 * Displays encounter details in a card layout
 */
export default function EncounterCard({ encounter }: EncounterCardProps) {
  return (
    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
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
  )
}
