# data-model.md

Canonical data model for Monster (frontend-first shape; used for Zod schema generation and contract scaffolding)

## Monster (entity)

- id: string (uuid) — primary identifier
- name: string (required, non-empty)
- cr: number (challenge rating; can be fractional, e.g., 0.25)
- size: string (enum: Tiny, Small, Medium, Large, Huge, Gargantuan)
- type: string (e.g., "humanoid", "beast", "dragon")
- alignment: string | null
- hp: number (hit points)
- ac: number (armor class)
- speed: string | structured object (e.g., "30 ft.", or {walk: 30, swim: 20})
- abilities: object
  - str: number
  - dex: number
  - con: number
  - int: number
  - wis: number
  - cha: number
- savingThrows: object | null
- skills: object | null
- resistances: string[]
- immunities: string[]
- conditionImmunities: string[]
- senses: string[]
- languages: string[]
- tags: string[]
- actions: array of Action objects (see below)
- legendaryActions: array of Action objects (optional)
- lairActions: array of Action objects (optional)
- templateId: string | null
- ownerId: string (user id or "system")
- createdBy: string (user id)
- scope: enum ("global" | "campaign" | "public")
- isPublic: boolean
- publicAt: ISO8601 timestamp | null
- creditedTo: string | null
- createdAt: ISO8601 timestamp
- updatedAt: ISO8601 timestamp

### Action object

- id: string
- name: string
- description: string
- attackBonus: number | null
- damage: string | null

## MonsterTemplate

- templateId: string
- name: string
- defaultValues: partial Monster fields
- tags: string[]
- createdBy: string
- createdAt: timestamp

## Validation notes (for Zod schema)

- `name` required (min length 1)
- `cr` must be >= 0 and can be fractional (use number, accept decimals)
- `hp`, `ac` must be non-negative integers
- `abilities` values between -5 and +30 (validation range)
- `scope` enum must be one of `global|campaign|public`

## Usage

This file is the canonical reference for frontend shapes and will be used to generate:

- `specs/007-monster-management/contracts/monsters.openapi.yml` (Phase 1)
- Zod schema used by components and forms
