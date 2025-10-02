/**
 * Test helper utilities for database testing
 * Reduces complexity in model and service test files
 */

import mongoose, { Document } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;

/**
 * Setup MongoDB memory server for tests
 */
export async function setupTestDatabase(): Promise<void> {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}

/**
 * Clear all collections in the test database
 */
export async function clearTestDatabase(): Promise<void> {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

/**
 * Teardown MongoDB memory server
 */
export async function teardownTestDatabase(): Promise<void> {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
}

/**
 * Expect document to have specific field values
 */
export function expectDocumentFields<T extends Document>(
  document: T | null,
  fields: Partial<Record<keyof T, unknown>>
): void {
  if (!document) {
    throw new Error('Expected document to exist but got null');
  }

  Object.entries(fields).forEach(([key, expectedValue]) => {
    const actualValue = document[key as keyof T];
    if (actualValue !== expectedValue) {
      throw new Error(
        `Expected ${key} to be ${JSON.stringify(expectedValue)} but got ${JSON.stringify(actualValue)}`
      );
    }
  });
}

/**
 * Expect atomic operation to increment field correctly
 */
export async function expectAtomicIncrement<T extends Document>(
  model: mongoose.Model<T>,
  documentId: string | mongoose.Types.ObjectId,
  field: string,
  expectedValue: number
): Promise<void> {
  const doc = await model.findById(documentId);
  if (!doc) {
    throw new Error(`Document with id ${documentId} not found`);
  }

  const actualValue = (doc as Record<string, unknown>)[field];
  if (actualValue !== expectedValue) {
    throw new Error(
      `Expected ${field} to be ${expectedValue} but got ${actualValue}`
    );
  }
}
