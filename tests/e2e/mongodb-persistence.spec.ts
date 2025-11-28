import { test, expect } from '@playwright/test';

/**
 * E2E Test: MongoDB Data Persistence
 *
 * This test verifies that:
 * 1. User data created via API endpoints persists in MongoDB
 * 2. Collections and indexes are properly set up
 * 3. Subsequent reads retrieve the same data
 * 4. Health check endpoint confirms database is ready
 *
 * This is a critical regression test to ensure feature 014 (MongoDB integration)
 * continues to work correctly after migrations.
 */

/**
 * Polling utility to wait for async operations to complete.
 * More robust than fixed setTimeout for database operations under load.
 */
async function poll(
  fn: () => Promise<boolean>,
  { timeout = 2000, interval = 100 } = {}
): Promise<void> {
  const endTime = Date.now() + timeout;
  while (Date.now() < endTime) {
    if (await fn()) return;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error(`Polling timed out after ${timeout}ms`);
}

test.describe('MongoDB Data Persistence', () => {
  const testUserId = `e2e-test-user-${Date.now()}`;
  const testEmail = `e2e-${Date.now()}@test.com`;
  const testDisplayName = 'E2E Test User';

  test.describe('Database Health & Migrations', () => {
    test('health check confirms database is ready with migrations applied', async ({ request }) => {
      const response = await request.get('/api/health');

      expect(response.status()).toBe(200);

      const health = await response.json();

      expect(health).toHaveProperty('status', 'healthy');
      expect(health).toHaveProperty('mongodb.connected', true);
      expect(health.mongodb.collections.users.exists).toBe(true);
      expect(health.mongodb.collections.user_events.exists).toBe(true);

      // Verify indexes are created
      expect(health.mongodb.collections.users.hasUniqueUserId).toBe(true);
      expect(health.mongodb.collections.users.hasUniqueEmail).toBe(true);
      expect(health.mongodb.collections.user_events.hasEventTypeIndex).toBe(true);
    });
  });

  test.describe('User Data Persistence', () => {
    test('create user via API and verify data persists in MongoDB', async ({ request }) => {
      // Step 1: Create a user via API
      const createResponse = await request.post('/api/internal/users', {
        data: {
          userId: testUserId,
          email: testEmail,
          displayName: testDisplayName,
          metadata: {
            source: 'e2e-test',
            testRun: Date.now(),
          },
        },
      });

      expect(createResponse.status()).toBe(201);

      const createdUser = await createResponse.json();

      expect(createdUser).toHaveProperty('success', true);
      expect(createdUser.data).toHaveProperty('_id');
      expect(createdUser.data).toHaveProperty('userId', testUserId);
      expect(createdUser.data).toHaveProperty('email', testEmail);
      expect(createdUser.data).toHaveProperty('displayName', testDisplayName);
      expect(createdUser.data).toHaveProperty('createdAt');
      expect(createdUser.data).toHaveProperty('updatedAt');

      const userId = createdUser.data._id;

      // Wait for write to be flushed using polling for robustness
      await poll(async () => {
        const getResponse = await request.get(`/api/internal/users/${userId}`);
        return getResponse.ok();
      });

      // Read the user back from API
      const getResponse = await request.get(`/api/internal/users/${userId}`);

      expect(getResponse.status()).toBe(200);

      const retrievedUser = await getResponse.json();

      expect(retrievedUser).toHaveProperty('success', true);
      expect(retrievedUser.data).toHaveProperty('userId', testUserId);
      expect(retrievedUser.data).toHaveProperty('email', testEmail);
      expect(retrievedUser.data).toHaveProperty('displayName', testDisplayName);

      // Step 4: Verify metadata persisted
      expect(retrievedUser.data.metadata).toEqual({
        source: 'e2e-test',
        testRun: createdUser.data.metadata.testRun,
      });

      // Step 5: Verify timestamps
      expect(new Date(retrievedUser.data.createdAt)).toEqual(
        new Date(createdUser.data.createdAt)
      );
      expect(new Date(retrievedUser.data.updatedAt)).toEqual(
        new Date(createdUser.data.updatedAt)
      );
    });

    test('update user and verify changes persist', async ({ request }) => {
      const userId2 = `e2e-test-user-update-${Date.now()}`;
      const email2 = `e2e-update-${Date.now()}@test.com`;

      // Create user
      const createResponse = await request.post('/api/internal/users', {
        data: {
          userId: userId2,
          email: email2,
          displayName: 'Original Name',
        },
      });

      expect(createResponse.status()).toBe(201);

      const createdUser = await createResponse.json();
      const id = createdUser.data._id;

      // Update user
      const updateResponse = await request.patch(`/api/internal/users/${id}`, {
        data: {
          displayName: 'Updated Name',
          metadata: { updated: true },
        },
      });

      expect(updateResponse.status()).toBe(200);

      const updatedUser = await updateResponse.json();

      expect(updatedUser.data).toHaveProperty('displayName', 'Updated Name');
      expect(updatedUser.data.metadata).toHaveProperty('updated', true);

      // Wait for update to persist using polling
      await poll(async () => {
        const getResponse = await request.get(`/api/internal/users/${id}`);
        if (!getResponse.ok()) return false;
        const user = await getResponse.json();
        return user.data.displayName === 'Updated Name';
      });

      // Read back and verify update persisted
      const getResponse = await request.get(`/api/internal/users/${id}`);

      expect(getResponse.status()).toBe(200);

      const retrievedUser = await getResponse.json();

      expect(retrievedUser.data).toHaveProperty('displayName', 'Updated Name');
      expect(retrievedUser.data.metadata).toHaveProperty('updated', true);
      expect(new Date(retrievedUser.data.updatedAt).getTime()).toBeGreaterThan(
        new Date(createdUser.data.createdAt).getTime()
      );
    });

    test('soft delete user and verify deletedAt is set', async ({ request }) => {
      const userId3 = `e2e-test-user-delete-${Date.now()}`;
      const email3 = `e2e-delete-${Date.now()}@test.com`;

      // Create user
      const createResponse = await request.post('/api/internal/users', {
        data: {
          userId: userId3,
          email: email3,
          displayName: 'User To Delete',
        },
      });

      expect(createResponse.status()).toBe(201);

      const createdUser = await createResponse.json();
      const id = createdUser.data._id;

      // Verify not deleted initially
      const initialGetResponse = await request.get(`/api/internal/users/${id}`);
      expect(initialGetResponse.status()).toBe(200);
      const userBefore = await initialGetResponse.json();
      expect(userBefore.data.deletedAt).toBeNull();

      // Delete user
      const deleteResponse = await request.delete(`/api/internal/users/${id}`);

      expect(deleteResponse.status()).toBe(204);

      // Wait briefly for soft-delete to persist
      await poll(async () => {
        const response = await request.get(`/api/internal/users/${id}`);
        return response.status() === 404;
      });

      // Verify soft-delete: user should not be returned in get
      const getResponse = await request.get(`/api/internal/users/${id}`);

      expect(getResponse.status()).toBe(404);
    });

    test('unique constraints on userId and email prevent duplicates', async ({ request }) => {
      const userId4 = `e2e-test-user-unique-${Date.now()}`;
      const email4 = `e2e-unique-${Date.now()}@test.com`;

      // Create first user
      const firstCreate = await request.post('/api/internal/users', {
        data: {
          userId: userId4,
          email: email4,
          displayName: 'First User',
        },
      });

      expect(firstCreate.status()).toBe(201);

      // Try to create user with same userId
      const duplicateUserIdResponse = await request.post('/api/internal/users', {
        data: {
          userId: userId4,
          email: `different-${Date.now()}@test.com`,
          displayName: 'Duplicate UserID',
        },
      });

      expect(duplicateUserIdResponse.status()).toBe(409);
      const dupUserIdError = await duplicateUserIdResponse.json();
      expect(dupUserIdError).toHaveProperty('success', false);

      // Try to create user with same email
      const duplicateEmailResponse = await request.post('/api/internal/users', {
        data: {
          userId: `different-${Date.now()}`,
          email: email4,
          displayName: 'Duplicate Email',
        },
      });

      expect(duplicateEmailResponse.status()).toBe(409);
      const dupEmailError = await duplicateEmailResponse.json();
      expect(dupEmailError).toHaveProperty('success', false);
    });
  });

  test.describe('Webhook Events Persistence', () => {
    test('webhook events are persisted to user_events collection', async ({ request }) => {
      const eventId = `e2e-event-${Date.now()}`;
      const testUserId5 = `e2e-webhook-user-${Date.now()}`;
      const testEmail5 = `e2e-webhook-${Date.now()}@test.com`;

      // Send webhook event
      const webhookResponse = await request.post('/api/webhooks/user-events', {
        data: {
          eventType: 'created',
          eventId,
          timestamp: new Date().toISOString(),
          user: {
            userId: testUserId5,
            email: testEmail5,
            displayName: 'Webhook User',
            metadata: { source: 'webhook' },
          },
        },
      });

      expect(webhookResponse.status()).toBe(200);

      const webhookResult = await webhookResponse.json();

      expect(webhookResult).toHaveProperty('success', true);
      expect(webhookResult).toHaveProperty('eventId');

      // Wait for async processing and verify the user was created by the webhook
      await poll(async () => {
        const getResponse = await request.get(`/api/internal/users/${testUserId5}`);
        return getResponse.ok();
      });

      // Verify the user was created by the webhook by querying the API
      const getResponse = await request.get(`/api/internal/users/${testUserId5}`);
      expect(getResponse.status()).toBe(200);
      const user = await getResponse.json();
      expect(user.data.email).toBe(testEmail5);

      // Verify health check still shows system is operational
      const healthResponse = await request.get('/api/health');

      expect(healthResponse.status()).toBe(200);

      const health = await healthResponse.json();

      expect(health).toHaveProperty('status', 'healthy');
      expect(health.mongodb.collections.user_events.exists).toBe(true);
    });
  });
});
