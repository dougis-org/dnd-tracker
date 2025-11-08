# data-model.md

## Entities

### Encounter

- id: string (UUID or DB ObjectId)
- name: string (required)
- description: string (optional)
- participants: Participant[] (required, length >= 1)
- tags: string[] (optional)
- template_flag: boolean (defaults false)
- created_at: ISO timestamp
- updated_at: ISO timestamp

Validation rules

- name: non-empty, max 200 chars
- participants: at least one participant; each participant validated per Participant rules

### Participant

- id: string (generated per participant instance)
- type: enum('monster','party_member','custom')
- displayName: string (required)
- quantity: integer >= 1
- hp: integer >= 0 (optional)
- initiative: integer (optional)
- metadata: object (notes, sourceId, additional attributes)

Validation rules

- displayName: non-empty
- quantity: positive integer

### EncounterTemplate

- Same as Encounter with template_flag=true and optional author metadata

## Relationships

- Encounter contains many Participants; Participants do not exist outside the Encounter in this model (nor are they global objects) — they may reference a source (monster id or party member id) for lookups.
