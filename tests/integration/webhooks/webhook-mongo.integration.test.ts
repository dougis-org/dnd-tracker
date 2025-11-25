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

let UserModel: any;
let UserEventModel: any;
let POST: any;

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
});
