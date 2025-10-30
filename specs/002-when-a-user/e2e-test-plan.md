# E2E Test Plan: User Registration and Profile Management

**Date**: 2025-10-25
**Feature**: User Registration and Profile Management (Enhanced)
**Branch**: 002-when-a-user-phase
**Test Framework**: Playwright 1.46+

## Overview

This document defines comprehensive end-to-end test scenarios for validating the complete user journey including login, dashboard access, profile viewing/editing, and authorization enforcement. All tests use Playwright and map directly to testing requirements TR-001 through TR-010 from the feature specification.

## Test Requirements Mapping

| Test ID | Requirement | Description |
|---------|-------------|-------------|
| E2E-001 | TR-001 | Complete user login flow using Clerk authentication |
| E2E-002 | TR-002 | Authenticated users can access and view dashboard with correct data |
| E2E-003 | TR-003 | Users can navigate to profile page and view all information |
| E2E-004 | TR-004 | Users can edit profile fields and changes persist correctly |
| E2E-005 | TR-005 | Unauthenticated users are redirected to Clerk login |
| E2E-006 | TR-006 | Users cannot access other users' profiles |
| E2E-007 | TR-007 | First-time user flow: Clerk login → profile setup → dashboard |
| E2E-008 | TR-008 | Returning user flow: Clerk login → dashboard (skip profile setup) |
| E2E-009 | TR-009 | Login failure scenarios with appropriate Clerk error messages |
| E2E-010 | TR-010 | Profile form validation errors are displayed correctly |

## Test Environment Setup

### Prerequisites

- MongoDB test instance running
- Clerk test environment configured
- Next.js app running in test mode
- Test user accounts in Clerk dashboard
- Playwright installed and configured

### Test Data

```typescript
// Test Users
const TEST_USERS = {
  newUser: {
    email: 'new-user-test@example.com',
    password: 'TestPassword123!',
    clerkId: 'user_new_test_123',
  },
  returningUser: {
    email: 'returning-user@example.com',
    password: 'TestPassword123!',
    clerkId: 'user_returning_456',
    profileSetupCompleted: true,
  },
  otherUser: {
    email: 'other-user@example.com',
    clerkId: 'user_other_789',
  },
};

// Subscription Limits
const FREE_TIER_LIMITS = {
  parties: 1,
  encounters: 3,
  creatures: 10,
};
```

### Shared Fixtures

```typescript
// tests/e2e/fixtures/auth.ts
export async function authenticateUser(page, userCredentials) {
  await page.goto('/sign-in');
  await page.fill('[name="identifier"]', userCredentials.email);
  await page.fill('[name="password"]', userCredentials.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard', { timeout: 5000 });
}

// tests/e2e/fixtures/database.ts
export async function seedTestUser(userData) {
  // Create user in MongoDB for testing
}

export async function cleanupTestData() {
  // Remove test users from database
}
```

---

## Test Scenarios

### E2E-001: Complete User Login Flow (TR-001, TR-009)

**Test File**: `tests/e2e/auth/login.spec.ts`

**Purpose**: Validate that users can successfully log in using Clerk authentication and are redirected to the dashboard.

**Test Steps**:

1. **Setup**
   - Ensure test user exists in Clerk
   - Clear browser cookies and local storage

2. **Navigate to Application**

   ```typescript
   await page.goto('/');
   ```

3. **Expect Redirect to Clerk Login**

   ```typescript
   await expect(page).toHaveURL(/sign-in/);
   ```

4. **Enter Valid Credentials**

   ```typescript
   await page.fill('[name="identifier"]', TEST_USERS.returningUser.email);
   await page.fill('[name="password"]', TEST_USERS.returningUser.password);
   ```

5. **Submit Login Form**

   ```typescript
   await page.click('button[type="submit"]');
   ```

6. **Wait for Dashboard Redirect**

   ```typescript
   await page.waitForURL('/dashboard', { timeout: 5000 });
   ```

7. **Verify Dashboard Loaded**

   ```typescript
   await expect(page.locator('h1')).toContainText('Dashboard');
   await expect(page.locator('[data-testid="user-greeting"]')).toBeVisible();
   ```

**Success Criteria**:

- ✅ User successfully authenticates via Clerk
- ✅ User is redirected to /dashboard
- ✅ Dashboard displays user-specific greeting
- ✅ No console errors during login flow

**Related**: TR-001, TR-009

---

### E2E-002: Dashboard Access with Correct Data (TR-002)

**Test File**: `tests/e2e/dashboard/dashboard.spec.ts`

**Purpose**: Validate that authenticated users see their dashboard with correct subscription tier, usage metrics, and statistics.

**Test Steps**:

1. **Setup**
   - Authenticate test user
   - Seed usage data in database:

     ```typescript
     await seedTestUser({
       ...TEST_USERS.returningUser,
       subscriptionTier: 'free',
       sessionsCount: 5,
       charactersCreatedCount: 3,
       encountersUsed: 2,
     });
     ```

2. **Navigate to Dashboard**

   ```typescript
   await page.goto('/dashboard');
   ```

3. **Verify Subscription Tier Display**

   ```typescript
   await expect(page.locator('[data-testid="subscription-tier"]'))
     .toContainText('Free Adventurer');
   ```

4. **Verify Usage Progress Bars**

   ```typescript
   // Encounters: 2/3 used
   await expect(page.locator('[data-testid="encounters-progress"]'))
     .toHaveAttribute('aria-valuenow', '66.67');

   await expect(page.locator('[data-testid="encounters-usage"]'))
     .toContainText('2 / 3');
   ```

5. **Verify Activity Metrics**

   ```typescript
   await expect(page.locator('[data-testid="sessions-count"]'))
     .toContainText('5');

   await expect(page.locator('[data-testid="characters-count"]'))
     .toContainText('3');
   ```

6. **Verify Quick Actions Present**

   ```typescript
   await expect(page.locator('[data-testid="quick-actions"]'))
     .toBeVisible();
   ```

**Success Criteria**:

- ✅ Subscription tier displayed correctly
- ✅ Usage progress bars show correct percentages
- ✅ Activity metrics match database values
- ✅ Quick actions are accessible

**Related**: TR-002

---

### E2E-003: Profile Page Viewing (TR-003)

**Test File**: `tests/e2e/settings/profile-view.spec.ts`

**Purpose**: Validate that users can navigate to their profile page and view all profile information.

**Test Steps**:

1. **Setup**
   - Authenticate test user with complete profile

   ```typescript
   await seedTestUser({
     ...TEST_USERS.returningUser,
     displayName: 'Test DM',
     dndEdition: '5th Edition',
     experienceLevel: 'intermediate',
     primaryRole: 'dm',
   });
   ```

2. **Navigate from Dashboard to Settings**

   ```typescript
   await page.goto('/dashboard');
   await page.click('[data-testid="user-menu"]');
   await page.click('text=Settings');
   ```

3. **Verify Redirect to Profile Tab**

   ```typescript
   await expect(page).toHaveURL('/settings/profile');
   ```

4. **Verify Settings Tabs Visible**

   ```typescript
   await expect(page.locator('[role="tablist"]')).toBeVisible();
   await expect(page.locator('text=Profile')).toHaveClass(/active/);
   ```

5. **Verify Profile Information Displayed**

   ```typescript
   await expect(page.locator('[data-testid="display-name"]'))
     .toHaveValue('Test DM');

   await expect(page.locator('[data-testid="dnd-edition"]'))
     .toHaveValue('5th Edition');

   await expect(page.locator('[data-testid="experience-level"]'))
     .toHaveValue('intermediate');

   await expect(page.locator('[data-testid="primary-role"]'))
     .toHaveValue('dm');
   ```

6. **Verify Subscription Info Displayed**

   ```typescript
   await expect(page.locator('[data-testid="subscription-tier"]'))
     .toContainText('Free Adventurer');
   ```

**Success Criteria**:

- ✅ Navigation to settings works from dashboard
- ✅ Settings tabs are visible and functional
- ✅ All profile fields display correct values
- ✅ Subscription tier information is visible

**Related**: TR-003

---

### E2E-004: Profile Editing and Persistence (TR-004)

**Test File**: `tests/e2e/settings/profile-edit.spec.ts`

**Purpose**: Validate that users can edit profile fields and changes are persisted correctly.

**Test Steps**:

1. **Setup**
   - Authenticate test user
   - Navigate to profile settings

2. **Edit Display Name**

   ```typescript
   await page.fill('[data-testid="display-name"]', 'Updated DM Name');
   ```

3. **Edit D&D Preferences**

   ```typescript
   await page.selectOption('[data-testid="experience-level"]', 'experienced');
   await page.selectOption('[data-testid="primary-role"]', 'both');
   ```

4. **Submit Form**

   ```typescript
   await page.click('button[type="submit"]');
   ```

5. **Wait for Success Message**

   ```typescript
   await expect(page.locator('[data-testid="success-message"]'))
     .toContainText('Profile updated successfully');
   ```

6. **Verify Changes Persisted (Reload Page)**

   ```typescript
   await page.reload();

   await expect(page.locator('[data-testid="display-name"]'))
     .toHaveValue('Updated DM Name');

   await expect(page.locator('[data-testid="experience-level"]'))
     .toHaveValue('experienced');
   ```

7. **Verify Changes Reflected in Database**

   ```typescript
   const user = await findUserInDatabase(TEST_USERS.returningUser.clerkId);
   expect(user.displayName).toBe('Updated DM Name');
   expect(user.experienceLevel).toBe('experienced');
   ```

**Success Criteria**:

- ✅ Form fields are editable
- ✅ Submit button triggers save
- ✅ Success message displays
- ✅ Changes persist after page reload
- ✅ Database reflects updated values

**Related**: TR-004

---

### E2E-005: Unauthenticated Access Protection (TR-005)

**Test File**: `tests/e2e/auth/auth-enforcement.spec.ts`

**Purpose**: Validate that unauthenticated users are redirected to Clerk login when accessing protected pages.

**Test Steps**:

1. **Setup**
   - Clear all cookies and session data
   - Ensure user is logged out

2. **Attempt to Access Dashboard**

   ```typescript
   await page.goto('/dashboard');
   ```

3. **Expect Redirect to Clerk Login**

   ```typescript
   await page.waitForURL(/sign-in/, { timeout: 3000 });
   ```

4. **Attempt to Access Profile Settings**

   ```typescript
   await page.goto('/settings/profile');
   await page.waitForURL(/sign-in/);
   ```

5. **Verify Return URL Preserved**

   ```typescript
   const url = new URL(page.url());
   expect(url.searchParams.get('redirect_url')).toContain('/settings/profile');
   ```

6. **Login and Verify Redirect Back**

   ```typescript
   await authenticateUser(page, TEST_USERS.returningUser);
   await expect(page).toHaveURL('/settings/profile');
   ```

**Success Criteria**:

- ✅ Dashboard access redirects to login
- ✅ Settings access redirects to login
- ✅ Return URL is preserved
- ✅ After login, user returns to intended page

**Related**: TR-005

---

### E2E-006: Authorization Enforcement (TR-006)

**Test File**: `tests/e2e/auth/authorization.spec.ts`

**Purpose**: Validate that users cannot access other users' profiles.

**Test Steps**:

1. **Setup**
   - Authenticate as test user
   - Seed another user in database

2. **Attempt to Access Other User's Profile**

   ```typescript
   await page.goto(`/settings/profile?userId=${TEST_USERS.otherUser.clerkId}`);
   ```

3. **Expect 403 Forbidden or Redirect**

   ```typescript
   // Should show error or redirect to own profile
   await expect(page.locator('[data-testid="error-message"]'))
     .toContainText('You do not have permission');

   // OR
   await expect(page).toHaveURL(/\/settings\/profile$/);
   ```

4. **Verify Own User Data Displayed**

   ```typescript
   const displayName = await page.locator('[data-testid="display-name"]').inputValue();
   expect(displayName).not.toBe(TEST_USERS.otherUser.displayName);
   ```

5. **Attempt API Call to Other User's Settings**

   ```typescript
   const response = await page.request.get(
     `/api/users/${TEST_USERS.otherUser.clerkId}/settings`
   );
   expect(response.status()).toBe(403);
   ```

**Success Criteria**:

- ✅ Cannot view other users' profiles via URL manipulation
- ✅ API requests to other users' data return 403
- ✅ User sees their own data only

**Related**: TR-006

---

### E2E-007: First-Time User Flow (TR-007)

**Test File**: `tests/e2e/profile-setup/first-time-user.spec.ts`

**Purpose**: Validate the complete first-time user flow: Clerk login → profile setup → dashboard.

**Test Steps**:

1. **Setup**
   - Create new test user in Clerk
   - Create MongoDB user via webhook with `profileSetupCompleted: false`

2. **Navigate and Login**

   ```typescript
   await page.goto('/');
   await authenticateUser(page, TEST_USERS.newUser);
   ```

3. **Expect Redirect to Profile Setup**

   ```typescript
   await expect(page).toHaveURL('/profile-setup');
   ```

4. **Verify Profile Setup Form**

   ```typescript
   await expect(page.locator('h1')).toContainText('Complete Your Profile');
   ```

5. **Complete Profile Form**

   ```typescript
   await page.fill('[data-testid="display-name"]', 'New Adventurer');
   await page.selectOption('[data-testid="experience-level"]', 'new');
   await page.selectOption('[data-testid="primary-role"]', 'player');
   ```

6. **Submit Profile**

   ```typescript
   await page.click('text=Complete Profile');
   ```

7. **Expect Redirect to Dashboard**

   ```typescript
   await page.waitForURL('/dashboard', { timeout: 5000 });
   ```

8. **Verify Profile Setup Completed in Database**

   ```typescript
   const user = await findUserInDatabase(TEST_USERS.newUser.clerkId);
   expect(user.profileSetupCompleted).toBe(true);
   expect(user.displayName).toBe('New Adventurer');
   ```

**Success Criteria**:

- ✅ New user redirected to profile setup after login
- ✅ Profile form displays correctly
- ✅ Form submission successful
- ✅ User redirected to dashboard after completion
- ✅ profileSetupCompleted flag set to true

**Related**: TR-007

---

### E2E-008: Returning User Flow (TR-008)

**Test File**: `tests/e2e/profile-setup/returning-user.spec.ts`

**Purpose**: Validate returning user flow: Clerk login → dashboard (skip profile setup).

**Test Steps**:

1. **Setup**
   - Create test user with `profileSetupCompleted: true`

2. **Navigate and Login**

   ```typescript
   await page.goto('/');
   await authenticateUser(page, TEST_USERS.returningUser);
   ```

3. **Expect Direct Redirect to Dashboard**

   ```typescript
   await expect(page).toHaveURL('/dashboard');
   await expect(page).not.toHaveURL('/profile-setup');
   ```

4. **Verify No Profile Setup Prompt**

   ```typescript
   await expect(page.locator('text=Complete Your Profile')).not.toBeVisible();
   ```

5. **Verify Dashboard Loads Immediately**

   ```typescript
   await expect(page.locator('[data-testid="subscription-tier"]')).toBeVisible();
   ```

**Success Criteria**:

- ✅ Returning user goes directly to dashboard
- ✅ No profile setup prompt shown
- ✅ Dashboard loads with user data

**Related**: TR-008

---

### E2E-009: Login Failure Scenarios (TR-009)

**Test File**: `tests/e2e/auth/login-failures.spec.ts`

**Purpose**: Validate login failure scenarios with appropriate Clerk error messages.

**Test Steps**:

#### Scenario A: Invalid Email

1. **Navigate to Login**

   ```typescript
   await page.goto('/sign-in');
   ```

2. **Enter Invalid Email**

   ```typescript
   await page.fill('[name="identifier"]', 'invalid-email@nonexistent.com');
   await page.fill('[name="password"]', 'SomePassword123');
   ```

3. **Submit and Verify Error**

   ```typescript
   await page.click('button[type="submit"]');
   await expect(page.locator('[data-clerk-error]'))
     .toContainText(/Couldn't find your account/);
   ```

#### Scenario B: Invalid Password

1. **Enter Valid Email, Wrong Password**

   ```typescript
   await page.fill('[name="identifier"]', TEST_USERS.returningUser.email);
   await page.fill('[name="password"]', 'WrongPassword123');
   ```

2. **Submit and Verify Error**

   ```typescript
   await page.click('button[type="submit"]');
   await expect(page.locator('[data-clerk-error]'))
     .toContainText(/Password is incorrect/);
   ```

#### Scenario C: Network Timeout

1. **Simulate Network Offline**

   ```typescript
   await page.context().setOffline(true);
   ```

2. **Attempt Login**

   ```typescript
   await page.fill('[name="identifier"]', TEST_USERS.returningUser.email);
   await page.fill('[name="password"]', TEST_USERS.returningUser.password);
   await page.click('button[type="submit"]');
   ```

3. **Verify Network Error**

   ```typescript
   await expect(page.locator('[data-clerk-error]'))
     .toContainText(/network/i);
   ```

**Success Criteria**:

- ✅ Invalid email shows appropriate error
- ✅ Wrong password shows appropriate error
- ✅ Network issues show appropriate error
- ✅ User remains on login page after errors

**Related**: TR-009

---

### E2E-010: Profile Form Validation Errors (TR-010)

**Test File**: `tests/e2e/settings/profile-validation.spec.ts`

**Purpose**: Validate that profile form validation errors are displayed correctly.

**Test Steps**:

1. **Setup**
   - Authenticate test user
   - Navigate to profile settings

2. **Test Display Name Length Validation**

   ```typescript
   const longName = 'A'.repeat(101); // Exceeds 100 char limit
   await page.fill('[data-testid="display-name"]', longName);
   await page.click('button[type="submit"]');

   await expect(page.locator('[data-testid="display-name-error"]'))
     .toContainText('Display name cannot exceed 100 characters');
   ```

3. **Test D&D Edition Length Validation**

   ```typescript
   const longEdition = 'B'.repeat(51); // Exceeds 50 char limit
   await page.fill('[data-testid="dnd-edition"]', longEdition);
   await page.blur('[data-testid="dnd-edition"]');

   await expect(page.locator('[data-testid="dnd-edition-error"]'))
     .toContainText('D&D edition cannot exceed 50 characters');
   ```

4. **Test Required Field Validation (if primary role required)**

   ```typescript
   await page.selectOption('[data-testid="primary-role"]', '');
   await page.click('button[type="submit"]');

   // Verify inline error
   await expect(page.locator('[data-testid="primary-role-error"]'))
     .toBeVisible();
   ```

5. **Fix Errors and Verify Submission**

   ```typescript
   await page.fill('[data-testid="display-name"]', 'Valid Name');
   await page.fill('[data-testid="dnd-edition"]', '5th Edition');
   await page.selectOption('[data-testid="primary-role"]', 'dm');
   await page.click('button[type="submit"]');

   await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
   ```

**Success Criteria**:

- ✅ Field-level validation errors display inline
- ✅ Error messages are clear and helpful
- ✅ Form submission blocked when invalid
- ✅ Errors clear when fields corrected
- ✅ Valid form submits successfully

**Related**: TR-010

---

## Test Execution Strategy

### Local Development

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test suite
npm run test:e2e -- tests/e2e/auth/login.spec.ts

# Run in headed mode for debugging
npm run test:e2e -- --headed

# Run with UI mode
npm run test:e2e -- --ui
```

### CI/CD Integration

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:e2e
```

### Test Reports

Playwright generates:

- HTML reports with screenshots
- Video recordings of failures
- Trace files for debugging
- JUnit XML for CI integration

---

## Success Metrics

**Coverage Goals**:

- 100% of testing requirements (TR-001 to TR-010) covered
- All critical user flows validated
- All authorization scenarios tested

**Performance Targets**:

- Each E2E test completes in <30 seconds
- Full suite completes in <5 minutes
- 95%+ test stability (no flaky tests)

**Quality Gates**:

- All E2E tests must pass before PR merge
- No skipped tests in main branch
- Failures block deployment

---

**Status**: 📝 Ready for implementation
**Next Steps**: Implement test files following this plan
