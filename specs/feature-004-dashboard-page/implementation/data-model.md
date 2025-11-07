# Data Model: Dashboard Page (Feature 004)

## Entities

- DashboardWidget
  - id: string
  - label: string
  - value: number | string
  - delta?: number (optional change since last period)
  - detailUrl?: string

- PartySummary
  - id: string
  - displayName: string
  - memberCount: number

- CombatSessionSummary
  - sessionId: string
  - title: string
  - round: number
  - lastUpdated: ISO-8601 timestamp

- ActivityItem
  - id: string
  - type: enum ("session" | "party" | "system")
  - timestamp: ISO-8601 timestamp
  - description: string
  - targetUrl?: string

## Validation rules (UI-level)

- Widget values MUST be formatted for readability (k, M suffixes when appropriate)
- Activity feed MUST be ordered by timestamp descending
- Empty collections MUST be represented by explicit empty-state messages

---

**Prepared**: agent
