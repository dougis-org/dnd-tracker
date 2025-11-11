# Phase 0: Research & Clarifications - F010

**Feature**: User Profile & Settings Pages (F010)  
**Date**: 2025-11-11  
**Status**: ✅ All Clarifications Resolved

---

## Research Summary

All key unknowns from the feature specification have been researched and resolved. The decisions below inform the implementation plan.

---

## Clarification Resolution (from Spec Session 2025-11-11)

### Q1: Security & Data Protection Strategy

**Clarification Resolved**: ✅  
**Decision**: Defer security best practices (audit logging, PII encryption, GDPR compliance) until Clerk auth integration (Feature 013). Create follow-up issue #425 to track security implementation.

**Rationale**:

- F010 is UI-first with mock data adapter (localStorage-backed)
- Real user data persistence deferred to F014 (MongoDB + Mongoose)
- Clerk integration (F013) includes OAuth/authentication security
- Security controls (audit logging, encryption) are follow-up work (#425)

**Impact on Implementation**:

- No encryption of profile data in localStorage (acceptable for mock phase)
- No audit logging in mock adapter
- Authentication redirects mocked (real implementation in F013)

---

### Q2: Exact Validation Rules for Profile Fields

**Clarification Resolved**: ✅  
**Decision**:

- Email: RFC 5322 format enforced via Zod (simplified regex)
- Name: 1–100 characters, Unicode allowed (via Zod `.max(100)`, UTF-8 support)
- Preferences: enum-only dropdowns (no free-text entry)

**Rationale**:

- RFC 5322 is standard for email validation; Zod provides built-in email schema
- Name constraints are reasonable (1-100 chars covers most use cases; Unicode for international names)
- Enum-only preferences ensure data consistency

**Validation Rules (Zod)**:

```typescript
const profileSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  email: z.string()
    .email('Invalid email address'),
  preferences: z.object({
    experienceLevel: z.enum(['Novice', 'Intermediate', 'Advanced']),
    preferredRole: z.enum(['DM', 'Player', 'Both']),
    ruleset: z.enum(['5e', '3.5e', 'PF2e']),
  }),
});
```

**Error Display**:

- Inline messages on field blur (not on keystroke, to avoid noise)
- Optional toast on save failure with form revert

---

### Q3: Data Persistence Pattern

**Clarification Resolved**: ✅  
**Decision**: Optimistic updates with error recovery.

- Changes reflect immediately on client (optimistic)
- Form save button disabled with loading spinner during submission
- On success: show success toast, persist data
- On error: show error toast, revert form to previous state

**Rationale**:

- Better UX (no perceived delay; users see changes immediately)
- Spec requirement: "reflect changes immediately"
- Error recovery ensures data consistency (revert if save fails)

**Implementation Pattern**:

1. User edits field → state updates immediately (optimistic)
2. User clicks Save → disable button, show spinner, send to adapter
3. Success → success toast, keep changes, re-enable button
4. Error → error toast, revert form to previous state, re-enable button

**Risk Mitigation**: Lock form during save to prevent concurrent submissions (race conditions).

---

### Q4: Error & Loading States UX

**Clarification Resolved**: ✅  
**Decision**:

- Skeleton loader during initial fetch (shows for 0.5–1s while loading)
- Error banner with retry button on fetch failure
- Empty state message for new users with no preferences

**Rationale**:

- Skeleton provides perceived performance (user knows page is loading)
- Error banner allows recovery (retry button retriggers fetch)
- Empty state guides new users to configure settings

**Components**:

- `ProfileLoader.tsx` — Skeleton placeholder
- `ProfileError.tsx` — Error banner with retry
- `ProfileEmpty.tsx` — Helpful message for new users

---

### Q5: Notification Preferences Scope

**Clarification Resolved**: ✅  
**Decision**: Core set of 3 boolean toggles:

- Email Notifications (boolean)
- Party Updates (boolean)
- Encounter Reminders (boolean)

Extensible for future frequency/digest options (not in this phase).

**Rationale**:

- 3 toggles cover primary notification types (email, party, combat)
- Boolean-only keeps UI simple (no frequency dropdown complexity)
- Future phases can add digest modes, frequency controls, etc.

**Data Schema**:

```typescript
interface NotificationSettings {
  userId: string;
  emailNotifications: boolean;
  partyUpdates: boolean;
  encounterReminders: boolean;
}
```

---

## Technology Stack Decisions

### Framework & Language

- **TypeScript 5.9.2**: Type-safe development
- **Next.js 16**: Full-stack React framework, App Router
- **React 19**: Latest React with Server Components
- **Decision**: Use Next.js pages (already in app router); no extra abstractions

### Styling & Components

- **Tailwind CSS 4.x**: Utility-first styling
- **shadcn/ui**: Pre-built components (Button, Input, Select, Card)
- **Decision**: Leverage existing shadcn/ui setup; no custom CSS (use Tailwind)

### Validation & Types

- **Zod 3.23.8**: Runtime schema validation
- **TypeScript interfaces**: Type definitions in `src/types/user.ts`
- **Decision**: Zod schemas live in `src/lib/schemas/` (reusable, shared source of truth)

### Testing

- **Jest 30.2.0**: Unit & integration tests
- **Playwright 1.56.1**: E2E tests
- **@testing-library/react**: Component testing utilities
- **Decision**: TDD-first; write failing tests before implementation

### Data & Storage

- **localStorage**: Mock adapter for F010 (ephemeral, safe for non-sensitive demo data)
- **Future (F014)**: MongoDB + Mongoose (real persistence)
- **Decision**: Mock adapter pattern allows clean swap to real DB later

### API Routes

- **Next.js `/api/` routes**: GET/PUT endpoints for profile, preferences, notifications
- **Mock implementation**: Routes call localStorage adapter (no external API)
- **Decision**: Stub routes now; replace with real Mongoose calls in F014

---

## Data Model Entities

### User Profile

```typescript
interface UserProfile {
  id: string;                // ObjectId-like or userId from Clerk
  name: string;              // 1-100 chars, Unicode
  email: string;             // RFC 5322 format
  createdAt: Date;
  updatedAt: Date;
}
```

### User Preferences

```typescript
interface UserPreferences {
  userId: string;
  experienceLevel: 'Novice' | 'Intermediate' | 'Advanced';
  preferredRole: 'DM' | 'Player' | 'Both';
  ruleset: '5e' | '3.5e' | 'PF2e';
}
```

### Notification Settings

```typescript
interface NotificationSettings {
  userId: string;
  emailNotifications: boolean;
  partyUpdates: boolean;
  encounterReminders: boolean;
}
```

---

## API Contract (Mock Routes)

### GET /api/user/profile

**Purpose**: Fetch user profile data  
**Response** (200 OK):

```json
{
  "id": "user-123",
  "name": "Alice Adventurer",
  "email": "alice@example.com",
  "createdAt": "2025-10-01T00:00:00Z",
  "updatedAt": "2025-11-11T19:00:00Z"
}
```

**Error** (404 Not Found):

```json
{ "error": "User not found" }
```

### PUT /api/user/profile

**Purpose**: Update user profile  
**Request**:

```json
{
  "name": "Alice the Brave",
  "email": "alice.brave@example.com"
}
```

**Response** (200 OK):

```json
{
  "id": "user-123",
  "name": "Alice the Brave",
  "email": "alice.brave@example.com",
  "updatedAt": "2025-11-11T19:30:00Z"
}
```

**Error** (400 Bad Request):

```json
{ "error": "Invalid email address" }
```

### GET /api/user/preferences

**Purpose**: Fetch user D&D preferences  
**Response** (200 OK):

```json
{
  "userId": "user-123",
  "experienceLevel": "Intermediate",
  "preferredRole": "Player",
  "ruleset": "5e"
}
```

### PUT /api/user/preferences

**Purpose**: Update user preferences  
**Request**:

```json
{
  "experienceLevel": "Advanced",
  "preferredRole": "DM",
  "ruleset": "5e"
}
```

**Response** (200 OK):

```json
{
  "userId": "user-123",
  "experienceLevel": "Advanced",
  "preferredRole": "DM",
  "ruleset": "5e"
}
```

### GET /api/user/notifications

**Purpose**: Fetch notification preferences  
**Response** (200 OK):

```json
{
  "userId": "user-123",
  "emailNotifications": true,
  "partyUpdates": false,
  "encounterReminders": true
}
```

### PUT /api/user/notifications

**Purpose**: Update notification preferences  
**Request**:

```json
{
  "emailNotifications": false,
  "partyUpdates": true,
  "encounterReminders": true
}
```

**Response** (200 OK):

```json
{
  "userId": "user-123",
  "emailNotifications": false,
  "partyUpdates": true,
  "encounterReminders": true
}
```

---

## Component Architecture

### Component Hierarchy

```
ProfilePage (src/app/profile/page.tsx)
├── ProfileLoader (skeleton)
├── ProfileForm (edit form)
│   ├── Input fields (name, email)
│   ├── Select dropdowns (experience, role, ruleset)
│   └── Save button
├── ProfileError (error banner + retry)
└── ProfileEmpty (guidance for new users)

SettingsPage (src/app/settings/page.tsx)
├── SettingsNav (section tabs)
├── AccountSettings (read-only account info)
├── PreferencesSettings (edit D&D prefs)
│   ├── Select for experience level
│   ├── Select for role
│   ├── Select for ruleset
│   └── Save button
├── NotificationSettings (toggle switches)
│   ├── Toggle for Email Notifications
│   ├── Toggle for Party Updates
│   ├── Toggle for Encounter Reminders
│   └── Save button
└── DataManagement (export button stub)
```

### Shared Services

**userAdapter.ts**: Mock CRUD operations (localStorage-backed)

```typescript
export const userAdapter = {
  getProfile: async (userId: string) => UserProfile,
  updateProfile: async (userId: string, data: Partial<UserProfile>) => UserProfile,
  getPreferences: async (userId: string) => UserPreferences,
  updatePreferences: async (userId: string, data: Partial<UserPreferences>) => UserPreferences,
  getNotifications: async (userId: string) => NotificationSettings,
  updateNotifications: async (userId: string, data: Partial<NotificationSettings>) => NotificationSettings,
};
```

**userSchema.ts**: Zod validation schemas (reusable, client + server)

```typescript
export const profileSchema = z.object({ name, email });
export const preferencesSchema = z.object({ experienceLevel, preferredRole, ruleset });
export const notificationsSchema = z.object({ emailNotifications, partyUpdates, encounterReminders });
```

**profileFormHelpers.ts**: Optimistic state management, error recovery

```typescript
export function applyOptimisticUpdate(form, field, value) { /* ... */ }
export function revertOptimisticUpdate(form, previous) { /* ... */ }
export function formatErrorMessage(error) { /* ... */ }
```

---

## Testing Strategy

### Unit Tests (Jest)

- **Schemas**: Validate Zod schemas for all entity types (100% coverage)
- **Validation**: Utility functions (parseEmail, validateName, etc.) (100%)
- **Adapter**: Mock CRUD operations, error handling (85%+)
- **Components**: ProfileForm, NotificationSettings, etc. with mocked adapter (80%+)

### Integration Tests

- **Adapter + localStorage**: Full CRUD flow end-to-end
- **Components + Adapter**: Form editing and save with real adapter

### E2E Tests (Playwright)

- Navigate to `/profile` → load data → verify form
- Edit form → save → verify success toast → refresh → verify persistence
- Settings sections render → toggle notification → save → verify state
- Invalid email → error message → retry
- Network failure → error banner → retry

### Coverage Target

- **New code**: 80%+ minimum per constitution
- **Schemas**: 100% (critical, simple)
- **Adapter**: 85%+ (mocking layer edge cases may be integration-only)

---

## Accessibility Compliance

### WCAG 2.1 AA Standards

- Keyboard navigation: Tab, Shift+Tab, Enter/Space to toggle
- ARIA labels on form fields and buttons
- Color contrast: 4.5:1 for text, 3:1 for graphics
- Focus indicators visible on all interactive elements
- Error messages associated with fields (`aria-describedby`)
- Screen reader support: semantic HTML, meaningful labels

### Testing

- Manual keyboard navigation (Tab through all fields)
- axe-playwright accessibility audit in E2E tests
- Screen reader testing (NVDA/JAWS or browser screen reader)

---

## Performance Targets

| Metric | Target | Approach |
|--------|--------|----------|
| Page Load | < 1s | Skeleton + lazy load data |
| Time to First Render | < 500ms | Show skeleton immediately |
| Validation | < 200ms inline | Debounce on blur |
| Form Save | < 500ms perceived | Optimistic update (instant) + spinner |
| Settings Page Render | < 1s all sections | Render all sections, lazy load data per section |

---

## Future Integration Points (F013, F014, F017, F048)

### F013 (Clerk Integration)

- Replace localStorage fallback with Clerk session
- Add real authentication redirects
- Extract userId from Clerk `auth()` helper

### F014 (MongoDB User Model)

- Replace mock adapter with real Mongoose adapter
- Zod schemas reused for server-side validation
- API routes call Mongoose models instead of localStorage

### F017 (Profile Page Functionality)

- Extend profile form with additional fields (bio, profile picture)
- Add email verification flow
- Add audit logging

### F048 (Data Export System)

- Implement real file download (DataManagement export button)
- Generate JSON/CSV of user data
- Handle large data sets efficiently

---

## Research Completion Checklist

- [x] Email validation approach determined (RFC 5322 via Zod)
- [x] Name constraints finalized (1-100 chars, Unicode)
- [x] D&D preference enums confirmed (3 choices each)
- [x] Notification preferences scope defined (3 boolean toggles)
- [x] Optimistic updates pattern chosen & documented
- [x] Loading/error/empty states designed
- [x] Security deferral approved (F013/F025/follow-up #425)
- [x] Mock adapter pattern validated
- [x] API contract stubs documented
- [x] Component architecture outlined
- [x] Testing strategy defined
- [x] Accessibility requirements confirmed
- [x] Performance targets established
- [x] Future integration points identified

---

**Phase 0 Status**: ✅ Complete  
**Next Phase**: Phase 1 (Data-Model.md, Contracts/, Quickstart.md)
