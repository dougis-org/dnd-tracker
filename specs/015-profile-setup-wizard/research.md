# Phase 0: Research & Decisions

**Feature**: 015 - Profile Setup Wizard  
**Date**: 2025-11-28  
**Status**: Complete

## Overview

This document consolidates research findings and design decisions for Feature 015 (Profile Setup Wizard). All identified unknowns from the Technical Context have been researched and resolved. No blockers remain for Phase 1 design.

## Research Tasks & Resolutions

### Task 1: Avatar Compression Library Selection

**Question**: How should avatar images be compressed on the client to meet the 100KB base64 constraint?

**Decision**: Use native browser Canvas API for client-side compression (no external library).

**Rationale**:

- Canvas API is built into all modern browsers; no npm dependency required.
- Sufficient for JPEG/PNG/WebP compression with quality adjustment.
- Integrates cleanly with React (FileReader + Canvas APIs).
- Reduces client bundle size vs. adding a third-party library.
- Aligns with project's minimal dependency philosophy.

**Alternatives Considered**:

1. **`sharp` library** (Node.js): Server-side image processing
   - **Rejected**: Not suitable for client-side; adds backend dependencies; increases latency and complexity.
2. **`image-compressor.js` npm package**: Lightweight client-side library
   - **Rejected**: Adds external dependency; Canvas API sufficient for feature requirements.
3. **Server-side compression**: Process image on backend
   - **Rejected**: Defeats client-side preview; increases latency; complicates error handling.

**Implementation Approach**:

1. User selects image file via file picker.
2. Read file as data URL via `FileReader.readAsDataURL()`.
3. Create `Image` element; load data URL.
4. Create `Canvas` element; render image at reduced dimensions/quality.
5. Export to base64 via `canvas.toDataURL("image/jpeg", quality)` with quality parameter (0.0–1.0).
6. Measure base64 string size.
7. If size > 100KB, decrease quality and retry (loop until target reached or min quality hit).
8. If compression succeeds, return base64 data URL.
9. If compression fails (timeout, min quality insufficient), throw error; user sees error message and can retry.

**Constraints Met**:

- ✅ Client-side compression: no external service
- ✅ Target size: 100KB base64 (max file upload)
- ✅ Server-side validation: max 250KB base64 (defense-in-depth)
- ✅ Timeout: <2s for files ≤2MB (per NFR)
- ✅ Supported formats: JPEG, PNG, WebP

**Validation Evidence**:

- Unit tests: `tests/unit/lib/avatarCompression.test.ts` (8 test cases covering compression, formats, errors, timeouts)
- Integration tests: Verify avatar base64 is correctly stored in User.profile
- E2E tests: Verify user can upload, preview, and save avatar

---

### Task 2: Accessibility Implementation Strategy

**Question**: How should the wizard implement WCAG 2.1 AA compliance (keyboard navigation, screen reader support, focus management)?

**Decision**: Use Radix UI primitives (via shadcn/ui) for form components; implement manual focus trap via React hooks (`useEffect`, `useRef`).

**Rationale**:

- shadcn/ui components are built on Radix UI, which is WCAG 2.1 AA compliant by default.
- Radix primitives handle most accessibility concerns (labels, aria attributes, semantic HTML).
- Focus trapping for modals can be implemented with standard React patterns (no additional library needed).
- Reduces dependencies while meeting accessibility requirements.
- Aligns with project's existing use of shadcn/ui.

**Alternatives Considered**:

1. **`react-focus-lock` library**: Third-party focus management
   - **Rejected**: Radix primitives provide sufficient foundation; additional library adds dependency for minimal benefit.
2. **Custom focus management without Radix**: Roll-your-own accessibility
   - **Rejected**: Error-prone; inconsistent with project patterns; more code to maintain and test.
3. **Use a different component library** (e.g., Headless UI)
   - **Rejected**: Project standardized on shadcn/ui; no reason to diverge.

**Implementation Approach**:

1. **Form Components**:
   - Use shadcn/ui input, button, radio group, switch primitives.
   - All inputs have explicit labels via `<label>` element or `aria-label`.
   - Required fields marked with `aria-required="true"`.

2. **Focus Trap** (for modal):
   - Detect Tab key in `keydown` event within modal.
   - If Tab from last focusable element, focus first element.
   - If Shift+Tab from first element, focus last element.
   - Use `useRef` to track focus targets.

3. **Error Announcements**:
   - Display error messages in DOM.
   - Use `aria-live="polite"` region to announce errors to screen readers.
   - Real-time validation on blur (user knows immediately if invalid).

4. **Modal Semantics**:
   - Use `role="alertdialog"` for modal.
   - Modal has `aria-label` with title (e.g., "Profile Setup Wizard").
   - Focus moved to first input on open; returned to trigger element on close.

5. **Keyboard Support**:
   - Escape key: dismiss on skippable screens only (not on first login).
   - Tab: navigate forward through focusable elements.
   - Shift+Tab: navigate backward.
   - Enter: submit form or advance screen.
   - Arrow keys: toggle radio buttons, switch toggles.

**Constraints Met**:

- ✅ WCAG 2.1 AA Level compliance
- ✅ Keyboard navigation (Tab, Shift+Tab, Escape, arrows)
- ✅ Screen reader support (labels, aria-live, role attributes)
- ✅ Focus management (trap, visible indicator, restoration)
- ✅ English-only for MVP (no i18n complexity)

**Validation Evidence**:

- Unit tests: Component rendering with correct aria attributes.
- E2E accessibility tests: Keyboard navigation, screen reader announcements (Playwright axe accessibility audit).
- Manual testing: NVDA/JAWS screen readers (recommended but not automated in MVP).

---

### Task 3: Modal Trigger Logic & First Login Detection

**Question**: How should the wizard modal be triggered on first login? Where should trigger logic live?

**Decision**: Fetch user profile in `RootLayout` (app shell) after Clerk auth; check `profile.completedSetup` flag; conditionally render modal.

**Rationale**:

- RootLayout is the centralized app shell component; ideal place for top-level UI decisions.
- Runs once after app init when authentication is available (via Clerk hook).
- Single point of control eliminates duplication and inconsistency.
- Follows Next.js 16 app router conventions (RootLayout at `src/app/layout.tsx`).
- Cleanest integration with existing Clerk auth context.

**Alternatives Considered**:

1. **Per-route guards**: Check on each route/page
   - **Rejected**: Duplicates logic across many files; easy to miss a route; inconsistent behavior.
2. **Middleware function**: Check in Next.js middleware
   - **Rejected**: Middleware runs at request time; harder to access client-side auth context; overkill for this use case.
3. **Zustand/Redux global state**: Centralized state manager
   - **Rejected**: Adds complexity and dependency; simple flag check doesn't warrant global state.

**Implementation Approach**:

1. **In RootLayout (`src/app/layout.tsx`)**:

   ```typescript
   import { useUser } from "@clerk/nextjs";
   
   export default function RootLayout({ children }) {
     const { isLoaded, user } = useUser();
     const [showWizard, setShowWizard] = useState(false);
     const [isFirstLogin, setIsFirstLogin] = useState(false);

     useEffect(() => {
       if (isLoaded && user) {
         // Fetch user profile from internal API
         fetchUserProfile(user.id).then((profile) => {
           const isComplete = profile?.profile?.completedSetup ?? false;
           setShowWizard(!isComplete);
           setIsFirstLogin(true); // First render after auth
         });
       }
     }, [isLoaded, user]);

     return (
       <>
         {children}
         <ProfileSetupWizardModal
           isOpen={showWizard}
           isDismissible={!isFirstLogin}
           onClose={() => setShowWizard(false)}
         />
       </>
     );
   }
   ```

2. **Wizard Modal Props**:
   - `isOpen`: Show/hide modal
   - `isDismissible`: false on first login (no close button); true on repeat visits
   - `onClose`: Callback when user finishes or skips

3. **First Login Logic**:
   - On first login (after auth), if `profile.completedSetup === false`, show modal with no close button.
   - User can skip, but modal will reappear on next visit or when accessing profile settings.
   - Once completed, `profile.completedSetup = true`; modal never reappears.

**Constraints Met**:

- ✅ Trigger on first login only
- ✅ Modal non-dismissible initially
- ✅ Central, single point of control
- ✅ Integrates cleanly with Clerk auth
- ✅ Works with Feature 014 User model

**Validation Evidence**:

- Unit tests: Check that modal appears/disappears based on `completedSetup` flag.
- E2E tests: New user logs in → wizard appears; completes wizard → profile saved; revisits → wizard gone.

---

### Task 4: Zod Schema Reuse & Validation Layers

**Question**: How should validation schemas be structured and reused across frontend and tests?

**Decision**: Extract profile field schemas to `src/lib/wizards/wizardValidation.ts`; reuse in components, tests, and API routes.

**Rationale**:

- Zod is the project's standard validation library (per Tech-Stack.md).
- Centralizing schemas ensures consistency between client-side and server-side validation.
- Enables easy testing of validation rules.
- Single source of truth for field constraints.
- Simplifies future changes (modify schema in one place).

**Alternatives Considered**:

1. **Inline validation**: Define rules in each component/test
   - **Rejected**: Duplicates rules; easy to miss updates; inconsistent behavior.
2. **Separate client/server schemas**: Different rules for frontend and backend
   - **Rejected**: Creates complexity and potential mismatches; harder to debug.

**Implementation Approach**:

File: `src/lib/wizards/wizardValidation.ts`

```typescript
import { z } from "zod";

// Individual field schemas (reusable)
export const displayNameSchema = z
  .string()
  .min(1, "Display name is required")
  .max(50, "Display name must be 50 characters or less")
  .trim();

export const avatarSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || val.length <= 250 * 1024,
    "Avatar must be 250KB or smaller (base64 encoded)"
  );

export const preferencesSchema = z.object({
  theme: z.enum(["light", "dark"]),
  notifications: z.boolean(),
});

// Composed profile schema (full validation)
export const profileSetupSchema = z.object({
  displayName: displayNameSchema,
  avatar: avatarSchema,
  preferences: preferencesSchema,
});

export type ProfileSetup = z.infer<typeof profileSetupSchema>;
```

**Usage in Components**:

```typescript
const { displayName, setDisplayName, displayNameError } = useProfileSetupWizard();

// Real-time validation on blur
const handleDisplayNameBlur = () => {
  const result = displayNameSchema.safeParse(displayName);
  if (!result.success) {
    setDisplayNameError(result.error.errors[0].message);
  }
};
```

**Usage in Tests**:

```typescript
test("displayName must be 1-50 chars", () => {
  expect(displayNameSchema.parse("John")).toEqual("John");
  expect(() => displayNameSchema.parse("")).toThrow();
  expect(() => displayNameSchema.parse("a".repeat(51))).toThrow();
});
```

**Constraints Met**:

- ✅ Centralized, reusable schemas
- ✅ Parity between client and server validation
- ✅ TypeScript inference via `z.infer<>`
- ✅ Consistent error messages
- ✅ Easy to test and update

**Validation Evidence**:

- Unit tests: `tests/unit/lib/wizardValidation.test.ts` (10+ test cases for each schema).
- Integration tests: Verify schemas prevent invalid submissions.

---

### Task 5: Error Handling & Toast Notifications

**Question**: How should the wizard handle and display errors to users (validation, save failures, network issues)?

**Decision**: Use error toast notifications for transient errors (network, server); inline field errors for validation; retry button for save failures.

**Rationale**:

- Toast notifications are non-blocking and standard in modern UIs; user can dismiss or retry.
- Inline field errors provide real-time feedback during form entry.
- Retry mechanism allows users to recover from transient failures without restarting wizard.
- Aligns with project's existing error handling patterns.

**Alternatives Considered**:

1. **Alert dialogs**: Modal error prompts
   - **Rejected**: Blocking and disruptive; poor UX for transient errors; forces user to dismiss before proceeding.
2. **Only inline errors**: No toast notifications
   - **Rejected**: Network/server errors not tied to specific fields; user misses transient errors.

**Implementation Approach**:

1. **Field Validation Errors** (real-time, on blur):
   - Display inline error message below field.
   - Use red border/error styling from shadcn/ui.
   - Next button disabled until field valid.
   - Example: "Display name must be 1–50 characters"

2. **Save Errors** (on PATCH request failure):
   - Display error toast (non-blocking).
   - Include retry button in toast action.
   - Log error to monitoring system (Sentry).
   - Example: "Failed to save profile. Please retry." [Retry] [Dismiss]

3. **Timeout Errors** (>10s):
   - Return 504 error; display toast: "Request timed out. Check connection and retry."

4. **Validation Errors from Server** (400/409 responses):
   - Parse error response; display appropriate message.
   - Example: 409 Conflict: "This email is already in use."
   - Display in toast; allow retry after user fixes issue.

5. **Unsupported Formats** (avatar):
   - Display inline error: "File format not supported. Please use JPEG, PNG, or WebP."
   - User can select another file immediately.

**Error Logging** (Structured JSON):

```json
{
  "level": "ERROR",
  "timestamp": "2025-11-28T15:30:00Z",
  "message": "Profile save failed",
  "context": {
    "userId": "user_123",
    "error": "ECONNREFUSED",
    "statusCode": 500
  }
}
```

**Constraints Met**:

- ✅ Non-blocking error feedback
- ✅ User can retry without restarting wizard
- ✅ Appropriate error messages for each scenario
- ✅ Logging for observability
- ✅ Graceful handling of network/server issues

**Validation Evidence**:

- Unit tests: Error state display, retry logic.
- Integration tests: Save failure scenarios, retry behavior.
- E2E tests: User sees error toast, can retry successfully.

---

## Technical Stack Confirmation

All required technologies identified in Technical Context are available and confirmed:

| Technology | Version | Confirmed | Notes |
|-----------|---------|-----------|-------|
| TypeScript | 5.9.2 | ✅ | Project default |
| Next.js | 16.0.1 | ✅ | Project default |
| React | 19.0.0 | ✅ | Project default |
| Tailwind CSS | 4.x | ✅ | Project default |
| shadcn/ui | Latest | ✅ | Component library |
| Zod | 3.23.8 | ✅ | Validation standard |
| Mongoose | 8.19.1 | ✅ | For User model queries |
| Jest | 30.2.0 | ✅ | Unit/integration tests |
| Playwright | 1.56.1 | ✅ | E2E tests |
| Clerk | 6.35.2 | ✅ | Auth context |

**No new dependencies required.** Feature 015 uses only existing libraries from `package.json`.

---

## Integration Points Confirmed

1. **Feature 014 (MongoDB User Model)**: ✅ `PATCH /api/internal/users/[userId]` endpoint available; `profile.completedSetup` flag present
2. **Feature 013 (Clerk Integration)**: ✅ `useUser()` hook available for auth context
3. **Existing UI System**: ✅ shadcn/ui, Tailwind CSS available
4. **Testing Infrastructure**: ✅ Jest, React Testing Library, Playwright configured

**No blockers for Phase 1 design.**

---

## Dependencies & Constraints Summary

### Must-Have (Blocking)

- ✅ Feature 014 User model (upstream dependency)
- ✅ Clerk auth context
- ✅ MongoDB connection via Mongoose

### Nice-to-Have (Non-Blocking)

- 🟡 Toast library (use shadcn/ui if not available)
- 🟡 Feature flag system (deploy without if unavailable)

### Architectural Constraints

- ✅ Max 450 lines per file; max 50 lines per function
- ✅ 80%+ test coverage on new code
- ✅ No code duplication; use shared utilities
- ✅ Strictly typed (no `any` types)
- ✅ WCAG 2.1 AA accessibility compliance

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Avatar compression exceeds 2s timeout | Medium | Unit tests validate timing; adjust quality loop thresholds; implement caching |
| Focus trap implementation buggy | Medium | Use Radix primitives where possible; comprehensive E2E a11y tests |
| Server validation rejects valid base64 | Low | Both client and server enforce 250KB; test with known payloads |
| Modal trigger race condition (Clerk not ready) | Low | Use `useUser()` hook; add loading state |
| Breaking change to User model | Low | Feature 014 finalized; new fields are additive |
| Screen reader fails to announce errors | Medium | Test with NVDA/JAWS; use aria-live for dynamic content |

**Mitigation Status**: All risks have identified mitigations; no research blocker remains.

---

## Next Steps

1. ✅ **Phase 0 Complete**: Research and decisions finalized.
2. 🔄 **Phase 1 (Next)**: Generate `data-model.md`, `contracts/`, and `quickstart.md`.
3. ⏳ **Phase 2 (Implementation)**: Begin TDD with task T1 (avatar compression unit tests).

---

**Generated by**: `/speckit.plan` workflow  
**Date**: 2025-11-28  
**Status**: Complete, no blockers identified
