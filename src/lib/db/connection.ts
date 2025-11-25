import mongoose from 'mongoose';
// Use a relative import here to ensure this module can be imported by the
// Node-based jest global setup/teardown scripts which don't always resolve
// the TS path alias (`@`). Using a relative path is more resilient to runtime
// contexts like globalSetup/globalTeardown.
import { logStructured } from '../utils/logger';

/**
 * Global cache for MongoDB connection promise to prevent connection storms
 * Caches the promise itself, not just the connection object
 * Ensures mongoose.connect() is called only once even with concurrent requests
 */
let cachedConnectionPromise: Promise<mongoose.Connection> | null = null;

/**
 * Connects to MongoDB and returns cached connection
 * Prevents connection storms in serverless environments by caching the connection promise
 * Ensures mongoose.connect() is called only once even with concurrent invocations
 *
 * @returns MongoDB connection instance
 * @throws Error if MONGODB_URI is not set
 */
export async function connectToMongo(): Promise<mongoose.Connection> {
  // Return cached promise if connection attempt already in progress
  if (cachedConnectionPromise) {
    return cachedConnectionPromise;
  }

  // Check if already connected
  if (mongoose.connection.readyState === 1) {
    logStructured('info', 'Using existing MongoDB connection');
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    logStructured('error', 'MONGODB_URI environment variable is not set');
    throw new Error('MONGODB_URI environment variable is required');
  }

  // Cache the connection promise before awaiting
  cachedConnectionPromise = (async () => {
    try {
      logStructured('info', 'Connecting to MongoDB', {
        uri: mongoUri.replace(/:[^:]*@/, ':***@'),
      });

      await mongoose.connect(mongoUri, {
        dbName: process.env.MONGODB_DB_NAME || 'dnd-tracker',
        // For integration tests running against containers, prefer direct
        // connections to avoid the driver attempting to resolve internal
        // container hostnames (which are unreachable from host)
        directConnection: !!process.env.JEST_INTEGRATION,
      });

      logStructured('info', 'Successfully connected to MongoDB', {
        dbName: process.env.MONGODB_DB_NAME || 'dnd-tracker',
      });

      return mongoose.connection;
    } catch (err) {
      // Clear cache on error so retry is possible
      cachedConnectionPromise = null;
      logStructured('error', 'Failed to connect to MongoDB', {
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  })();

  return cachedConnectionPromise;
}

/**
 * Disconnects from MongoDB (primarily for testing)
 */
export async function disconnectFromMongo(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    cachedConnectionPromise = null;
    logStructured('info', 'Disconnected from MongoDB');
  }
}
