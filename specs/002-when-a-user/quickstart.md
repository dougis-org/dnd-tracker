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

*Quickstart scenarios version 1.0 - 2025-09-30*
