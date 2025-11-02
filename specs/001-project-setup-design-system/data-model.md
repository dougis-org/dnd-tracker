# Data Model: F001 — Project Setup & Design System

**Date**: 2025-11-01  
**Feature**: Project Setup & Design System  
**Status**: N/A for Infrastructure

## Overview

This feature focuses on establishing the project infrastructure and design system.
No domain-specific data models are introduced in this phase.

## Foundation for Future Models

This setup establishes the infrastructure that will support all future data models:

### Database Connection

- **MongoDB 8.0+** via Mongoose ODM
- Connection pooling configured
- Environment-based connection strings
- Graceful connection handling

### Mongoose Configuration

```typescript
// src/lib/db/mongoose.ts
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => mongoose)
  }

  cached.conn = await cached.promise
  return cached.conn
}

export default connectDB
```

### TypeScript Type System

Base types and utilities established for future models:

```typescript
// src/types/common.ts

// Common timestamp fields
export interface Timestamps {
  createdAt: Date
  updatedAt: Date
}

// Soft delete pattern
export interface SoftDelete {
  deletedAt?: Date
}

// Base entity interface
export interface BaseEntity extends Timestamps, SoftDelete {
  _id: string
}

// User reference pattern (for future models)
export interface UserOwned {
  userId: string
}

// MongoDB ObjectId type helper
export type ObjectId = string
```

### Validation Framework

Zod schema patterns for future API validations:

```typescript
// src/lib/validations/common.ts
import { z } from 'zod'

// MongoDB ObjectId validation
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/)

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
})

// Common field schemas
export const nameSchema = z.string().min(1).max(100)
export const descriptionSchema = z.string().max(1000)
export const emailSchema = z.string().email()
```

## Theme Preferences (User Settings)

While not a full data model, theme preferences are stored client-side:

### localStorage Schema

```typescript
// Managed by next-themes
interface ThemePreference {
  theme: 'light' | 'dark' | 'system'
}

// Key: 'theme'
// Value: 'light' | 'dark' | 'system'
```

This is automatically handled by the `next-themes` package and persists in browser localStorage.

## Future Data Models

The following data models will be implemented in subsequent features:

### Phase 2: Authentication & User Management

- **User Model** (Feature 014)
  - Clerk integration
  - Profile preferences
  - Subscription tier
  - Usage metrics

### Phase 3: Core Entity Management

- **Character Model** (Feature 018)
  - D&D 5e character stats
  - Equipment, spells, features
  - Templates support

- **Monster Model** (Feature 023)
  - Stat blocks
  - Special abilities
  - Legendary/lair actions

- **Item Model** (Feature 026)
  - Weapons, armor, magic items
  - Rarity and properties

- **Party Model** (Feature 028)
  - Party composition
  - Member roles
  - Campaign association

### Phase 4: Combat & Encounters

- **Encounter Model** (Feature 034)
  - Participants (parties, characters, monsters)
  - Environment and hazards
  - Lair actions

- **Combat Session Model** (Feature 036)
  - Initiative order
  - HP tracking
  - Status effects
  - Combat history

### Phase 5: Offline Support

- **IndexedDB Schema** (Feature 031)
  - Offline combat sessions
  - Sync queue
  - Cached entities

## Database Indexing Strategy

While no collections exist yet, the foundation establishes indexing patterns:

### Common Index Patterns

```typescript
// User ownership index (will be used in all collections)
{ userId: 1, createdAt: -1 }

// Soft delete index (for filtering active records)
{ deletedAt: 1 }

// Name search index (for list views)
{ userId: 1, name: 1 }

// Status filters (for combat, subscriptions, etc.)
{ userId: 1, status: 1 }
```

These patterns will be applied consistently across all future collections.

## API Response Patterns

Standard response structures established for consistency:

### Success Response

```typescript
interface SuccessResponse<T> {
  data: T
  meta?: {
    timestamp: string
    requestId: string
    version: string
  }
}
```

### Error Response

```typescript
interface ErrorResponse {
  error: {
    type: string
    message: string
    code: string
    details?: Record<string, any>
    timestamp: string
    requestId: string
  }
}
```

### Paginated Response

```typescript
interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalPages: number
    totalItems: number
    hasNext: boolean
    hasPrev: boolean
  }
  links: {
    self: string
    first: string
    last: string
    next: string | null
    prev: string | null
  }
}
```

## Testing Data Fixtures

Base fixtures for future testing:

```typescript
// tests/fixtures/users.ts
export const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  clerkId: 'user_test123',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
}

// tests/fixtures/common.ts
export function createMockEntity<T>(overrides?: Partial<T>): T {
  return {
    _id: '507f1f77bcf86cd799439011',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as T
}
```

## Alignment with Technical Design

This infrastructure setup aligns with:

- **Database Design**: `docs/design/dnd-tracker-database-design.md`
  - Mongoose connection pattern
  - Collection schema conventions
  - Indexing strategy

- **API Design**: `docs/design/dnd-tracker-api-design.md`
  - Response format standards
  - Error handling patterns
  - Pagination structure

- **Technical Design**: `docs/design/dnd-tracker-technical-design.md`
  - Repository pattern foundation
  - Service layer structure
  - Type safety approach

## Next Steps

Future features will build upon this foundation:

1. **Feature 014**: Implement User model with Clerk webhook
2. **Feature 018**: Implement Character model with full D&D 5e schema
3. **Feature 023**: Implement Monster model with stat blocks
4. **Feature 028**: Implement Party model with member management
5. **Feature 034**: Implement Encounter model with participants
6. **Feature 036**: Implement Combat Session with state machine

Each model implementation will reference this foundation and follow established patterns.

## References

- Technical Design: `docs/design/dnd-tracker-technical-design.md`
- Database Design: `docs/design/dnd-tracker-database-design.md`
- API Design: `docs/design/dnd-tracker-api-design.md`
- Tech Stack: `docs/Tech-Stack.md`
