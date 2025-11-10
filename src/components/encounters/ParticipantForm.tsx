'use client'

import type { ParticipantDoc } from '../../types/encounter'

interface ParticipantFormProps {
  index: number
  participant: ParticipantDoc
  onUpdate: (index: number, updates: Partial<ParticipantDoc>) => void
  onRemove: (index: number) => void
  errors: Array<{ field: string; message: string }>
}

/**
 * T019: Participant form component for editing individual participants
 *
 * Allows editing:
 * - Type (monster, party_member, custom)
 * - Display name
 * - Quantity
 * - HP
 * - Initiative (optional)
 */

export default function ParticipantForm({
  index,
  participant,
  onUpdate,
  onRemove,
  errors,
}: ParticipantFormProps) {
  const getFieldError = (suffix: string) => {
    const err = errors.find((e) => e.field === `participants.${index}${suffix}`)
    return err?.message
  }

  return (
    <div className="mb-4 p-4 border rounded-md bg-gray-50">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium">Participant {index + 1}</h3>
        {index > 0 && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Type */}
        <div>
          <label htmlFor={`type-${index}`} className="block text-sm font-medium mb-1">
            Type
          </label>
          <select
            id={`type-${index}`}
            name={`participants.${index}.type`}
            value={participant.type}
            onChange={(e) => {
              const newType = e.target.value as ParticipantDoc['type']
              onUpdate(index, { type: newType })
            }}
            className="w-full px-2 py-1 border rounded text-sm"
          >
            <option value="monster">Monster</option>
            <option value="party_member">Party Member</option>
            <option value="custom">Custom NPC</option>
          </select>
        </div>

        {/* Display Name */}
        <div>
          <label htmlFor={`displayName-${index}`} className="block text-sm font-medium mb-1">
            Name *
          </label>
          <input
            id={`displayName-${index}`}
            name={`participants.${index}.displayName`}
            type="text"
            value={participant.displayName}
            onChange={(e) => onUpdate(index, { displayName: e.target.value })}
            placeholder="e.g., Goblin"
            className="w-full px-2 py-1 border rounded text-sm"
          />
          {getFieldError('.displayName') && (
            <p className="mt-1 text-xs text-red-600">{getFieldError('.displayName')}</p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label htmlFor={`quantity-${index}`} className="block text-sm font-medium mb-1">
            Quantity
          </label>
          <input
            id={`quantity-${index}`}
            name={`participants.${index}.quantity`}
            type="number"
            min="1"
            value={participant.quantity}
            onChange={(e) => onUpdate(index, { quantity: parseInt(e.target.value, 10) || 1 })}
            className="w-full px-2 py-1 border rounded text-sm"
          />
          {getFieldError('.quantity') && (
            <p className="mt-1 text-xs text-red-600">{getFieldError('.quantity')}</p>
          )}
        </div>

        {/* HP */}
        <div>
          <label htmlFor={`hp-${index}`} className="block text-sm font-medium mb-1">
            HP (per individual)
          </label>
          <input
            id={`hp-${index}`}
            name={`participants.${index}.hp`}
            type="number"
            min="0"
            value={participant.hp || 0}
            onChange={(e) => onUpdate(index, { hp: parseInt(e.target.value, 10) || 0 })}
            className="w-full px-2 py-1 border rounded text-sm"
          />
        </div>

        {/* Initiative */}
        <div>
          <label htmlFor={`initiative-${index}`} className="block text-sm font-medium mb-1">
            Initiative (optional)
          </label>
          <input
            id={`initiative-${index}`}
            name={`participants.${index}.initiative`}
            type="number"
            value={participant.initiative ?? ''}
            onChange={(e) =>
              onUpdate(index, { initiative: e.target.value ? parseInt(e.target.value, 10) : null })
            }
            className="w-full px-2 py-1 border rounded text-sm"
          />
        </div>
      </div>
    </div>
  )
}
