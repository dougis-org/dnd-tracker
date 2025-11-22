import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToMongo } from '@/lib/db/connection';
import UserModel, { UserEventModel, type UserEventDoc } from '@/lib/models/user';
import {
  validateWebhookEvent,
  formatValidationErrors,
  type WebhookEventRequest,
} from '@/lib/schemas/webhook.schema';
import { logStructured } from '@/lib/utils/logger';

/**
 * Compare two buffers using timing-safe equality
 */
function compareSignatures(hash: string, expectedHash: string): boolean {
  const bufferHash = Buffer.from(hash);
  const bufferExpected = Buffer.from(expectedHash);

  if (bufferHash.length !== bufferExpected.length) {
    logStructured(
      'warn',
      'Webhook signature validation failed - hash length mismatch'
    );
    return false;
  }

  try {
    return crypto.timingSafeEqual(bufferHash, bufferExpected);
  } catch (err) {
    logStructured('error', 'Webhook signature validation failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

/**
 * Validates webhook signature using HMAC-SHA256
 */
function validateSignature(
  body: string,
  signature: string | null,
  secret: string | undefined
): boolean {
  if (!secret) {
    if (process.env.NODE_ENV !== 'test') {
      logStructured(
        'warn',
        'WEBHOOK_SECRET not set - signature validation disabled'
      );
    }
    return true;
  }

  if (!signature) {
    logStructured(
      'warn',
      'Webhook signature validation failed - no signature provided'
    );
    return false;
  }

  const parts = signature.split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256') {
    logStructured(
      'warn',
      'Webhook signature validation failed - invalid format'
    );
    return false;
  }

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body);
  const expectedHash = hmac.digest('hex');

  if (!compareSignatures(parts[1], expectedHash)) {
    logStructured(
      'warn',
      'Webhook signature validation failed - hash mismatch'
    );
    return false;
  }

  return true;
}

/**
 * POST /api/webhooks/user-events
 * Receives webhook events from external systems (Clerk, etc.)
 * Validates, stores, and processes user lifecycle events
 *
 * Request body:
 * {
 *   eventType: 'created' | 'updated' | 'deleted',
 *   eventId?: string,
 *   timestamp: ISO8601 | number,
 *   user: { userId, email?, displayName?, metadata? }
 * }
 *
 * Response: 200 OK (fire-and-forget semantics)
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Check payload size (default 1MB)
    const maxSize = parseInt(
      process.env.WEBHOOK_MAX_PAYLOAD_SIZE || '1048576',
      10
    );
    const contentLength = req.headers.get('content-length');

    if (contentLength && parseInt(contentLength, 10) > maxSize) {
      logStructured('warn', 'Webhook payload exceeds size limit', {
        maxSize,
        receivedSize: parseInt(contentLength, 10),
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Request payload exceeds maximum size (1MB)',
            maxSize,
            receivedSize: parseInt(contentLength, 10),
          },
        },
        { status: 413 }
      );
    }

    // Read and parse request body
    let body: string;
    try {
      body = await req.text();
      if (!body) {
        logStructured('warn', 'Webhook received with empty body');
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Request body is empty',
            },
          },
          { status: 400 }
        );
      }
    } catch (err) {
      logStructured('error', 'Failed to read request body', {
        error: err instanceof Error ? err.message : String(err),
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Failed to read request body',
          },
        },
        { status: 400 }
      );
    }

    // Validate signature
    const signature = req.headers.get('X-Webhook-Signature');
    const secret = process.env.WEBHOOK_SECRET;
    const signatureValid = validateSignature(body, signature, secret);

    if (!signatureValid && secret) {
      logStructured('warn', 'Webhook signature validation failed', {
        endpoint: '/api/webhooks/user-events',
        method: 'POST',
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Webhook signature validation failed',
          },
        },
        { status: 401 }
      );
    }

    // Parse JSON
    let payload: unknown;
    try {
      payload = JSON.parse(body);
    } catch (err) {
      logStructured('warn', 'Webhook received with invalid JSON', {
        error: err instanceof Error ? err.message : String(err),
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid JSON in request body',
          },
        },
        { status: 400 }
      );
    }

    // Validate schema
    const validation = validateWebhookEvent(payload);
    if (!validation.success) {
      const details = formatValidationErrors(validation.error);
      logStructured('warn', 'Webhook validation failed', {
        endpoint: '/api/webhooks/user-events',
        method: 'POST',
        details,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation error',
            details,
          },
        },
        { status: 400 }
      );
    }

    const event = validation.data;

    // Connect to MongoDB
    await connectToMongo();

    // Extract timestamp
    const eventTimestamp = new Date(event.timestamp);

    // Store event immediately (fire-and-forget)
    const storedEvent = await UserEventModel.create({
      eventId: event.eventId,
      eventType: event.eventType,
      userId: event.user.userId,
      payload: event.user,
      source: 'webhook',
      signature: signature || undefined,
      signatureValid,
      receivedAt: new Date(),
      status: 'stored',
    });

    logStructured('info', 'Webhook event stored', {
      endpoint: '/api/webhooks/user-events',
      method: 'POST',
      eventType: event.eventType,
      userId: event.user.userId,
      eventId: storedEvent._id,
      duration_ms: Date.now() - startTime,
    });

    // Return success immediately (fire-and-forget)
    // Process event asynchronously in background
    void processWebhookEvent(event, storedEvent, eventTimestamp);

    return NextResponse.json(
      {
        success: true,
        message: 'Event received and stored',
        eventId: storedEvent._id,
      },
      { status: 200 }
    );
  } catch (err) {
    logStructured('error', 'Webhook receiver error', {
      error: err instanceof Error ? err.message : String(err),
      duration_ms: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to process webhook',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Process webhook event asynchronously (background task)
 * Does not block webhook response
 */
async function processWebhookEvent(
  event: WebhookEventRequest,
  storedEvent: UserEventDoc,
  eventTimestamp: Date
): Promise<void> {
  try {
    if (event.eventType === 'created') {
      // Create new user
      await UserModel.create({
        userId: event.user.userId,
        email: event.user.email || '',
        displayName: event.user.displayName || '',
        metadata: event.user.metadata || {},
      });

      logStructured('info', 'User created from webhook', {
        userId: event.user.userId,
      });
    } else if (event.eventType === 'updated') {
      // Update existing user (timestamp-based conflict resolution)
      const currentUser = await UserModel.findOne({
        userId: event.user.userId,
      });

      if (currentUser) {
        if (eventTimestamp > currentUser.updatedAt) {
          // Update is newer, apply changes
          if (event.user.displayName !== undefined) {
            currentUser.displayName = event.user.displayName;
          }
          if (event.user.metadata !== undefined) {
            currentUser.metadata = event.user.metadata;
          }
          await currentUser.save();

          logStructured('info', 'User updated from webhook', {
            userId: event.user.userId,
          });
        } else {
          // Late-arriving event, skip upsert but store event
          logStructured(
            'warn',
            'Webhook update skipped - late-arriving event',
            {
              userId: event.user.userId,
              eventTimestamp: eventTimestamp.toISOString(),
              currentUpdatedAt: currentUser.updatedAt.toISOString(),
            }
          );
        }
      } else {
        // User doesn't exist, create it
        await UserModel.create({
          userId: event.user.userId,
          email: event.user.email || '',
          displayName: event.user.displayName || '',
          metadata: event.user.metadata || {},
        });

        logStructured('info', 'User created from webhook (updated event)', {
          userId: event.user.userId,
        });
      }
    } else if (event.eventType === 'deleted') {
      // Soft-delete user
      const user = await UserModel.findOne({ userId: event.user.userId });

      if (user) {
        user.deletedAt = eventTimestamp;
        await user.save();

        logStructured('info', 'User soft-deleted from webhook', {
          userId: event.user.userId,
        });
      }
    }

    // Mark event as processed
    storedEvent.status = 'processed';
    storedEvent.processedAt = new Date();
    await storedEvent.save();
  } catch (err) {
    // Log processing error but don't block response
    logStructured('error', 'Failed to process webhook event', {
      eventId: storedEvent._id,
      error: err instanceof Error ? err.message : String(err),
    });

    // Mark event as failed
    storedEvent.status = 'failed';
    storedEvent.error = err instanceof Error ? err.message : String(err);
    await storedEvent.save();
  }
}
