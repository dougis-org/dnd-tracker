/**
 * Client-side encounter types (non-Mongoose)
 * Used by components and client-side code to avoid Mongoose/MongoDB dependencies
 */

export interface ParticipantDoc {
  id?: string
  type: 'monster' | 'party_member' | 'custom'
  displayName: string
  quantity: number
  hp?: number
  initiative?: number | null
  metadata?: Record<string, unknown>
}

export interface EncounterDoc {
  id?: string
  name: string
  description?: string
  participants: ParticipantDoc[]
  tags?: string[]
  template_flag?: boolean
  owner_id: string
  org_id?: string | null
  created_at?: Date | string
  updated_at?: Date | string
}
