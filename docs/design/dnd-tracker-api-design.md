# D&D Tracker - API Design Document

**Version**: 1.0
**Base URL**: `https://api.dndtracker.com/api/v1`
**Date**: 2025-11-01

## 1. API Standards

### 1.1 General Principles

- **RESTful Design**: Resource-based URLs, HTTP verbs for actions
- **JSON API**: All requests and responses in JSON format
- **UTF-8 Encoding**: All text data in UTF-8
- **ISO 8601 Dates**: All timestamps in ISO 8601 format
- **UUID/ObjectId**: Resource identifiers as MongoDB ObjectIds

### 1.2 HTTP Methods

| Method | Usage | Idempotent |
|--------|-------|------------|
| GET | Retrieve resource(s) | Yes |
| POST | Create new resource | No |
| PUT | Full update of resource | Yes |
| PATCH | Partial update of resource | No |
| DELETE | Remove resource | Yes |

### 1.3 Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 402 | Payment Required | Tier limit exceeded |
| 403 | Forbidden | Valid auth but no permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource conflict (duplicate, etc.) |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### 1.4 Request Headers

```http
Content-Type: application/json
Authorization: Bearer {clerk_token}
X-Request-ID: {uuid}
X-Client-Version: 1.0.0
Accept-Language: en-US
```

### 1.5 Response Format

#### Success Response
```json
{
  "data": {
    // Response payload
  },
  "meta": {
    "timestamp": "2025-11-01T12:00:00Z",
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "version": "1.0"
  }
}
```

#### Error Response
```json
{
  "error": {
    "type": "VALIDATION",
    "message": "Validation failed",
    "code": "ERR_VALIDATION_FAILED",
    "details": {
      "fields": [
        {
          "field": "name",
          "message": "Name is required",
          "code": "required"
        }
      ]
    },
    "timestamp": "2025-11-01T12:00:00Z",
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### 1.6 Pagination

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 5,
    "totalItems": 97,
    "hasNext": true,
    "hasPrev": false
  },
  "links": {
    "self": "/api/v1/characters?page=1&pageSize=20",
    "first": "/api/v1/characters?page=1&pageSize=20",
    "last": "/api/v1/characters?page=5&pageSize=20",
    "next": "/api/v1/characters?page=2&pageSize=20",
    "prev": null
  }
}
```

### 1.7 Filtering & Sorting

```
GET /api/v1/characters?filter[race]=elf&filter[level]=5&sort=-createdAt&page=1&pageSize=20
```

## 2. Authentication & Authorization

### 2.1 Authentication Flow

All API requests require authentication via Clerk JWT tokens:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 2.2 Authorization Rules

- **Resource Ownership**: Users can only access their own resources
- **Tier Limits**: Certain operations check subscription tier
- **Rate Limits**: Per-user and per-IP rate limiting

## 3. API Endpoints

### 3.1 Authentication Endpoints

#### Clerk Webhook
```
POST /api/v1/auth/webhook
```

Handles Clerk lifecycle events (user.created, user.updated, user.deleted)

**Request Body** (from Clerk):
```json
{
  "type": "user.created",
  "data": {
    "id": "user_xxx",
    "email_addresses": [...],
    "first_name": "John",
    "last_name": "Doe",
    "image_url": "https://..."
  }
}
```

**Response**: 200 OK

---

### 3.2 User Endpoints

#### Get User Profile
```
GET /api/v1/users/profile
```

**Response**:
```json
{
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "profile": {
      "experienceLevel": "intermediate",
      "preferredRole": "both",
      "ruleset": "5e",
      "bio": "Forever DM",
      "setupCompleted": true
    },
    "subscription": {
      "tier": "seasoned",
      "status": "active",
      "currentPeriodEnd": "2025-12-01T00:00:00Z"
    },
    "usage": {
      "parties": 2,
      "encounters": 8,
      "characters": 15
    }
  }
}
```

#### Update User Profile
```
PUT /api/v1/users/profile
```

**Request Body**:
```json
{
  "profile": {
    "experienceLevel": "expert",
    "preferredRole": "dm",
    "ruleset": "5e",
    "bio": "Running campaigns for 10 years"
  }
}
```

#### Get Usage Metrics
```
GET /api/v1/users/{userId}/usage
```

**Response**:
```json
{
  "data": {
    "current": {
      "parties": 2,
      "encounters": 8,
      "characters": 15,
      "monsters": 23,
      "items": 45
    },
    "limits": {
      "parties": 3,
      "encounters": 15,
      "characters": 50,
      "monsters": 50,
      "items": 100,
      "maxParticipants": 10
    },
    "percentages": {
      "parties": 66.7,
      "encounters": 53.3,
      "characters": 30.0
    }
  }
}
```

---

### 3.3 Character Endpoints

#### List Characters
```
GET /api/v1/characters?page=1&pageSize=20&filter[class]=fighter&sort=-level
```

**Response**:
```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Thorin Oakenshield",
      "race": "Dwarf",
      "classes": [
        {
          "className": "Fighter",
          "level": 5
        }
      ],
      "level": 5,
      "hitPoints": {
        "current": 45,
        "maximum": 45
      },
      "armorClass": 18
    }
  ],
  "pagination": {...}
}
```

#### Get Character
```
GET /api/v1/characters/{characterId}
```

**Response**: Full character object

#### Create Character
```
POST /api/v1/characters
```

**Request Body**:
```json
{
  "name": "Legolas",
  "race": "Elf",
  "classes": [
    {
      "className": "Ranger",
      "level": 5
    }
  ],
  "abilityScores": {
    "strength": 12,
    "dexterity": 18,
    "constitution": 14,
    "intelligence": 12,
    "wisdom": 16,
    "charisma": 10
  },
  "hitPoints": {
    "maximum": 38,
    "current": 38
  },
  "armorClass": 16,
  "initiative": 4
}
```

**Response**: 201 Created with character object

#### Update Character
```
PUT /api/v1/characters/{characterId}
```

**Request Body**: Complete character object

#### Partial Update Character
```
PATCH /api/v1/characters/{characterId}
```

**Request Body**: Partial updates
```json
{
  "hitPoints": {
    "current": 25
  },
  "level": 6
}
```

#### Delete Character
```
DELETE /api/v1/characters/{characterId}
```

**Response**: 204 No Content

#### Save as Template
```
POST /api/v1/characters/{characterId}/save-template
```

**Request Body**:
```json
{
  "templateName": "Level 5 Fighter"
}
```

#### Get Character Templates
```
GET /api/v1/characters/templates
```

#### Create from Template
```
POST /api/v1/characters/from-template
```

**Request Body**:
```json
{
  "templateId": "507f1f77bcf86cd799439011",
  "name": "New Character Name"
}
```

---

### 3.4 Party Endpoints

#### List Parties
```
GET /api/v1/parties
```

#### Get Party
```
GET /api/v1/parties/{partyId}
```

#### Create Party
```
POST /api/v1/parties
```

**Request Body**:
```json
{
  "name": "The Fellowship",
  "description": "Heroes on a quest",
  "campaignName": "Journey to Mordor"
}
```

#### Update Party
```
PUT /api/v1/parties/{partyId}
```

#### Delete Party
```
DELETE /api/v1/parties/{partyId}
```

#### Add Party Member
```
POST /api/v1/parties/{partyId}/members
```

**Request Body**:
```json
{
  "characterId": "507f1f77bcf86cd799439011",
  "playerName": "John Smith",
  "role": "tank"
}
```

#### Remove Party Member
```
DELETE /api/v1/parties/{partyId}/members/{characterId}
```

---

### 3.5 Monster Endpoints

#### List Monsters
```
GET /api/v1/monsters?filter[type]=dragon&filter[cr]=10&sort=-cr
```

#### Get Monster
```
GET /api/v1/monsters/{monsterId}
```

#### Create Monster
```
POST /api/v1/monsters
```

**Request Body**:
```json
{
  "name": "Ancient Red Dragon",
  "size": "Gargantuan",
  "type": "Dragon",
  "alignment": "Chaotic Evil",
  "challengeRating": 24,
  "armorClass": {
    "value": 22,
    "type": "natural armor"
  },
  "hitPoints": {
    "average": 546,
    "formula": "28d20 + 252"
  },
  "speed": {
    "walk": 40,
    "climb": 40,
    "fly": 80
  },
  "abilityScores": {
    "strength": 30,
    "dexterity": 10,
    "constitution": 29,
    "intelligence": 18,
    "wisdom": 15,
    "charisma": 23
  },
  "legendaryActions": {
    "count": 3,
    "actions": [...]
  },
  "lairActions": [...]
}
```

#### Update Monster
```
PUT /api/v1/monsters/{monsterId}
```

#### Delete Monster
```
DELETE /api/v1/monsters/{monsterId}
```

---

### 3.6 Item Endpoints

#### List Items
```
GET /api/v1/items?filter[category]=weapon&filter[rarity]=rare
```

#### Get Item
```
GET /api/v1/items/{itemId}
```

#### Create Item
```
POST /api/v1/items
```

**Request Body**:
```json
{
  "name": "Flame Tongue Longsword",
  "category": "weapon",
  "rarity": "rare",
  "properties": {
    "magical": true,
    "attunement": true
  },
  "weapon": {
    "type": "martial_melee",
    "damage": "1d8",
    "damageType": "slashing",
    "properties": ["versatile"],
    "damageBonus": 2
  },
  "description": "While the sword is ablaze, it deals an extra 2d6 fire damage",
  "value": {
    "amount": 5000,
    "currency": "gp"
  }
}
```

#### Update Item
```
PUT /api/v1/items/{itemId}
```

#### Delete Item
```
DELETE /api/v1/items/{itemId}
```

---

### 3.7 Encounter Endpoints

#### List Encounters
```
GET /api/v1/encounters?filter[difficulty]=hard
```

#### Get Encounter
```
GET /api/v1/encounters/{encounterId}
```

#### Create Encounter
```
POST /api/v1/encounters
```

**Request Body**:
```json
{
  "name": "Dragon's Lair",
  "description": "Final boss fight",
  "location": "Volcano Peak",
  "environment": {
    "terrain": "mountain",
    "lighting": "dim",
    "hazards": ["lava pools", "falling rocks"]
  }
}
```

#### Update Encounter
```
PUT /api/v1/encounters/{encounterId}
```

#### Delete Encounter
```
DELETE /api/v1/encounters/{encounterId}
```

#### Add Participant
```
POST /api/v1/encounters/{encounterId}/participants
```

**Request Body**:
```json
{
  "type": "monster",
  "id": "507f1f77bcf86cd799439011",
  "quantity": 2
}
```

#### Assign Lair Actions
```
POST /api/v1/encounters/{encounterId}/lair-actions
```

**Request Body**:
```json
{
  "actions": [
    {
      "name": "Magma Eruption",
      "description": "Magma erupts from the floor",
      "trigger": "initiative_20",
      "saveDC": 15,
      "damage": "10d6"
    }
  ]
}
```

---

### 3.8 Combat Session Endpoints

#### Start Combat
```
POST /api/v1/combat/sessions
```

**Request Body**:
```json
{
  "encounterId": "507f1f77bcf86cd799439011"
}
```

**Response**: New combat session with participants

#### Get Combat Session
```
GET /api/v1/combat/sessions/{sessionId}
```

#### List Combat Sessions
```
GET /api/v1/combat/sessions?filter[status]=active
```

#### Roll Initiative
```
POST /api/v1/combat/sessions/{sessionId}/initiative/roll
```

**Request Body** (optional):
```json
{
  "method": "auto"  // or "manual"
}
```

#### Update Initiative
```
PUT /api/v1/combat/sessions/{sessionId}/initiative/{participantId}
```

**Request Body**:
```json
{
  "initiative": 18
}
```

#### Next Turn
```
POST /api/v1/combat/sessions/{sessionId}/next-turn
```

#### Previous Turn
```
POST /api/v1/combat/sessions/{sessionId}/previous-turn
```

#### Apply Damage
```
POST /api/v1/combat/sessions/{sessionId}/damage
```

**Request Body**:
```json
{
  "participantId": "participant_123",
  "amount": 15,
  "type": "slashing",
  "source": "Sword attack"
}
```

#### Apply Healing
```
POST /api/v1/combat/sessions/{sessionId}/heal
```

**Request Body**:
```json
{
  "participantId": "participant_123",
  "amount": 10,
  "source": "Cure Wounds"
}
```

#### Set Temporary HP
```
POST /api/v1/combat/sessions/{sessionId}/temp-hp
```

**Request Body**:
```json
{
  "participantId": "participant_123",
  "amount": 8
}
```

#### Apply Status Effect
```
POST /api/v1/combat/sessions/{sessionId}/participants/{participantId}/effects
```

**Request Body**:
```json
{
  "effectId": "507f1f77bcf86cd799439011",
  "name": "Poisoned",
  "duration": {
    "type": "rounds",
    "value": 3
  }
}
```

#### Remove Status Effect
```
DELETE /api/v1/combat/sessions/{sessionId}/participants/{participantId}/effects/{effectId}
```

#### Trigger Lair Action
```
POST /api/v1/combat/sessions/{sessionId}/lair-action
```

**Request Body**:
```json
{
  "actionId": "507f1f77bcf86cd799439011",
  "targets": ["participant_123", "participant_456"],
  "results": {
    "damage": [
      {"participantId": "participant_123", "amount": 15}
    ]
  }
}
```

#### Get Available Lair Actions
```
GET /api/v1/combat/sessions/{sessionId}/lair-actions
```

#### Pause Combat
```
PUT /api/v1/combat/sessions/{sessionId}/pause
```

#### Resume Combat
```
PUT /api/v1/combat/sessions/{sessionId}/resume
```

#### End Combat
```
PUT /api/v1/combat/sessions/{sessionId}/end
```

**Response**: Combat summary with statistics

#### Get Combat History
```
GET /api/v1/combat/sessions/{sessionId}/history?page=1&pageSize=50
```

#### Undo Last Action
```
POST /api/v1/combat/sessions/{sessionId}/undo
```

#### Get Combat Log (Paid Feature)
```
GET /api/v1/combat/sessions/{sessionId}/log
```

**Response** (Tier check - Seasoned+):
```json
{
  "data": {
    "log": [
      {
        "round": 3,
        "turn": 2,
        "timestamp": "2025-11-01T12:00:00Z",
        "action": "damage",
        "actor": "Orc Warrior",
        "target": "Legolas",
        "details": {
          "amount": 12,
          "type": "slashing",
          "attackRoll": 18,
          "hit": true
        }
      }
    ],
    "statistics": {
      "totalRounds": 5,
      "duration": 1800,
      "participants": {...}
    }
  }
}
```

---

### 3.9 Billing Endpoints

#### Create Checkout Session
```
POST /api/v1/billing/checkout
```

**Request Body**:
```json
{
  "tier": "seasoned",
  "interval": "monthly"
}
```

**Response**:
```json
{
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/...",
    "sessionId": "cs_xxx"
  }
}
```

#### Get Customer Portal
```
POST /api/v1/billing/portal
```

**Response**:
```json
{
  "data": {
    "portalUrl": "https://billing.stripe.com/..."
  }
}
```

#### Upgrade Subscription
```
POST /api/v1/billing/upgrade
```

**Request Body**:
```json
{
  "toTier": "expert"
}
```

#### Downgrade Subscription
```
POST /api/v1/billing/downgrade
```

**Request Body**:
```json
{
  "toTier": "free",
  "reason": "Not using all features"
}
```

#### Cancel Subscription
```
POST /api/v1/billing/cancel
```

**Request Body**:
```json
{
  "reason": "No longer playing",
  "feedback": "Great service but taking a break"
}
```

#### Get Invoices
```
GET /api/v1/billing/invoices
```

**Response**:
```json
{
  "data": [
    {
      "id": "inv_xxx",
      "amount": 499,
      "currency": "usd",
      "status": "paid",
      "date": "2025-11-01T00:00:00Z",
      "downloadUrl": "https://..."
    }
  ]
}
```

#### Stripe Webhook
```
POST /api/v1/billing/webhooks/stripe
```

Handles Stripe events (subscription.created, subscription.updated, etc.)

---

### 3.10 Dashboard Endpoints

#### Get Dashboard Data
```
GET /api/v1/dashboard
```

**Response**:
```json
{
  "data": {
    "stats": {
      "activeParties": 3,
      "totalCharacters": 15,
      "recentSessions": 5,
      "currentTier": "seasoned"
    },
    "usage": {
      "parties": { "current": 2, "limit": 3 },
      "encounters": { "current": 8, "limit": 15 },
      "characters": { "current": 15, "limit": 50 }
    },
    "recentActivity": [
      {
        "type": "combat_completed",
        "title": "Dragon's Lair completed",
        "timestamp": "2025-11-01T10:00:00Z"
      }
    ],
    "quickActions": [
      {
        "label": "Start Combat",
        "action": "start_combat",
        "enabled": true
      }
    ]
  }
}
```

#### Get Recent Activity
```
GET /api/v1/recent?limit=10
```

---

### 3.11 Export Endpoints

#### Export Character
```
GET /api/v1/characters/{characterId}/export?format=json
```

**Response**: Character data in requested format

#### Export Encounter
```
GET /api/v1/encounters/{encounterId}/export?format=json
```

#### Export Combat Session
```
GET /api/v1/combat/sessions/{sessionId}/export?format=pdf
```

**Response**: PDF download or JSON data

#### Bulk Export Characters
```
GET /api/v1/export/characters?format=json
```

#### Bulk Export Encounters
```
GET /api/v1/export/encounters?format=json
```

---

### 3.12 Character Sharing Endpoints

#### Create Share Link
```
POST /api/v1/characters/{characterId}/share
```

**Request Body**:
```json
{
  "permissions": {
    "view": true,
    "edit": false,
    "play": true
  },
  "expiresIn": 604800  // 7 days in seconds
}
```

**Response**:
```json
{
  "data": {
    "shareCode": "ABC123XYZ",
    "shareUrl": "https://dndtracker.com/share/ABC123XYZ",
    "expiresAt": "2025-11-08T00:00:00Z"
  }
}
```

#### Grant Permission
```
POST /api/v1/characters/{characterId}/permissions
```

**Request Body**:
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "permissions": {
    "view": true,
    "edit": true,
    "play": true,
    "share": false
  }
}
```

#### Revoke Permission
```
DELETE /api/v1/characters/{characterId}/permissions/{userId}
```

#### List Shared Characters
```
GET /api/v1/characters/shared
```

#### List Characters Shared With Me
```
GET /api/v1/characters/shared-with-me
```

---

### 3.13 Theme & Preferences Endpoints

#### Update Theme (Paid Feature)
```
PUT /api/v1/users/{userId}/theme
```

**Request Body**:
```json
{
  "theme": "dark",
  "colorScheme": "#FF5733",
  "fontSize": "medium",
  "compactMode": false
}
```

**Note**: Custom themes require Expert tier or higher

#### Get Available Themes
```
GET /api/v1/themes
```

**Response** (filtered by tier):
```json
{
  "data": [
    {
      "id": "light",
      "name": "Light",
      "tier": "free"
    },
    {
      "id": "dark",
      "name": "Dark",
      "tier": "free"
    },
    {
      "id": "custom",
      "name": "Custom",
      "tier": "expert"
    }
  ]
}
```

---

### 3.14 Tier Information Endpoints

#### Get Tier Limits
```
GET /api/v1/tiers
```

**Response**:
```json
{
  "data": [
    {
      "tier": "free",
      "name": "Free Adventurer",
      "price": {
        "monthly": 0,
        "yearly": 0
      },
      "limits": {
        "parties": 1,
        "encounters": 3,
        "characters": 10,
        "monsters": 10,
        "maxParticipants": 6
      },
      "features": []
    },
    {
      "tier": "seasoned",
      "name": "Seasoned Adventurer",
      "price": {
        "monthly": 499,
        "yearly": 4999
      },
      "limits": {
        "parties": 3,
        "encounters": 15,
        "characters": 50,
        "monsters": 50,
        "maxParticipants": 10
      },
      "features": ["cloud_sync", "advanced_logging", "export"]
    }
  ]
}
```

## 4. WebSocket Events (Future)

For real-time collaboration features:

### 4.1 Connection
```javascript
const socket = io('wss://api.dndtracker.com', {
  auth: {
    token: 'clerk_jwt_token'
  }
});
```

### 4.2 Events

#### Join Combat Session
```javascript
socket.emit('combat:join', { sessionId: '...' });
```

#### Combat Updates
```javascript
socket.on('combat:update', (data) => {
  // Real-time combat state update
});
```

#### Turn Notification
```javascript
socket.on('combat:turn', (data) => {
  // Your turn notification
});
```

## 5. Rate Limiting

### 5.1 Limits

| Tier | Requests/Hour | Burst |
|------|--------------|-------|
| Free | 100 | 10/minute |
| Seasoned | 500 | 50/minute |
| Expert | 1000 | 100/minute |
| Master | 5000 | 500/minute |
| Guild | Unlimited | Unlimited |

### 5.2 Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1635724800
```

## 6. API Versioning

### 6.1 Version Strategy

- URL versioning: `/api/v1/`, `/api/v2/`
- Breaking changes require new version
- Deprecation notices 3 months in advance
- Old versions supported for 6 months minimum

### 6.2 Version Header

```http
X-API-Version: 1.0
X-API-Deprecated: false
X-API-Sunset: 2026-05-01T00:00:00Z
```

## 7. Security

### 7.1 Authentication

- Clerk JWT tokens required
- Token expiry: 1 hour
- Refresh tokens handled by Clerk

### 7.2 CORS Policy

```javascript
{
  origin: ['https://dndtracker.com', 'https://*.dndtracker.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

### 7.3 Request Validation

- All inputs validated with Zod schemas
- SQL injection prevention (N/A for MongoDB)
- XSS prevention via input sanitization
- File upload restrictions (images only, max 5MB)

## 8. Monitoring & Logging

### 8.1 Request Logging

```json
{
  "timestamp": "2025-11-01T12:00:00Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "POST",
  "path": "/api/v1/characters",
  "userId": "507f1f77bcf86cd799439011",
  "statusCode": 201,
  "duration": 145,
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.1"
}
```

### 8.2 Error Tracking

- All 5xx errors sent to Sentry
- 4xx errors logged for analysis
- Performance metrics tracked

## 9. Testing

### 9.1 Test Endpoints (Development Only)

```
POST /api/v1/test/reset-database
POST /api/v1/test/seed-data
GET /api/v1/test/health
```

### 9.2 Health Check

```
GET /api/v1/health
```

**Response**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-11-01T12:00:00Z",
  "services": {
    "database": "connected",
    "cache": "connected",
    "stripe": "connected",
    "clerk": "connected"
  }
}
```

## 10. SDK Examples

### 10.1 JavaScript/TypeScript

```typescript
import { DndTrackerClient } from '@dndtracker/sdk';

const client = new DndTrackerClient({
  apiKey: 'clerk_token',
  version: 'v1'
});

// Create character
const character = await client.characters.create({
  name: 'Gandalf',
  race: 'Human',
  classes: [{ className: 'Wizard', level: 20 }]
});

// Start combat
const session = await client.combat.start(encounterId);
await client.combat.rollInitiative(session.id);
```

### 10.2 cURL Examples

```bash
# Get characters
curl -X GET https://api.dndtracker.com/api/v1/characters \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create character
curl -X POST https://api.dndtracker.com/api/v1/characters \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Gandalf","race":"Human"}'
```