# Feature 011 — Combat Session State Management (Specify)

Related Issue: [#256](https://github.com/dougis-org/dnd-tracker/issues/256)

## Short Description

Save combat state, pause/resume sessions, end combat, and persist combat history for later review.

## Purpose / Value

- Let DMs pause/resume without losing state and review prior sessions for campaign continuity.

## Initial Tasks (Specify phase)

1. Define CombatSession persistence model and snapshot format.
2. Design pause/resume API and end-of-combat summary.
3. Determine retention and deletion policies for session history.
