# Data Model: User Profile & Settings

## Entities

### User Profile

Extends the base User entity (from Feature 014: MongoDB User Model & Webhook) with profile-specific fields.

**Collection**: `users`

**Schema**:

```typescript
{
  _id: ObjectId,
  clerkId: string,
  email: string,
  name: string,

  // Profile fields (new in F010)
  profile: {
    displayName: string,           // User's display name (editable)
    bio?: string,                   // Optional user bio
    createdAt: Date,
    updatedAt: Date
  },

  // D&D Preferences (new in F010)
  preferences: {
    experienceLevel: "Novice" | "Intermediate" | "Advanced",
    preferredRole: "DM" | "Player" | "Both",
    ruleset: "5e" | "3.5e" | "PF2e"
  },

  // Notification Settings (new in F010)
  notificationSettings: {
    emailNotifications: boolean,    // Receive email updates
    partyUpdates: boolean,          // Notify on party changes
    encounterReminders: boolean,    // Remind before encounters
    combatNotifications: boolean    // Active combat notifications
  },

  // Existing fields (from F014)
  subscription: {
    tier: string,
    status: string
  },
  usage: {
    parties: number,
    encounters: number,
    characters: number
  }
}
```

### Form Validation Schemas (Zod)

**Profile Edit Form**:

- displayName: non-empty string, max 100 characters
- bio: optional string, max 500 characters

**Preferences Form**:

- experienceLevel: enum (Novice, Intermediate, Advanced)
- preferredRole: enum (DM, Player, Both)
- ruleset: enum (5e, 3.5e, PF2e)

**Notification Settings**:

- All boolean fields with toggle controls

## Relationships

- User Profile 1:1 User (same document)
- Preferences are nested within User
- Notification Settings are nested within User

## Data Constraints

- displayName must be unique across active users (optional constraint)
- All preference and notification fields are required with sensible defaults
- No profile data should be deleted (only updated)
