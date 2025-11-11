'use client'

import { useCallback, useMemo, type ReactNode } from 'react'
import type { ParticipantDoc } from '../../types/encounter'

interface ParticipantFormProps {
  index: number
  participant: ParticipantDoc
  onUpdate: (index: number, updates: Partial<ParticipantDoc>) => void
  onRemove: (index: number) => void
  errors: Array<{ field: string; message: string }>
}

type FieldProps = {
  id: string
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}

const INPUT_CLASS = 'w-full px-2 py-1 border rounded text-sm'

function Field({ id, label, required, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label}
        {required ? ' *' : null}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  )
}

const parseInteger = (value: string, fallback: number) => {
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}
export default function ParticipantForm({
  index,
  participant,
  onUpdate,
  onRemove,
  errors,
}: ParticipantFormProps) {
  const errorMap = useMemo(() => {
    const map = new Map<string, string>()
    errors.forEach((error) => {
      map.set(error.field, error.message)
    })
    return map
  }, [errors])

  const getFieldError = useCallback(
    (suffix: string) => errorMap.get(`participants.${index}${suffix}`),
    [errorMap, index]
  )

  const updateParticipant = useCallback(
    (updates: Partial<ParticipantDoc>) => {
      onUpdate(index, updates)
    },
    [index, onUpdate]
  )

  const ids = useMemo(
    () => ({
      type: `type-${index}`,
      displayName: `displayName-${index}`,
      quantity: `quantity-${index}`,
      hp: `hp-${index}`,
      initiative: `initiative-${index}`,
    }),
    [index]
  )

  const names = useMemo(
    () => ({
      type: `participants.${index}.type`,
      displayName: `participants.${index}.displayName`,
      quantity: `participants.${index}.quantity`,
      hp: `participants.${index}.hp`,
      initiative: `participants.${index}.initiative`,
    }),
    [index]
  )

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
        <Field id={ids.type} label="Type">
          <select
            id={ids.type}
            name={names.type}
            value={participant.type}
            onChange={(event) =>
              updateParticipant({ type: event.target.value as ParticipantDoc['type'] })
            }
            className={INPUT_CLASS}
          >
            <option value="monster">Monster</option>
            <option value="party_member">Party Member</option>
            <option value="custom">Custom NPC</option>
          </select>
        </Field>

        <Field id={ids.displayName} label="Name" required error={getFieldError('.displayName')}>
          <input
            id={ids.displayName}
            name={names.displayName}
            type="text"
            value={participant.displayName}
            onChange={(event) => updateParticipant({ displayName: event.target.value })}
            placeholder="e.g., Goblin"
            className={INPUT_CLASS}
          />
        </Field>

        <Field id={ids.quantity} label="Quantity" error={getFieldError('.quantity')}>
          <input
            id={ids.quantity}
            name={names.quantity}
            type="number"
            min="1"
            value={participant.quantity}
            onChange={(event) =>
              updateParticipant({ quantity: parseInteger(event.target.value, 1) })
            }
            className={INPUT_CLASS}
          />
        </Field>

        <Field id={ids.hp} label="HP (per individual)">
          <input
            id={ids.hp}
            name={names.hp}
            type="number"
            min="0"
            value={participant.hp ?? 0}
            onChange={(event) => updateParticipant({ hp: parseInteger(event.target.value, 0) })}
            className={INPUT_CLASS}
          />
        </Field>

        <Field id={ids.initiative} label="Initiative (optional)">
          <input
            id={ids.initiative}
            name={names.initiative}
            type="number"
            value={participant.initiative ?? ''}
            onChange={(event) => {
              const value = event.target.value.trim()
              updateParticipant({
                initiative: value === '' ? null : parseInteger(value, 0),
              })
            }}
            className={INPUT_CLASS}
          />
        </Field>
      </div>
    </div>
  )
}
