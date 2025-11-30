# Quickstart: Profile Setup Wizard Component Usage

**Feature**: 015 - Profile Setup Wizard  
**Date**: 2025-11-28  
**Status**: Phase 1 - Design Complete

## Overview

This document provides a quick reference for integrating and using the Profile Setup Wizard component in Feature 015.

## Component Hierarchy

```
RootLayout (src/app/layout.tsx)
  └── ProfileSetupWizardModal
      ├── WelcomeScreen
      ├── DisplayNameScreen
      ├── AvatarUploadScreen
      ├── PreferencesScreen
      └── CompletionScreen
```

## Quick Integration Steps

### 1. Embed Modal in RootLayout

File: `src/app/layout.tsx`

```typescript
import { useUser } from "@clerk/nextjs";
import { ProfileSetupWizardModal } from "@/components/ProfileSetupWizard/ProfileSetupWizardModal";
import { useState, useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, user } = useUser();
  const [showWizard, setShowWizard] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      // Fetch user profile to check completedSetup flag
      fetch(`/api/internal/users/${user.id}`)
        .then((res) => res.json())
        .then((profile) => {
          const isComplete = profile?.profile?.completedSetup ?? false;
          setShowWizard(!isComplete);
          setIsFirstLogin(true); // Mark as first login check
        })
        .catch((err) => {
          console.error("Failed to fetch user profile:", err);
          setShowWizard(true); // Fail-safe: show wizard
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

### 2. Add Reminder Banner to Profile Settings Page

File: `src/app/profile/settings/page.tsx`

```typescript
import { useUser } from "@clerk/nextjs";
import { ProfileSetupReminder } from "@/components/ProfileSetupReminder";
import { useState, useEffect } from "react";

export default function ProfileSettingsPage() {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user) {
      fetch(`/api/internal/users/${user.id}`)
        .then((res) => res.json())
        .then((data) => setProfile(data.profile))
        .catch((err) => console.error("Failed to fetch profile:", err));
    }
  }, [user]);

  const isProfileIncomplete = !profile?.completedSetup;

  return (
    <div className="container mx-auto p-6">
      {isProfileIncomplete && <ProfileSetupReminder />}

      {/* Rest of profile settings page */}
      <h1>Profile Settings</h1>
      {/* ... */}
    </div>
  );
}
```

## Component Props

### ProfileSetupWizardModal

```typescript
interface ProfileSetupWizardModalProps {
  isOpen: boolean;                    // Show/hide modal
  isDismissible?: boolean;            // Can user close via Escape/close button (default: false)
  onClose: () => void;                // Callback when user finishes or skips
  userId?: string;                    // Optional; auto-fetched from Clerk if not provided
}
```

### ProfileSetupReminder

```typescript
interface ProfileSetupReminderProps {
  onReminderClick?: () => void;       // Callback when user clicks "Complete Setup"
  isDismissible?: boolean;            // Can user dismiss banner (default: true)
}
```

## Validation Schemas

Use Zod schemas for validation in components and tests:

```typescript
import {
  displayNameSchema,
  avatarSchema,
  preferencesSchema,
  profileSetupSchema,
} from "@/lib/wizards/wizardValidation";

// Validate individual field
const result = displayNameSchema.safeParse("Aragorn");
if (result.success) {
  console.log("Valid:", result.data);
} else {
  console.error("Invalid:", result.error.errors);
}

// Validate full profile
const profileResult = profileSetupSchema.parse({
  displayName: "Aragorn",
  avatar: "data:image/jpeg;base64,...",
  preferences: { theme: "dark", notifications: true },
});
```

## Avatar Compression Utility

```typescript
import { compressAvatar } from "@/lib/wizards/avatarCompression";

// In component file picker handler
async function handleAvatarSelect(file: File) {
  try {
    const compressedBase64 = await compressAvatar(file, 100); // 100KB target
    console.log("Compressed:", compressedBase64);
    setAvatarPreview(compressedBase64);
  } catch (error) {
    console.error("Compression failed:", error);
    showErrorToast("Avatar compression failed. Please try a smaller image.");
  }
}
```

## Custom Hook: useProfileSetupWizard

The hook manages wizard state and submission:

```typescript
import { useProfileSetupWizard } from "@/components/ProfileSetupWizard/useProfileSetupWizard";

export function WizardComponent() {
  const {
    currentScreen,
    formData,
    loading,
    error,
    handleNext,
    handlePrev,
    handleSkip,
    handleFieldChange,
    handleSubmit,
  } = useProfileSetupWizard();

  // Use hook methods to manage wizard flow
}
```

## Error Handling

### Field Validation Errors

Display inline error messages below field:

```typescript
const [displayNameError, setDisplayNameError] = useState("");

const handleDisplayNameBlur = () => {
  const result = displayNameSchema.safeParse(displayName);
  if (!result.success) {
    setDisplayNameError(result.error.errors[0].message);
  }
};
```

### Save Errors

Display error toast with retry button:

```typescript
const showErrorToast = (message: string, onRetry: () => void) => {
  toast.error(message, {
    action: {
      label: "Retry",
      onClick: onRetry,
    },
  });
};

try {
  await submitWizardProfile(userId, formData);
} catch (error) {
  showErrorToast(
    "Failed to save profile. Please retry.",
    () => submitWizardProfile(userId, formData)
  );
}
```

## Testing the Wizard

### Unit Tests

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { ProfileSetupWizardModal } from "@/components/ProfileSetupWizard/ProfileSetupWizardModal";

test("displays welcome screen on open", () => {
  render(<ProfileSetupWizardModal isOpen={true} onClose={() => {}} />);
  expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
});
```

### Integration Tests

```typescript
test("user completes wizard flow", async () => {
  const onClose = jest.fn();
  render(<ProfileSetupWizardModal isOpen={true} onClose={onClose} />);

  // Fill displayName
  fireEvent.change(screen.getByLabelText(/display name/i), {
    target: { value: "Aragorn" },
  });

  // Click Next
  fireEvent.click(screen.getByRole("button", { name: /next/i }));

  // ... continue through screens ...

  // Click Finish
  fireEvent.click(screen.getByRole("button", { name: /finish/i }));

  // Verify modal closed
  expect(onClose).toHaveBeenCalled();
});
```

### E2E Tests (Playwright)

```typescript
import { test, expect } from "@playwright/test";

test("user completes wizard on first login", async ({ page }) => {
  // Login
  await page.goto("/");
  await loginWithClerk(page);

  // Wait for wizard modal
  await expect(page.locator('text="Welcome"')).toBeVisible();

  // Fill form
  await page.fill('label:has-text("Display Name")', "Aragorn");
  await page.click('button:has-text("Next")');

  // ... continue through screens ...

  // Submit
  await page.click('button:has-text("Finish")');

  // Verify redirect/modal close
  await expect(page.locator(".modal")).not.toBeVisible();
});
```

## Configuration Constants

File: `src/components/ProfileSetupWizard/constants.ts`

```typescript
export const WIZARD_CONSTRAINTS = {
  DISPLAY_NAME_MIN: 1,
  DISPLAY_NAME_MAX: 50,
  AVATAR_MAX_FILE_SIZE: 2 * 1024 * 1024,      // 2MB
  AVATAR_COMPRESSION_TARGET: 100 * 1024,      // 100KB
  AVATAR_MAX_BASE64_SIZE: 250 * 1024,         // 250KB
  AVATAR_COMPRESSION_TIMEOUT: 2000,            // 2s
  COMPRESSION_QUALITY_START: 0.9,
  COMPRESSION_QUALITY_MIN: 0.5,
};

export const WIZARD_SCREENS = [
  "welcome",
  "displayName",
  "avatar",
  "preferences",
  "completion",
];

export const SUPPORTED_AVATAR_FORMATS = ["image/jpeg", "image/png", "image/webp"];
```

## Accessibility

All components follow WCAG 2.1 AA standards:

- ✅ Keyboard navigation (Tab, Shift+Tab, Escape, Enter, Arrows)
- ✅ Screen reader support (aria-labels, aria-live, semantic HTML)
- ✅ Focus management (focus trap, visible indicator)
- ✅ Error announcements (aria-live="polite")

Test with:

```typescript
import { injectAxe, checkA11y } from "axe-playwright";

test("wizard is accessible", async ({ page }) => {
  await page.goto("/");
  await injectAxe(page);
  await checkA11y(page);
});
```

## Performance Tips

1. **Avatar Compression**: Client-side compression prevents large uploads; target max 100KB.
2. **Lazy Loading**: Import components on-demand to reduce bundle size.
3. **Memoization**: Use `React.memo` for screen components to prevent unnecessary re-renders.

```typescript
const WelcomeScreen = React.memo(({ onNext }: Props) => {
  return <div>{/* ... */}</div>;
});
```

## Troubleshooting

### Wizard Not Showing on First Login

- Check `profile.completedSetup` flag is `false` in database.
- Verify Clerk auth context is available (`useUser().isLoaded === true`).
- Check network tab for `/api/internal/users/:userId` request success.
- Check browser console for errors.

### Avatar Compression Fails

- Check file size (<2MB original).
- Check file format (JPEG, PNG, WebP only).
- Verify canvas support in browser (modern browsers support it).
- Try reducing target size or quality thresholds in constants.ts.

### Form Validation Not Working

- Verify Zod schemas are imported correctly.
- Check form blur event handlers are attached.
- Verify error state updates in component.

### Modal Closes Unexpectedly

- Check `isDismissible` prop on first login (should be `false`).
- Verify `onClose` callback is not being called unintentionally.
- Check for race conditions in effect hooks.

## Resources

- **Spec**: `specs/015-profile-setup-wizard/spec.md`
- **Data Model**: `specs/015-profile-setup-wizard/data-model.md`
- **API Contract**: `specs/015-profile-setup-wizard/contracts/wizard-api-contract.md`
- **Research**: `specs/015-profile-setup-wizard/research.md`
- **Implementation Plan**: `specs/015-profile-setup-wizard/plan.md`

---

**Generated by**: `/speckit.plan` workflow  
**Date**: 2025-11-28  
**Status**: Phase 1 - Complete
