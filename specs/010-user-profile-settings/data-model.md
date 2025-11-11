# Data Model: User Profile & Settings - F010

**Feature**: User Profile & Settings Pages (F010)  
**Date**: 2025-11-11  
**Phase**: 1 (Design & Contracts)

---

## Overview

This document defines the data entities, relationships, and validation rules for F010 (User Profile & Settings Pages). The model is designed to be composable, mockable in F010, and easily integratable with Mongoose (F014) and Clerk (F013).

---

## Entity Definitions

### 1. UserProfile

**Purpose**: Core user account information  
**Stores**: Name, email, created/updated timestamps

```typescript
interface UserProfile {
  id: string;                         // Unique identifier (ObjectId or Clerk userId)
  name: string;                       // 1-100 chars, Unicode allowed
  email: string;                      // RFC 5322 format, unique per user
  createdAt: Date;                    // ISO 8601 timestamp
  updatedAt: Date;                    // ISO 8601 timestamp, bumped on any change
}
```

**Validation Rules**:

- `id`: Required, non-empty string
- `name`: Required, 1–100 characters, Unicode allowed (no emoji restrictions)
- `email`: Required, RFC 5322 format, must be unique (enforced at F014 MongoDB level)
- `createdAt`: Immutable, set at profile creation
- `updatedAt`: Updated on any field modification

**Sample Data**:

```json
{
  "id": "user-123",
  "name": "Alice Adventurer",
  "email": "alice@example.com",
  "createdAt": "2025-10-01T00:00:00Z",
  "updatedAt": "2025-11-11T19:00:00Z"
}
```

---

### 2. UserPreferences (D&D Preferences)

**Purpose**: Store user's D&D-specific choices  
**Stores**: Experience level, preferred role, ruleset

```typescript
interface UserPreferences {
  userId: string;                     // Foreign key to UserProfile.id
  experienceLevel: 'Novice' | 'Intermediate' | 'Advanced';
  preferredRole: 'DM' | 'Player' | 'Both';
  ruleset: '5e' | '3.5e' | 'PF2e';
  updatedAt: Date;                    // ISO 8601 timestamp, bumped on any change
}
```

**Enum Values**:

- `experienceLevel`:
  - `'Novice'` — Beginner, learning D&D
  - `'Intermediate'` — Some experience, familiar with core rules
  - `'Advanced'` — Veteran, houserules, playstyle preferences
- `preferredRole`:
  - `'DM'` — Prefers to run campaigns (Dungeon Master)
  - `'Player'` — Prefers to play characters (Player)
  - `'Both'` — Enjoys both DM and Player roles
- `ruleset`:
  - `'5e'` — D&D 5th Edition (default, most popular)
  - `'3.5e'` — D&D 3.5 Edition (legacy)
  - `'PF2e'` — Pathfinder 2nd Edition (alternative ruleset)

**Validation Rules**:

- `userId`: Required, must reference existing UserProfile.id
- `experienceLevel`: Required, enum-only (no free-text entry)
- `preferredRole`: Required, enum-only
- `ruleset`: Required, enum-only
- `updatedAt`: Auto-updated on any field change

**Sample Data**:

```json
{
  "userId": "user-123",
  "experienceLevel": "Intermediate",
  "preferredRole": "Player",
  "ruleset": "5e",
  "updatedAt": "2025-11-11T19:00:00Z"
}
```

---

### 3. NotificationSettings

**Purpose**: Store user's notification preferences  
**Stores**: Boolean toggles for different notification types

```typescript
interface NotificationSettings {
  userId: string;                     // Foreign key to UserProfile.id
  emailNotifications: boolean;        // Email notifications enabled
  partyUpdates: boolean;              // Party activity notifications enabled
  encounterReminders: boolean;        // Combat encounter notifications enabled
  updatedAt: Date;                    // ISO 8601 timestamp, bumped on any change
}
```

**Field Descriptions**:

- `emailNotifications`: When true, user receives email for account activity (future: frequency options in F0XX)
- `partyUpdates`: When true, user receives notifications about party member activity (new characters, party changes)
- `encounterReminders`: When true, user receives reminders about upcoming combat encounters

**Default Values** (for new users):

```json
{
  "emailNotifications": true,
  "partyUpdates": true,
  "encounterReminders": true
}
```

**Validation Rules**:

- `userId`: Required, must reference existing UserProfile.id
- `emailNotifications`: Required, boolean only
- `partyUpdates`: Required, boolean only
- `encounterReminders`: Required, boolean only
- `updatedAt`: Auto-updated on any toggle change

**Sample Data**:

```json
{
  "userId": "user-123",
  "emailNotifications": true,
  "partyUpdates": false,
  "encounterReminders": true,
  "updatedAt": "2025-11-11T19:00:00Z"
}
```

---

## Relationships

```
UserProfile (1) ──────────────── (1) UserPreferences
     |                                      |
     └─ id ─────────────────────────────── userId

UserProfile (1) ──────────────── (1) NotificationSettings
     |                                      |
     └─ id ─────────────────────────────── userId
```

**Relationship Type**: One-to-One

- Each UserProfile has exactly one UserPreferences record
- Each UserProfile has exactly one NotificationSettings record
- UserPreferences and NotificationSettings are created with UserProfile (or lazily on first access)

**Foreign Key Integrity**:

- `UserPreferences.userId` must reference an existing `UserProfile.id`
- `NotificationSettings.userId` must reference an existing `UserProfile.id`
- Cascade delete: If UserProfile deleted, associated records are deleted (enforced in F014 Mongoose schema)

---

## Validation Schemas (Zod)

All schemas defined in `src/lib/schemas/userSchema.ts`.

### User Profile Schema

```typescript
import { z } from 'zod';

export const userProfileSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  email: z.string()
    .email('Invalid email address'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
```

### User Preferences Schema

```typescript
export const userPreferencesSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  experienceLevel: z.enum(['Novice', 'Intermediate', 'Advanced']),
  preferredRole: z.enum(['DM', 'Player', 'Both']),
  ruleset: z.enum(['5e', '3.5e', 'PF2e']),
  updatedAt: z.coerce.date(),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;
```

### Notification Settings Schema

```typescript
export const notificationSettingsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  emailNotifications: z.boolean(),
  partyUpdates: z.boolean(),
  encounterReminders: z.boolean(),
  updatedAt: z.coerce.date(),
});

export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
```

### Partial Update Schemas (for PUT requests)

```typescript
export const updateUserProfileSchema = userProfileSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .partial();

export const updateUserPreferencesSchema = userPreferencesSchema
  .omit({ userId: true, updatedAt: true })
  .partial();

export const updateNotificationSettingsSchema = notificationSettingsSchema
  .omit({ userId: true, updatedAt: true })
  .partial();
```

---

## State Transitions

### UserProfile State Lifecycle

```
[New User Profile Created]
  id: user-123
  name: ""
  email: "alice@example.com"
  createdAt: now()
  updatedAt: now()
           ↓
    [User Edits Profile]
    name: "Alice Adventurer"
    updatedAt: updated to now()
           ↓
    [Profile Saved]
    [Data persisted to storage]
    [No further transitions until next edit]
```

### UserPreferences State Lifecycle

```
[Default Preferences Created with Profile]
  userId: user-123
  experienceLevel: 'Novice'
  preferredRole: 'Both'
  ruleset: '5e'
           ↓
    [User Updates Preferences]
    experienceLevel: 'Intermediate'
    preferredRole: 'Player'
    updatedAt: updated to now()
           ↓
    [Preferences Saved]
```

### NotificationSettings State Lifecycle

```
[Default Settings Created with Profile]
  userId: user-123
  emailNotifications: true
  partyUpdates: true
  encounterReminders: true
           ↓
    [User Toggles Notification]
    partyUpdates: false
    updatedAt: updated to now()
           ↓
    [Settings Saved]
```

---

## API Contracts (Detailed)

### Profile Endpoints

**GET /api/user/profile**

```
Request: GET /api/user/profile
Headers: 
  - Authorization: Bearer <userId> (mocked in F010, real in F013)

Response: 200 OK
{
  "id": "user-123",
  "name": "Alice Adventurer",
  "email": "alice@example.com",
  "createdAt": "2025-10-01T00:00:00Z",
  "updatedAt": "2025-11-11T19:00:00Z"
}

Response: 404 Not Found
{
  "error": "User profile not found"
}
```

**PUT /api/user/profile**

```
Request: PUT /api/user/profile
Headers:
  - Authorization: Bearer <userId>
  - Content-Type: application/json
Body (partial update):
{
  "name": "Alice the Brave",
  "email": "alice.brave@example.com"
}

Response: 200 OK
{
  "id": "user-123",
  "name": "Alice the Brave",
  "email": "alice.brave@example.com",
  "createdAt": "2025-10-01T00:00:00Z",
  "updatedAt": "2025-11-11T19:30:00Z"
}

Response: 400 Bad Request
{
  "error": "Validation failed",
  "details": {
    "email": "Invalid email address"
  }
}
```

### Preferences Endpoints

**GET /api/user/preferences**

```
Request: GET /api/user/preferences
Headers:
  - Authorization: Bearer <userId>

Response: 200 OK
{
  "userId": "user-123",
  "experienceLevel": "Intermediate",
  "preferredRole": "Player",
  "ruleset": "5e",
  "updatedAt": "2025-11-11T19:00:00Z"
}

Response: 404 Not Found
{
  "error": "User preferences not found"
}
```

**PUT /api/user/preferences**

```
Request: PUT /api/user/preferences
Headers:
  - Authorization: Bearer <userId>
  - Content-Type: application/json
Body (partial update):
{
  "experienceLevel": "Advanced",
  "preferredRole": "DM"
}

Response: 200 OK
{
  "userId": "user-123",
  "experienceLevel": "Advanced",
  "preferredRole": "DM",
  "ruleset": "5e",
  "updatedAt": "2025-11-11T19:30:00Z"
}

Response: 400 Bad Request
{
  "error": "Validation failed",
  "details": {
    "experienceLevel": "Invalid enum value. Expected 'Novice' | 'Intermediate' | 'Advanced'"
  }
}
```

### Notification Endpoints

**GET /api/user/notifications**

```
Request: GET /api/user/notifications
Headers:
  - Authorization: Bearer <userId>

Response: 200 OK
{
  "userId": "user-123",
  "emailNotifications": true,
  "partyUpdates": false,
  "encounterReminders": true,
  "updatedAt": "2025-11-11T19:00:00Z"
}

Response: 404 Not Found
{
  "error": "User notification settings not found"
}
```

**PUT /api/user/notifications**

```
Request: PUT /api/user/notifications
Headers:
  - Authorization: Bearer <userId>
  - Content-Type: application/json
Body (partial update):
{
  "partyUpdates": true,
  "encounterReminders": false
}

Response: 200 OK
{
  "userId": "user-123",
  "emailNotifications": true,
  "partyUpdates": true,
  "encounterReminders": false,
  "updatedAt": "2025-11-11T19:30:00Z"
}

Response: 400 Bad Request
{
  "error": "Validation failed",
  "details": {
    "partyUpdates": "Expected boolean"
  }
}
```

---

## Storage Implementation (F010: Mock)

### localStorage Schema

F010 uses localStorage for ephemeral mock data. Structure mirrors database schema:

```javascript
// User Profile
localStorage.setItem('user:profile:user-123', JSON.stringify({
  id: 'user-123',
  name: 'Alice Adventurer',
  email: 'alice@example.com',
  createdAt: '2025-10-01T00:00:00Z',
  updatedAt: '2025-11-11T19:00:00Z'
}));

// User Preferences
localStorage.setItem('user:preferences:user-123', JSON.stringify({
  userId: 'user-123',
  experienceLevel: 'Intermediate',
  preferredRole: 'Player',
  ruleset: '5e',
  updatedAt: '2025-11-11T19:00:00Z'
}));

// Notification Settings
localStorage.setItem('user:notifications:user-123', JSON.stringify({
  userId: 'user-123',
  emailNotifications: true,
  partyUpdates: false,
  encounterReminders: true,
  updatedAt: '2025-11-11T19:00:00Z'
}));
```

### Future Storage (F014: MongoDB + Mongoose)

After F014, replace localStorage with Mongoose models:

```typescript
// src/lib/db/models/User.ts
const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, validate: emailRegex },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// src/lib/db/models/UserPreferences.ts
const preferencesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  experienceLevel: { type: String, enum: ['Novice', 'Intermediate', 'Advanced'], required: true },
  preferredRole: { type: String, enum: ['DM', 'Player', 'Both'], required: true },
  ruleset: { type: String, enum: ['5e', '3.5e', 'PF2e'], required: true },
  updatedAt: { type: Date, default: Date.now },
});

// src/lib/db/models/NotificationSettings.ts
const notificationsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emailNotifications: { type: Boolean, default: true },
  partyUpdates: { type: Boolean, default: true },
  encounterReminders: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now },
});
```

---

## Data Integrity & Constraints

### Uniqueness Constraints

- `UserProfile.email`: Unique per user (case-insensitive; enforced in F014 MongoDB unique index)
- `UserPreferences.userId`: One preferences record per user (enforced by application logic)
- `NotificationSettings.userId`: One settings record per user (enforced by application logic)

### Referential Integrity

- `UserPreferences.userId` → `UserProfile.id` (foreign key)
- `NotificationSettings.userId` → `UserProfile.id` (foreign key)
- Cascade delete: Deleting UserProfile deletes associated Preferences & NotificationSettings

### Type Validation

- All email fields validated per RFC 5322 (Zod `z.string().email()`)
- All enum fields validated against allowed values (Zod `z.enum()`)
- All name fields limited to 100 characters (Zod `.max(100)`)

### Audit Trail (Future, F013/F025)

- Track who updated what field and when
- Log security-relevant changes (email update, etc.)
- Store previous values for audit purposes

---

## Example Workflows

### Workflow 1: New User Profile Creation

```
1. User registers (triggers profile creation, deferred to F013/F014)
2. System creates UserProfile:
   - Generates id (ObjectId in MongoDB)
   - Sets name = "" (empty, to be filled)
   - Sets email = provided email
   - Sets createdAt = now()
   - Sets updatedAt = now()

3. System creates default UserPreferences:
   - experienceLevel = 'Novice'
   - preferredRole = 'Both'
   - ruleset = '5e'

4. System creates default NotificationSettings:
   - emailNotifications = true
   - partyUpdates = true
   - encounterReminders = true

5. User navigates to /profile
   - Displays empty state: "Complete your profile"
   - ProfileForm shows editable fields

6. User edits name and preferences:
   - name: "Alice Adventurer"
   - experienceLevel: "Intermediate"

7. User clicks Save:
   - Updates UserProfile.name & updatedAt
   - Updates UserPreferences.experienceLevel & updatedAt
   - Shows success toast
   - Persists to localStorage (F010) or MongoDB (F014+)
```

### Workflow 2: Existing User Updates Notification Preferences

```
1. User navigates to /settings
2. System fetches NotificationSettings from storage
3. NotificationSettings displays with current toggles:
   - emailNotifications: true (checked)
   - partyUpdates: false (unchecked)
   - encounterReminders: true (checked)

4. User toggles "partyUpdates" to true (optimistic update)
   - UI state changes immediately
   - Form shows updated state

5. User clicks Save:
   - Disable save button, show loading spinner
   - Send updated NotificationSettings to adapter/API
   - updatedAt bumped to now()
   - Data persisted to storage

6. Success:
   - Show success toast
   - Re-enable save button
   - Keep updated state

7. If error occurs:
   - Show error toast
   - Revert form to previous state (partyUpdates: false)
   - Re-enable save button
```

---

## Glossary

| Term | Definition |
|------|-----------|
| **RFC 5322** | Internet Message Format standard for email validation |
| **Enum** | Enumerated type; restricted set of allowed values (no free-text) |
| **Foreign Key** | Reference to primary key in another table (userId → UserProfile.id) |
| **Cascade Delete** | Automatic deletion of related records when parent is deleted |
| **Optimistic Update** | Update UI immediately, persist in background, revert on error |
| **Zod** | TypeScript-first schema validation library |
| **localStorage** | Browser API for ephemeral client-side storage (used in F010) |
| **Mongoose** | MongoDB ODM (Object Data Modeling) for Node.js (used in F014+) |
| **ObjectId** | MongoDB's unique 12-byte identifier (used in F014+) |

---

**Data Model Status**: ✅ Complete  
**Next Phase**: Contracts/, Quickstart.md, API Implementation
