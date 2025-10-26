# Test Requirements: User Registration and Profile Management

**Feature**: 002-when-a-user
**Created**: 2025-10-26
**Purpose**: Define test data, test environment setup, and testing infrastructure requirements
**Audience**: QA Team, Test Automation Engineers

---

## 1. Test Environment Requirements

### 1.1 Unit Test Environment

**Framework**: Jest 29.7+ with React Testing Library 16.0+

**Required Configuration**:
- Node.js 18+ LTS
- TypeScript 5.9+ with strict mode enabled
- In-memory test environment (no external services)

**Mock Requirements**:
- Mongoose models mocked with `jest.mock()`
- Clerk SDK mocked for authentication checks
- Zod schemas tested with real validation (not mocked)
- React components tested with `@testing-library/react`

**Environment Variables** (`.env.test`):
```env
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/test  # Not used (in-memory DB)
CLERK_PUBLISHABLE_KEY=pk_test_mock
CLERK_SECRET_KEY=sk_test_mock
CLERK_WEBHOOK_SECRET=whsec_test_mock
```

---

### 1.2 Integration Test Environment

**Framework**: Jest with mongodb-memory-server

**Required Configuration**:
- mongodb-memory-server for isolated test database
- Supertest for HTTP request testing
- Mock Clerk authentication middleware

**Database Setup**:
```typescript
// tests/setup/db.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
```

**Mock Clerk Webhooks**:
```typescript
// tests/utils/mockWebhook.ts
import { Webhook } from 'svix';

export function generateValidWebhookSignature(payload: any, secret: string) {
  const webhook = new Webhook(secret);
  const msgId = 'msg_test_' + Date.now();
  const timestamp = Math.floor(Date.now() / 1000);

  return webhook.sign(msgId, timestamp, JSON.stringify(payload));
}
```

**Environment Variables** (`.env.test`):
```env
NODE_ENV=test
CLERK_WEBHOOK_SECRET=whsec_test_fixed_secret_for_testing
CLERK_PUBLISHABLE_KEY=pk_test_mock
CLERK_SECRET_KEY=sk_test_mock
```

---

### 1.3 E2E Test Environment

**Framework**: Playwright 1.46+

**Required Configuration**:
- Clerk test mode enabled (`CLERK_TEST_MODE=true`)
- Test MongoDB instance (can be shared, but isolated schema)
- Headless browser automation (Chromium, Firefox, WebKit)

**Clerk Test Mode Setup**:
- Create Clerk test application with test API keys
- Use fixed test user accounts (not ephemeral)
- Test users: `test-user-1@example.com`, `test-dm@example.com`, `test-admin@example.com`

**Database Setup**:
- Option 1: Ephemeral MongoDB instance per test suite (docker-compose)
- Option 2: Persistent test database with cleanup before each test

**Environment Variables** (`.env.e2e`):
```env
NODE_ENV=test
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_<real_test_key>
CLERK_SECRET_KEY=sk_test_<real_test_key>
CLERK_WEBHOOK_SECRET=whsec_test_<real_webhook_secret>
MONGODB_URI=mongodb://localhost:27017/dnd_tracker_e2e_test
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Playwright Configuration**:
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 2. Test Data Requirements

### 2.1 Sample User Profiles

**Test User 1: First-Time User (No Profile)**
```json
{
  "clerkId": "user_test_new_001",
  "email": "newuser@example.com",
  "username": "newuser",
  "firstName": "Alice",
  "lastName": "Newbie",
  "role": "user",
  "subscriptionTier": "free",
  "profileSetupCompleted": false,
  "sessionsCount": 0,
  "charactersCreatedCount": 0,
  "campaignsCreatedCount": 0,
  "createdAt": "2025-10-26T10:00:00Z"
}
```

**Test User 2: Experienced DM (Complete Profile)**
```json
{
  "clerkId": "user_test_dm_002",
  "email": "dm@example.com",
  "username": "dungeonmaster",
  "firstName": "Bob",
  "lastName": "GameMaster",
  "displayName": "The Dungeon Master",
  "timezone": "America/New_York",
  "dndEdition": "5th Edition",
  "experienceLevel": "veteran",
  "primaryRole": "dm",
  "role": "user",
  "subscriptionTier": "expert",
  "profileSetupCompleted": true,
  "sessionsCount": 42,
  "charactersCreatedCount": 3,
  "campaignsCreatedCount": 5,
  "lastLoginAt": "2025-10-25T15:30:00Z",
  "createdAt": "2023-01-15T08:00:00Z"
}
```

**Test User 3: Partial Profile (Skipped Initial Setup)**
```json
{
  "clerkId": "user_test_partial_003",
  "email": "partial@example.com",
  "username": "partialuser",
  "firstName": "Charlie",
  "lastName": "Incomplete",
  "timezone": "UTC",
  "dndEdition": "5th Edition",
  "primaryRole": "player",
  "profileSetupCompleted": true,
  "role": "user",
  "subscriptionTier": "free",
  "sessionsCount": 1,
  "charactersCreatedCount": 0,
  "campaignsCreatedCount": 0,
  "createdAt": "2025-10-20T12:00:00Z"
}
```

**Test User 4: Admin User**
```json
{
  "clerkId": "user_test_admin_004",
  "email": "admin@example.com",
  "username": "admin",
  "firstName": "Admin",
  "lastName": "User",
  "displayName": "System Administrator",
  "timezone": "UTC",
  "dndEdition": "5th Edition",
  "experienceLevel": "experienced",
  "primaryRole": "dm",
  "role": "admin",
  "subscriptionTier": "guild",
  "profileSetupCompleted": true,
  "sessionsCount": 100,
  "charactersCreatedCount": 20,
  "campaignsCreatedCount": 15,
  "createdAt": "2022-06-01T00:00:00Z"
}
```

**Test User 5: Edge Case - At Usage Limits**
```json
{
  "clerkId": "user_test_limits_005",
  "email": "limited@example.com",
  "username": "atlimit",
  "firstName": "David",
  "lastName": "AtLimit",
  "primaryRole": "player",
  "role": "user",
  "subscriptionTier": "free",
  "profileSetupCompleted": true,
  "sessionsCount": 100,
  "charactersCreatedCount": 10,  // At free tier limit
  "campaignsCreatedCount": 0,
  "partiesCreated": 1,  // At free tier limit
  "encountersCreated": 3,  // At free tier limit
  "createdAt": "2025-09-01T00:00:00Z"
}
```

---

### 2.2 Validation Test Data

**Valid Inputs** (Boundary Values):
```typescript
const validInputs = {
  displayName: {
    min: "",  // Empty string (optional field)
    typical: "John Doe",
    max: "A".repeat(100),  // Exactly 100 characters
    unicode: "José García 李明",  // International characters
    emoji: "DM 👨‍🏫 Guide",  // Emoji support
  },
  dndEdition: {
    typical: "5th Edition",
    max: "X".repeat(50),  // Exactly 50 characters
    alternatives: ["3.5E", "Pathfinder 2E", "AD&D 2nd Edition"],
  },
  experienceLevel: {
    values: ["new", "beginner", "intermediate", "experienced", "veteran"],
  },
  primaryRole: {
    values: ["dm", "player", "both"],
  },
  timezone: {
    valid: ["UTC", "America/New_York", "Europe/London", "Asia/Tokyo"],
  },
};
```

**Invalid Inputs** (Error Cases):
```typescript
const invalidInputs = {
  displayName: {
    tooLong: "A".repeat(101),  // 101 characters
    maxPlus10: "A".repeat(110),  // Well over limit
  },
  dndEdition: {
    tooLong: "X".repeat(51),  // 51 characters
  },
  experienceLevel: {
    invalid: ["expert", "master", "noob", "", null, 123],
  },
  primaryRole: {
    invalid: ["gm", "spectator", "", null, 123],
  },
  timezone: {
    invalid: ["EST", "PST", "invalid/timezone", ""],
  },
};
```

**Special Characters & Edge Cases**:
```typescript
const edgeCaseInputs = {
  displayName: {
    htmlTags: "<script>alert('XSS')</script>",  // Should be escaped/sanitized
    sqlInjection: "'; DROP TABLE users; --",  // Should be escaped
    quotes: "O'Malley \"The Great\"",  // Quotes and apostrophes
    zeroWidth: "Test\u200BUser",  // Zero-width space
    rtl: "مستخدم اختبار",  // Right-to-left text
  },
  dndEdition: {
    specialChars: "D&D 5e (2014) - PHB & DMG",
    unicode: "龙与地下城 第五版",  // Chinese characters
  },
};
```

---

### 2.3 Clerk Webhook Payloads

**user.created Event**:
```json
{
  "type": "user.created",
  "data": {
    "id": "user_test_new_001",
    "object": "user",
    "email_addresses": [
      {
        "id": "idn_test_email_001",
        "email_address": "newuser@example.com",
        "verification": {
          "status": "verified",
          "strategy": "from_oauth_google"
        }
      }
    ],
    "first_name": "Alice",
    "last_name": "Newbie",
    "image_url": "https://img.clerk.com/test_avatar_001",
    "created_at": 1698345600000,
    "updated_at": 1698345600000
  }
}
```

**user.updated Event**:
```json
{
  "type": "user.updated",
  "data": {
    "id": "user_test_dm_002",
    "object": "user",
    "email_addresses": [
      {
        "id": "idn_test_email_002",
        "email_address": "dm-updated@example.com",
        "verification": { "status": "verified" }
      }
    ],
    "first_name": "Robert",
    "last_name": "GameMaster",
    "image_url": "https://img.clerk.com/test_avatar_002_updated",
    "created_at": 1698345600000,
    "updated_at": 1698432000000
  }
}
```

**user.deleted Event**:
```json
{
  "type": "user.deleted",
  "data": {
    "id": "user_test_deleted_006",
    "object": "user",
    "deleted": true
  }
}
```

---

## 3. Test Environment Setup Scripts

### 3.1 Database Seed Script

**Purpose**: Populate test database with sample users for manual testing

**File**: `tests/setup/seedTestData.ts`

```typescript
import mongoose from 'mongoose';
import { User } from '@/lib/models/User';

export async function seedTestUsers() {
  await User.deleteMany({}); // Clear existing test data

  const testUsers = [
    { /* Test User 1 data */ },
    { /* Test User 2 data */ },
    { /* Test User 3 data */ },
    { /* Test User 4 data */ },
    { /* Test User 5 data */ },
  ];

  await User.insertMany(testUsers);
  console.log('✓ Test users seeded successfully');
}

// Run: npx tsx tests/setup/seedTestData.ts
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI!).then(async () => {
    await seedTestUsers();
    await mongoose.disconnect();
  });
}
```

---

### 3.2 Playwright Test Fixtures

**Purpose**: Reusable authenticated sessions for E2E tests

**File**: `tests/e2e/fixtures/auth.ts`

```typescript
import { test as base } from '@playwright/test';
import { clerkSetup } from '@clerk/testing/playwright';

type Fixtures = {
  authenticatedUser: { email: string; userId: string };
  dmUser: { email: string; userId: string };
  adminUser: { email: string; userId: string };
};

export const test = base.extend<Fixtures>({
  authenticatedUser: async ({ page }, use) => {
    await clerkSetup({ frontendApiUrl: process.env.CLERK_FRONTEND_API });
    await page.goto('/sign-in');
    await page.fill('input[name="identifier"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await use({ email: 'newuser@example.com', userId: 'user_test_new_001' });
  },

  dmUser: async ({ page }, use) => {
    await clerkSetup({ frontendApiUrl: process.env.CLERK_FRONTEND_API });
    await page.goto('/sign-in');
    await page.fill('input[name="identifier"]', 'dm@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await use({ email: 'dm@example.com', userId: 'user_test_dm_002' });
  },

  adminUser: async ({ page }, use) => {
    await clerkSetup({ frontendApiUrl: process.env.CLERK_FRONTEND_API });
    await page.goto('/sign-in');
    await page.fill('input[name="identifier"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'AdminPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await use({ email: 'admin@example.com', userId: 'user_test_admin_004' });
  },
});
```

---

## 4. CI/CD Test Environment

### 4.1 GitHub Actions Configuration

**File**: `.github/workflows/test.yml`

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:8.0
        ports:
          - 27017:27017
    env:
      CLERK_PUBLISHABLE_KEY: ${{ secrets.CLERK_TEST_PUBLISHABLE_KEY }}
      CLERK_SECRET_KEY: ${{ secrets.CLERK_TEST_SECRET_KEY }}
      CLERK_WEBHOOK_SECRET: ${{ secrets.CLERK_TEST_WEBHOOK_SECRET }}
      MONGODB_URI: mongodb://localhost:27017/test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 5. Test Coverage Requirements

### 5.1 Unit Tests

**Target**: 80%+ coverage on touched code

**Files Requiring High Coverage**:
- `src/lib/validations/user.ts`: 90%+ (critical validation logic)
- `src/lib/services/userService.ts`: 85%+ (business logic)
- `src/lib/utils/subscription.ts`: 90%+ (usage limit calculations)
- `src/lib/utils/metrics.ts`: 80%+
- React components: 75%+ (presentational logic)

**Coverage Reports**:
```bash
npm run test:coverage
# Generates: coverage/lcov-report/index.html
```

---

### 5.2 Integration Tests

**Target**: All API routes covered

**Required Coverage**:
- `src/app/api/webhooks/clerk/route.ts`: All event types tested
- `src/app/api/users/[id]/profile/route.ts`: GET, PATCH with auth/validation
- `src/app/api/dashboard/metrics/route.ts`: GET with auth
- `src/app/api/users/[userId]/settings/route.ts`: GET
- `src/app/api/users/[userId]/settings/preferences/route.ts`: PATCH

---

### 5.3 E2E Tests

**Target**: All critical user flows covered

**Required Scenarios** (10 tests from e2e-test-plan.md):
- E2E-001: Login flow with valid/invalid credentials
- E2E-002: Dashboard access and metrics display
- E2E-003: Settings navigation and profile viewing
- E2E-004: Profile editing and validation
- E2E-005: Authentication enforcement
- E2E-006: Authorization enforcement (cross-user access)
- E2E-007: First-time user flow (profile setup)
- E2E-008: Returning user flow (skip setup)
- E2E-009: Settings tab navigation
- E2E-010: Validation error handling

---

## 6. Test Data Cleanup Strategy

### 6.1 Unit Tests

- No cleanup needed (mocks and in-memory only)
- Each test isolated with fresh mocks

### 6.2 Integration Tests

- `afterEach` hook deletes all collections in test database
- Test database fully reset between test suites
- No data persists across tests

### 6.3 E2E Tests

**Option 1: Ephemeral Database** (Recommended for CI)
- Docker container with MongoDB started before tests
- Container destroyed after tests complete
- Fresh database for each test run

**Option 2: Cleanup Hooks** (Local development)
- `beforeEach`: Seed required test users
- `afterEach`: Delete test users created during test
- Keep baseline test users for faster test execution

---

## 7. Performance Testing Data

### 7.1 Load Test Scenarios

**Scenario 1: Concurrent Profile Updates**
- 100 concurrent users updating profiles
- Measure: Response time, error rate
- Target: <2s for 95% of requests, <1% error rate

**Scenario 2: Dashboard Load**
- 500 concurrent dashboard page loads
- Measure: Time to Interactive, API response time
- Target: <1.5s TTI, <500ms API response

**Scenario 3: Webhook Burst**
- 50 Clerk webhooks arrive within 1 second
- Measure: Processing time, duplicate handling
- Target: All webhooks processed within 30s, no duplicates

---

## 8. Traceability

All test requirements mapped to functional requirements (FR-001 to FR-019) and testing requirements (TR-001 to TR-010) in spec.md.

See `/home/doug/ai-dev-1/dnd-tracker/specs/002-when-a-user/traceability-matrix.md` for complete mapping.

---

**Document Version**: 1.0
**Last Updated**: 2025-10-26
**Maintained By**: QA Team
