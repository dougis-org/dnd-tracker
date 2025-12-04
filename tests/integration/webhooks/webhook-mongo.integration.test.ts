import crypto from 'crypto';
import { jest } from '@jest/globals';

import {
  startMongoContainer,
  stopMongoContainer,
  clearMongoDatabase,
} from '@test-helpers/mongo-testcontainers';

import {
  connectToMongo as appConnectToMongo,
  disconnectFromMongo,
} from '@/lib/db/connection';
import { createMockRequest } from '@test-helpers/request-helpers';

let UserModel: unknown;
let UserEventModel: unknown;
let POST: (req: Request) => Promise<Response> | unknown;

// Helper - poll for a predicate until timeout
async function waitFor<T>(
  fn: () => Promise<T | null>,
  timeout = 3000,
  interval = 200
) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const res = await fn();
    if (res) return res;
    await new Promise((r) => setTimeout(r, interval));
  }
  return null;
}

describe('Webhook integration - MongoDB', () => {
  beforeAll(async () => {
    // Ensure we don't use mocked mongoose (and related mocked libs) from jest.setup.js
    jest.resetModules();
    jest.unmock('mongoose');
    jest.unmock('bson');
    // Re-require models and route after resetting module registry

    ({ default: UserModel, UserEventModel } = require('@/lib/models/user'));
    ({ POST } = require('@/app/api/webhooks/user-events/route'));

    // Start Mongo container and set application env
    const connStr = await startMongoContainer();
    if (!connStr)
      throw new Error('Failed to obtain test container connection string');
    process.env.MONGODB_URI = connStr;
    process.env.MONGODB_DB_NAME = 'dnd-tracker-test';

    // Connect via our app's connectToMongo helper
    await appConnectToMongo();
  }, 60_000);

  afterAll(async () => {
    try {
      await disconnectFromMongo();
    } finally {
      await stopMongoContainer();
    }
  });

  beforeEach(async () => {
    await clearMongoDatabase();
  });

  afterEach(async () => {
    // ensure we leave DB clean
    await clearMongoDatabase();
  });

  test('stores event and creates user via background processing', async () => {
    process.env.WEBHOOK_SECRET = 'integration-secret';
    const endpoint = 'http://localhost:3000/api/webhooks/user-events';
    const payload = {
      eventId: 'evt_int_1',
      timestamp: new Date().toISOString(),
      eventType: 'created',
      user: {
        userId: 'user_int_1',
        email: 'int@example.com',
        displayName: 'Int Test',
      },
    };

    const body = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(body)
      .digest('hex');
    const signatureHeader = `sha256=${signature}`;

    const req = createMockRequest(endpoint, 'POST', payload, {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signatureHeader,
      'Content-Length': String(Buffer.byteLength(body)),
    });

    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(200);

    // Verify event stored
    const stored = await waitFor(
      async () => {
        return await UserEventModel.findOne({
          eventId: payload.eventId,
        }).lean();
      },
      5000,
      200
    );

    expect(stored).not.toBeNull();
    expect(stored?.signatureValid).toBe(true);
    expect(stored?.signature).toBe(signatureHeader);

    // Verify background processing created user
    const user = await waitFor(
      async () => {
        return await UserModel.findOne({ userId: payload.user.userId }).lean();
      },
      5000,
      200
    );

    expect(user).not.toBeNull();
    expect(user?.email).toBe(payload.user.email);
    expect(user?.displayName).toBe(payload.user.displayName);
  }, 60_000);

  test('handles user updated event with timestamp conflict resolution', async () => {
    process.env.WEBHOOK_SECRET = 'integration-secret';

    // Create initial user
    const userId = 'user_int_2';
    const initialUser = await UserModel.create({
      userId,
      email: 'initial@example.com',
      displayName: 'Initial',
    });

    // Create updated event with earlier timestamp (should be skipped)
    const oldTimestamp = new Date(
      initialUser.updatedAt.getTime() - 10000
    ).toISOString();
    const payload = {
      eventId: 'evt_int_2_old',
      timestamp: oldTimestamp,
      eventType: 'updated',
      user: {
        userId,
        displayName: 'Updated From Old Event',
      },
    };

    const body = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    const req = createMockRequest(
      'http://localhost:3000/api/webhooks/user-events',
      'POST',
      payload,
      {
        'X-Webhook-Signature': `sha256=${signature}`,
        'Content-Type': 'application/json',
      }
    );

    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(200);

    // Wait for event to be stored
    await waitFor(() =>
      UserEventModel.findOne({ eventId: payload.eventId })
    );

    // User should NOT be updated (late-arriving event)
    const user = await UserModel.findOne({ userId });
    expect(user?.displayName).toBe('Initial');
  }, 60_000);

  test('handles user updated event when user does not exist', async () => {
    process.env.WEBHOOK_SECRET = 'integration-secret';
    const userId = 'user_int_3_new';

    const payload = {
      eventId: 'evt_int_3_new_user',
      timestamp: new Date().toISOString(),
      eventType: 'updated',
      user: {
        userId,
        email: 'new@example.com',
        displayName: 'New User From Update',
      },
    };

    const body = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    const req = createMockRequest(
      'http://localhost:3000/api/webhooks/user-events',
      'POST',
      payload,
      {
        'X-Webhook-Signature': `sha256=${signature}`,
        'Content-Type': 'application/json',
      }
    );

    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(200);

    // Wait for event to be processed
    await waitFor(() =>
      UserEventModel.findOne({ eventId: payload.eventId })
    );

    // User should be created
    const user = await UserModel.findOne({ userId });
    expect(user).not.toBeNull();
    expect(user?.displayName).toBe('New User From Update');
  }, 60_000);

  test('handles user deleted event (soft-delete)', async () => {
    process.env.WEBHOOK_SECRET = 'integration-secret';
    const userId = 'user_int_4_delete';

    // Create user first
    await UserModel.create({
      userId,
      email: 'delete@example.com',
      displayName: 'To Delete',
    });

    const deleteTime = new Date();
    const payload = {
      eventId: 'evt_int_4_delete',
      timestamp: deleteTime.toISOString(),
      eventType: 'deleted',
      user: { userId },
    };

    const body = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    const req = createMockRequest(
      'http://localhost:3000/api/webhooks/user-events',
      'POST',
      payload,
      {
        'X-Webhook-Signature': `sha256=${signature}`,
        'Content-Type': 'application/json',
      }
    );

    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(200);

    // Wait for event to be processed
    await waitFor(() =>
      UserEventModel.findOne({ eventId: payload.eventId })
    );

    // User should be soft-deleted
    const user = await UserModel.findOne({ userId });
    expect(user?.deletedAt).not.toBeNull();
  }, 60_000);

  test('rejects invalid webhook signature', async () => {
    process.env.WEBHOOK_SECRET = 'integration-secret';
    const payload = {
      eventId: 'evt_int_5_bad_sig',
      timestamp: new Date().toISOString(),
      eventType: 'created',
      user: { userId: 'user_int_5' },
    };

    const req = createMockRequest(
      'http://localhost:3000/api/webhooks/user-events',
      'POST',
      payload,
      {
        'X-Webhook-Signature': 'sha256=invalidsignature123',
        'Content-Type': 'application/json',
      }
    );

    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(401);
  });
});
