# API Contracts: Feature 014 - MongoDB User Model & Webhook

**Date**: 2025-11-18 | **Version**: 1.0  
**Status**: Finalized for Implementation

---

## Overview

This document defines the HTTP API contracts for Feature 014:
- **Internal CRUD endpoints** (`/api/internal/users/*`) — Server-side only, no public exposure
- **Webhook receiver** (`/api/webhooks/user-events`) — External system POST endpoint

All endpoints:
- Return JSON responses
- Use proper HTTP status codes (201, 200, 204, 400, 401, 404, 409, 413, 500, 504)
- Accept and validate request bodies with Zod schemas
- Support structured error responses

---

## Internal CRUD Endpoints

### 1. Create User

**Endpoint**: `POST /api/internal/users`  
**Purpose**: Create a new user record (typically called via Clerk webhook or admin action)  
**Access**: Internal only (server-side)

#### Request

```http
POST /api/internal/users
Content-Type: application/json

{
  "userId": "user_abc123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "metadata": { "role": "player" }
}
```

**Request Schema** (Zod):
```typescript
export const createUserSchema = z.object({
  userId: z.string().min(1).max(255),
  email: z.string().email().toLowerCase(),
  displayName: z.string().min(1).max(255),
  metadata: z.record(z.unknown()).optional(),
})

export type CreateUserRequest = z.infer<typeof createUserSchema>
```

#### Response: 201 Created

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "user_abc123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "metadata": { "role": "player" },
    "createdAt": "2025-11-18T12:00:00Z",
    "updatedAt": "2025-11-18T12:00:00Z",
    "deletedAt": null
  }
}
```

#### Response: 400 Bad Request (validation error)

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": {
    "message": "Validation error",
    "details": {
      "email": ["Invalid email address"],
      "displayName": ["String must contain at least 1 character"]
    }
  }
}
```

#### Response: 409 Conflict (duplicate userId or email)

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "success": false,
  "error": {
    "message": "Duplicate userId or email",
    "details": {
      "constraint": "userId",
      "value": "user_abc123"
    }
  }
}
```

#### Response: 500 Internal Server Error

```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "success": false,
  "error": {
    "message": "Database error"
  }
}
```

---

### 2. Get User by ID

**Endpoint**: `GET /api/internal/users/:userId`  
**Purpose**: Retrieve a single user by userId  
**Access**: Internal only (server-side)

#### Request

```http
GET /api/internal/users/user_abc123
```

#### Response: 200 OK

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "user_abc123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "metadata": { "role": "player" },
    "createdAt": "2025-11-18T12:00:00Z",
    "updatedAt": "2025-11-18T12:00:00Z",
    "deletedAt": null
  }
}
```

#### Response: 404 Not Found

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "success": false,
  "error": {
    "message": "User not found",
    "userId": "user_abc123"
  }
}
```

---

### 3. Update User

**Endpoint**: `PATCH /api/internal/users/:userId`  
**Purpose**: Partial update of user record  
**Access**: Internal only (server-side)

#### Request

```http
PATCH /api/internal/users/user_abc123
Content-Type: application/json

{
  "displayName": "John D. Doe",
  "metadata": { "role": "dm", "level": 5 }
}
```

**Request Schema** (Zod):
```typescript
export const updateUserSchema = z.object({
  displayName: z.string().min(1).max(255).optional(),
  metadata: z.record(z.unknown()).optional(),
})

export type UpdateUserRequest = z.infer<typeof updateUserSchema>
```

#### Response: 200 OK

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "user_abc123",
    "email": "user@example.com",
    "displayName": "John D. Doe",
    "metadata": { "role": "dm", "level": 5 },
    "createdAt": "2025-11-18T12:00:00Z",
    "updatedAt": "2025-11-18T12:05:00Z",
    "deletedAt": null
  }
}
```

#### Response: 404 Not Found

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "success": false,
  "error": {
    "message": "User not found",
    "userId": "user_abc123"
  }
}
```

---

### 4. Delete User (Soft Delete)

**Endpoint**: `DELETE /api/internal/users/:userId`  
**Purpose**: Soft-delete a user (set deletedAt timestamp)  
**Access**: Internal only (server-side)

#### Request

```http
DELETE /api/internal/users/user_abc123
```

#### Response: 204 No Content

```http
HTTP/1.1 204 No Content
```

(No body; successful deletion indicated by 204 status)

#### Response: 404 Not Found

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "success": false,
  "error": {
    "message": "User not found",
    "userId": "user_abc123"
  }
}
```

---

## Webhook Receiver

### Receive User Event

**Endpoint**: `POST /api/webhooks/user-events`  
**Purpose**: Receive and process user lifecycle events from external systems (Clerk, etc.)  
**Access**: Public (signed requests validated via HMAC-SHA256)  
**Rate Limiting**: None (external system responsible for throttling)

#### Request

```http
POST /api/webhooks/user-events
Content-Type: application/json
X-Webhook-Signature: sha256=abc123def456...

{
  "eventType": "created",
  "eventId": "evt_001",
  "timestamp": "2025-11-18T12:00:00Z",
  "user": {
    "userId": "user_abc123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "metadata": { "role": "player" }
  }
}
```

**Request Schema** (Zod):
```typescript
export const webhookEventSchema = z.object({
  eventType: z.enum(['created', 'updated', 'deleted']),
  eventId: z.string().optional(),
  timestamp: z.string().datetime().or(z.number()),
  user: z.object({
    userId: z.string().min(1),
    email: z.string().email().optional(),
    displayName: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
})

export type WebhookEventRequest = z.infer<typeof webhookEventSchema>
```

**Signature Validation**:
- Header: `X-Webhook-Signature: sha256=<hex>`
- Compute: `HMAC-SHA256(request_body, WEBHOOK_SECRET)`
- Validation: If `WEBHOOK_SECRET` set, validate header; if not set, skip validation
- Failure: Return 401 Unauthorized

#### Response: 200 OK (all event types)

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "Event received and stored",
  "eventId": "evt_001"
}
```

Response is identical for all event types (`created`, `updated`, `deleted`) to indicate fire-and-forget success.

#### Response: 400 Bad Request (malformed payload)

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": {
    "message": "Validation error",
    "details": {
      "eventType": ["Invalid enum value. Expected 'created' | 'updated' | 'deleted'"],
      "user.userId": ["String must contain at least 1 character"]
    }
  }
}
```

#### Response: 401 Unauthorized (invalid signature)

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "success": false,
  "error": {
    "message": "Webhook signature validation failed"
  }
}
```

#### Response: 413 Payload Too Large (> 1MB)

```http
HTTP/1.1 413 Payload Too Large
Content-Type: application/json

{
  "success": false,
  "error": {
    "message": "Request payload exceeds maximum size (1MB)",
    "maxSize": 1048576,
    "receivedSize": 2097152
  }
}
```

#### Response: 504 Gateway Timeout (processing exceeds 3 seconds)

```http
HTTP/1.1 504 Gateway Timeout
Content-Type: application/json

{
  "success": false,
  "error": {
    "message": "Webhook processing timeout"
  }
}
```

#### Response: 500 Internal Server Error

```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "success": false,
  "error": {
    "message": "Failed to process webhook"
  }
}
```

---

## Webhook Event Processing Logic

### created Event
1. Validate request and signature
2. Store event in `user_events` collection with `status: 'stored'`
3. Insert new user into `users` collection
4. Return 200 immediately (fire-and-forget)
5. Log at INFO level on success, WARN on validation failure

### updated Event
1. Validate request and signature
2. Store event in `user_events` collection with `status: 'stored'`
3. Fetch current user by `userId`
4. Compare event `timestamp` with current `updatedAt`:
   - If `event.timestamp > current.updatedAt`: upsert user fields
   - If `event.timestamp <= current.updatedAt`: log WARN "late-arriving event", skip upsert
5. Return 200 immediately (fire-and-forget)

### deleted Event
1. Validate request and signature
2. Store event in `user_events` collection with `status: 'stored'`
3. Fetch current user by `userId`
4. Set `deletedAt` to event timestamp (soft-delete)
5. Return 200 immediately (fire-and-forget)

---

## Error Response Format

All error responses follow this consistent schema:

```typescript
export interface ErrorResponse {
  success: false
  error: {
    message: string           // Human-readable error summary
    details?: Record<string, string[]>  // Validation errors per field
    code?: string            // Optional: machine-readable error code
  }
}
```

---

## Success Response Format

All success responses follow this consistent schema:

```typescript
export interface SuccessResponse<T> {
  success: true
  data?: T               // Populated for GET, POST, PATCH
  message?: string       // Optional: summary message
  eventId?: string       // Optional: for webhook endpoint
}
```

---

## HTTP Status Codes Summary

| Status | Meaning | Trigger |
|--------|---------|---------|
| 200 | OK | Successful GET, PATCH, webhook receipt |
| 201 | Created | Successful POST (new user created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Malformed JSON, validation errors |
| 401 | Unauthorized | Invalid webhook signature |
| 404 | Not Found | User/resource doesn't exist |
| 409 | Conflict | Duplicate userId or email |
| 413 | Payload Too Large | Request > 1MB |
| 500 | Internal Server Error | Database error, system failure |
| 504 | Gateway Timeout | Processing exceeds 3s |

---

## Environment Variables

```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dnd-tracker
MONGODB_DB=dnd-tracker
WEBHOOK_SECRET=your-secret-key-here (optional; if unset, signature validation skipped)
WEBHOOK_MAX_PAYLOAD_SIZE=1048576 (default: 1MB)
WEBHOOK_TIMEOUT_MS=3000 (default: 3s)
```

---

## Logging Format

All endpoints log structured messages:

```json
{
  "level": "info",
  "timestamp": "2025-11-18T12:00:00Z",
  "endpoint": "/api/webhooks/user-events",
  "method": "POST",
  "userId": "user_abc123",
  "eventType": "created",
  "status": 200,
  "duration_ms": 45
}
```

Levels:
- **INFO**: Successful operations
- **WARN**: Validation failures, late-arriving events, signature mismatches
- **ERROR**: System failures, database errors

---

*These contracts are ready for implementation. All Zod schemas will be placed in `src/lib/schemas/webhook.schema.ts` and API routes in `/src/app/api/`.*
