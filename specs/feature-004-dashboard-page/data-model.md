---
title: Data Model - Dashboard Page
generated: 2025-11-05
---

This document describes the primary data shapes used by the Dashboard UI (mock data for Phase 1). These are intentionally lightweight and intended as contracts for the UI; backend integrations can adapt these shapes later.

Entities

- DashboardWidget
  - id: string
  - label: string
  - value: number | string
  - delta?: number  # percent change vs prior period
  - sparkline?: number[] # optional series for small visual
  - link?: string # URL to drill-in

- PartySummary
  - id: string
  - displayName: string
  - memberCount: number
  - lastActiveAt?: string (ISO 8601)

- CombatSessionSummary
  - sessionId: string
  - title: string
  - round: number
  - lastUpdated: string (ISO 8601)
  - participantsCount?: number

- ActivityItem
  - id: string
  - type: "combat" | "party" | "character" | "system" | string
  - timestamp: string (ISO 8601)
  - description: string
  - targetUrl?: string

Notes

- These shapes are used by the Dashboard components in Phase 1 as mock data. When the backend is implemented, compatibility adapters or API versioning may be added.
