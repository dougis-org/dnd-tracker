# Data Model: Profile Setup Wizard

**Feature**: 015 - Profile Setup Wizard  
**Date**: 2025-11-28  
**Status**: Phase 1 - Design Complete

## Overview

This document defines the data model extensions for Feature 015. Feature 015 extends the existing `User` model from Feature 014 with wizard-related fields and validation rules.

## User Profile Extension

### New Fields in User.profile Subdocument

The wizard collects and persists the following fields to the User model's `profile` subdocument:

```typescript
profile: {
  // Existing fields from Feature 014
  // (userId, email, etc.)

  // New fields (Feature 015)
  displayName: string;                          // User's public display name
  avatar?: string;                              // Base64-encoded avatar image (optional)
  preferences: {
    theme: "light" | "dark";                    // UI theme preference
    notifications: boolean;                     // Enable/disable email notifications
  };
  completedSetup: boolean;                      // true after wizard completion
  setupCompletedAt?: Date;                      // Timestamp of completion
}
```

### Field Descriptions & Constraints

| Field | Type | Required | Constraints | Example |
|-------|------|----------|-------------|---------|
| `displayName` | string | Yes | Min 1, Max 50 chars; trimmed | "Aragorn the Ranger" |
| `avatar` | string (base64) | No | Max 250KB when encoded; JPEG/PNG/WebP only | "data:image/jpeg;base64,/9j/4AAQSkZ..." |
| `preferences.theme` | enum | Yes | "light" or "dark" | "dark" |
| `preferences.notifications` | boolean | Yes | true or false | true |
| `completedSetup` | boolean | Yes | true or false; default false on user creation | true |
| `setupCompletedAt` | Date (ISO8601) | No | Timestamp; set when wizard completed | "2025-11-28T15:30:00Z" |

### Validation Rules

#### displayName

- Required (non-empty after trim)
- Minimum length: 1 character
- Maximum length: 50 characters
- Automatically trimmed on save
- Error message: "Display name must be 1–50 characters"

#### avatar

- Optional field
- Allowed formats: JPEG, PNG, WebP
- Max file size (original): 2MB
- Max base64 size: 250KB (after compression)
- Client-side compression target: 100KB base64
- Validation on client: File picker + compression; error message if invalid format or compression fails
- Validation on server: Base64 size check; return HTTP 413 if exceeds 250KB
- Error messages:
  - "File format not supported. Please use JPEG, PNG, or WebP."
  - "Avatar compression failed. Please try a smaller image."
  - "Avatar is too large (max 250KB base64)."

#### preferences.theme

- Required
- Allowed values: "light" or "dark"
- Default value: "light" (or user's system preference if detected)
- Error message: "Please select a theme"

#### preferences.notifications

- Required
- Type: boolean (true or false)
- Default value: true
- Error message: "Notification preference is required"

#### completedSetup

- Required
- Type: boolean
- Default: false (set by Feature 014 webhook on user creation)
- Set to true: After user completes wizard and clicks "Finish"
- Set to false: If user skips wizard (initially); remains false until explicitly completed
- Used for: Trigger logic (show wizard if false)

#### setupCompletedAt

- Optional
- Type: Date (ISO8601 format)
- Set when: `completedSetup` transitions from false to true
- Used for: Audit trail; future analytics

## MongoDB Schema Definition

### Mongoose Model Extension

The User model from Feature 014 is extended with the following schema update:

```typescript
const userProfileSchema = new Schema({
  // Existing fields (Feature 014)
  // ...

  // Feature 015 new fields
  displayName: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50,
    trim: true,
    default: "",  // Backwards compatible: existing users can have empty displayName
  },
  avatar: {
    type: String,
    maxlength: 250 * 1024,  // 250KB
    optional: true,
  },
  preferences: {
    type: {
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
      notifications: {
        type: Boolean,
        default: true,
      },
    },
    required: true,
    default: { theme: "light", notifications: true },
  },
  completedSetup: {
    type: Boolean,
    default: false,  // Set to false by Feature 014 webhook
  },
  setupCompletedAt: {
    type: Date,
    optional: true,
  },
});
```

### Indexes

No new indexes required for Feature 015. Feature 014 provides:

- `{ userId: 1 }` unique index
- `{ email: 1 }` unique index
- `{ updatedAt: -1 }` index (for recent updates queries)

### Backward Compatibility

- Existing users created before Feature 015: have `displayName` undefined or empty; treated as incomplete profile.
- Existing users created after Feature 014 but before Feature 015: have `completedSetup = false` (set by Feature 014 webhook); wizard will be triggered on first login.
- No breaking changes to existing schema.

## Data States & Transitions

### User Wizard Completion State Machine

```
[NOT_STARTED]
    ↓ (Clerk auth + completedSetup === false)
[WIZARD_REQUIRED] ← Modal shows, non-dismissible
    ├→ [COMPLETED] (user clicks Finish) ← completedSetup = true
    └→ [SKIPPED] (user clicks Skip) ← completedSetup remains false
        ↓ (user visits profile settings)
    [REMINDER_SHOWN] ← Dismissible banner appears
        └→ [COMPLETED] (user clicks reminder link + completes wizard)
```

### completedSetup Flag States

| State | Value | Trigger | Wizard Behavior | Next Action |
|-------|-------|---------|-----------------|------------|
| New User | false | Created by Feature 014 webhook | Shows modal (non-dismissible) | Complete setup or skip |
| Skipped | false | User clicks Skip on any screen | N/A; modal closes | Visit profile → see reminder |
| Completed | true | User clicks Finish on last screen | N/A; modal never appears again | N/A |

## API Payload Example

### Request (PATCH /api/internal/users/:userId)

```json
{
  "profile": {
    "displayName": "Aragorn the Ranger",
    "avatar": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAYABgAAD/2wB...",
    "preferences": {
      "theme": "dark",
      "notifications": true
    },
    "completedSetup": true
  }
}
```

### Response (200 OK)

```json
{
  "userId": "user_123",
  "email": "aragorn@example.com",
  "profile": {
    "displayName": "Aragorn the Ranger",
    "avatar": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAYABgAAD/2wB...",
    "preferences": {
      "theme": "dark",
      "notifications": true
    },
    "completedSetup": true,
    "setupCompletedAt": "2025-11-28T15:30:00Z"
  },
  "createdAt": "2025-11-28T12:00:00Z",
  "updatedAt": "2025-11-28T15:30:00Z"
}
```

## Validation Layers

### Client-Side Validation (Frontend)

Implemented via Zod schemas (`src/lib/wizards/wizardValidation.ts`):

1. **Display Name**: Real-time validation on blur
   - Check min/max length
   - Show inline error if invalid
   - Disable Next button if invalid

2. **Avatar**: Validation on file select
   - Check file type (JPEG, PNG, WebP)
   - Check original file size (<2MB)
   - Compress to target size (<100KB base64)
   - Show error toast if compression fails

3. **Preferences**: Validation on input
   - Theme radio buttons: always valid (default to "light")
   - Notifications toggle: always valid (default to true)

### Server-Side Validation (API Route)

Implemented in `PATCH /api/internal/users/:userId` endpoint (Feature 014):

1. **Display Name**: Validate in Mongoose schema
   - Check required, min/max length
   - Trim whitespace
   - Return HTTP 400 if invalid

2. **Avatar**: Validate base64 size
   - Check base64 string length ≤ 250KB
   - Return HTTP 413 if exceeds limit

3. **Preferences**: Validate enum values
   - Check theme is "light" or "dark"
   - Check notifications is boolean
   - Return HTTP 400 if invalid

4. **Uniqueness**: Already enforced by Feature 014
   - `userId`, `email` unique constraints
   - Return HTTP 409 if conflict

## Storage & Performance Considerations

### Blob Storage Decision: Base64 in MongoDB

**Choice**: Embed avatar as base64 string in User document (no external blob storage).

**Rationale**:

- Simplicity: No external service dependency (S3, GCS, etc.)
- Atomic writes: User profile and avatar saved together.
- Maximum base64 size (250KB) is within MongoDB document size limits (16MB).
- Suitable for MVP; can be refactored to external storage later if needed.

**Performance Impact**:

- Document size increases by max 250KB per user (negligible at scale <100k users).
- Serialization/deserialization overhead minimal (<10ms for 250KB base64).
- Query performance unaffected (no avatar index needed).

### Query Patterns

#### Get User Profile (with avatar)

```javascript
db.collection("users").findOne(
  { userId: "user_123" },
  { projection: { "profile.avatar": 1 } }
);
```

#### Update User Profile (all fields)

```javascript
db.collection("users").updateOne(
  { userId: "user_123" },
  {
    $set: {
      "profile.displayName": "Aragorn",
      "profile.avatar": "data:image/jpeg;base64,...",
      "profile.preferences.theme": "dark",
      "profile.preferences.notifications": true,
      "profile.completedSetup": true,
      "profile.setupCompletedAt": new Date(),
      updatedAt: new Date(),
    },
  }
);
```

#### List Users by Theme Preference

```javascript
db.collection("users").find(
  { "profile.preferences.theme": "dark" },
  { projection: { profile: 1 } }
);
```

## Testing Considerations

### Unit Tests

- Validate displayName constraints (min/max, trim)
- Validate avatar base64 size limit
- Validate preferences enum values
- Test Zod schema parsing (valid/invalid cases)

### Integration Tests

- Save complete profile via PATCH endpoint
- Verify avatar base64 persisted correctly
- Verify completedSetup flag updated
- Verify setupCompletedAt timestamp set

### E2E Tests

- User completes wizard → profile saved → can retrieve it
- User skips wizard → profile incomplete → reminder appears
- User updates preferences → changes persisted

## Migration Notes

**No migration required.** Feature 015 extends Feature 014's User model:

- New fields are optional or have defaults (backward compatible).
- Existing users unaffected; can have empty `displayName` or `preferences` undefined until wizard is triggered.
- MongoDB will create missing fields on first write.

## Future Considerations

1. **External Blob Storage**: If users grow beyond 100k+, refactor avatar storage to S3/GCS (not in MVP).
2. **Avatar Versioning**: Track avatar history (upload timestamp, previous versions) for audit trail (deferred).
3. **Avatar Resize**: Generate thumbnail versions for list views (deferred).
4. **Profile Analytics**: Track completion rate, abandonment, time-to-completion (deferred to separate observability feature).
5. **Multi-Language Support**: Implement i18n for validation messages and UI text (deferred; English-only MVP).

---

**Generated by**: `/speckit.plan` workflow  
**Date**: 2025-11-28  
**Status**: Phase 1 - Complete
