# Quickstart Guide: User Registration and Profile Management

**Date**: 2025-09-30
**Feature**: User Registration and Profile Management
**Branch**: 002-when-a-user

## Purpose

This quickstart guide provides step-by-step scenarios to validate the user registration and profile management feature. Each scenario corresponds to a user story from the feature specification and can be executed manually or automated as integration/E2E tests.

## Prerequisites

- MongoDB running and accessible
- Clerk application configured with webhook endpoint
- Next.js development server running (`npm run dev`)
- Test user account in Clerk dashboard

## Scenario 1: New User Registration via Clerk

**User Story**: When a new user registers through Clerk, their profile is created in MongoDB with default values.

### Steps

1. **Setup**: Ensure Clerk webhook is configured to point to `/api/webhooks/clerk`

2. **Action**: Create a new user in Clerk (via sign-up UI or Clerk dashboard)
   - Email: `test-user@example.com`
   - First Name: `Test`
   - Last Name: `User`

3. **Expected Result**: Clerk webhook triggers `user.created` event

4. **Verification**:

   ```bash
   # Check MongoDB for new user
   db.users.findOne({ email: 'test-user@example.com' })
   ```

5. **Assertions**:
   - User document exists with matching email
   - `clerkId` is set from webhook payload
   - `role` is `'user'` (default)
   - `subscriptionTier` is `'free'` (default)
   - `timezone` is `'UTC'` (default)
   - `dndEdition` is `'5th Edition'` (default)
   - `profileSetupCompleted` is `false` (default)
   - `sessionsCount`, `charactersCreatedCount`, `campaignsCreatedCount` are `0`
   - `authProvider` is `'clerk'`
   - `syncStatus` is `'active'`
   - `createdAt` and `updatedAt` timestamps are set

### Success Criteria

- ✅ User created in MongoDB via webhook
- ✅ All default values correctly assigned
- ✅ No errors in application logs

---

## Scenario 2: First-Time Profile Setup

**User Story**: When a user authenticates for the first time, they are presented with a D&D profile form to complete registration.

### Steps

1. **Setup**: Use test user from Scenario 1 with `profileSetupCompleted: false`

2. **Action**: Authenticate user via Clerk and navigate to app

3. **Expected Result**: User is redirected to `/profile-setup` page

4. **Action**: Complete profile form with:
   - Display Name: `Dungeon Master Alex`
   - Timezone: `America/New_York`
   - D&D Edition: `5th Edition` (pre-filled)
   - Experience Level: `intermediate`
   - Primary Role: `dm`

5. **Action**: Click "Complete Profile" button

6. **Verification**:

   ```bash
   # Check updated profile
   db.users.findOne({ email: 'test-user@example.com' })
   ```

7. **Assertions**:
   - `displayName` is `'Dungeon Master Alex'`
   - `timezone` is `'America/New_York'`
   - `dndEdition` is `'5th Edition'`
   - `experienceLevel` is `'intermediate'`
   - `primaryRole` is `'dm'`
   - `profileSetupCompleted` is `true`
   - User is redirected to dashboard
   - `updatedAt` timestamp is more recent than `createdAt`

### Success Criteria

- ✅ Profile form displays with default values
- ✅ Form validates input (Zod schema)
- ✅ Profile saved successfully
- ✅ User redirected to dashboard
- ✅ No errors in console or logs

---

## Scenario 3: Skip Profile Setup

**User Story**: Users can skip profile setup and access the app immediately, completing their profile later if desired.

### Steps

1. **Setup**: Create new test user with `profileSetupCompleted: false`

2. **Action**: Authenticate user and reach `/profile-setup` page

3. **Action**: Click "Skip for now" button

4. **Expected Result**: User redirected to dashboard without completing profile

5. **Verification**:

   ```bash
   # Check profile status
   db.users.findOne({ email: 'test-user@example.com' })
   ```

6. **Assertions**:
   - `profileSetupCompleted` is still `false`
   - `displayName`, `experienceLevel`, `primaryRole` remain `null`/`undefined`
   - Default values (timezone, dndEdition) are present
   - User can access all app features
   - Dashboard shows subtle reminder to complete profile (optional UX)

### Success Criteria

- ✅ Skip button works correctly
- ✅ User not blocked from app features
- ✅ Profile remains incomplete in database
- ✅ Can access settings to complete profile later

---

## Scenario 4: Update Profile in Settings

**User Story**: Users can view and update their profile information after initial registration through the settings page.

### Steps

1. **Setup**: Use test user with completed or incomplete profile

2. **Action**: Navigate to `/settings/profile`

3. **Expected Result**: Profile form displays with current values pre-filled

4. **Action**: Update fields:
   - Experience Level: `intermediate` → `experienced`
   - Primary Role: `dm` → `both`
   - Display Name: `Dungeon Master Alex` → `DM Alex the Great`

5. **Action**: Click "Save Changes" button

6. **Verification**:

   ```bash
   # Check updated profile
   db.users.findOne({ email: 'test-user@example.com' })
   ```

7. **Assertions**:
   - `experienceLevel` is `'experienced'`
   - `primaryRole` is `'both'`
   - `displayName` is `'DM Alex the Great'`
   - `updatedAt` timestamp is current
   - Success message displayed to user
   - Form remains on settings page (no redirect)

### Success Criteria

- ✅ Current profile values loaded correctly
- ✅ Form validation works (Zod schema)
- ✅ Updates persisted to MongoDB
- ✅ Success feedback shown to user

---

## Scenario 5: Usage Metrics Tracking

**User Story**: When users create resources (sessions, characters, campaigns), their usage metrics are tracked against subscription tier limits.

### Steps

1. **Setup**: User with `subscriptionTier: 'free'` (limits: 1 party, 3 encounters, 10 characters)

2. **Action**: Simulate creating a character (future feature, but metrics ready)

   ```bash
   # Manual increment for testing
   db.users.updateOne(
     { email: 'test-user@example.com' },
     {
       $inc: { charactersCreatedCount: 1 },
       $set: { metricsLastUpdated: new Date() }
     }
   )
   ```

3. **Verification**:

   ```bash
   # Check metrics
   db.users.findOne(
     { email: 'test-user@example.com' },
     { sessionsCount: 1, charactersCreatedCount: 1, campaignsCreatedCount: 1 }
   )
   ```

4. **Assertions**:
   - `charactersCreatedCount` incremented to 1
   - `metricsLastUpdated` timestamp is current
   - Other metrics unchanged
   - Atomic increment prevents race conditions

5. **Action**: Check tier limits enforcement (future implementation)

   ```typescript
   const canCreate = user.charactersCreatedCount < SUBSCRIPTION_LIMITS[user.subscriptionTier].characters;
   ```

### Success Criteria

- ✅ Metrics increment atomically
- ✅ Timestamp updated on metric change
- ✅ Infrastructure supports future limit enforcement

---

## Scenario 6: Clerk User Update Sync

**User Story**: When a user updates their Clerk profile (email, name), changes sync to MongoDB.

### Steps

1. **Setup**: Existing user in MongoDB synced from Clerk

2. **Action**: Update user in Clerk dashboard:
   - First Name: `Test` → `Updated`
   - Last Name: `User` → `Name`
   - Email: Keep same (email changes trigger different flow)

3. **Expected Result**: Clerk webhook triggers `user.updated` event

4. **Verification**:

   ```bash
   # Check synced updates
   db.users.findOne({ email: 'test-user@example.com' })
   ```

5. **Assertions**:
   - `firstName` is `'Updated'`
   - `lastName` is `'Name'`
   - `lastClerkSync` timestamp is current
   - `syncStatus` is `'active'`
   - `updatedAt` timestamp is current
   - D&D profile fields remain unchanged (not managed by Clerk)

### Success Criteria

- ✅ Clerk updates sync correctly
- ✅ Only Clerk-managed fields updated
- ✅ Sync timestamp tracks last update
- ✅ No errors in webhook processing

---

## Scenario 7: Profile Validation Errors

**User Story**: Invalid profile data is rejected with clear validation error messages.

### Steps

1. **Setup**: Authenticated user on profile settings page

2. **Action**: Submit invalid data:
   - Display Name: `"x".repeat(101)` (exceeds 100 char limit)
   - D&D Edition: `"y".repeat(51)` (exceeds 50 char limit)
   - Experience Level: `'expert'` (invalid enum value)

3. **Expected Result**: Form submission rejected with validation errors

4. **Assertions**:
   - API returns 400 status code
   - Response includes validation errors array:

     ```json
     {
       "success": false,
       "error": "Validation failed",
       "errors": [
         { "field": "displayName", "message": "Display name cannot exceed 100 characters" },
         { "field": "dndEdition", "message": "D&D edition cannot exceed 50 characters" },
         { "field": "experienceLevel", "message": "Invalid experience level" }
       ]
     }
     ```

   - Form displays error messages inline
   - Database not updated with invalid data

### Success Criteria

- ✅ Zod validation catches errors
- ✅ Clear error messages returned
- ✅ Invalid data not persisted
- ✅ User can correct and resubmit

---

## Scenario 8: Authorization Checks

**User Story**: Users can only update their own profile, not other users' profiles.

### Steps

1. **Setup**: Two users: User A (authenticated) and User B

2. **Action**: User A attempts to update User B's profile via API:

   ```bash
   PATCH /api/users/{userB_id}/profile
   Authorization: Bearer {userA_token}
   ```

3. **Expected Result**: Request rejected with 403 Forbidden

4. **Assertions**:
   - API returns 403 status code
   - Response: `{ "success": false, "error": "Forbidden" }`
   - User B's profile remains unchanged
   - Attempt logged (optional security logging)

### Success Criteria

- ✅ Authorization enforced
- ✅ Cross-user updates blocked
- ✅ Appropriate error response

---

## Scenario 9: User Login and Dashboard Access

**User Story**: Users log in via existing Clerk authentication and access their personalized dashboard.

### Steps

1. **Setup**: Existing user account in Clerk with completed profile

2. **Action**: Navigate to application root URL `/`

3. **Expected Result**:
   - Unauthenticated users redirected to Clerk sign-in page
   - Clerk authentication interface displayed (not custom login screen)

4. **Action**: Sign in using Clerk interface
   - Email: `test-user@example.com`
   - Password: (valid password)

5. **Expected Result**: After successful authentication
   - User redirected to `/dashboard`
   - Dashboard page loads within 1.5s

6. **Verification**: Dashboard displays correct user information

7. **Assertions**:
   - Clerk session established
   - Dashboard URL is `/dashboard`
   - User's display name shown in header
   - Subscription tier badge displayed (e.g., "Free Adventurer")
   - Quick action buttons visible (Create Party, Create Encounter, etc.)
   - Navigation includes Dashboard, Parties, Encounters, Settings links

### Success Criteria

- ✅ Clerk authentication works correctly
- ✅ Successful redirect to dashboard after login
- ✅ Dashboard loads within performance target
- ✅ No authentication errors

---

## Scenario 10: Dashboard Usage Metrics Display

**User Story**: Dashboard displays subscription tier limits, current usage, and progress bars to help users track their resource consumption.

### Steps

1. **Setup**: Authenticated user with:
   - Subscription Tier: `free`
   - Usage: 2 encounters, 7 creatures, 0 parties

2. **Action**: Navigate to `/dashboard`

3. **Expected Result**: Dashboard loads with usage metrics section

4. **Verification**: Check displayed metrics

5. **Assertions**:
   - **Subscription Card**:
     - Tier name: "Free Adventurer"
     - Tier badge/icon displayed
     - "Upgrade" button visible (if applicable)

   - **Usage Metrics**:
     - Parties: "0 / 1" with progress bar at 0%
     - Encounters: "2 / 3" with progress bar at 66.67%
     - Creatures: "7 / 10" with progress bar at 70%

   - **Progress Bars**:
     - Visual indication of usage (filled portion)
     - Color coding: green (<50%), yellow (50-80%), red (>80%)
     - Encounters bar shows yellow/warning color
     - Creatures bar shows yellow/warning color

   - **Usage Warnings** (if usage >50%):
     - Warning message: "You've used 2 of 3 encounters"
     - Warning message: "You've used 7 of 10 creatures"

   - **Activity Metrics**:
     - Sessions count displayed
     - Characters created count displayed
     - Campaigns created count displayed
     - Last login timestamp displayed

6. **Action**: Simulate resource creation (update database):

   ```bash
   db.users.updateOne(
     { email: 'test-user@example.com' },
     {
       $inc: { encountersCreated: 1 },
       $set: { metricsLastUpdated: new Date() }
     }
   )
   ```

7. **Action**: Refresh dashboard

8. **Assertions**:
   - Encounters: "3 / 3" with progress bar at 100%
   - Progress bar shows red/critical color
   - Warning message: "You've reached your encounter limit"
   - Severity: "critical"

### Success Criteria

- ✅ All metrics display correctly
- ✅ Progress bars show accurate percentages
- ✅ Color coding indicates usage levels
- ✅ Warnings appear for high usage
- ✅ Real-time data from MongoDB

---

## Scenario 11: Settings Navigation and Profile Viewing

**User Story**: Users navigate to settings and view their profile information across tabbed sections.

### Steps

1. **Setup**: Authenticated user with completed profile

2. **Action**: Click "Settings" in navigation menu

3. **Expected Result**: Redirected to `/settings` (or `/settings/profile` as default tab)

4. **Verification**: Settings page structure

5. **Assertions**:
   - **Settings Layout**:
     - Page title: "Settings"
     - Tab navigation visible with tabs: Profile, Preferences, Account
     - Active tab indicator on "Profile"
     - URL: `/settings` or `/settings/profile`

   - **Profile Tab** (viewing mode):
     - Display Name: shown (read-only or editable field)
     - Email: shown (Clerk-managed, read-only)
     - Timezone: shown
     - D&D Edition: shown
     - Experience Level: shown (human-readable: "Intermediate")
     - Primary Role: shown (human-readable: "Dungeon Master")
     - "Edit Profile" button visible (or form is directly editable)

6. **Action**: Click "Preferences" tab

7. **Expected Result**: URL changes to `/settings/preferences`

8. **Assertions**:
   - Active tab indicator on "Preferences"
   - Preferences form displayed:
     - Theme: dropdown (Light/Dark/System)
     - Email Notifications: toggle
     - Browser Notifications: toggle
     - Language: dropdown
     - Dice Roll Animations: toggle
     - Auto-Save Encounters: toggle

9. **Action**: Click "Account" tab

10. **Expected Result**: URL changes to `/settings/account`

11. **Assertions**:
    - Active tab indicator on "Account"
    - Account information displayed:
      - Subscription tier
      - Account creation date
      - Last login timestamp
      - "Delete Account" button (with confirmation)

### Success Criteria

- ✅ Settings page loads within 800ms
- ✅ Tab navigation works correctly
- ✅ URL updates with tab changes
- ✅ All profile data displays accurately
- ✅ Read-only fields clearly indicated
- ✅ Tabs are keyboard accessible (ARIA)

---

## Scenario 12: Settings Profile Editing and Validation

**User Story**: Users edit their profile in settings with proper validation and feedback.

### Steps

1. **Setup**: Authenticated user on `/settings/profile`

2. **Action**: Edit profile fields:
   - Display Name: `DM Alex` → `DM Alex the Experienced`
   - Experience Level: `intermediate` → `experienced`
   - Primary Role: `dm` → `both`

3. **Action**: Click "Save Changes" button

4. **Expected Result**:
   - Loading indicator shown briefly
   - API call to `PATCH /api/users/{userId}/settings/preferences`

5. **Verification**:

   ```bash
   # Check updated profile
   db.users.findOne({ email: 'test-user@example.com' })
   ```

6. **Assertions**:
   - `displayName` is `'DM Alex the Experienced'`
   - `experienceLevel` is `'experienced'`
   - `primaryRole` is `'both'`
   - `updatedAt` timestamp is current
   - Success toast/message: "Profile updated successfully"
   - Form remains on profile tab (no redirect)
   - Updated values reflected in UI immediately

7. **Action**: Attempt invalid edit:
   - Display Name: `"x".repeat(101)` (exceeds limit)

8. **Action**: Click "Save Changes"

9. **Expected Result**: Validation error

10. **Assertions**:
    - Error message displayed: "Display name cannot exceed 100 characters"
    - Form field highlighted with error
    - Database not updated
    - User can correct and retry

### Success Criteria

- ✅ Profile edits save successfully
- ✅ Validation enforced client-side and server-side
- ✅ Clear success/error feedback
- ✅ Optimistic UI updates (optional)
- ✅ Form interaction within 500ms performance target

---

## Scenario 13: Unauthenticated Access Protection

**User Story**: Unauthenticated users cannot access protected pages and are redirected to login.

### Steps

1. **Setup**: No active Clerk session (logged out state)

2. **Action**: Attempt to navigate to `/dashboard`

3. **Expected Result**:
   - Redirected to Clerk sign-in page
   - Original destination saved for post-login redirect

4. **Assertions**:
   - Dashboard page not accessible
   - Clerk authentication screen shown
   - URL includes redirect parameter (e.g., `?redirect_url=/dashboard`)

5. **Action**: Attempt to navigate to `/settings`

6. **Expected Result**: Same redirect behavior

7. **Action**: Attempt to navigate to `/settings/profile`

8. **Expected Result**: Same redirect behavior

9. **Action**: Attempt direct API call without authentication:

   ```bash
   GET /api/dashboard/metrics
   # No Authorization header
   ```

10. **Expected Result**: 401 Unauthorized

11. **Assertions**:
    - Status code: 401
    - Response: `{ "error": "Unauthorized", "message": "You must be logged in to access dashboard metrics" }`
    - No data exposed

12. **Action**: Attempt to access another user's profile:

    ```bash
    GET /api/users/{otherUserId}/settings
    Authorization: Bearer {validToken}
    ```

13. **Expected Result**: 403 Forbidden

14. **Assertions**:
    - Status code: 403
    - Response: `{ "error": "Forbidden", "message": "You can only access your own settings" }`
    - Cross-user access blocked

### Success Criteria

- ✅ All protected routes enforce authentication
- ✅ Proper redirects to Clerk sign-in
- ✅ Post-login redirect works correctly
- ✅ API endpoints return appropriate error codes
- ✅ Authorization prevents cross-user access
- ✅ Error messages are clear but don't expose system details

---

## Automation Notes

### Unit Tests

- Zod validation schemas: Test all valid/invalid inputs
- Mongoose model methods: Test defaults, validations, atomic updates
- User service functions: Test CRUD operations with mocks

### Integration Tests

- Clerk webhook handler: Test user.created, user.updated, user.deleted events
- Profile API routes: Test GET, PATCH with authentication
- Database operations: Test with real MongoDB (test database)

### E2E Tests (Playwright)

- Full profile setup flow from Clerk authentication to completion
- Skip flow validation
- Profile update in settings
- Validation error handling

---

## Troubleshooting

**Issue**: Webhook not triggering

- Check Clerk dashboard webhook configuration
- Verify webhook URL is publicly accessible (use ngrok for local dev)
- Check webhook secret is correctly set in environment variables

**Issue**: Validation failing unexpectedly

- Review Zod schema definitions
- Check for timezone-specific date format issues
- Verify enum values match exactly (case-sensitive)

**Issue**: Profile not syncing

- Check `lastClerkSync` and `syncStatus` fields
- Review application logs for webhook errors
- Verify MongoDB connection is stable

---

*Quickstart scenarios version 2.0 - Enhanced 2025-10-25 with login, dashboard, settings, and auth protection scenarios*
