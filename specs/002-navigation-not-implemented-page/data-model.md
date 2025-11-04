# Data Model: F002 — Navigation & Breadcrumbs

## Entities

### NavigationItem (conceptual)

- id: string (generated)
- label: string (required) — human readable label for the nav item
- path: string (required) — route path (e.g., `/characters`, `/characters/:id`)
- children: NavigationItem[] (optional)
- order: number (optional) — controls display order
- label: string (required) - human readable label for the nav item
- path: string (required) - route path (e.g., `/characters`, `/characters/:id`)
- children: NavigationItem[] (optional)
- order: number (optional) - controls display order

Validation rules:

- label must be non-empty and <= 60 characters
- path must be a valid pathname pattern (no spaces)

Notes:

- This is a UI-only structure; no DB persistence required for initial implementation. If later persisted, follow Mongoose patterns used in the project and provide schema-level validation.

Breadcrumbs: derived structure produced at render time by splitting the current path and mapping segments to labels via `routeMeta`.

```
