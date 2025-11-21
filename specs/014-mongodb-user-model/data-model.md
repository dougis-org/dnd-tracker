# Data Model: Feature 014 - MongoDB User Model & Webhook

**Date**: 2025-11-18 | **Version**: 1.0  
**Schema Status**: Finalized

---

## Overview

Feature 014 introduces two core MongoDB collections: `users` for persistent user records and `user_events` for webhook event tracking. The model enforces strict uniqueness constraints, supports soft-delete semantics, and provides comprehensive audit trails.

---

## Collection: `users`

### Purpose

Persistent user records synchronized via Clerk webhook events. Stores core profile data, metadata, and lifecycle timestamps.

### Schema Definition

#### Fields

| Field | Type | Constraints | Default | Index | Notes |
|-------|------|-----------|---------|-------|-------|
| `_id` | ObjectId | Auto-generated | — | Primary | Unique MongoDB document ID |
| `userId` | String | Required, unique, non-empty | — | Unique | Auth provider user ID (from Clerk) |
| `email` | String | Required, unique, lowercase | — | Unique | User email address |
| `displayName` | String | Required, 1–255 chars | — | — | User display/full name |
| `metadata` | Object | Optional, flexible | `{}` | — | Custom key-value data |
| `createdAt` | ISO8601 | Immutable, server-set | Now | Non-unique | Document creation timestamp |
| `updatedAt` | ISO8601 | Auto-updated | Now | Non-unique | Last successful sync/update |
| `deletedAt` | ISO8601 \| null | Optional, immutable once set | `null` | — | Soft-delete marker (null = active) |

#### TypeScript Interface

```typescript
export interface UserDoc extends Document {
  _id: mongoose.Types.ObjectId
  userId: string          // Unique, from auth provider
  email: string           // Unique, lowercase
  displayName: string
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null  // null = active, otherwise soft-deleted
}
```

### Indexes

| Index Name | Fields | Type | Reason |
|-----------|--------|------|--------|
| Primary | `_id` | Unique | Default MongoDB index |
| Unique-userId | `userId: 1` | Unique | Fast lookup by auth user ID; prevent duplicates |
| Unique-email | `email: 1` | Unique | Enforce email uniqueness; enable email-based queries |
| Sorted-updatedAt | `updatedAt: -1` | Non-unique | Support sorting by recency; identify stale records |
| Active-users | `deletedAt: 1, updatedAt: -1` | Non-unique | Efficient soft-delete filtering; fast active-user queries |

### Validation Rules

1. **userId**: Non-empty string, case-sensitive, immutable after creation
2. **email**: Valid email format, case-insensitive for uniqueness (stored lowercase), immutable after creation
3. **displayName**: 1–255 characters, can contain Unicode
4. **metadata**: Unrestricted JSON object (max 16MB per document via MongoDB limits)
5. **createdAt/updatedAt**: ISO8601 timestamps in UTC
6. **deletedAt**: Null by default; immutable once set; indicates soft-delete

### Uniqueness Constraints

- **userId**: Globally unique (one user per auth provider ID)
- **email**: Globally unique (one user per email)
- Enforcement: Mongoose schema-level unique indexes + MongoDB index

### Soft-Delete Behavior

- **Soft-delete action**: Set `deletedAt` to current timestamp (read-only thereafter)
- **Default query filter**: Exclude `{ deletedAt: { $ne: null } }` from all standard queries
- **Admin override**: Queries may explicitly include deleted users with `includeDeleted: true`
- **No cascade**: Soft-deleted users remain in system; external cleanup (if any) is operational concern

### Query Examples

#### Active Users Only (Default)

```javascript
db.users.find({ deletedAt: null })
```

#### Including Deleted Users (Admin)

```javascript
db.users.find({})  // No filter for deletedAt
```

#### Lookup by userId

```javascript
db.users.findOne({ userId: "user_123" })
```

#### Lookup by Email

```javascript
db.users.findOne({ email: "user@example.com" })
```

---

## Collection: `user_events`

### Purpose

Immutable event log for all webhook payloads received and processed. Provides audit trail, replay capability, and debugging support.

### Schema Definition

#### Fields

| Field | Type | Constraints | Default | Index | Notes |
|-------|------|-----------|---------|-------|-------|
| `_id` | ObjectId | Auto-generated | — | Primary | Unique MongoDB document ID |
| `eventId` | String | Optional, unique if provided | UUID | — | External event ID (if provided by source) |
| `eventType` | String | Required, enum | — | Indexed | One of: `created`, `updated`, `deleted` |
| `userId` | String | Optional | — | Indexed | User ID from payload (may be null if malformed) |
| `payload` | Object | Required, complete | — | — | Raw webhook body as received |
| `source` | String | Optional | — | — | Event source identifier (e.g., "clerk", "analytics") |
| `signature` | String | Optional | — | — | Webhook signature hash (for audit) |
| `signatureValid` | Boolean | Optional | `null` | — | Signature validation result (null = not checked) |
| `receivedAt` | ISO8601 | Server-set | Now | Indexed | Server timestamp when event was received |
| `processedAt` | ISO8601 | Optional | — | — | Server timestamp when event was processed |
| `status` | String | Required, enum | `stored` | Indexed | One of: `stored`, `processed`, `failed` |
| `error` | String | Optional | — | — | Error message if processing failed |

#### TypeScript Interface

```typescript
export interface UserEventDoc extends Document {
  _id: mongoose.Types.ObjectId
  eventId?: string
  eventType: 'created' | 'updated' | 'deleted'
  userId?: string
  payload: Record<string, unknown>
  source?: string
  signature?: string
  signatureValid?: boolean | null
  receivedAt: Date
  processedAt?: Date
  status: 'stored' | 'processed' | 'failed'
  error?: string
}
```

### Indexes

| Index Name | Fields | Type | Reason |
|-----------|--------|------|--------|
| Primary | `_id` | Unique | Default MongoDB index |
| SortedReceived | `receivedAt: -1` | Non-unique | Support sorting by recency; oldest-first scans |
| ByEventType | `eventType: 1, receivedAt: -1` | Non-unique | Filter by event type + recency |
| ByStatus | `status: 1, receivedAt: -1` | Non-unique | Find failed/pending events |
| ByUserId | `userId: 1, receivedAt: -1` | Non-unique | Audit trail by user |

### Validation Rules

1. **eventType**: Must be one of `created`, `updated`, `deleted` (enum validation)
2. **payload**: Complete, valid JSON object; stored as-is (no mutation)
3. **receivedAt**: ISO8601 UTC timestamp, server-set at request arrival
4. **processedAt**: Optional; set only if processing completed successfully
5. **status**: Must be one of `stored`, `processed`, `failed` (enum validation)
6. **error**: Populated only if `status === 'failed'`

### Event Lifecycle

1. **Received**: Webhook POST arrives → validate structure → store with `status: 'stored'` → return 200 immediately
2. **Processed**: Apply changes to `users` collection (sync, within same request or async) → set `processedAt` → set `status: 'processed'`
3. **Failed**: If processing fails → set `status: 'failed'` → populate `error` field → optionally retry (external responsibility)

### Data Retention

- **Retention Policy**: Events stored indefinitely (no automatic archival in code)
- **Operational Cleanup**: Database administrators can implement archival/cleanup policies as needed
- **Compliance**: No GDPR-specific cleanup logic (out of scope; assume operational compliance)

---

## Mongoose Schema Definitions

### User Schema (TypeScript)

```typescript
import mongoose, { Schema, Document } from 'mongoose'

export interface UserDoc extends Document {
  _id: mongoose.Types.ObjectId
  userId: string
  email: string
  displayName: string
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

const UserSchema = new Schema<UserDoc>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      immutable: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      immutable: true,
    },
    displayName: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 255,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
)

// Compound index for soft-delete filtering
UserSchema.index({ deletedAt: 1, updatedAt: -1 })

// Export model and interface
let UserModel: mongoose.Model<UserDoc>
try {
  UserModel = mongoose.model<UserDoc>('User')
} catch {
  UserModel = mongoose.model<UserDoc>('User', UserSchema)
}

export default UserModel
```

### UserEvent Schema (TypeScript)

```typescript
import mongoose, { Schema, Document } from 'mongoose'

export interface UserEventDoc extends Document {
  _id: mongoose.Types.ObjectId
  eventId?: string
  eventType: 'created' | 'updated' | 'deleted'
  userId?: string
  payload: Record<string, unknown>
  source?: string
  signature?: string
  signatureValid?: boolean | null
  receivedAt: Date
  processedAt?: Date
  status: 'stored' | 'processed' | 'failed'
  error?: string
}

const UserEventSchema = new Schema<UserEventDoc>(
  {
    eventId: {
      type: String,
      sparse: true,
      unique: true,
    },
    eventType: {
      type: String,
      enum: ['created', 'updated', 'deleted'],
      required: true,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    source: String,
    signature: String,
    signatureValid: {
      type: Boolean,
      default: null,
    },
    receivedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    processedAt: Date,
    status: {
      type: String,
      enum: ['stored', 'processed', 'failed'],
      required: true,
      default: 'stored',
      index: true,
    },
    error: String,
  },
  { _id: true }
)

// Compound indexes
UserEventSchema.index({ eventType: 1, receivedAt: -1 })
UserEventSchema.index({ status: 1, receivedAt: -1 })
UserEventSchema.index({ userId: 1, receivedAt: -1 })

// Export model and interface
let UserEventModel: mongoose.Model<UserEventDoc>
try {
  UserEventModel = mongoose.model<UserEventDoc>('UserEvent')
} catch {
  UserEventModel = mongoose.model<UserEventDoc>('UserEvent', UserEventSchema)
}

export default UserEventModel
```

---

## Migration Steps (Operations)

### 1. Create Collections & Indexes (MongoDB Atlas)

```javascript
// Create users collection with indexes
db.createCollection('users')
db.users.createIndex({ userId: 1 }, { unique: true })
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ updatedAt: -1 })
db.users.createIndex({ deletedAt: 1, updatedAt: -1 })

// Create user_events collection with indexes
db.createCollection('user_events')
db.user_events.createIndex({ eventType: 1, receivedAt: -1 })
db.user_events.createIndex({ status: 1, receivedAt: -1 })
db.user_events.createIndex({ userId: 1, receivedAt: -1 })
db.user_events.createIndex({ receivedAt: -1 })
```

### 2. Verify Indexes

```javascript
db.users.getIndexes()
db.user_events.getIndexes()
```

### 3. Test Uniqueness Constraints

```javascript
// Attempt duplicate userId (should fail)
db.users.insertOne({ userId: "test", email: "test1@example.com", displayName: "Test" })
db.users.insertOne({ userId: "test", email: "test2@example.com", displayName: "Test 2" })
// Expected: Duplicate key error

// Attempt duplicate email (should fail)
db.users.insertOne({ userId: "user1", email: "dup@example.com", displayName: "User 1" })
db.users.insertOne({ userId: "user2", email: "dup@example.com", displayName: "User 2" })
// Expected: Duplicate key error
```

---

## Data Model Relationships

### User ↔ UserEvent

- **Relationship**: One-to-many (one user may have multiple events, though events are immutable history)
- **Cardinality**: 1:N
- **Foreign Key**: `user_events.userId` → `users.userId` (referential, not enforced in MongoDB)
- **Join Pattern**: Query by `userId` in both collections
- **Cascade**: None (events are immutable; soft-deleting a user does not affect event history)

---

## Design Decisions Rationale

### Why Soft-Delete?

- Preserves audit trail and data integrity
- Allows user recovery / GDPR right-to-be-forgotten (latter handled separately, not in this feature)
- Maintains referential integrity without cascading deletes

### Why Timestamp-Based Conflict Resolution?

- Handles distributed, eventually-consistent webhook delivery
- Prevents late-arriving updates from overwriting recent data
- Logs conflicts for operational debugging

### Why Immutable Fields?

- Prevents accidental mutation of auth provider identity
- Maintains consistency with Clerk source of truth

### Why Separate user_events Collection?

- Decouples event audit trail from operational user records
- Enables high-volume event ingestion without impacting user queries
- Supports compliance and replay scenarios

---

## Performance Characteristics

| Operation | Complexity | Index Used | Expected Latency |
|-----------|-----------|-----------|-----------------|
| Create user | O(1) | Unique indexes on userId, email | <50ms |
| Read by userId | O(1) | Unique-userId index | <10ms |
| Read by email | O(1) | Unique-email index | <10ms |
| List active users (paginated) | O(log n) | Active-users index | <100ms (1000 docs) |
| Upsert user (from webhook) | O(1) | Unique indexes | <100ms |
| Store event | O(1) | Indexes on status, eventType | <50ms |
| List events by userId | O(log n) | ByUserId index | <100ms (10k events) |

---

## Security & Validation Considerations

1. **Input Validation**: All webhook payloads validated against Zod schemas before storage
2. **Unique Constraints**: Enforced at database level; violations return HTTP 409 Conflict
3. **Immutability**: `userId` and `email` set via `immutable: true` in Mongoose
4. **Soft-Delete**: All default queries exclude deleted users; explicit flag required to include
5. **Audit Trail**: All events stored immutably in `user_events` for compliance
6. **Signature Validation**: Optional HMAC-SHA256 validation; skip if `WEBHOOK_SECRET` not set
7. **Timestamp Conflict Resolution**: Late-arriving updates logged but not stored (reduces attack surface for data manipulation)

---

## Appendix: Example Documents

### Example User Document

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "userId": "user_123_clerk",
  "email": "alice@example.com",
  "displayName": "Alice Smith",
  "metadata": {
    "department": "Engineering",
    "timezone": "America/New_York"
  },
  "createdAt": ISODate("2025-11-18T12:00:00Z"),
  "updatedAt": ISODate("2025-11-18T14:30:00Z"),
  "deletedAt": null
}
```

### Example UserEvent Document (created event)

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "eventId": "evt_001",
  "eventType": "created",
  "userId": "user_123_clerk",
  "payload": {
    "userId": "user_123_clerk",
    "email": "alice@example.com",
    "displayName": "Alice Smith",
    "metadata": {
      "department": "Engineering"
    },
    "timestamp": "2025-11-18T12:00:00Z"
  },
  "source": "clerk",
  "signature": "sha256=abc123...",
  "signatureValid": true,
  "receivedAt": ISODate("2025-11-18T12:00:05Z"),
  "processedAt": ISODate("2025-11-18T12:00:06Z"),
  "status": "processed"
}
```

### Example UserEvent Document (updated event with timestamp conflict)

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "eventType": "updated",
  "userId": "user_123_clerk",
  "payload": {
    "userId": "user_123_clerk",
    "displayName": "Alice A. Smith",
    "timestamp": "2025-11-18T12:30:00Z"
  },
  "source": "clerk",
  "receivedAt": ISODate("2025-11-18T13:00:00Z"),
  "processedAt": ISODate("2025-11-18T13:00:01Z"),
  "status": "processed"
}
```

---

*This data model is finalized and ready for implementation in Phase 2. All Mongoose schemas are provided for direct copy-paste into `src/lib/models/user.ts`.*
