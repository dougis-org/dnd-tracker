# Data Model: User Registration and Profile Management

**Date**: 2025-09-30
**Feature**: User Registration and Profile Management
**Branch**: 002-when-a-user

## Overview

This document defines the data model for user registration and profile management, including Clerk integration fields, D&D preferences, subscription tiers, and usage metrics.

## Entity: User

### Purpose
Represents a registered user with authentication credentials, D&D profile preferences, subscription tier, and usage tracking data.

### Schema Definition

```typescript
interface IUser extends Document {
  // Identity & Authentication
  _id: Types.ObjectId;
  clerkId: string;                    // Clerk user identifier (unique, indexed)
  email: string;                      // User email (unique, indexed, lowercase)
  username: string;                   // Unique username (indexed, lowercase)
  firstName: string;                  // User first name
  lastName: string;                   // User last name
  imageUrl?: string;                  // Profile image from Clerk
  authProvider: 'local' | 'clerk';    // Authentication provider
  isEmailVerified: boolean;           // Email verification status

  // Authorization & Subscription
  role: 'user' | 'admin';             // User role (indexed, default: 'user')
  subscriptionTier: 'free' | 'seasoned' | 'expert' | 'master' | 'guild';
                                      // Subscription tier (indexed, default: 'free')

  // D&D Profile Preferences
  displayName?: string;               // Optional display name (max 100 chars)
  timezone: string;                   // User timezone (default: 'UTC')
  dndEdition: string;                 // D&D edition preference (default: '5th Edition', max 50 chars)
  experienceLevel?: 'new' | 'beginner' | 'intermediate' | 'experienced' | 'veteran';
  primaryRole?: 'dm' | 'player' | 'both';
  profileSetupCompleted: boolean;     // Profile setup status (default: false)

  // User Preferences
  preferences: {
    theme: 'light' | 'dark' | 'system';          // UI theme (default: 'system')
    emailNotifications: boolean;                  // Email notifications (default: true)
    browserNotifications: boolean;                // Browser notifications (default: false)
    timezone: string;                             // Preference timezone (default: 'UTC')
    language: string;                             // UI language (default: 'en')
    diceRollAnimations: boolean;                  // Dice animations (default: true)
    autoSaveEncounters: boolean;                  // Auto-save (default: true)
  };

  // Usage Metrics
  sessionsCount: number;              // Total sessions count (default: 0)
  charactersCreatedCount: number;     // Characters created (default: 0)
  campaignsCreatedCount: number;      // Campaigns created (default: 0)
  metricsLastUpdated?: Date;          // Last metrics update timestamp

  // Clerk Integration
  lastClerkSync?: Date;               // Last sync with Clerk
  syncStatus: 'active' | 'pending' | 'error';  // Sync health (default: 'pending')

  // Timestamps
  lastLoginAt?: Date;                 // Last login timestamp (indexed)
  createdAt: Date;                    // Document creation (auto)
  updatedAt: Date;                    // Document update (auto)
}
```

### Field Constraints

| Field | Type | Required | Constraints | Default |
|-------|------|----------|-------------|---------|
| clerkId | String | No* | Unique, sparse index | - |
| email | String | Yes | Unique, max 254 chars, lowercase, email format | - |
| username | String | Yes | Unique, 3-30 chars, alphanumeric + underscore/hyphen, lowercase | - |
| firstName | String | Yes | 1-100 chars, letters/spaces/apostrophes/hyphens | - |
| lastName | String | Yes | 1-100 chars, letters/spaces/apostrophes/hyphens | - |
| role | Enum | Yes | 'user' or 'admin' | 'user' |
| subscriptionTier | Enum | Yes | 'free', 'seasoned', 'expert', 'master', 'guild' | 'free' |
| displayName | String | No | Max 100 chars | - |
| timezone | String | Yes | Non-empty string | 'UTC' |
| dndEdition | String | Yes | Max 50 chars | '5th Edition' |
| experienceLevel | Enum | No | 'new', 'beginner', 'intermediate', 'experienced', 'veteran' | - |
| primaryRole | Enum | No | 'dm', 'player', 'both' | - |
| profileSetupCompleted | Boolean | Yes | true/false | false |
| sessionsCount | Number | Yes | Non-negative integer | 0 |
| charactersCreatedCount | Number | Yes | Non-negative integer | 0 |
| campaignsCreatedCount | Number | Yes | Non-negative integer | 0 |

*clerkId is required for Clerk-authenticated users, not required for local auth users

### Indexes

```typescript
// Existing indexes
{ email: 1 }                              // Unique user lookup
{ username: 1 }                           // Unique username lookup
{ clerkId: 1 }                            // Unique Clerk user lookup (sparse)
{ role: 1 }                               // Admin queries
{ subscriptionTier: 1 }                   // Tier-based queries
{ isEmailVerified: 1 }                    // Verification status queries
{ lastLoginAt: -1 }                       // Recent activity queries
{ createdAt: -1 }                         // User registration timeline

// Future consideration if usage queries become common
{ subscriptionTier: 1, sessionsCount: 1 }  // Usage-based tier queries
```

### Validation Rules

**Email Validation**:
- Must be valid email format
- Maximum 254 characters
- Case-insensitive (stored lowercase)
- Unique across all users

**Username Validation**:
- 3-30 characters
- Alphanumeric, underscore, hyphen only
- Case-insensitive (stored lowercase)
- Unique across all users

**Name Validation**:
- First name: 1-100 characters, letters/spaces/apostrophes/hyphens
- Last name: 1-100 characters, letters/spaces/apostrophes/hyphens

**D&D Profile Validation**:
- displayName: Optional, max 100 characters
- timezone: Non-empty string, valid timezone identifier
- dndEdition: Max 50 characters
- experienceLevel: Must be one of enum values if provided
- primaryRole: Must be one of enum values if provided

**Usage Metrics Validation**:
- All counts must be non-negative integers
- Increments use atomic $inc operations to prevent race conditions

### State Transitions

**Profile Setup Flow**:
```
User Created (Clerk webhook)
  → profileSetupCompleted: false
  → subscriptionTier: 'free'

Profile Skipped
  → profileSetupCompleted: false
  → No D&D fields populated

Profile Completed
  → profileSetupCompleted: true
  → D&D fields populated (validated)
```

**Subscription Tier Transitions**:
```
New User: 'free' (default)
  ↓ (upgrade via Stripe)
Seasoned: 'seasoned'
  ↓ (upgrade)
Expert: 'expert'
  ↓ (upgrade)
Master: 'master'
  ↓ (upgrade)
Guild: 'guild'

Any tier can downgrade to any lower tier
```

**Sync Status Flow**:
```
User Created: 'pending'
  → First webhook processed: 'active'
  → Webhook error: 'error'
  → Retry successful: 'active'
```

### Relationships

**User → Parties** (future):
- One user can own multiple parties
- Constrained by subscription tier limits

**User → Characters** (future):
- One user can create multiple characters
- Constrained by subscription tier limits (charactersCreatedCount)

**User → Encounters** (future):
- One user can create multiple encounters
- Constrained by subscription tier limits

**User → Sessions** (future):
- One user can have multiple sessions
- Tracked via sessionsCount metric

## Subscription Tier Limits

```typescript
export const SUBSCRIPTION_LIMITS = {
  free: {
    parties: 1,
    encounters: 3,
    characters: 10,
    maxParticipants: 6,
  },
  seasoned: {
    parties: 3,
    encounters: 15,
    characters: 50,
    maxParticipants: 10,
  },
  expert: {
    parties: 10,
    encounters: 50,
    characters: 200,
    maxParticipants: 20,
  },
  master: {
    parties: 25,
    encounters: 100,
    characters: 500,
    maxParticipants: 30,
  },
  guild: {
    parties: Infinity,
    encounters: Infinity,
    characters: Infinity,
    maxParticipants: 50,
  },
};
```

## Data Migration

### Phase 1: No Migration Required
- All new fields are optional or have defaults
- MongoDB handles missing fields gracefully
- Existing User documents continue to function
- New fields populate on first read/update

### Future Considerations
- If usage metrics grow complex → Extract to separate UsageMetrics collection
- If D&D preferences expand significantly → Extract to UserProfile subdocument
- If metrics require time-series analysis → Implement event logging

## Security Considerations

**Sensitive Fields** (never exposed to client):
- passwordHash (for local auth users)
- emailVerificationToken
- passwordResetToken
- passwordResetExpires

**Admin-Only Modifications**:
- role field (user → admin requires manual DB update)
- subscriptionTier (managed via Stripe webhooks or admin panel)

**User-Modifiable Fields**:
- displayName, timezone, dndEdition, experienceLevel, primaryRole
- preferences object
- profileSetupCompleted (indirectly via form submission)

**System-Managed Fields**:
- clerkId, lastClerkSync, syncStatus (Clerk webhooks)
- sessionsCount, charactersCreatedCount, campaignsCreatedCount (usage tracking)
- createdAt, updatedAt, lastLoginAt (automatic timestamps)

## Performance Considerations

**Read Patterns**:
- Primary key lookup by _id: O(1) with index
- Clerk ID lookup: O(1) with sparse index
- Email/username lookup: O(1) with unique indexes
- Profile reads always fetch complete user document (no JOINs needed)

**Write Patterns**:
- User creation: Single document insert
- Profile update: Single document update (atomic)
- Usage increment: Atomic $inc operation (no read-modify-write cycle)
- Clerk sync: Upsert by clerkId (idempotent)

**Optimization Notes**:
- Embedded usage metrics avoid JOIN overhead
- Sparse index on clerkId saves space for local auth users
- Compound indexes deferred until query patterns established

---
*Data model version 1.0 - 2025-09-30*
