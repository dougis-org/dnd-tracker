# Feature 004 — Party Management (Specify)

Related Issue: [Parent Issue #179](https://github.com/dougis-org/dnd-tracker/issues/179)

## Short Description

Group characters into parties, manage composition, and save party templates for campaign organization.

## Purpose / Value

- Enable DMs to organize characters into reusable parties for encounters and campaigns.
- Provide a lightweight UI for party creation and member management.

## Success Criteria

- API endpoints for party CRUD implemented and documented.
- Party templates can be created and reused when building encounters.

## Deliverables

- Data model sketch for `Party` and `PartyMember`.
- API contract for `/api/parties`.
- UI mockups for party list and editor.

## Initial Tasks (Specify phase)

1. Define Party schema and relations to Character.
2. Draft API request/response shapes.
3. List validation rules and tier limits.
