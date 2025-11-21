import mongoose from 'mongoose';

/**
 * Global cache for MongoDB connection to prevent connection storms in serverless environments
 * Reuses existing connection across invocations
 */
let cachedConnection: mongoose.Connection | null = null;

/**
 * Logs structured messages in JSON format
 */
function logStructured(
  level: 'info' | 'warn' | 'error',
  message: string,
  data?: Record<string, unknown>
) {
  const log = {
    level,
    timestamp: new Date().toISOString(),
    message,
    ...data,
  };
  console.log(JSON.stringify(log));
}

/**
 * Connects to MongoDB and returns cached connection
 * Prevents connection storms in serverless environments by reusing existing connections
 *
 * @returns MongoDB connection instance
 * @throws Error if MONGODB_URI is not set
 */
export async function connectToMongo(): Promise<mongoose.Connection> {
  // Return cached connection if already connected
  if (cachedConnection && cachedConnection.readyState === 1) {
    logStructured('info', 'Using cached MongoDB connection');
    return cachedConnection;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    logStructured('error', 'MONGODB_URI environment variable is not set');
    throw new Error('MONGODB_URI environment variable is required');
  }

  try {
    logStructured('info', 'Connecting to MongoDB', {
      uri: mongoUri.replace(/:[^:]*@/, ':***@'),
    });

    // Connect or reuse existing connection
    const conn =
      mongoose.connection.readyState === 0
        ? await mongoose.connect(mongoUri, {
            dbName: process.env.MONGODB_DB_NAME || 'dnd-tracker',
          })
        : mongoose;

    cachedConnection = conn.connection;

    logStructured('info', 'Successfully connected to MongoDB', {
      dbName: process.env.MONGODB_DB_NAME || 'dnd-tracker',
    });

    return cachedConnection;
  } catch (err) {
    logStructured('error', 'Failed to connect to MongoDB', {
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

/**
 * Disconnects from MongoDB (primarily for testing)
 */
export async function disconnectFromMongo(): Promise<void> {
  if (cachedConnection) {
    await mongoose.disconnect();
    cachedConnection = null;
    logStructured('info', 'Disconnected from MongoDB');
  }
}
