'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ParticipantForm from '../../../components/encounters/ParticipantForm'
import adapter from '../../../lib/api/encounters'
import { EncounterSchema } from '../../../lib/schemas/encounter'
import type { ParticipantDoc } from '../../../types/encounter'

/**
 * T018: New Encounter creation page
 *
 * Allows users to:
 * 1. Enter encounter name and description
 * 2. Add multiple participants (monsters, party members, custom NPCs)
 * 3. Set quantities and HP for each participant
 * 4. Save the encounter
 */

interface FormError {
  field: string
  message: string
}

export default function NewEncounterPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [participants, setParticipants] = useState<ParticipantDoc[]>([
    { type: 'monster', displayName: '', quantity: 1, hp: 0 },
  ])
  const [errors, setErrors] = useState<FormError[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: FormError[] = []

    if (!name.trim()) {
      newErrors.push({ field: 'name', message: 'Name is required' })
    }

    if (participants.length === 0) {
      newErrors.push({ field: 'participants', message: 'At least one participant is required' })
    }

    // Validate each participant
    participants.forEach((p, idx) => {
      if (!p.displayName.trim()) {
        newErrors.push({ field: `participants.${idx}.displayName`, message: 'Participant name is required' })
      }
      if (p.quantity < 1) {
        newErrors.push({ field: `participants.${idx}.quantity`, message: 'Quantity must be at least 1' })
      }
    })

    setErrors(newErrors)
    return newErrors.length === 0
  }, [name, participants])

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)

    try {
      const encounter = {
        name,
        description: description || undefined,
        participants,
        owner_id: 'user-001', // TODO: Get from session/auth context
      }

      // Validate with Zod schema
      const validated = EncounterSchema.parse(encounter)

      // Create via adapter
      await adapter.create(validated)

      // Redirect to encounters list
      router.push('/encounters')
    } catch (err) {
      console.error('Failed to save encounter:', err)
      setErrors([{ field: 'general', message: 'Failed to save encounter. Please try again.' }])
    } finally {
      setIsSaving(false)
    }
  }, [name, description, participants, validateForm, router])

  const handleAddParticipant = useCallback(() => {
    setParticipants([
      ...participants,
      { type: 'monster' as const, displayName: '', quantity: 1, hp: 0 },
    ])
  }, [participants])

  const handleRemoveParticipant = useCallback(
    (index: number) => {
      setParticipants(participants.filter((_, i) => i !== index))
    },
    [participants]
  )

  const handleUpdateParticipant = useCallback(
    (index: number, updates: Partial<(typeof participants)[0]>) => {
      const updated = [...participants]
      updated[index] = { ...updated[index], ...updates }
      setParticipants(updated)
    },
    [participants]
  )

  const generalError = errors.find((e) => e.field === 'general')
  const nameError = errors.find((e) => e.field === 'name')
  const participantsError = errors.find((e) => e.field === 'participants')

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create New Encounter</h1>

      {generalError && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{generalError.message}</div>}

      {/* Encounter Details */}
      <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Encounter Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Goblin Ambush"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {nameError && <p className="mt-1 text-sm text-red-600">{nameError.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Notes about this encounter..."
            rows={3}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Participants */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Participants *</h2>
            <button
              type="button"
              onClick={handleAddParticipant}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Participant
            </button>
          </div>

          {participantsError && <p className="mb-2 text-sm text-red-600">{participantsError.message}</p>}

          {participants.map((participant, index) => (
            <ParticipantForm
              key={index}
              index={index}
              participant={participant}
              onUpdate={handleUpdateParticipant}
              onRemove={handleRemoveParticipant}
              errors={errors}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
