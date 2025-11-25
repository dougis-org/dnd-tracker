import { MongoDBContainer } from '@testcontainers/mongodb';
import mongoose from 'mongoose';
// Avoid using the `@` alias here because jest global setup runs in a Node
// context that doesn't resolve TS path aliases by default. Use a relative
// import which works reliably for both the test runner and CI hooks.
import { disconnectFromMongo } from '../../src/lib/db/connection';

// Global MongoDB container instance for integration tests
let mongoContainer: MongoDBContainer | null = null;
let mongoConnectionString: string = '';

/**
 * Start a testcontainers MongoDB instance for integration tests
 * Called in jest.setup or beforeAll in test suites
 */
export async function startMongoContainer(): Promise<string> {
  if (mongoConnectionString) {
    return mongoConnectionString;
  }

  try {
    // Use a modern MongoDB image compatible with mongoose v8+ (requires wire version >= 8)
    mongoContainer = await new MongoDBContainer('mongo:6.0.8').start();
    // Build a connection string that's reachable from the host, using the
    // container host and mapped port (not the internal container hostname)
    // Prefer localhost for host to ensure the mapped port is reachable from the
    // test runner environment. Some Docker setups return the container hostname
    // which is not resolvable from the host.
    // Prefer localhost (127.0.0.1) to connect to the mapped port on the host
    // regardless of what the container reports as a host.
    const host = '127.0.0.1';
    const port = mongoContainer.getMappedPort(27017);
    const connStr = `mongodb://${host}:${port}`;
    mongoConnectionString = connStr;
    return mongoConnectionString;
  } catch (error) {
    console.error('Failed to start MongoDB container:', error);
    throw error;
  }
}

/**
 * Stop the testcontainers MongoDB instance
 * Called in jest.teardown or afterAll in test suites
 */
export async function stopMongoContainer(): Promise<void> {
  if (mongoContainer) {
    try {
      // Disconnect mongoose and clear any cached connection promise from the
      // repo connection helper (recommended) so the global worker can exit cleanly
      await disconnectFromMongo();
      await mongoContainer.stop();
      mongoContainer = null;
      mongoConnectionString = '';
    } catch (error) {
      console.error('Failed to stop MongoDB container:', error);
    }
  }
}

/**
 * Connect to the MongoDB testcontainer
 */
export async function connectToMongo(): Promise<void> {
  if (!mongoConnectionString) {
    throw new Error(
      'MongoDB container not started. Call startMongoContainer first.'
    );
  }

  if (mongoose.connection.readyState === 1) {
    return; // Already connected
  }

  const options = {
    dbName: 'test-encounters',
    directConnection: true,
    serverSelectionTimeoutMS: 15000,
  };
  const maxRetries = 6;
  const baseDelay = 250;

  for (let i = 0; i < maxRetries; i += 1) {
    try {
      await mongoose.connect(mongoConnectionString, options);
      return;
    } catch (error) {
      if (i === maxRetries - 1) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
      }
      console.warn(`Retrying MongoDB connect (attempt ${i + 1}/${maxRetries})`);
       
      await new Promise((res) => setTimeout(res, baseDelay * (i + 1)));
    }
  }
}

/**
 * Clear all collections in the test database
 */
export async function clearMongoDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  const db = mongoose.connection.db;
  if (!db) return;

  try {
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      await db.dropCollection(collection.name);
    }
  } catch (error) {
    console.error('Failed to clear database:', error);
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectMongo(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    try {
      await mongoose.disconnect();
    } catch (error) {
      console.error('Failed to disconnect from MongoDB:', error);
    }
  }
}
