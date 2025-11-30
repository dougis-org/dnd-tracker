# Feature Specification: Profile Setup Wizard

**Feature Branch**: `feature/015-profile-setup-wizard`  
**Created**: 2025-11-28  
**Status**: Draft  
**Input**: User description: "A Setup Wizard for user profiles"

**Maintainer**: @doug
**Canonical components (UI)**: GlobalNav
**Constitution**: This specification must comply with `.specify/memory/constitution.md` (sections 1.0–1.4). After edits, run the required Codacy analysis for any edited files per repository rules. All implementation tasks MUST follow TDD (Test-First) and enforce constitutional quality gates: 80%+ test coverage, no `any` types, file size limits (≤450 lines per file, ≤50 lines per function), code review approval.

## Clarifications

### Session 2025-11-28 (Initial)

- Q: Scope of Profile Data – What fields must the wizard configure? → A: Essential fields only (Display Name, Avatar, Basic Preferences: theme, notifications)
- Q: Wizard Trigger & Enforcement – When must the wizard run? → A: Mandatory on first login only; skippable on repeat visits (with prompt if profile incomplete)
- Q: Avatar Upload – How should avatar images be stored and served? → A: Base64 embedded in MongoDB document (for simplicity)
- Q: UX Behavior on Error – How should the wizard handle validation or save failures? → A: Inline field validation (real-time on blur); on save failure, show error toast & allow retry
- Q: Integration with Feature 013 (Auth) – How is "first login" detected? → A: Flag in User model (`profile.completedSetup = false` on user creation, set by Feature 014 webhook)
- Q: Component Architecture – Where should the wizard component live and what should trigger it? → A: Modal overlay in app layout wrapper; shows when `completedSetup === false` on first load
- Q: Accessibility & Localization – What accessibility and internationalization standards must the wizard meet? → A: WCAG 2.1 AA compliant (keyboard nav, screen reader, focus mgmt); English-only for MVP

### Session 2025-11-28 (Follow-up)

- Q: Avatar Compression & Storage Limits – What compression parameters and max base64 size? → A: Auto-compress client-side to max 100KB with JPEG quality 75% (photos) or PNG zlib level 6 (graphics). Server enforces max 250KB base64 string size.
- Q: Reminder Prompt Placement & Dismissibility – Where and how should the reminder appear on profile page? → A: Dismissible inline banner at top of profile settings page. Reappears on next visit if `completedSetup` still false. Styled with warning/info background.
- Q: Analytics Event Tracking – Which events and system for tracking wizard completion? → A: Defer analytics to separate observability feature. Implement wizard without event tracking for MVP.

## Functional Requirements

### Wizard Trigger & Flow

- Wizard is **mandatory** on first login (blocks navigation until dismissed; no close button or Escape key support).
- On subsequent visits (after first login), wizard is **skippable** via a "Skip" button or modal close (close button visible; Escape key enabled).
- If user skips initial wizard, a persistent dismissible prompt appears in the profile page until setup is completed.
- Once `profile.completedSetup === true`, wizard never reappears and reminder is hidden permanently.

### User Interaction Steps

1. **Welcome Screen**: Brief introduction ("Welcome! Let's set up your profile.")
2. **Display Name**: Text input field (required, min 1 char, max 50 chars).
3. **Avatar Upload**: File picker for image upload (optional, formats: JPEG, PNG, WebP; max 2MB uncompressed). Client-side auto-compression targets ≤100KB base64 data URL (lossy JPEG at quality 75% for photos, lossless PNG with zlib level 6 for graphics). If compression fails or exceeds target after quality reduction, show error message and allow user to retry, skip avatar, or reduce file size. Server enforces hard limit of ≤250KB base64 data URL size and returns HTTP 413 if exceeded. Stored as base64 data URL in MongoDB.
4. **Preferences**:
   - Theme selector (Light/Dark radio buttons or toggle).
   - Notification toggle (ON/OFF).
5. **Completion**: "Finish" button saves and closes wizard; marks `completedSetup = true`.

### Skip Behavior

- "Skip" button available on all screens except Completion.
- Skipping sets `completedSetup = false` and shows reminder prompt.
- Reminder is a dismissible inline banner at top of profile settings page (`src/app/profile/settings/page.tsx`); styled with warning/info background; reappears on next visit if `completedSetup` remains false.

### Error Handling & Validation

- **Field Validation** (real-time on blur):
  - Display Name: Required, 1–50 characters; show inline error if empty or too long.
  - Avatar: Validate file type (JPEG, PNG, WebP only); max 2MB original file; auto-compress to ≤100KB base64 data URL; server enforces ≤250KB base64 data URL; show error toast if invalid format, compression timeout (>2s), or size violation; allow retry, skip avatar, or reduce file size.
- **Save Failures**:
  - On profile save error, display error toast with retry button.
  - User may retry save indefinitely without closing wizard.
  - Unsaved data persisted in component state during session.
  - Non-retryable errors (HTTP 400, 401, 404, 409): show error and suggest user action (fix input, re-auth, etc.).
  - Retryable errors (HTTP 500, 504): show error toast with retry button; implement exponential backoff (1s, 2s, 4s max).
- **Network Issues**:
  - Timeout after 10 seconds; suggest retry or check connection.
  - Do not auto-dismiss wizard on error (user must take action).

### First Login Detection

- **Source**: `User.profile.completedSetup` flag (initialized to `false` by Feature 014 webhook on user creation; existing users with undefined flag treat as `false` during rollout).
- **Check**: On app initialization (after auth), if `completedSetup === false`, trigger wizard modal.
- **Integration**: Feature 014 (MongoDB User Model) must set this flag during user creation webhook.
- **Edge Case - Existing Users**: For users created before Feature 015 deployment where `completedSetup` is undefined, treat as `false` on first load (wizard shown). No data migration script required; lazy loading during rollout is sufficient.

## Integration & External Dependencies

### Upstream Dependencies

- **Feature 013 (Clerk Integration)**: Provides authenticated user context and session.
- **Feature 014 (MongoDB User Model)**: Provides User model with profile subdocument; sets `completedSetup = false` on user creation via webhook.

### API Endpoints Required

- `PATCH /api/internal/users/[userId]` (Feature 014): Updates `profile.displayName`, `profile.avatar`, `profile.preferences`, and `profile.completedSetup`.

### No Breaking Changes

- This feature extends the User model but does not modify existing fields or break backward compatibility.
- Existing users have `completedSetup = undefined` until Feature 015 updates are deployed; treat as `false` during initial rollout.

## Component Architecture

### Modal Overlay Pattern

- **Location**: Managed by RootLayout wrapper (e.g., `src/app/layout.tsx` or app shell component).
- **Trigger Logic**: After user authentication (from Clerk), fetch user profile and check `completedSetup` flag.
- **Behavior**:
  - If `completedSetup === false`, render `<ProfileSetupWizardModal>` with `isOpen={true}`.
  - Modal is non-dismissible on first login (no close button on initial display).
  - After completion, modal closes and sets `isOpen={false}`.
- **Reminder Prompt**: On profile settings page, if `completedSetup === false`, show dismissible inline banner at top: "Complete your profile setup" with a link to re-trigger modal. Banner styled with warning/info background. Reappears on next visit if setup remains incomplete.

### File Structure

```
src/
  components/
    ProfileSetupWizard/
      ProfileSetupWizardModal.tsx      # Main modal component
      WelcomeScreen.tsx                # Step 1
      DisplayNameScreen.tsx             # Step 2
      AvatarUploadScreen.tsx            # Step 3
      PreferencesScreen.tsx             # Step 4
      CompletionScreen.tsx              # Step 5
      useProfileSetupWizard.ts          # Hook for state & submission
  app/
    layout.tsx                          # RootLayout embeds modal
    profile/
      settings/
        page.tsx                        # Shows reminder if incomplete
```

## Non-Functional Requirements & Quality Attributes

### Accessibility (WCAG 2.1 AA)

- **Keyboard Navigation**:
  - All controls reachable via Tab/Shift+Tab.
  - Modal can be dismissed via Escape key (on skippable screens only).
  - Focus trap within modal when open.
- **Screen Reader Support**:
  - All form fields have associated labels (via `<label>` or `aria-label`).
  - Error messages announced via `aria-live="polite"`.
  - Modal role and title announced on open.
- **Focus Management**:
  - Focus moved to first input on modal open.
  - Focus returned to trigger element on close.
  - Visual focus indicator always visible (no `outline: none` without replacement).

### Performance

- **Modal Load Time**: < 500ms from first login to wizard display.
- **Avatar Compression**: Client auto-compresses to max 100KB base64 (≤250KB enforced by server). Compression must complete within 2s for files ≤2MB.
- **Save Latency**: Profile save request should complete within 3–10s (timeout at 10s).

### Language Support

- **MVP**: English only.
- **Future**: i18n framework (e.g., next-intl) deferred to separate feature.
- **Text Strings**: All UI text hardcoded as English for now; no i18n placeholders.

### Error Observability

- **Logging**: Log save errors to monitoring system (Sentry, etc.) for debugging.
- **User Feedback**: Toast notifications for user-facing errors (connection issues, validation failures).
- **Analytics**: Deferred to separate observability feature. MVP does not emit wizard completion or drop-off events.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - First Login Setup (Priority: P1)

As a new user, I want to be guided through a setup wizard after my first login so that I can configure my profile and preferences.

**Why this priority**: Ensures users can quickly onboard and personalize their experience.

**Independent Test**: Verify that a new user is automatically directed to the setup wizard upon first login and can complete the process without errors.

**Acceptance Scenarios**:

1. **Given** a new user logs in for the first time, **When** they complete the setup wizard, **Then** their profile is saved successfully.
2. **Given** a user skips the wizard, **When** they attempt to access their profile, **Then** they are prompted to complete the setup.

---

## Data Model

### Profile Fields (Wizard Configuration)

The wizard collects and persists the following essential user profile data:

- **displayName** (string, required): User's display name for public visibility
- **avatar** (base64 string, optional): Profile avatar image, client-compressed to ≤100KB, stored as base64 with server-side validation ≤250KB
- **preferences** (object, required):
  - **theme** (enum: "light" | "dark"): UI theme preference
  - **notifications** (boolean): Enable/disable email notifications

### Schema Extension

Integrates with the User model from Feature 014 (MongoDB User Model). New fields added to `User.profile` subdocument:

```typescript
profile: {
  displayName: string;                          // 1–50 chars, required after wizard
  avatar?: string;                              // base64 data URL, optional, max 250KB base64
  preferences: {
    theme: "light" | "dark";                    // required enum: light or dark
    notifications: boolean;                     // required boolean: true or false
  };
  completedSetup: boolean;                      // required, defaults to false; true after wizard completion
  setupCompletedAt?: Date;                      // optional timestamp when wizard marked complete
}
```
