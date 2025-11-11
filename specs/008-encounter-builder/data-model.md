# Encounter data model

This document describes the Encounter-related entities used by the Encounter Builder feature. It consolidates entity schemas, validation rules, relationships, state transitions, and suggested indexes.

## Entities

### Encounter

- id: string (UUID or DB ObjectId)
- name: string (required, min 1, max 200)
- description: string (optional)
- participants: Participant[] (required, length >= 1)
- tags: string[] (optional)
- template_flag: boolean (default: false)
- owner_id: string (required)
- org_id: string | null (optional)
- created_at: string (ISO timestamp)
- updated_at: string (ISO timestamp)

Validation rules

- name: non-empty, max 200 chars
- participants: must contain at least one Participant; each Participant must satisfy Participant validation rules
- owner_id: must match the authenticated user's id when persisting (enforced at API level)

### Participant

- id: string (UUID or locally-generated id)
- type: enum('monster', 'party_member', 'custom')
- displayName: string (required, non-empty)
- quantity: number (integer, min 1)
- hp: number (integer, min 0)
- initiative: number | null (nullable to allow participants without a rolled value)
- metadata: Record<string, unknown> (notes, sourceId, tags, additional attributes)

Validation rules

- displayName: non-empty
- quantity: integer >= 1
- hp: integer >= 0

### EncounterTemplate

- In practice: same shape as `Encounter` but with `template_flag: true` and optional author/metadata fields describing the template origin.

Validation rules are the same as `Encounter` with any template-specific metadata validated as required by the template contract.

## Relationships

- Encounter.owner_id -> users.id (ownership; enforced at API level)
- An Encounter contains many Participants. Participants are embedded within the Encounter (not global entities) but may include references (e.g., source monster id or party member id) to external objects for lookups.

## State transitions

- draft -> saved (on first successful save)
- saved -> template (when `template_flag` is toggled to true)

## Indexes (MongoDB suggestions)

- compound index on { owner_id: 1, name: 1 } (for owner-scoped lookups)
- index on created_at (for listing/ordering)

## Notes and recommendations

- Use Zod schemas for validation on both client and server. Keep adapter-specific transforms thin and reversible.
- Keep API-level enforcement for ownership (owner_id) and any org-scoped access controls.
- Keep the Participant model embedded inside Encounter to simplify versioning and snapshots; use source references where normalization is required.

---

If you want this split into two documents (one for the canonical data model and one for implementation notes / API-level rules), tell me which parts you want moved to a separate file and I will split them.
