# Quick Start: User Profile & Settings Pages

## Feature Overview

This feature delivers two connected pages for user account management:

1. **Profile Page** (`/profile`): Displays and edits user profile information and D&D preferences
2. **Settings Page** (`/settings`): Central hub for managing account settings, notifications, and data

## Key Deliverables

### Page 1: Profile Page (`/profile`)

**Components**:

- ProfileHeader (displays user name/email)
- ProfileForm (editable D&D preferences)
- ProfileCard (read-only profile summary)

**Functionality**:

- Load and display authenticated user's profile
- Edit preferences (experience level, role, ruleset)
- Save changes with validation
- Display success/error messages

**Mock Data**:

- Sample user: "Campaign Master Bob"
- Experience: Advanced
- Role: DM
- Ruleset: 5e

### Page 2: Settings Page (`/settings`)

**Sections**:

1. Account Settings
   - Email display
   - Display name edit
   - Account created date

2. D&D Preferences
   - Experience level selector
   - Role preference selector
   - Ruleset selector

3. Notification Preferences
   - Email notifications toggle
   - Party updates toggle
   - Encounter reminders toggle
   - Combat notifications toggle

4. Data Management
   - Export data button
   - Account status info

**Functionality**:

- Organize settings into logical sections
- Save changes to database
- Validate form inputs
- Provide loading/success/error states

## File Structure

```
src/app/
  ├── profile/
  │   ├── page.tsx
  │   └── layout.tsx
  └── settings/
      ├── page.tsx
      └── layout.tsx

src/components/
  ├── ProfileHeader.tsx
  ├── ProfileForm.tsx
  ├── SettingsSection.tsx
  ├── NotificationPreferences.tsx
  ├── AccountSettings.tsx
  └── DataManagement.tsx

src/lib/
  ├── schemas/
  │   └── profile.ts
  └── hooks/
      └── useProfile.ts
```

## Implementation Order

1. Create page layouts and basic structure
2. Implement ProfileForm component with mock data
3. Implement SettingsPage with all sections
4. Add form validation (Zod schemas)
5. Connect to profile API endpoints (mock → real)
6. Add success/error handling
7. Write comprehensive tests
8. E2E testing with Playwright

## Testing Approach

**Unit Tests**:

- Form validation schemas
- Component rendering
- Event handlers

**Integration Tests**:

- Profile loading from API
- Settings form submission
- Error handling

**E2E Tests**:

- Full user flow: navigate → view profile → edit → save → verify
- Settings page sections visibility
- Form validation error display

## API Integration (Future)

When APIs are available (Feature 014, 017):

- `GET /api/v1/users/profile` → Load user profile
- `PUT /api/v1/users/profile` → Update profile preferences
- `GET /api/v1/users/settings` → Load settings
- `PUT /api/v1/users/settings` → Update settings

Initially will use mock data/localStorage.

## Acceptance Criteria for Completion

- [ ] Profile page accessible at `/profile`
- [ ] Settings page accessible at `/settings`
- [ ] All form fields render and accept input
- [ ] Profile displays mock user data
- [ ] Forms show validation errors
- [ ] Success messages appear on save
- [ ] All sections visible on settings page
- [ ] Responsive design on mobile
- [ ] 80%+ test coverage
- [ ] ESLint passing
- [ ] TypeScript compilation successful
