# API Contract: Dashboard (Feature 004)

## GET /api/dashboard

Summary: Returns the set of stat widgets and recent activity for the dashboard page. This contract is intended for future backend integration; the initial UI uses mock fixtures that match this shape.

Response 200 JSON schema (application/json):

```json
{
  "widgets": [
    {
      "id": "active_parties",
      "label": "Active Parties",
      "value": 3,
      "detailUrl": "/parties"
    }
  ],
  "recentActivity": [
    {
      "id": "a1",
      "type": "session",
      "timestamp": "2025-11-05T12:34:56Z",
      "description": "Combat session 'Goblin Ambush' ended",
      "targetUrl": "/combat/123"
    }
  ]
}
```

Notes:

- The API should allow pagination for `recentActivity` when wired in production; UI uses the first 5 items for display.

---

**Prepared**: agent
