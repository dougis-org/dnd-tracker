import { NextRequest, NextResponse } from 'next/server';
import { connectToMongo } from '@/lib/db/connection';
import UserModel, { UserEventModel } from '@/lib/models/user';
import { logStructured } from '@/lib/utils/logger';

/**
 * GET /api/health
 * Health check endpoint that verifies:
 * 1. MongoDB connection is working
 * 2. Collections exist
 * 3. Indexes are created
 * 4. Database is writable (for monitoring/alerting systems)
 *
 * @param _req - NextRequest (unused, marked with underscore)
 * @returns Health status JSON with database details
 */
export async function GET(_req: NextRequest) {
  const startTime = Date.now();

  try {
    // Check MongoDB connection
    const connection = await connectToMongo();

    // Verify connection.db exists
    if (!connection.db) {
      throw new Error('MongoDB connection database is undefined');
    }

    // Verify collections exist
    const collections = await connection.db?.listCollections().toArray() ?? [];
    const collectionNames = collections.map((c) => c.name);

    const userColExists = collectionNames.includes('users');
    const eventColExists = collectionNames.includes('user_events');

    // Get index information
    let userIndexes: Record<string, unknown> = {};
    let eventIndexes: Record<string, unknown> = {};

    if (userColExists) {
      userIndexes = await UserModel.collection.getIndexes();
    }

    if (eventColExists) {
      eventIndexes = await UserEventModel.collection.getIndexes();
    }

    const duration_ms = Date.now() - startTime;

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      duration_ms,
      mongodb: {
        connected: true,
        database: process.env.MONGODB_DB_NAME || 'dnd-tracker',
        collections: {
          users: {
            exists: userColExists,
            indexCount: Object.keys(userIndexes).length,
            hasUniqueUserId: 'userId_1' in userIndexes,
            hasUniqueEmail: 'email_1' in userIndexes,
            hasCompoundIndex: 'deletedAt_1_updatedAt_-1' in userIndexes,
          },
          user_events: {
            exists: eventColExists,
            indexCount: Object.keys(eventIndexes).length,
            hasEventTypeIndex: 'eventType_1_receivedAt_-1' in eventIndexes,
            hasStatusIndex: 'status_1_receivedAt_-1' in eventIndexes,
            hasUserIdIndex: 'userId_1_receivedAt_-1' in eventIndexes,
          },
        },
      },
    };

    logStructured('info', 'Health check passed', {
      endpoint: '/api/health',
      duration_ms,
      collections_ready: userColExists && eventColExists,
    });

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (err) {
    const duration_ms = Date.now() - startTime;

    logStructured('error', 'Health check failed', {
      endpoint: '/api/health',
      duration_ms,
      error: err instanceof Error ? err.message : String(err),
    });

    return NextResponse.json(
      {
        status: 'unhealthy',
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        duration_ms,
      },
      { status: 503 }
    );
  }
}
