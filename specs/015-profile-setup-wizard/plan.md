# Implementation Plan: Profile Setup Wizard

**Branch**: `feature/015-profile-setup-wizard` | **Date**: 2025-11-28 | **Spec**: [Profile Setup Wizard Spec](spec.md)
**Input**: Feature specification from `/specs/015-profile-setup-wizard/spec.md`

**Maintainer**: @doug

## Summary

Feature 015 implements a mandatory first-login profile setup wizard that guides new users through configuring essential profile data (display name, avatar, preferences) and provides a dismissible reminder for incomplete profiles. The wizard is triggered by the `completedSetup` flag (set by Feature 014 webhook on user creation), displays as a non-dismissible modal on first login, and integrates with the existing User model via `PATCH /api/internal/users/[userId]` endpoint. The wizard component uses React hooks for state management, implements client-side avatar compression (max 100KB base64), enforces WCAG 2.1 AA accessibility, and provides real-time field validation with error toasts for save failures.

## Technical Context

**Language/Version**: TypeScript 5.9.2 (Next.js 16.0.1, React 19.0.0)
**Primary Dependencies**: Next.js 16, React 19, Tailwind CSS 4.x, shadcn/ui, Zod 3.23.8, Mongoose 8.19.1
**Storage**: MongoDB (via Mongoose, Feature 014 User model)
**Testing**: Jest 30.2.0 (unit/integration), Playwright 1.56.1 (e2e)
**Target Platform**: Web (browser), Node.js 25.1.0+
**Project Type**: Full-stack Next.js web application (frontend + API routes)
**Performance Goals**:

- Modal load: <500ms from first login to wizard display
- Avatar compression: <2s for files ≤2MB
- Save latency: 3–10s (10s timeout)

**Constraints**:

- Max file size: 450 lines per file, max 50 lines per function
- No code duplication; use shared utilities
- 80%+ test coverage on touched code
- WCAG 2.1 AA compliance (keyboard nav, screen reader, focus management)
- Avatar compression: client-side to max 100KB base64, server-side max 250KB

**Scale/Scope**:

- 5 wizard screens: Welcome, DisplayName, AvatarUpload, Preferences, Completion
- Reminder prompt on profile settings page
- 1 new hook: `useProfileSetupWizard` (state + submission logic)
- ~5 component files for wizard screens
- ~120–150 lines total per screen component

## Constitution Check

**Gate: Must pass before Phase 0 research. Re-check after Phase 1 design.**

**Constitutional Authority**: All implementation tasks MUST comply with `.specify/memory/constitution.md` (sections 1.0–1.4):

- **Quality & Ownership**: Code reviewed for correctness, maintainability, clarity; no shortcuts.
- **Test-First (TDD)**: Red → Green → Refactor cycle mandatory for all new behavior.
- **Simplicity & Composability**: Small, focused modules; ≤450 lines per file, ≤50 lines per function.
- **Observability & Security**: Structured JSON logging; no sensitive data in logs; HMAC validation inherited from Feature 014.
- **Versioning & Governance**: No breaking changes; backward compatible with Feature 014.

### Requirements Verification

✅ **Quality & Ownership (NON-NEGOTIABLE)**

- Design follows TDD: tests written before implementation.
- All code will be reviewed for correctness, maintainability, clarity.
- Code ownership: @doug (maintainer) oversees.

✅ **Test-First (TDD) (NON-NEGOTIABLE)**

- Red → Green → Refactor cycle followed for all new behavior.
- Unit tests for model updates, avatar compression, validation.
- Integration tests for wizard flow (modal trigger, screen transitions).
- Component tests via React Testing Library.

✅ **Simplicity & Composability**

- Each screen is a small, focused component (<50 lines if possible, up to 100 for UI logic).
- Shared state managed in custom hook (`useProfileSetupWizard`).
- Avatar compression extracted to utility function.
- Form validation extracted to Zod schemas (reusable).

✅ **Observability & Security**

- Structured JSON logging for profile save attempts (INFO/WARN/ERROR).
- Client-side validation with real-time feedback; server-side validation enforced.
- HMAC-SHA256 webhook already enforced by Feature 014.
- No sensitive data in logs; no hardcoded secrets.

✅ **Versioning & Governance**

- Feature extends User model (backward compatible).
- No breaking changes to existing APIs.
- Integrates with Feature 014 (upstream dependency).
- No new environment variables beyond Feature 014's `WEBHOOK_SECRET`.

### Post-ratification Checklist

- [ ] Constitution referenced in feature spec ✅ (done)
- [ ] Codacy analysis run on edited files (deferred to Phase 2)
- [ ] Templates reviewed for constitutional alignment ✅

## Project Structure

### Documentation (this feature)

```text
specs/015-profile-setup-wizard/
├── spec.md                          # Feature specification
├── plan.md                          # This file (Phase 0-1 output)
├── research.md                      # Phase 0 output (TBD)
├── data-model.md                    # Phase 1 output (TBD)
├── quickstart.md                    # Phase 1 output (TBD)
├── contracts/                       # Phase 1 output (TBD)
│   ├── user-profile-schema.json     # User profile extension schema
│   └── wizard-api-contract.md       # Wizard modal integration notes
└── tasks.md                         # Phase 2 output (TBD)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ProfileSetupWizard/
│   │   ├── ProfileSetupWizardModal.tsx        # Main modal wrapper, screen router
│   │   ├── WelcomeScreen.tsx                  # Step 1: Welcome intro
│   │   ├── DisplayNameScreen.tsx              # Step 2: Display name input
│   │   ├── AvatarUploadScreen.tsx             # Step 3: Avatar file picker + preview
│   │   ├── PreferencesScreen.tsx              # Step 4: Theme + notifications
│   │   ├── CompletionScreen.tsx               # Step 5: Success message
│   │   ├── useProfileSetupWizard.ts           # Custom hook: state + submission
│   │   └── constants.ts                       # Shared constants (max sizes, etc.)
│   ├── ProfileSetupReminder.tsx               # Dismissible banner for profile settings page
│   └── ...existing components
├── lib/
│   ├── wizards/
│   │   ├── avatarCompression.ts               # Client-side avatar compression utility
│   │   └── wizardValidation.ts                # Zod schemas for wizard fields
│   └── ...existing lib
├── hooks/
│   └── useProfileSetupWizard.ts               # (also in components/ProfileSetupWizard/)
├── app/
│   ├── layout.tsx                             # RootLayout: embeds ProfileSetupWizardModal
│   ├── profile/
│   │   └── settings/
│   │       └── page.tsx                       # Profile settings page with reminder
│   └── ...existing routes
└── types/
    ├── wizard.ts                              # TypeScript interfaces for wizard state
    └── ...existing types

tests/
├── unit/
│   ├── components/
│   │   └── ProfileSetupWizard.test.tsx        # Component tests
│   ├── lib/
│   │   ├── avatarCompression.test.ts          # Avatar compression unit tests
│   │   └── wizardValidation.test.ts           # Zod schema validation tests
│   └── ...existing tests
├── integration/
│   └── wizard-flow.integration.test.ts        # Full wizard flow tests
└── e2e/
    └── wizard.e2e.spec.ts                     # E2E tests via Playwright
```

**Structure Decision**: Web application (full-stack) with modal overlay architecture. Wizard components co-located with existing UI system. Utilities extracted to `src/lib/wizards/` for reuse. Tests follow existing pattern (unit, integration, e2e).

## Scope Decomposition Assessment

**Is the scope appropriate?** ✅ Yes. Feature 015 is a contained, self-sufficient user onboarding UI task that builds on Feature 014 (User model). Estimated 5–7 days of focused TDD work.

**Should this be broken into sub-issues?** ❌ No. Although the wizard has 5 screens, each screen is small (<100 lines) and shares common state/validation logic via the custom hook. A single issue with clear TDD phases (component tests → implementation → integration) is sufficient. The reminder prompt is trivial (<50 lines) and can be added in the same PR.

**Why not split?**

- All screens depend on the same state hook (`useProfileSetupWizard`), so sequential feature work is not parallelizable.
- Each screen is independently testable but shares test fixtures and mock data.
- PR review is clearer as a cohesive unit (wizard logic, avatar compression, accessibility).
- No risk of dependency hell or conflicts; Feature 014 is already merged and stable.

## Assumptions & Open Questions

### Confirmed Assumptions

1. **Feature 013 (Clerk Integration)** is complete and deployed; `useUser()` hook is available and provides authenticated user context in RootLayout. ✅
2. **Feature 014 (MongoDB User Model)** is complete and merged; `User.profile.completedSetup` flag exists and is set to `false` on user creation via webhook. ✅
3. `PATCH /api/internal/users/[userId]` endpoint is functional (Feature 014). ✅
4. Tailwind CSS 4.x and shadcn/ui are available for UI. ✅
5. MongoDB connection helper (`connectToMongo()` from Feature 014) is reusable. ✅
6. `react-hot-toast` (or equivalent toast library) is available for error notifications; if not present, will be added in Phase 1A. ✅

### Resolved Clarifications (from spec)

1. **Avatar Storage**: Base64 embedded in MongoDB (confirmed in spec, no external service needed). ✅
2. **Avatar Compression**: Client-side auto-compression to max 100KB base64; server enforces max 250KB. ✅
3. **First Login Detection**: `User.profile.completedSetup` flag (Feature 014). ✅
4. **Reminder Placement**: Dismissible inline banner on profile settings page. ✅
5. **Accessibility**: WCAG 2.1 AA compliant; keyboard nav, screen reader, focus management. ✅

### No Open Questions

All functional and technical requirements are clarified in the feature spec. Proceeding to Phase 0 research.

## Complexity Tracking

| Aspect | Justification |
|--------|---------------|
| Avatar Compression | Client-side JPEG/PNG/WebP compression necessary to meet 100KB base64 constraint; deferred server-side validation simplifies frontend error handling. |
| 5 Wizard Screens | Each screen is small (<100 lines); no alternative to sequential UX flow without breaking user experience. |
| Custom Hook | Centralizes wizard state and submission logic; avoids prop drilling and duplicated state across 5 screens. |

---

## Phase 0: Outline & Research

### Research Tasks (Resolved via Existing Knowledge)

**Task 1: Avatar Compression Library Selection**

- **Decision**: Use native browser `Canvas` API (`HTMLCanvasElement.toDataURL()`) with Pillow-like compression logic in TypeScript.
- **Rationale**: No external dependency; built-in browser API; sufficient for JPEG/PNG/WebP.
- **Alternatives Considered**:
  - `sharp` library (server-side, increases bundle size for client-side use).
  - `image-compressor.js` (third-party, adds dependency).
  - **Rejected because**: Native API sufficient; lightweight; no additional npm package required.

**Task 2: Accessibility Library Selection**

- **Decision**: Use Radix UI (via shadcn/ui) for accessible form components; implement manual focus management via `useEffect` + `useRef`.
- **Rationale**: shadcn/ui components already WCAG 2.1 AA compliant; focus trapping can be done with standard React patterns.
- **Alternatives Considered**:
  - `react-focus-lock` (third-party library for focus trapping).
  - **Rejected because**: Radix primitives already handle most a11y; manual implementation sufficient for modal use case.

**Task 3: Modal Overlay Trigger Logic**

- **Decision**: Fetch user profile in `RootLayout` after Clerk auth; check `completedSetup` flag; render modal conditionally.
- **Rationale**: Centralized trigger location; runs once on app init after auth is available.
- **Alternatives Considered**:
  - Per-route guards (duplicates logic, harder to maintain).
  - **Rejected because**: Single point of trigger is clearer and avoids duplication.

**Task 4: Zod Schema Reuse**

- **Decision**: Extract profile field schemas to `src/lib/wizards/wizardValidation.ts` for reuse in tests and frontend validation.
- **Rationale**: Aligns with project convention (Zod used throughout); ensures parity between client/server validation.
- **Alternatives Considered**:
  - Inline validation (less reusable).
  - **Rejected because**: Explicit schemas promote testing and consistency.

**Task 5: Error Toast System**

- **Decision**: Use existing toast library (assumed `react-hot-toast` or similar); display error messages on save failure.
- **Rationale**: Non-blocking, user-friendly feedback; allows retry without modal close.
- **Alternatives Considered**:
  - Alert dialogs (blocking, disruptive).
  - Inline error messages (less visible for network errors).
  - **Rejected because**: Toast provides best UX balance.

**Task 5: Data Migration Plan (Existing Users)**

- **Decision**: Lazy loading; no bulk migration script required.
- **Rationale**: Existing users (created before Feature 015 deploy) have `completedSetup = undefined`. On first app load, `RootLayout` treats undefined as `false` (wizard shown). Schema update is additive; no breaking change.
- **Alternatives Considered**:
  - Pre-migration script (adds deployment step; slows rollout).
  - **Rejected because**: Lazy loading simpler; users see wizard as intended on first post-deploy login.

See [research.md](#phase-0-research-output-below) for consolidated research findings.

---

## Phase 1: Design & Contracts

### Data Model Extension (from Feature 014)

**User.profile extension**:

```typescript
profile: {
  displayName: string;                          // required, 1–50 chars
  avatar?: string;                              // optional, base64, ≤250KB
  preferences: {
    theme: "light" | "dark";                    // required
    notifications: boolean;                     // required
  };
  completedSetup: boolean;                      // true after wizard completion
  setupCompletedAt?: Date;                      // timestamp of completion
}
```

### API Contracts

**No new endpoints required.** Feature 015 reuses:

- `PATCH /api/internal/users/[userId]` (Feature 014) with extended payload:
  - `profile.displayName` (string)
  - `profile.avatar` (base64 string or undefined)
  - `profile.preferences.theme` (enum)
  - `profile.preferences.notifications` (boolean)
  - `profile.completedSetup` (boolean)

**Request Example**:

```json
{
  "profile": {
    "displayName": "Aragorn",
    "avatar": "data:image/jpeg;base64,/9j/4AAQSkZ...",
    "preferences": {
      "theme": "dark",
      "notifications": true
    },
    "completedSetup": true
  }
}
```

**Response**:

```json
{
  "userId": "user_123",
  "email": "aragorn@example.com",
  "profile": {
    "displayName": "Aragorn",
    "avatar": "data:image/jpeg;base64,/9j/4AAQSkZ...",
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

### Component Architecture

**ProfileSetupWizardModal (main wrapper)**

- State: current screen index, form data, loading, error
- Renders: Screen router + navigation buttons (Next/Skip/Finish)
- Accessibility: Modal role, title, focus trap, keyboard escape (skippable screens only)
- Non-dismissible on first login (no close button); dismissible on repeat visits

**Custom Hook: useProfileSetupWizard**

- State: wizard state, screen index, form data
- Submission: POST to `PATCH /api/internal/users/[userId]`
- Error handling: retry logic, error toast
- Validation: real-time on blur via Zod schemas

**Zod Schemas (wizardValidation.ts)**

```typescript
const displayNameSchema = z.string().min(1).max(50);
const avatarSchema = z.string().optional().refine(
  (val) => !val || val.length <= 250 * 1024,  // 250KB base64
  "Avatar too large (max 250KB base64)"
);
const preferencesSchema = z.object({
  theme: z.enum(["light", "dark"]),
  notifications: z.boolean(),
});
const profileSetupSchema = z.object({
  displayName: displayNameSchema,
  avatar: avatarSchema,
  preferences: preferencesSchema,
});
```

### Avatar Compression (avatarCompression.ts)

```typescript
async function compressAvatar(file: File, maxSizeKB: number = 100): Promise<string> {
  // 1. Validate file type (JPEG, PNG, WebP)
  // 2. Read file as data URL
  // 3. Create Image, render to canvas at reduced quality (start at 0.75 for JPEG, 6 for PNG)
  // 4. Export to base64; measure size
  // 5. Retry with lower quality if > maxSizeKB (until quality <= 0.5 or zlib <= 3)
  // 6. If cannot reach maxSizeKB target, throw error (user can skip or reduce file size)
  // 7. Server enforces hard limit of 250KB on accept; client targets 100KB
  // Return: base64 data URL or throw error after timeout (>2s) or max quality reduction
}
```

### Phase 1 Output: Contracts & Design Files

Files to be generated (Phase 1 completion):

1. **data-model.md**: Extended User.profile schema + validation rules
2. **contracts/user-profile-schema.json**: OpenAPI-style schema for profile update
3. **contracts/wizard-api-contract.md**: Integration notes (no new endpoints)
4. **quickstart.md**: Setup wizard component usage guide

---

## Step-by-Step Implementation Plan (TDD-First)

### Phase 1A: Toast/Error Notification System Setup (Prerequisites)

**T0 (Optional)**: If `react-hot-toast` not in `package.json`, add it:

```bash
npm install react-hot-toast
```

- Rationale: Error toasts required for wizard submission errors, retry prompts.
- If library already installed, skip this task.

### Phase 2A: Avatar Compression & Validation (T1–T3)

**T1: Avatar Compression Unit Tests**

- Test JPEG compression to target 100KB (with quality adjustment)
- Test PNG compression with zlib level 6
- Test WebP compression fallback
- Test error handling for unsupported formats
- Test timeout/failure scenarios (>2s processing)
- **File**: `tests/unit/lib/avatarCompression.test.ts`

**T2: Implement Avatar Compression Utility**

- Implement `compressAvatar(file: File, maxSizeKB: number)` function
- Validate file type, size, format
- Use Canvas API for compression
- Implement retry loop (quality adjustment)
- Return base64 data URL or throw error
- **File**: `src/lib/wizards/avatarCompression.ts` (~80 lines)

**T3: Zod Schemas Unit Tests**

- Test displayName validation (min 1, max 50)
- Test avatar base64 size limit (250KB)
- Test preferences enum values
- Test full profileSetupSchema
- **File**: `tests/unit/lib/wizardValidation.test.ts`

### Phase 2B: Custom Hook & State Management (T4–T5)

**T4: useProfileSetupWizard Hook Tests**

- Test state initialization
- Test screen navigation (next/prev/skip)
- Test form data updates
- Test submission (POST to PATCH endpoint)
- Test error handling + retry
- Test localStorage persistence (optional, for UX improvement)
- **File**: `tests/unit/hooks/useProfileSetupWizard.test.ts`

**T5: Implement useProfileSetupWizard Hook**

- Manage wizard state (screen, formData, loading, error)
- Implement `handleNext()`, `handlePrev()`, `handleSkip()`
- Implement `handleSubmit()` (call PATCH endpoint)
- Implement error toast display
- Implement retry logic
- **File**: `src/hooks/useProfileSetupWizard.ts` (~120 lines)

### Phase 2C: Wizard Screen Components (T6–T10)

**T6: Component Integration Tests (All Screens)**

- Test WelcomeScreen render
- Test DisplayNameScreen validation
- Test AvatarUploadScreen file picker + preview
- Test PreferencesScreen radio/toggle inputs
- Test CompletionScreen success message
- Test screen transitions (next button enables after valid input)
- Test accessibility (keyboard nav, aria labels, focus)
- **File**: `tests/unit/components/ProfileSetupWizard.test.tsx`

**T7: Implement WelcomeScreen Component**

- Render intro text + Next button
- Test passes on render
- **File**: `src/components/ProfileSetupWizard/WelcomeScreen.tsx` (~40 lines)

**T8: Implement DisplayNameScreen Component**

- Text input + validation on blur
- Show error if invalid (red border, error message)
- Next button disabled until valid
- Test passes
- **File**: `src/components/ProfileSetupWizard/DisplayNameScreen.tsx` (~60 lines)

**T9: Implement AvatarUploadScreen Component**

- File picker (accept JPEG, PNG, WebP)
- File size validation (max 2MB)
- Call `compressAvatar()` on file select
- Show preview + compression progress
- Show error if compression fails
- Next button enabled (optional field)
- Test passes
- **File**: `src/components/ProfileSetupWizard/AvatarUploadScreen.tsx` (~100 lines)

**T10: Implement PreferencesScreen Component**

- Theme radio buttons (Light/Dark)
- Notifications toggle
- Next button always enabled
- Test passes
- **File**: `src/components/ProfileSetupWizard/PreferencesScreen.tsx` (~60 lines)

### Phase 2D: Modal Wrapper & Integration (T11–T13)

**T11: Implement CompletionScreen Component**

- Success message
- Finish button to close + submit
- **File**: `src/components/ProfileSetupWizard/CompletionScreen.tsx` (~40 lines)

**T12: Implement ProfileSetupWizardModal (Main Wrapper)**

- Screen router (render current screen)
- Navigation buttons (Next/Skip/Finish/Close)
- Focus trap (trap focus within modal)
- Escape key handling (skip on skippable screens)
- Modal role + title announcement
- Non-dismissible on first login (no close button)
- Test passes
- **File**: `src/components/ProfileSetupWizard/ProfileSetupWizardModal.tsx` (~100 lines)

**T10: Integration Tests - Full Wizard Flow**

- Test: user completes all screens → profile saved
- Test: user skips wizard on first login → `completedSetup = false` + reminder appears
- Test: user retries after skip → wizard reopens (dismissible)
- Test: user skips on repeat visit (not first login) → modal has close button + Escape key works
- Test: save error → error toast + retry available
- Test: avatar compression fails → error message + retry
- Test: first login detection: no close button available; repeat visit: close button visible
- **File**: `tests/integration/wizard-flow.integration.test.ts`

### Phase 2E: Modal Trigger & RootLayout Integration (T14–T15)

**T14: Unit Tests - Trigger Logic**

- Test: new user (completedSetup = false) → modal shows
- Test: existing user (completedSetup = true) → modal hidden
- Test: first login detection works post-auth
- **File**: `tests/unit/components/ProfileSetupWizardTrigger.test.tsx`

**T15: Implement Modal Trigger in RootLayout**

- Fetch user profile after Clerk auth
- Check `completedSetup` flag
- Pass `isFirstLogin={true}` to modal (non-dismissible)
- Pass `isFirstLogin={false}` on repeat (dismissible)
- Test passes
- **File**: `src/app/layout.tsx` (modify RootLayout)

### Phase 2F: Reminder Banner & Settings Page (T16–T17)

**T16: Unit Tests - Reminder Banner**

- Test: renders when `completedSetup = false`
- Test: hidden when `completedSetup = true`
- Test: dismiss button hides banner
- Test: banner text + link to re-trigger modal
- **File**: `tests/unit/components/ProfileSetupReminder.test.tsx`

**T17: Implement ProfileSetupReminder Component**

- Dismissible banner for profile settings page
- Shows when profile incomplete
- Link to trigger wizard modal
- Styled with warning/info background
- **File**: `src/components/ProfileSetupReminder.tsx` (~50 lines)

### Phase 2G: E2E Tests & Accessibility (T18–T19)

**T18: E2E Tests - Full User Flow**

- Test: new user sees wizard on first login
- Test: user completes wizard → profile saved → modal closes
- Test: user navigates away → wizard doesn't reappear
- Test: user skips → reminder appears on profile page
- Test: user clicks reminder link → wizard reopens
- **File**: `tests/e2e/wizard.e2e.spec.ts`

**T19: Accessibility Audit & Fixes**

- Test: keyboard navigation (Tab/Shift+Tab through all fields)
- Test: screen reader announces modal title, labels, errors
- Test: focus trap works (Tab from last field → first field)
- Test: Escape key dismissed skippable screens
- Test: visual focus indicator always visible
- Implement any fixes needed (aria-labels, role attributes, etc.)
- **File**: `tests/e2e/wizard-a11y.e2e.spec.ts`

---

## Effort, Risks, and Mitigations

### Effort Estimation

| Phase | Task | Estimate | Notes |
|-------|------|----------|-------|
| 2A | Avatar compression + validation | 1–2 days | Library selection clear; native Canvas API |
| 2B | Custom hook + state mgmt | 1 day | Straightforward React patterns |
| 2C | 5 wizard screens | 2–3 days | Each screen small; shared state simplifies |
| 2D | Modal wrapper + integration | 1 day | Focus trap, keyboard handling standard |
| 2E | RootLayout trigger | 0.5 days | Fetch user profile, conditional render |
| 2F | Reminder banner | 0.5 days | Simple dismissible component |
| 2G | E2E + accessibility | 1–2 days | Playwright E2E + manual a11y audit |
| **Total** | | **7–10 days** | TDD throughout; assumes Feature 014 stable |

### Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Avatar compression exceeds 2s timeout | Medium | Unit tests validate timing; adjust quality loop thresholds; cache compression results |
| Focus trap implementation buggy | Medium | Use Radix UI primitives where possible; thorough E2E a11y tests |
| Avatar base64 size validation fails server-side | Low | Both client and server enforce 250KB limit; client-side compression reduces likelihood |
| Modal trigger race condition (Clerk auth not yet ready) | Low | Use Clerk hook (`useUser()`) to ensure auth available; add loading state |
| Breaking change to User model schema | Low | Feature 014 already finalized; new fields are additive (backward compatible) |
| Screen reader announcements missing | Medium | Test with NVDA/JAWS; implement aria-live for errors; use labeled form fields |

---

## File-Level Change List

### New Files

1. `src/components/ProfileSetupWizard/ProfileSetupWizardModal.tsx` — Main modal wrapper
2. `src/components/ProfileSetupWizard/WelcomeScreen.tsx` — Welcome screen
3. `src/components/ProfileSetupWizard/DisplayNameScreen.tsx` — Display name input
4. `src/components/ProfileSetupWizard/AvatarUploadScreen.tsx` — Avatar file picker
5. `src/components/ProfileSetupWizard/PreferencesScreen.tsx` — Theme + notifications
6. `src/components/ProfileSetupWizard/CompletionScreen.tsx` — Success screen
7. `src/components/ProfileSetupReminder.tsx` — Dismissible banner for profile page
8. `src/hooks/useProfileSetupWizard.ts` — Custom hook (state + submission)
9. `src/lib/wizards/avatarCompression.ts` — Avatar compression utility
10. `src/lib/wizards/wizardValidation.ts` — Zod schemas for validation
11. `src/lib/wizards/constants.ts` — Shared constants (max sizes, defaults)
12. `src/types/wizard.ts` — TypeScript interfaces for wizard state
13. `tests/unit/lib/avatarCompression.test.ts` — Avatar compression tests
14. `tests/unit/lib/wizardValidation.test.ts` — Zod schema tests
15. `tests/unit/hooks/useProfileSetupWizard.test.ts` — Hook tests
16. `tests/unit/components/ProfileSetupWizard.test.tsx` — Component unit tests
17. `tests/unit/components/ProfileSetupReminder.test.tsx` — Reminder tests
18. `tests/integration/wizard-flow.integration.test.ts` — Full flow integration tests
19. `tests/e2e/wizard.e2e.spec.ts` — E2E tests via Playwright
20. `tests/e2e/wizard-a11y.e2e.spec.ts` — Accessibility E2E tests
21. `specs/015-profile-setup-wizard/research.md` — Phase 0 research (auto-generated)
22. `specs/015-profile-setup-wizard/data-model.md` — Phase 1 data model
23. `specs/015-profile-setup-wizard/contracts/user-profile-schema.json` — Schema contract
24. `specs/015-profile-setup-wizard/contracts/wizard-api-contract.md` — API notes
25. `specs/015-profile-setup-wizard/quickstart.md` — Component usage guide

### Modified Files

1. `src/app/layout.tsx` — Embed modal trigger + fetch user profile
2. `src/app/profile/settings/page.tsx` — Add reminder banner (if page exists; else create)
3. `.env.example` — Add any new env vars (none expected; Feature 014 sufficient)

### Configuration Updates

- No new npm dependencies required (uses existing libraries: React, Zod, Canvas API, shadcn/ui).
- No new environment variables.

---

## Test Plan

### Unit Tests (80%+ coverage)

1. **avatarCompression.test.ts** (8 test cases):
   - Compress JPEG to target size
   - Compress PNG with zlib level 6
   - Compress WebP
   - Reject unsupported formats
   - Handle files > 2MB (error)
   - Handle compression timeout
   - Reach max base64 size limit (error)
   - Return valid data URL

2. **wizardValidation.test.ts** (10 test cases):
   - displayName min/max length
   - displayName empty (error)
   - avatar base64 size limit (valid)
   - avatar base64 size limit (error)
   - theme enum values
   - notifications boolean
   - full profileSetupSchema valid
   - full profileSetupSchema missing fields (error)

3. **useProfileSetupWizard.test.ts** (15 test cases):
   - Initialize with default state
   - Advance screen (next)
   - Revert screen (prev)
   - Skip wizard (sets completedSetup = false)
   - Update form data
   - Submit valid data (POST to endpoint)
   - Handle submission error + retry
   - Submit with missing avatar (optional field)
   - Retry after timeout
   - Reset state on mount

4. **ProfileSetupWizard.test.tsx** (25 test cases):
   - WelcomeScreen renders + button enabled
   - DisplayNameScreen input validation
   - DisplayNameScreen error message display
   - AvatarUploadScreen file picker
   - AvatarUploadScreen compression progress
   - AvatarUploadScreen compression error
   - PreferencesScreen radio buttons
   - PreferencesScreen toggle
   - CompletionScreen success message
   - Modal renders with correct title
   - Modal focus trap
   - Keyboard escape key (skippable screens)
   - Screen transitions on button click
   - Next button disabled until valid input
   - Submit button sends correct payload

5. **ProfileSetupReminder.test.tsx** (5 test cases):
   - Renders when completedSetup = false
   - Hidden when completedSetup = true
   - Dismiss button hides banner
   - Banner text + link present
   - Reappears on next visit (if still incomplete)

**Total Unit Tests**: ~65 test cases, targeting 80%+ coverage on touched files.

### Integration Tests (15 test cases)

1. **wizard-flow.integration.test.ts**:
   - User logs in → wizard modal appears (first login)
   - User completes all screens → profile saved to MongoDB
   - User clicks finish → modal closes + completedSetup = true
   - User skips → modal stays open, completedSetup remains false
   - User updates avatar → compressed and saved
   - User sees reminder banner on profile page
   - User clicks reminder link → wizard reopens
   - Validation error on save → retry available
   - Network timeout → error toast + retry available

### E2E Tests (Playwright, 10+ scenarios)

1. **wizard.e2e.spec.ts**:
   - New user completes full wizard (all 5 screens)
   - User can navigate forward/back through screens
   - User can skip wizard
   - User sees reminder on profile page
   - User can re-trigger wizard from reminder
   - Avatar preview displays correctly
   - Theme preference persists
   - Notifications preference persists

2. **wizard-a11y.e2e.spec.ts**:
   - Keyboard navigation (Tab through all fields)
   - Screen reader reads modal title + labels
   - Focus trap works (Tab from last field loops to first)
   - Escape key dismisses skippable screens
   - Visual focus indicator always visible
   - Error messages announced via aria-live

**Test Coverage Target**: 80%+ on all new files; no regressions in modified files.

---

## Rollout & Monitoring Plan

### Rollout Strategy

**Phase 1: Soft Rollout (5% of new users)**

- Deploy to production behind a feature flag (e.g., `ENABLE_PROFILE_SETUP_WIZARD=true`).
- Monitor error rate, avatar compression failures, save latency.
- Collect user feedback (support tickets, Sentry errors).

**Phase 2: Gradual Rollout (50% of new users)**

- If Phase 1 metrics healthy, enable for 50% of new users.
- Continue monitoring.

**Phase 3: Full Rollout (100% of new users)**

- If Phase 2 metrics stable, enable for all new users.

### Monitoring & Alerts

**Key Metrics**:

- Avatar compression success rate (target: >99%)
- Avatar compression time (p95 < 2s)
- Profile save success rate (target: >99%)
- Profile save latency (p95 < 10s)
- Wizard completion rate (% of new users who complete vs. skip)
- Error rate on profile PATCH endpoint (target: <1%)

**Logs to Monitor** (Structured JSON):

- All wizard events logged at INFO level (screen transitions, submissions)
- Validation failures logged at WARN level
- Save errors logged at ERROR level (includes error details, user ID, timestamp)

**Rollback Plan**:

- If error rate > 5% or compression failures > 1%, disable feature flag immediately.
- Notify @doug; investigate via Sentry + server logs.
- Deploy fix and re-enable after validation.

### Analytics (Deferred)

Feature 015 does not implement event tracking (per spec clarification). Analytics integration is deferred to a separate observability feature. For now, track completion via log analysis or manual user audit.

---

## Handoff Package

### Documentation Artifacts

1. **quickstart.md** — How to use wizard component in templates/layouts
2. **data-model.md** — Extended User.profile schema
3. **contracts/*** — API integration notes
4. **tests/*** — Test fixtures, mocks, setup helpers

### Code Artifacts

- Source files (25 files listed above)
- Test files (20 files listed above)
- No breaking changes; backward compatible with Feature 014

### Pre-Merge Checklist

- [ ] All 65+ unit tests passing (80%+ coverage)
- [ ] All 15+ integration tests passing
- [ ] All 10+ E2E tests passing
- [ ] Accessibility audit complete (WCAG 2.1 AA)
- [ ] TypeScript strict mode: no `any` types, all types explicit
- [ ] ESLint passes (no duplication, file/function size limits)
- [ ] Codacy analysis: no new issues
- [ ] Build successful (`npm run build`)
- [ ] Precommit hook passes all checks
- [ ] Code review approved

### Post-Merge Handoff

1. Remove `in-progress` label from issue #015.
2. Mark issue as `completed`.
3. Update `docs/Feature-Roadmap.md`: Feature 015 → Complete.
4. Deploy to production (via Fly.io) with feature flag `ENABLE_PROFILE_SETUP_WIZARD=true`.
5. Monitor metrics per rollout plan above.
6. Document any post-launch issues or improvements in follow-up issues.

---

## Phase 0 Research Output (Below)

*All research tasks resolved; no blockers identified. Proceeding to Phase 1.*

### Avatar Compression Library: Native Canvas API

**Decision**: Use browser `Canvas` API for client-side compression (no external library).

**Rationale**:

- Built-in to all modern browsers; no npm dependency.
- Sufficient for JPEG/PNG/WebP compression.
- Integrates easily with React (FileReader API).
- Reduces client-side bundle size.

**Implementation Approach**:

1. Read file as data URL via `FileReader.readAsDataURL()`.
2. Create `Image` element; load data URL.
3. Create `Canvas` element; render image at reduced quality.
4. Export to base64 via `canvas.toDataURL("image/jpeg", quality)`.
5. Measure base64 string size; retry with lower quality if needed.
6. Stop when size ≤ 100KB or quality reaches minimum threshold (e.g., 0.5).

**Alternatives Considered & Rejected**:

- `sharp` (Node.js library, not suitable for client-side; increases backend dependencies).
- `image-compressor.js` (third-party; adds npm dependency; Canvas API sufficient).
- Server-side compression (defeats client-side preview; adds latency).

**Validation**:

- Unit tests confirm JPEG/PNG compression; quality adjustment loop; timeout handling.

---

### Accessibility Implementation: Radix UI + Manual Focus Management

**Decision**: Use Radix UI primitives (via shadcn/ui) for form components; implement manual focus trap via `useEffect` + `useRef`.

**Rationale**:

- shadcn/ui components already WCAG 2.1 AA compliant (Radix-based).
- Focus trapping for modals can be implemented with standard React patterns.
- No additional accessibility library required.

**Implementation Approach**:

1. Use Radix UI form components for all inputs (auto-labels, aria attributes).
2. Implement focus trap: capture Tab key; cycle focus within modal.
3. Announce modal title via `role="alertdialog"` + `aria-label`.
4. Use `aria-live="polite"` for error messages (auto-announced).
5. Test with NVDA/JAWS screen readers; Playwright a11y tests.

**Alternatives Considered & Rejected**:

- `react-focus-lock` (third-party; Radix primitives sufficient).
- Custom focus management without Radix (less robust; more code).

**Validation**:

- E2E accessibility tests via Playwright; manual screen reader audit.

---

### Modal Trigger Logic: RootLayout Post-Auth Check

**Decision**: Fetch user profile in `RootLayout` after Clerk auth; check `completedSetup` flag; conditionally render modal.

**Rationale**:

- Centralized trigger (single point of control).
- Runs once after app init when auth is available.
- Cleanest integration with existing app shell.

**Implementation Approach**:

1. Use Clerk hook `useUser()` to detect auth.
2. When user is available, fetch full user profile (call internal GET endpoint).
3. Check `profile.completedSetup` flag.
4. Pass flag to modal component; set `isFirstLogin={!completedSetup}`.
5. Modal is non-dismissible if `isFirstLogin=true`; dismissible otherwise.

**Alternatives Considered & Rejected**:

- Per-route guards (duplicates logic; scattered trigger points).
- Centralized state manager (Zustand/Redux overkill for this use case).

**Validation**:

- Unit tests confirm flag check; E2E tests confirm modal appears for new users.

---

### Zod Schema Reuse: Central Validation Module

**Decision**: Extract profile field schemas to `src/lib/wizards/wizardValidation.ts` for reuse.

**Rationale**:

- Aligns with project convention (Zod used for all validation).
- Enables frontend validation without duplicating rules.
- Ensures parity between client-side and server-side validation.
- Schemas can be reused in tests, components, and API routes.

**Implementation Approach**:

1. Define individual field schemas (displayName, avatar, preferences).
2. Compose into `profileSetupSchema`.
3. Export for use in hook, components, tests, and API routes.
4. Use `parse()` for validation; `safeParse()` for error handling.

**Validation**:

- Unit tests for each schema; integration tests for full profile schema.

---

### Error Toast System: Existing React Hot Toast or Similar

**Decision**: Use existing toast library (assumed available; if not, implement via shadcn/ui `Toast` primitive).

**Rationale**:

- Non-blocking, user-friendly error feedback.
- Allows retry without modal close.
- Standard UI pattern in modern web apps.

**Implementation Approach**:

1. On profile PATCH error, call `toast.error("Failed to save profile. Please retry.")`.
2. Include retry button in toast action.
3. On retry, re-call submission logic.

**Alternatives Considered & Rejected**:

- Alert dialogs (blocking; disruptive UX).
- Inline error messages (less visible for network errors).

**Validation**:

- Unit tests for error display; E2E tests for retry flow.

---

## Conclusion

Feature 015 (Profile Setup Wizard) is well-scoped, technically clear, and ready for Phase 2 implementation. All research tasks are resolved; no blockers identified. Constitutional alignment confirmed. Proceeding with TDD-first implementation following the 19-task checklist (T1–T19).

**Next Steps**:

1. Create `research.md` in `/specs/015-profile-setup-wizard/`.
2. Create `data-model.md` and contract files (Phase 1).
3. Begin implementation with T1 (avatar compression unit tests).

---

**Generated by**: `/speckit.plan` workflow
**Date**: 2025-11-28
**Status**: Phase 0–1 Planning Complete
