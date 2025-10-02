# Research Findings: User Registration and Profile Management

**Date**: 2025-09-30
**Feature**: User Registration and Profile Management
**Branch**: 002-when-a-user

## Overview

This document consolidates research findings for implementing user registration and profile management with Clerk authentication, MongoDB persistence, and D&D-specific profile fields.

## 1. Clerk Webhook Integration

### Decision
Implement Clerk webhook handler at `/api/webhooks/clerk` using Svix signature verification with support for `user.created`, `user.updated`, and `user.deleted` events.

### Rationale
- Clerk webhooks provide reliable, event-driven user lifecycle management
- Svix headers ensure webhook authenticity and prevent replay attacks
- Event-driven architecture decouples authentication from data persistence
- Reference implementation at `/home/doug/ai-dev-2/dnd-tracker-next-js` demonstrates proven pattern

### Key Implementation Details

**Webhook Events**:
- `user.created`: Triggered when user completes Clerk sign-up → Create MongoDB user record
- `user.updated`: Triggered when Clerk profile changes → Sync to MongoDB
- `user.deleted`: Triggered when user is deleted from Clerk → Archive/delete MongoDB record

**Signature Verification Pattern**:
```typescript
import { Webhook } from 'svix';

const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
const payload = webhook.verify(body, headers) as ClerkWebhookEvent;
```

**Idempotency Strategy**:
- Check if user exists by `clerkId` before creating
- Use upsert operations for updates to handle duplicate events
- Return 200 for duplicate operations to prevent retries
- Store `lastClerkSync` timestamp to detect stale updates

**Error Handling**:
- Return 400 for signature verification failures
- Return 200 for already-processed events (idempotency)
- Return 500 for database errors (triggers Clerk retry with exponential backoff)
- Log all webhook processing for debugging

### Alternatives Considered
- **Polling Clerk API**: Rejected due to higher latency and API rate limits
- **Client-side user creation**: Rejected due to security concerns and race conditions

## 2. Mongoose Schema Extension

### Decision
Extend existing User schema with optional D&D profile fields using Mongoose defaults and optional field patterns. No migration needed for adding optional fields.

### Rationale
- MongoDB's schemaless nature allows adding optional fields without migration
- Mongoose defaults provide consistent values for new fields on existing documents
- Sparse indexes support unique constraints on optional fields
- Reference implementation demonstrates safe field addition patterns

### Key Implementation Details

**Schema Extension Pattern**:
```typescript
// Add to existing User schema
displayName: {
  type: String,
  trim: true,
  maxlength: [100, 'Display name cannot exceed 100 characters'],
},
timezone: {
  type: String,
  default: 'UTC',
},
dndEdition: {
  type: String,
  default: '5th Edition',
  maxlength: [50, 'D&D edition cannot exceed 50 characters'],
},
experienceLevel: {
  type: String,
  enum: ['new', 'beginner', 'intermediate', 'experienced', 'veteran'],
},
primaryRole: {
  type: String,
  enum: ['dm', 'player', 'both'],
},
profileSetupCompleted: {
  type: Boolean,
  default: false,
}
```

**Field Handling**:
- Optional fields (displayName, experienceLevel, primaryRole): No default, can be undefined
- Fields with defaults (timezone, dndEdition): Auto-populated on document read if missing
- Boolean flags (profileSetupCompleted): Explicit default for tracking state

**Index Considerations**:
- No indexes needed for D&D profile fields (query patterns favor userId lookups)
- Existing compound indexes on role, subscriptionTier remain unchanged
- Sparse index on clerkId supports unique Clerk users

### Alternatives Considered
- **Schema versioning**: Rejected as unnecessary for optional field additions
- **Separate Profile collection**: Rejected to avoid JOIN complexity and maintain atomic updates
- **Required migrations**: Rejected as MongoDB handles missing fields gracefully with defaults

## 3. Usage Metrics Storage

### Decision
Embed usage metrics as counters directly in User document with extensible nested structure for future metric types.

### Rationale
- Embedded counters provide atomic updates and fast reads (single document fetch)
- Usage metrics are always accessed in user context (no independent queries)
- Document size impact is minimal (4 integers + timestamp = ~40 bytes)
- Extensible nested structure supports future metric additions without schema changes
- Reference implementation uses embedded pattern successfully

### Key Implementation Details

**Storage Structure**:
```typescript
// Embedded in User schema
sessionsCount: {
  type: Number,
  default: 0,
},
charactersCreatedCount: {
  type: Number,
  default: 0,
},
campaignsCreatedCount: {
  type: Number,
  default: 0,
},
metricsLastUpdated: {
  type: Date,
}
```

**Efficient Counter Increment**:
```typescript
// Atomic increment operation
await User.findByIdAndUpdate(
  userId,
  {
    $inc: { sessionsCount: 1 },
    $set: { metricsLastUpdated: new Date() }
  },
  { new: true }
);
```

**Extensibility Strategy**:
- Add new counter fields as needed without migration
- Future: Nest metrics in `usageMetrics` subdocument for better organization
- Future: Extract to separate collection if metrics grow complex (event history, time series)

**Aggregation Preparation**:
- Counters support subscription tier enforcement queries
- Add index on subscriptionTier + metric fields if usage-based queries become common
- Structure supports future aggregation pipeline for analytics

### Alternatives Considered
- **Separate UsageMetrics collection**: Rejected for Phase 1 to avoid JOIN complexity; viable future refactor
- **Event log with aggregation**: Rejected as over-engineering for simple counters
- **Denormalized in multiple locations**: Rejected to maintain single source of truth

## 4. Profile Form UX

### Decision
Implement optional profile wizard with skip functionality and deferred completion via settings page. Use React Hook Form with Next.js App Router server actions for form submission.

### Rationale
- Progressive disclosure reduces onboarding friction
- Skip functionality prevents blocking users from core features
- Settings page provides clear path to complete profile later
- React Hook Form provides robust validation and state management
- Next.js App Router server actions enable seamless form handling without API routes

### Key Implementation Details

**UX Flow**:
1. New user authenticates via Clerk → Redirect to `/profile-setup` (optional route group)
2. Profile wizard displays D&D preference form with "Skip for now" button
3. Skip button → Mark `profileSetupCompleted: false`, redirect to dashboard
4. Complete button → Validate, save, mark `profileSetupCompleted: true`, redirect to dashboard
5. Settings page (`/settings/profile`) → Same form, always accessible for updates

**Next.js App Router Pattern**:
```typescript
// app/(auth)/profile-setup/page.tsx - Optional first-time flow
// app/settings/profile/page.tsx - Always-available settings

// Conditional redirect in middleware or layout
if (!user.profileSetupCompleted && isFirstLogin) {
  redirect('/profile-setup');
}
```

**React Hook Form Strategy**:
```typescript
const form = useForm<ProfileFormData>({
  resolver: zodResolver(profileSchema),
  defaultValues: user.profile,
});

const onSubmit = async (data: ProfileFormData) => {
  await updateProfile(data); // Server action
  router.push('/dashboard');
};
```

**Skip Implementation**:
- Skip button calls server action with empty profile data
- Server marks `profileSetupCompleted: false` to show prompt on next login
- User can access all app features regardless of profile completion
- Subtle reminder banner in dashboard if profile incomplete

**Progressive Disclosure**:
- Single-page form for Phase 1 (5 fields: displayName, timezone, dndEdition, experienceLevel, primaryRole)
- Future: Multi-step wizard if profile expands beyond 8-10 fields
- All fields optional except role selection (dm/player/both)

### Alternatives Considered
- **Modal overlay**: Rejected as more intrusive than dedicated page
- **Required profile completion**: Rejected to reduce onboarding friction
- **Multi-step wizard**: Deferred to future as current form is simple enough for single page

## Summary Table

| Research Area | Decision | Key Benefit |
|--------------|----------|-------------|
| Clerk Webhooks | Svix-verified event handlers | Reliable, secure user sync |
| Schema Extension | Optional fields with defaults | No migration needed |
| Usage Metrics | Embedded counters in User | Atomic updates, fast reads |
| Profile UX | Optional wizard with skip | Low friction onboarding |

## Next Steps

Phase 1 artifacts can now be generated with confidence:
1. ✅ All technical decisions made
2. ✅ No NEEDS CLARIFICATION remaining
3. ✅ Implementation patterns validated from reference codebase
4. ✅ Ready for data-model.md, contracts, and quickstart.md

---
*Research completed: 2025-09-30*
