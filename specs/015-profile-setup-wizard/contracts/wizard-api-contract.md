# API Contract: Profile Setup Wizard

**Feature**: 015 - Profile Setup Wizard  
**Date**: 2025-11-28  
**Status**: Phase 1 - Design Complete

## Overview

Feature 015 does not introduce new API endpoints. Instead, it reuses the existing `PATCH /api/internal/users/:userId` endpoint from Feature 014 (MongoDB User Model) with extended payload fields for wizard data.

This contract document specifies how Feature 015 utilizes that endpoint.

## Endpoint Summary

| Endpoint | Method | Purpose | Feature |
|----------|--------|---------|---------|
| `/api/internal/users/:userId` | PATCH | Update user profile (including wizard data) | Feature 015 uses; Feature 014 provides |

## Request/Response Specification

### PATCH /api/internal/users/:userId

**Purpose**: Update user profile, including wizard fields (displayName, avatar, preferences, completedSetup).

**Authorization**: Internal API; requires server-side auth context (Feature 013 Clerk middleware).

### Request

**Method**: PATCH  
**Path**: `/api/internal/users/:userId`  
**Content-Type**: `application/json`

**Path Parameters**:

- `userId` (string, required): Unique user identifier (from User model)

**Request Body** (JSON):

```json
{
  "profile": {
    "displayName": "string (1–50 chars)",
    "avatar": "string (optional, base64, ≤250KB)",
    "preferences": {
      "theme": "light|dark",
      "notifications": "boolean"
    },
    "completedSetup": "boolean"
  }
}
```

**Field Validation**:

- `displayName`: Required, non-empty after trim, 1–50 chars. Return HTTP 400 if invalid.
- `avatar`: Optional. Max 250KB base64. Return HTTP 413 if exceeds max size.
- `preferences.theme`: Required, enum ["light", "dark"]. Return HTTP 400 if invalid.
- `preferences.notifications`: Required, boolean. Return HTTP 400 if invalid.
- `completedSetup`: Required, boolean. Return HTTP 400 if invalid.

**Example Request** (Feature 015 wizard submission):

```bash
curl -X PATCH http://localhost:3000/api/internal/users/user_123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <clerk-token>" \
  -d '{
    "profile": {
      "displayName": "Aragorn the Ranger",
      "avatar": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAYABg...",
      "preferences": {
        "theme": "dark",
        "notifications": true
      },
      "completedSetup": true
    }
  }'
```

### Response

**Success Response** (HTTP 200 OK):

```json
{
  "userId": "user_123",
  "email": "aragorn@example.com",
  "displayName": "Aragorn the Ranger",
  "profile": {
    "displayName": "Aragorn the Ranger",
    "avatar": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAYABg...",
    "preferences": {
      "theme": "dark",
      "notifications": true
    },
    "completedSetup": true,
    "setupCompletedAt": "2025-11-28T15:30:00.000Z"
  },
  "createdAt": "2025-11-28T12:00:00.000Z",
  "updatedAt": "2025-11-28T15:30:00.000Z"
}
```

**Error Response** (HTTP 400 Bad Request):

```json
{
  "error": "Validation error",
  "message": "displayName must be 1–50 characters",
  "statusCode": 400
}
```

**Error Response** (HTTP 413 Payload Too Large):

```json
{
  "error": "Avatar too large",
  "message": "Avatar must be 250KB or smaller (base64 encoded)",
  "statusCode": 413
}
```

**Error Response** (HTTP 404 Not Found):

```json
{
  "error": "User not found",
  "message": "User with ID 'user_123' does not exist",
  "statusCode": 404
}
```

**Error Response** (HTTP 500 Internal Server Error):

```json
{
  "error": "Internal server error",
  "message": "Failed to update user profile",
  "statusCode": 500
}
```

## HTTP Status Codes

| Status Code | Scenario | Notes |
|-------------|----------|-------|
| 200 OK | Profile updated successfully | Standard success response |
| 400 Bad Request | Validation error (missing/invalid field) | Return specific field error message |
| 401 Unauthorized | Not authenticated or insufficient permissions | Feature 013 Clerk auth required |
| 404 Not Found | User does not exist | userId not in database |
| 409 Conflict | Uniqueness constraint violated | Email/userId conflict (rare for this use case) |
| 413 Payload Too Large | Request body or avatar exceeds max size | Avatar >250KB base64 or total payload >1MB |
| 500 Internal Server Error | Database error, connection failure, etc. | Log full error; return generic message |
| 504 Gateway Timeout | Request processing exceeds timeout (>10s) | Feature 014 timeout; return descriptive error |

## Client-Side Integration (Feature 015)

### Wizard Component Flow

1. **User completes all wizard screens**:
   - displayName: "Aragorn the Ranger"
   - avatar: base64 JPEG (compressed to <100KB)
   - theme: "dark"
   - notifications: true

2. **Hook prepares payload** (`useProfileSetupWizard`):

   ```typescript
   const payload = {
     profile: {
       displayName,
       avatar,
       preferences: { theme, notifications },
       completedSetup: true,
     },
   };
   ```

3. **Submit to PATCH endpoint**:

   ```typescript
   const response = await fetch(`/api/internal/users/${userId}`, {
     method: "PATCH",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify(payload),
   });
   ```

4. **Handle response**:
   - ✅ 200 OK: Close modal, show success message
   - ❌ 400/413: Display error toast, allow retry
   - ❌ 401: Redirect to login (auth expired)
   - ❌ 404: Display error (user not found)
   - ❌ 500/504: Display error toast, allow retry

### Example Frontend Code

```typescript
async function submitWizardProfile(userId: string, profileData: ProfileSetup) {
  try {
    const response = await fetch(`/api/internal/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: profileData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to save profile");
    }

    const savedProfile = await response.json();
    console.log("Profile saved:", savedProfile);
    return savedProfile;
  } catch (error) {
    console.error("Profile save failed:", error);
    throw error; // Let hook handle error toast/retry
  }
}
```

## Fetch Trigger (First Login Detection)

### Get User Profile (for wizard trigger)

**Purpose**: Fetch user profile to check `completedSetup` flag on app init.

**Endpoint**: `GET /api/internal/users/:userId` (Feature 014)

**Request**:

```bash
curl http://localhost:3000/api/internal/users/user_123 \
  -H "Authorization: Bearer <clerk-token>"
```

**Response** (200 OK):

```json
{
  "userId": "user_123",
  "email": "aragorn@example.com",
  "profile": {
    "displayName": "Aragorn the Ranger",
    "avatar": "...",
    "preferences": { "theme": "dark", "notifications": true },
    "completedSetup": true,
    "setupCompletedAt": "2025-11-28T15:30:00Z"
  },
  "createdAt": "2025-11-28T12:00:00Z",
  "updatedAt": "2025-11-28T15:30:00Z"
}
```

### RootLayout Trigger Logic

```typescript
import { useUser } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, user } = useUser();
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      // Fetch user profile to check completedSetup flag
      fetch(`/api/internal/users/${user.id}`)
        .then((res) => res.json())
        .then((profile) => {
          const isComplete = profile?.profile?.completedSetup ?? false;
          setShowWizard(!isComplete); // Show if incomplete
        })
        .catch((err) => {
          console.error("Failed to fetch user profile:", err);
          // Default to show wizard (fail-safe)
          setShowWizard(true);
        });
    }
  }, [isLoaded, user]);

  return (
    <>
      {children}
      <ProfileSetupWizardModal isOpen={showWizard} onClose={() => setShowWizard(false)} />
    </>
  );
}
```

## Rate Limiting & Quotas

**No rate limiting applied** to `PATCH /api/internal/users/:userId` for Feature 015. Server-side timeout (10s) and max payload size (1MB, per Feature 014) apply.

## Backward Compatibility

**No breaking changes** to existing API:

- Feature 015 only adds new fields to request payload; all fields are optional or have defaults.
- Existing clients (not using wizard) can continue using the endpoint as before.
- New fields are ignored if not provided; database stores defaults.

## Error Handling & Retry Strategy

### Client-Side Retry Logic

```typescript
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function submitWithRetry(
  userId: string,
  profileData: ProfileSetup,
  attempt = 1
): Promise<any> {
  try {
    return await submitWizardProfile(userId, profileData);
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      console.warn(`Retry ${attempt}/${MAX_RETRIES}:`, error);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return submitWithRetry(userId, profileData, attempt + 1);
    }
    throw error; // Give up after MAX_RETRIES
  }
}
```

### Non-Retryable Errors

- HTTP 400, 401, 404, 409: User action required (fix input, re-auth, etc.)
- HTTP 413: Reduce avatar size and retry

### Retryable Errors

- HTTP 500, 504: Transient server error; retry with exponential backoff
- Network timeout: Retry with exponential backoff

## Logging & Monitoring

### Request Logging (Structured JSON)

All requests logged at INFO level:

```json
{
  "level": "INFO",
  "timestamp": "2025-11-28T15:30:00Z",
  "message": "Profile update request",
  "context": {
    "userId": "user_123",
    "method": "PATCH",
    "path": "/api/internal/users/user_123",
    "displayName": "Aragorn the Ranger",
    "avatar_size_kb": 125,
    "completedSetup": true
  }
}
```

### Error Logging (Structured JSON)

All errors logged at WARN/ERROR level:

```json
{
  "level": "ERROR",
  "timestamp": "2025-11-28T15:30:00Z",
  "message": "Profile update failed",
  "context": {
    "userId": "user_123",
    "method": "PATCH",
    "statusCode": 500,
    "error": "MongoDB connection timeout",
    "attempts": 3
  }
}
```

## Testing Scenarios

### Positive Test Cases

1. ✅ User completes wizard with all fields → 200 OK, profile saved
2. ✅ User updates only displayName → 200 OK, other fields unchanged
3. ✅ User provides optional avatar → 200 OK, avatar stored as base64
4. ✅ User skips avatar → 200 OK, avatar field omitted

### Negative Test Cases

1. ❌ displayName empty → 400 Bad Request
2. ❌ displayName >50 chars → 400 Bad Request
3. ❌ avatar >250KB base64 → 413 Payload Too Large
4. ❌ theme not in enum → 400 Bad Request
5. ❌ notifications not boolean → 400 Bad Request
6. ❌ userId not found → 404 Not Found
7. ❌ Network timeout → 504 Gateway Timeout
8. ❌ Database connection failure → 500 Internal Server Error

## Future Extensions

### Potential Future Endpoints (Deferred)

- `GET /api/internal/users` — List all users (pagination) [planned for admin dashboard]
- `DELETE /api/internal/users/:userId` — Delete user [Feature 014 already supports soft-delete]

### Potential Future Fields

- `profile.avatar_thumbnail` — Resized avatar for list views [deferred]
- `profile.profileCompletion` — Percentage of profile fields filled [deferred]
- `profile.updatedAt` — Field-level timestamp for avatar/preferences [deferred]

---

**Generated by**: `/speckit.plan` workflow  
**Date**: 2025-11-28  
**Status**: Phase 1 - Complete
