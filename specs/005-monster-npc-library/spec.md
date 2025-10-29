# Feature 005 — Monster and NPC Library (Specify)

Related Issue: [#214](https://github.com/dougis-org/dnd-tracker/issues/214)

## Short Description

Monster/NPC creation with stat blocks, abilities, legendary actions, and searchable creature library.

## Purpose / Value

- Give DMs an authorable creature library to populate encounters and reuse monster templates.

## Success Criteria

- CRUD API for monsters available.
- Search/filter by CR/type works with reasonable performance on sample dataset.

## Initial Tasks (Specify phase)

1. Define Monster schema and SpecialAbility structure.
2. Draft API contract for `/api/monsters`.
3. Define import strategy for SRD data (optional).
