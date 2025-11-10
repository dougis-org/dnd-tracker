import { MongoDBContainer } from '@testcontainers/mongodb';
import mongoose from 'mongoose';

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
    mongoContainer = await new MongoDBContainer().start();
    const connStr = mongoContainer.getConnectionString();
    mongoConnectionString = connStr || '';
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
      // Disconnect mongoose before stopping container
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
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

  try {
    await mongoose.connect(mongoConnectionString, {
      dbName: 'test-encounters',
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
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
