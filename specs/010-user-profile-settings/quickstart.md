# Developer Quickstart - F010

**Feature**: User Profile & Settings Pages (F010)  
**Phase**: 1 (Design & Contracts)  
**Date**: 2025-11-11

---

## Overview

This quickstart guide helps developers implement Feature 010 (User Profile & Settings Pages). It provides a step-by-step workflow, key file locations, and common patterns used throughout the feature.

---

## Prerequisites

### Repository Setup

- Clone and set up the repository per `CONTRIBUTING.md`
- Install dependencies: `npm install`
- Ensure tests run locally: `npm run test:ci:parallel`

### Knowledge Assumed

- TypeScript 5.9.2 and strict mode enabled
- React 19 with hooks and functional components
- Next.js 16 App Router (not Pages Router)
- Jest + @testing-library/react for component testing
- Playwright for E2E testing
- Zod for schema validation

### Tools Installed

- Node 25.1.0+
- npm 9.0+
- Git (for branching)

---

## Project Structure Quick Reference

```
specs/010-user-profile-settings/        # Feature documentation
├── plan.md                             # Implementation plan (this feature)
├── research.md                         # Research & clarifications resolved
├── data-model.md                       # Data entities & relationships
├── spec.md                             # Original feature specification
├── contracts/
│   └── openapi.yml                     # API contract (OpenAPI 3.0)
└── quickstart.md                       # This file

src/
├── app/
│   ├── profile/
│   │   └── page.tsx                    # Profile page route (to implement)
│   ├── settings/
│   │   └── page.tsx                    # Settings page route (to implement)
│   └── api/user/
│       ├── profile/route.ts            # Profile API endpoint
│       ├── preferences/route.ts        # Preferences API endpoint
│       └── notifications/route.ts      # Notifications API endpoint
│
├── components/
│   ├── profile/
│   │   ├── ProfilePage.tsx             # Main profile page component
│   │   ├── ProfileForm.tsx             # Editable form
│   │   ├── ProfileLoader.tsx           # Skeleton loader
│   │   ├── ProfileError.tsx            # Error banner
│   │   └── ProfileEmpty.tsx            # Empty state
│   └── settings/
│       ├── SettingsPage.tsx            # Main settings page
│       ├── AccountSettings.tsx         # Account section
│       ├── PreferencesSettings.tsx     # D&D prefs section
│       ├── NotificationSettings.tsx    # Notification section
│       └── DataManagement.tsx          # Data export section
│
├── lib/
│   ├── adapters/
│   │   └── userAdapter.ts              # Mock CRUD operations
│   ├── schemas/
│   │   └── userSchema.ts               # Zod validation schemas
│   ├── validation/
│   │   └── userValidation.ts           # Validation utilities
│   ├── utils/
│   │   └── profileFormHelpers.ts       # Form state helpers
│   └── types/ (existing, extend)
│       └── user.ts                     # TypeScript interfaces
│
tests/
├── unit/
│   ├── schemas/userSchema.test.ts
│   ├── lib/userValidation.test.ts
│   └── components/profile/
│       ├── ProfilePage.test.tsx
│       └── ProfileForm.test.tsx
├── integration/
│   └── adapters/userAdapter.test.ts
└── e2e/
    └── profile-settings.spec.ts
```

---

## Key Concepts

### 1. Optimistic Updates

Changes reflect immediately on the client; form locked during save; reverts on error.

**Pattern**:

```typescript
// 1. User edits → state updates immediately (optimistic)
setFormState({ ...formState, name: newName });

// 2. User clicks Save → lock form, show spinner
setSaving(true);

// 3. Send to adapter
const result = await userAdapter.updateProfile(userId, { name: newName });

// 4. Success → keep state, show toast, unlock
if (result.success) {
  showSuccessToast('Profile updated');
  setSaving(false);
}

// 5. Error → revert state, show error toast, unlock
else {
  setFormState(previousState);  // Revert optimistic update
  showErrorToast('Failed to save. Changes reverted.');
  setSaving(false);
}
```

### 2. Mock Adapter Pattern

The `userAdapter.ts` provides mock CRUD operations using localStorage. It's swappable for real backend (F014).

**Usage**:

```typescript
import { userAdapter } from '@/lib/adapters/userAdapter';

// In a component or service
const profile = await userAdapter.getProfile(userId);
const updated = await userAdapter.updateProfile(userId, { name: 'New Name' });
```

**Benefits**:

- Decouples components from storage implementation
- Testable in isolation (mock adapter is deterministic)
- Easy swap to real API in F014 (just replace adapter)

### 3. Zod Validation Schemas

All validation rules live in `userSchema.ts`. Schemas are used both client-side (form validation) and server-side (API route validation).

**Usage**:

```typescript
import { userProfileSchema } from '@/lib/schemas/userSchema';

// Client-side validation
const result = userProfileSchema.safeParse(formData);
if (!result.success) {
  const errors = result.error.flatten();  // { fieldErrors: {...}, formErrors: [...] }
}

// Server-side (API route)
const parsed = await userProfileSchema.parseAsync(req.body);
```

### 4. Component Hierarchy

Profile/Settings pages are organized as:

- **Page** (root, data fetching, conditional rendering)
- **Form/Section** (editable content)
- **Sub-components** (Loader, Error, Empty)

**Example: ProfilePage**:

```
ProfilePage (fetches data, shows conditions)
├─ ProfileLoader (while loading)
├─ ProfileForm (when data loaded)
├─ ProfileError (on error)
└─ ProfileEmpty (for new users)
```

---

## TDD Workflow (Step-by-Step)

### Phase 1: Schemas & Validation

**Step 1: Write failing test**

```bash
npm run test -- tests/unit/schemas/userSchema.test.ts --watch
```

Write test cases for valid/invalid emails, names, enums:

```typescript
describe('userProfileSchema', () => {
  it('should accept valid email', () => {
    const result = userProfileSchema.safeParse({
      id: 'user-123',
      name: 'Alice',
      email: 'alice@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = userProfileSchema.safeParse({
      id: 'user-123',
      name: 'Alice',
      email: 'not-an-email',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(result.success).toBe(false);
  });
});
```

**Step 2: Implement schema**

```typescript
// src/lib/schemas/userSchema.ts
export const userProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
```

**Step 3: Watch tests pass**

```bash
npm run test -- --watch
# Tests should now pass
```

---

### Phase 2: Components (TDD)

**Step 1: Write failing test**

```bash
npm run test -- tests/unit/components/profile/ProfileForm.test.tsx --watch
```

```typescript
describe('ProfileForm', () => {
  it('should render form with pre-populated data', () => {
    const profile = { id: 'u1', name: 'Alice', email: 'a@ex.com', ... };
    render(<ProfileForm profile={profile} />);
    
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('a@ex.com')).toBeInTheDocument();
  });

  it('should show validation error on invalid email', () => {
    render(<ProfileForm profile={...} />);
    const emailInput = screen.getByLabelText(/email/i);
    
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.blur(emailInput);
    
    expect(screen.getByText('Invalid email address')).toBeInTheDocument();
  });

  it('should disable save button and show spinner while saving', async () => {
    render(<ProfileForm profile={...} />);
    const saveButton = screen.getByRole('button', { name: /save/i });
    
    fireEvent.click(saveButton);
    
    expect(saveButton).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(/saving/i);
  });

  it('should show success toast on save', async () => {
    const mockAdapter = { updateProfile: jest.fn().mockResolvedValue({...}) };
    render(<ProfileForm profile={...} adapter={mockAdapter} />);
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/successfully updated/i)).toBeInTheDocument();
    });
  });
});
```

**Step 2: Implement component**

```typescript
// src/components/profile/ProfileForm.tsx
export function ProfileForm({ profile, onSave }: ProfileFormProps) {
  const [formData, setFormData] = useState(profile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Validate on blur (not on keystroke)
  };

  const handleBlur = (field: string) => {
    const result = userProfileSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(fieldErrors[field] ? { [field]: fieldErrors[field][0] } : {});
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await userAdapter.updateProfile(profile.id, formData);
      showSuccessToast('Profile updated');
    } catch (error) {
      setFormData(profile);  // Revert
      showErrorToast('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form>
      <input
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        onBlur={() => handleBlur('name')}
      />
      {errors.name && <span className="error">{errors.name}</span>}
      {/* ... email, preferences, etc. */}
      <button disabled={saving} onClick={handleSave}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

**Step 3: Watch tests pass**

```bash
npm run test -- --watch
# Tests should now pass
```

---

### Phase 3: E2E Tests

**Step 1: Write E2E test**

```typescript
// tests/e2e/profile-settings.spec.ts
test('user can edit profile and save changes', async ({ page }) => {
  await page.goto('/profile');
  
  // Verify skeleton loads
  expect(await page.locator('[role="status"]').isVisible()).toBe(true);
  
  // Wait for form to load
  await page.waitForSelector('input[name="name"]');
  
  // Edit name
  const nameInput = page.locator('input[name="name"]');
  await nameInput.clear();
  await nameInput.type('Alice the Brave');
  
  // Save
  const saveButton = page.locator('button:has-text("Save")');
  await saveButton.click();
  
  // Verify success toast
  expect(await page.locator('text=Profile updated').isVisible()).toBe(true);
  
  // Refresh and verify persistence
  await page.reload();
  await page.waitForSelector('input[name="name"]');
  expect(await nameInput.inputValue()).toBe('Alice the Brave');
});
```

**Step 2: Run E2E test**

```bash
npm run test:e2e -- profile-settings.spec.ts --headed
# Watch the browser as tests run
```

---

## Common Patterns & Code Snippets

### Pattern 1: Fetching Data with Loading States

```typescript
export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await userAdapter.getProfile(userId);
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) return <ProfileLoader />;
  if (error) return <ProfileError error={error} onRetry={() => { /* refetch */ }} />;
  if (!profile) return <ProfileEmpty />;

  return <ProfileForm profile={profile} />;
}
```

### Pattern 2: Form Validation with Zod

```typescript
const handleSave = async () => {
  // Validate before sending
  const result = userProfileSchema.safeParse(formData);
  
  if (!result.success) {
    // Show field errors
    const fieldErrors = result.error.flatten().fieldErrors;
    setErrors(fieldErrors);
    return;
  }

  // Send validated data
  await userAdapter.updateProfile(userId, result.data);
};
```

### Pattern 3: Optimistic Update with Error Recovery

```typescript
const [previousData, setPreviousData] = useState(formData);

const handleChange = (field: string, value: string) => {
  setPreviousData(formData);  // Save previous state
  setFormData(prev => ({ ...prev, [field]: value }));  // Optimistic update
};

const handleSave = async () => {
  try {
    await userAdapter.updateProfile(userId, formData);
    showSuccessToast('Saved');
  } catch (error) {
    setFormData(previousData);  // Revert on error
    showErrorToast('Failed to save. Reverted changes.');
  }
};
```

### Pattern 4: Testing Component with Mocked Adapter

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileForm } from '@/components/profile/ProfileForm';

jest.mock('@/lib/adapters/userAdapter');

describe('ProfileForm', () => {
  it('should save profile successfully', async () => {
    const mockUpdateProfile = jest.fn().mockResolvedValue({ id: 'u1', ... });
    userAdapter.updateProfile = mockUpdateProfile;

    const profile = { id: 'u1', name: 'Alice', ... };
    render(<ProfileForm profile={profile} />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith('u1', expect.objectContaining({...}));
    });
  });
});
```

---

## Running Tests Locally

### Unit & Integration Tests

```bash
# Run all tests in watch mode
npm run test

# Run specific test file
npm run test -- tests/unit/components/profile/ProfileForm.test.tsx

# Run with coverage
npm run test:coverage

# CI mode (no watch)
npm run test:ci:parallel
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- profile-settings.spec.ts

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run with debugging
npm run test:e2e -- --debug
```

### Type Checking & Linting

```bash
npm run type-check      # TypeScript compilation
npm run lint            # ESLint
npm run lint:fix        # Auto-fix linting errors
npm run build           # Full build (includes type-check, linting, tests)
```

---

## Debugging Tips

### 1. Component Not Rendering Data

**Symptom**: Form shows, but fields are empty or skeleton persists.

**Debug Steps**:

```typescript
// Add console.log to component
useEffect(() => {
  const fetchProfile = async () => {
    const data = await userAdapter.getProfile(userId);
    console.log('Fetched profile:', data);  // Check what adapter returns
    setProfile(data);
  };
  fetchProfile();
}, []);

// Check adapter implementation
console.log('localStorage data:', localStorage.getItem('user:profile:user-123'));
```

### 2. Form Validation Not Working

**Symptom**: Invalid email accepted, or valid email rejected.

**Debug Steps**:

```typescript
// Test Zod schema directly
import { userProfileSchema } from '@/lib/schemas/userSchema';

const testData = { id: '1', name: 'Alice', email: 'invalid', ... };
const result = userProfileSchema.safeParse(testData);
console.log('Validation result:', result);  // Should show errors
```

### 3. Save Not Persisting

**Symptom**: Form shows success toast, but data reverts on refresh.

**Debug Steps**:

```typescript
// Check localStorage after save
const saved = localStorage.getItem('user:profile:user-123');
console.log('Saved to localStorage:', saved);

// Check adapter implementation (it should call localStorage.setItem)
```

---

## API Integration (After F014)

Once F014 (MongoDB + Mongoose) is complete, replace the mock adapter with real API calls:

```typescript
// Before (F010 mock)
export const userAdapter = {
  getProfile: async (userId) => {
    const data = localStorage.getItem(`user:profile:${userId}`);
    return JSON.parse(data);
  },
};

// After (F014 real backend)
export const userAdapter = {
  getProfile: async (userId) => {
    const response = await fetch(`/api/user/profile`);
    return response.json();
  },
};
```

No component changes needed—adapters are swappable by design!

---

## Accessibility Checklist

Before marking component complete:

- [ ] All form fields have associated labels (`<label htmlFor="...">`)
- [ ] Error messages use `aria-describedby` to link to field
- [ ] Buttons have meaningful text (not just icon)
- [ ] Keyboard navigation works (Tab through all fields)
- [ ] Focus indicators visible (browser default or custom)
- [ ] Color not the only indicator (error icon + text, not just red)
- [ ] Tested with screen reader (NVDA, JAWS, or browser reader)

---

## Performance Checklist

- [ ] Profile page loads within 1 second (with skeleton)
- [ ] Form saves within 500ms (with optimistic update, perceived instant)
- [ ] Validation errors appear within 200ms
- [ ] No unnecessary re-renders (use `useCallback`, `useMemo` if needed)
- [ ] Image/asset optimizations (N/A for F010, but check future features)

---

## Resources

- **Zod Documentation**: <https://zod.dev/>
- **React Testing Library**: <https://testing-library.com/react>
- **Playwright**: <https://playwright.dev/>
- **Next.js App Router**: <https://nextjs.org/docs/app>
- **Feature Spec**: `specs/010-user-profile-settings/spec.md`
- **Data Model**: `specs/010-user-profile-settings/data-model.md`
- **API Contract**: `specs/010-user-profile-settings/contracts/openapi.yml`
- **Implementation Plan**: `specs/010-user-profile-settings/plan.md`

---

## Next Steps

1. **Phase 2 Complete**: Research, data-model, contracts, and quickstart are ready
2. **Begin Phase 3 Implementation**:
   - Start with schemas & validation tests (Phase 1 of plan)
   - Implement mock adapter (Phase 2 of plan)
   - Build profile components (Phase 3 of plan)
   - Build settings components (Phase 4 of plan)
   - Write E2E tests (Phase 5 of plan)
   - Polish & final checks (Phase 6 of plan)
3. **Run `/speckit.tasks`** to generate task checklist

---

**Quickstart Status**: ✅ Complete  
**Ready for**: Implementation (Phases 1-6 from plan.md)
