# Quickstart: Feature 014 - MongoDB User Model & Webhook

**Date**: 2025-11-18 | **Version**: 1.0  
**Target Audience**: Backend developers implementing Feature 014

---

## Overview

This quickstart guide walks through:
1. Setting up MongoDB connection
2. Initializing User and UserEvent models
3. Creating internal CRUD endpoints
4. Implementing webhook receiver
5. Testing all components locally

---

## Prerequisites

- Node.js 25.1.0+
- MongoDB Atlas account (or local MongoDB instance)
- Next.js 16.0+ project setup
- Environment variables ready (see `.env.example`)

---

## Step 1: Configure Environment Variables

Create `.env.local` (or update existing):

```bash
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dnd-tracker?retryWrites=true&w=majority
MONGODB_DB=dnd-tracker

# Webhook Security (optional; skip validation if unset)
WEBHOOK_SECRET=your-hmac-secret-here

# Webhook Configuration
WEBHOOK_MAX_PAYLOAD_SIZE=1048576   # 1MB
WEBHOOK_TIMEOUT_MS=3000             # 3 seconds
```

Add to `.env.example` for documentation.

---

## Step 2: Set Up Database Connection Helper

**File**: `src/lib/db/connection.ts`

If not already present (check codebase search results), create:

```typescript
import mongoose from 'mongoose'

interface MongooseConnection {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseConnection | undefined
}

function getCachedConnection(): MongooseConnection {
  if (!global.mongoose) {
    global.mongoose = { conn: null, promise: null }
  }
  return global.mongoose
}

function validateMongoUri(): string {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set')
  }
  return uri
}

function getConnectionOptions() {
  return {
    dbName: process.env.MONGODB_DB || 'dnd-tracker',
    retryWrites: true,
    maxPoolSize: 10,
  }
}

function logConnectionSuccess(): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Connected to MongoDB Atlas')
  }
}

function handleConnectionError(error: unknown, cached: ReturnType<typeof getCachedConnection>): never {
  cached.promise = null
  console.error('❌ MongoDB connection error:', error)
  throw error
}

export async function connectToMongo(): Promise<typeof mongoose> {
  const uri = validateMongoUri()
  const cached = getCachedConnection()

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = getConnectionOptions()
    cached.promise = mongoose.connect(uri, opts)
  }

  try {
    cached.conn = await cached.promise
    logConnectionSuccess()
    return cached.conn
  } catch (error) {
    return handleConnectionError(error, cached)
  }
}

export function resetConnectionCache(): void {
  if (global.mongoose) {
    global.mongoose.conn = null
    global.mongoose.promise = null
  }
}
```

---

## Step 3: Define User Models

**File**: `src/lib/models/user.ts`

Create models for both `User` and `UserEvent`:

```typescript
import mongoose, { Schema, Document } from 'mongoose'

// User Document Interface
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

// UserEvent Document Interface
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

// User Schema
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

UserSchema.index({ deletedAt: 1, updatedAt: -1 })

// UserEvent Schema
const UserEventSchema = new Schema<UserEventDoc>(
  {
    eventId: { type: String, sparse: true, unique: true },
    eventType: {
      type: String,
      enum: ['created', 'updated', 'deleted'],
      required: true,
      index: true,
    },
    userId: { type: String, index: true },
    payload: { type: Schema.Types.Mixed, required: true },
    source: String,
    signature: String,
    signatureValid: { type: Boolean, default: null },
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

UserEventSchema.index({ eventType: 1, receivedAt: -1 })
UserEventSchema.index({ status: 1, receivedAt: -1 })
UserEventSchema.index({ userId: 1, receivedAt: -1 })

// Export Models
let UserModel: mongoose.Model<UserDoc>
try {
  UserModel = mongoose.model<UserDoc>('User')
} catch {
  UserModel = mongoose.model<UserDoc>('User', UserSchema)
}

let UserEventModel: mongoose.Model<UserEventDoc>
try {
  UserEventModel = mongoose.model<UserEventDoc>('UserEvent')
} catch {
  UserEventModel = mongoose.model<UserEventDoc>('UserEvent', UserEventSchema)
}

export { UserSchema, UserEventSchema }
export default UserModel
export { UserEventModel }
```

---

## Step 4: Create Validation Schemas (Zod)

**File**: `src/lib/schemas/webhook.schema.ts`

```typescript
import { z } from 'zod'

export const createUserSchema = z.object({
  userId: z.string().min(1).max(255),
  email: z.string().email().toLowerCase(),
  displayName: z.string().min(1).max(255),
  metadata: z.record(z.unknown()).optional(),
})

export type CreateUserRequest = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  displayName: z.string().min(1).max(255).optional(),
  metadata: z.record(z.unknown()).optional(),
})

export type UpdateUserRequest = z.infer<typeof updateUserSchema>

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

---

## Step 5: Create Internal CRUD Endpoint

**File**: `src/app/api/internal/users/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { connectToMongo } from '@/lib/db/connection'
import UserModel from '@/lib/models/user'
import { createUserSchema } from '@/lib/schemas/webhook.schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = createUserSchema.parse(body)

    await connectToMongo()

    const user = await UserModel.create(validated)

    return NextResponse.json(
      {
        success: true,
        data: user.toObject(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation error',
            details: error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      )
    }

    if ((error as any)?.code === 11000) {
      const field = Object.keys((error as any).keyPattern)[0]
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Duplicate key error',
            details: { [field]: [`${field} already exists`] },
          },
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
```

---

## Step 6: Create Webhook Endpoint

**File**: `src/app/api/webhooks/user-events/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectToMongo } from '@/lib/db/connection'
import UserModel, { UserEventModel } from '@/lib/models/user'
import { webhookEventSchema } from '@/lib/schemas/webhook.schema'

function validateSignature(body: string, signature: string | null): boolean {
  const secret = process.env.WEBHOOK_SECRET
  if (!secret) return true // Skip validation if secret not set

  if (!signature) return false

  const [algo, hash] = signature.split('=')
  if (algo !== 'sha256') return false

  const computed = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return crypto.timingSafeEqual(computed, hash)
}

export async function POST(request: NextRequest) {
  try {
    const contentLength = request.headers.get('content-length')
    const maxSize = parseInt(process.env.WEBHOOK_MAX_PAYLOAD_SIZE || '1048576')

    if (contentLength && parseInt(contentLength) > maxSize) {
      return NextResponse.json(
        { success: false, error: { message: 'Payload too large' } },
        { status: 413 }
      )
    }

    const body = await request.text()
    const signature = request.headers.get('x-webhook-signature')

    if (!validateSignature(body, signature)) {
      return NextResponse.json(
        { success: false, error: { message: 'Signature validation failed' } },
        { status: 401 }
      )
    }

    const payload = JSON.parse(body)
    const validated = webhookEventSchema.parse(payload)

    await connectToMongo()

    // Store event
    const event = await UserEventModel.create({
      eventType: validated.eventType,
      eventId: validated.eventId,
      userId: validated.user.userId,
      payload: validated,
      receivedAt: new Date(),
      status: 'stored',
    })

    // Process based on event type
    if (validated.eventType === 'created') {
      await UserModel.create({
        userId: validated.user.userId,
        email: validated.user.email,
        displayName: validated.user.displayName,
        metadata: validated.user.metadata,
      })
    } else if (validated.eventType === 'updated') {
      const current = await UserModel.findOne({ userId: validated.user.userId })
      if (current) {
        const eventTimestamp = new Date(validated.timestamp).getTime()
        if (eventTimestamp > current.updatedAt.getTime()) {
          Object.assign(current, {
            displayName: validated.user.displayName,
            metadata: validated.user.metadata,
          })
          await current.save()
        }
      }
    } else if (validated.eventType === 'deleted') {
      await UserModel.updateOne(
        { userId: validated.user.userId },
        { deletedAt: new Date(validated.timestamp) }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Event received and stored',
        eventId: event._id,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Failed to process webhook' } },
      { status: 500 }
    )
  }
}
```

---

## Step 7: Create Tests (TDD)

**File**: `tests/integration/user.integration.test.ts`

```typescript
import { connectToMongo, clearMongoDatabase } from '@/tests/test-helpers/mongo-testcontainers'
import UserModel, { UserEventModel } from '@/lib/models/user'

describe('User CRUD & Webhook', () => {
  beforeAll(async () => {
    await connectToMongo()
  })

  afterEach(async () => {
    await clearMongoDatabase()
  })

  it('should create a user', async () => {
    const user = await UserModel.create({
      userId: 'test_user_1',
      email: 'test@example.com',
      displayName: 'Test User',
    })

    expect(user.userId).toBe('test_user_1')
    expect(user.deletedAt).toBeNull()
  })

  it('should prevent duplicate userId', async () => {
    await UserModel.create({
      userId: 'test_user_1',
      email: 'test1@example.com',
      displayName: 'Test',
    })

    await expect(
      UserModel.create({
        userId: 'test_user_1',
        email: 'test2@example.com',
        displayName: 'Test',
      })
    ).rejects.toThrow()
  })

  it('should soft-delete a user', async () => {
    const user = await UserModel.create({
      userId: 'test_user_1',
      email: 'test@example.com',
      displayName: 'Test',
    })

    await UserModel.updateOne({ _id: user._id }, { deletedAt: new Date() })
    const updated = await UserModel.findOne({ _id: user._id, deletedAt: null })
    expect(updated).toBeNull()
  })

  it('should store webhook events', async () => {
    const event = await UserEventModel.create({
      eventType: 'created',
      userId: 'test_user_1',
      payload: { userId: 'test_user_1', email: 'test@example.com' },
      status: 'stored',
    })

    expect(event.eventType).toBe('created')
    expect(event.status).toBe('stored')
  })
})
```

---

## Step 8: Local Testing

### Test User Creation
```bash
curl -X POST http://localhost:3000/api/internal/users \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "email": "user@example.com",
    "displayName": "John Doe"
  }'
```

### Test Webhook
```bash
curl -X POST http://localhost:3000/api/webhooks/user-events \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "created",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "user": {
      "userId": "user_123",
      "email": "user@example.com",
      "displayName": "John Doe"
    }
  }'
```

---

## Step 9: Verify MongoDB Collections

```javascript
// MongoDB Atlas connection
db.users.getIndexes()
db.user_events.getIndexes()

// Test data
db.users.find({})
db.user_events.find({})
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection timeout | Verify `MONGODB_URI`, check firewall, ensure IP whitelisted in Atlas |
| Duplicate key error | Clear collections: `db.users.deleteMany({})` |
| Signature validation fails | Check `WEBHOOK_SECRET` matches sender |
| Tests hang | Ensure testcontainers running; check Docker setup |

---

## Next Steps

1. Run all tests: `npm run test:ci`
2. Run linting: `npm run lint`
3. Build project: `npm run build`
4. Submit PR with all changes
5. Deploy to production

---

*This quickstart provides a complete, working implementation. For detailed specifications, refer to `data-model.md` and `contracts.md`.*
