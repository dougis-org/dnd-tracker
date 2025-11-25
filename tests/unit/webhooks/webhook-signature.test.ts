import crypto from 'crypto';
import { jest } from '@jest/globals';

import { createMockRequest } from '@test-helpers/request-helpers';

// Defer importing the handler until after mocks are applied in beforeEach
let POST: (req: Request) => Promise<Response> | unknown;

// Mock database operations to avoid touching real DB during unit tests
jest.mock('@/lib/models/user', () => ({
  __esModule: true,
  default: {},
  UserEventModel: { create: jest.fn().mockResolvedValue({ _id: 'storedId' }) },
}));

jest.mock('@/lib/db/connection', () => ({
  __esModule: true,
  connectToMongo: jest.fn().mockResolvedValue(undefined),
  disconnectFromMongo: jest.fn().mockResolvedValue(undefined),
}));

describe('Webhook signature validation (unit)', () => {
  const endpoint = 'http://localhost:3000/api/webhooks/user-events';
  const payload = {
    eventId: 'evt_1',
    timestamp: new Date().toISOString(),
    eventType: 'created',
    user: { userId: 'user_1', email: 'test@example.com' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure tests don't pick up secrets from real environment
    delete process.env.WEBHOOK_SECRET;
    // Ensure we always import the POST handler after mocks are set up

    ({ POST } = require('@/app/api/webhooks/user-events/route'));
  });

  test('accepts valid signature when secret set', async () => {
    process.env.WEBHOOK_SECRET = 'test-secret';
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
    const { UserEventModel } = jest.requireMock('@/lib/models/user');
    expect(UserEventModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        signatureValid: true,
        signature: signatureHeader,
      })
    );
  });

  test('rejects invalid hex signature', async () => {
    process.env.WEBHOOK_SECRET = 'test-secret';
    const body = JSON.stringify(payload);
    const signatureHeader =
      'sha256=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz';

    const req = createMockRequest(endpoint, 'POST', payload, {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signatureHeader,
      'Content-Length': String(Buffer.byteLength(body)),
    });

    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(401);
    const { UserEventModel } = jest.requireMock('@/lib/models/user');
    expect(UserEventModel.create).not.toHaveBeenCalled();
  });

  test('rejects unsupported algorithm prefix', async () => {
    process.env.WEBHOOK_SECRET = 'test-secret';
    const body = JSON.stringify(payload);
    const signatureHeader = 'sha1=abcdabcdabcdabcdabcdabcdabcdabcd';

    const req = createMockRequest(endpoint, 'POST', payload, {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signatureHeader,
      'Content-Length': String(Buffer.byteLength(body)),
    });

    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(401);
    const { UserEventModel } = jest.requireMock('@/lib/models/user');
    expect(UserEventModel.create).not.toHaveBeenCalled();
  });

  test('rejects mismatched length signature', async () => {
    process.env.WEBHOOK_SECRET = 'test-secret';
    const body = JSON.stringify(payload);
    const signatureHeader = 'sha256=abcd'; // too short

    const req = createMockRequest(endpoint, 'POST', payload, {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signatureHeader,
      'Content-Length': String(Buffer.byteLength(body)),
    });

    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(401);
    const { UserEventModel } = jest.requireMock('@/lib/models/user');
    expect(UserEventModel.create).not.toHaveBeenCalled();
  });

  test('disables validation if no secret configured (test env)', async () => {
    // Ensure secret is not set - validation is disabled and the handler should still store the event
    delete process.env.WEBHOOK_SECRET;
    const body = JSON.stringify(payload);
    const req = createMockRequest(endpoint, 'POST', payload, {
      'Content-Type': 'application/json',
      'Content-Length': String(Buffer.byteLength(body)),
    });

    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(200);
    const { UserEventModel } = jest.requireMock('@/lib/models/user');
    expect(UserEventModel.create).toHaveBeenCalled();
  });
});
