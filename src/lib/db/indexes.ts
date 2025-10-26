/**
 * Database index management utilities
 * Simple index creation with minimal complexity
 */
import mongoose from 'mongoose';
import type { Collection } from 'mongodb';

/**
 * Check if error is duplicate key error
 * Simple error type checking
 */
function isDuplicateKeyError(error: unknown): boolean {
  return (
    error instanceof Error &&
    'code' in error &&
    typeof (error as { code: number }).code === 'number' &&
    (error as { code: number }).code === 11000
  );
}

const CHARACTER_COLLECTION = 'characters';

type IndexKeys = Parameters<Collection['createIndex']>[0];
type IndexOptions = Parameters<Collection['createIndex']>[1];

/**
 * Create index with duplicate key handling
 * Shared helper for collection-specific indexes
 */
async function createIndexWithHandling(
  collection: Collection,
  keys: IndexKeys,
  options: IndexOptions = {} as IndexOptions
): Promise<void> {
  try {
    await collection.createIndex(keys, {
      background: true,
      ...(options || {}),
    });
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      console.warn(
        `Warning: Could not create index for ${collection.collectionName}:`,
        error
      );
    }
  }
}

/**
 * Create index for single collection with error handling
 * Simple index creation
 */
async function createCollectionIndexes(collection: Collection): Promise<void> {
  await createIndexWithHandling(collection, { createdAt: 1 });
  await createIndexWithHandling(collection, { updatedAt: 1 });
}

/**
 * Create indexes for all database collections
 * Simple iteration over collections
 */
export async function createDatabaseIndexes(): Promise<void> {
  const collections = await mongoose.connection.db?.collections();

  if (collections) {
    for (const collection of collections) {
      await createCollectionIndexes(collection);
    }
  }
}
/**
 * Create indexes required for the Character collection
 * Adds compound and text indexes used by character workflows
 */
export async function createCharacterCollectionIndexes(): Promise<void> {
  const db = mongoose.connection.db;

  if (!db) {
    return;
  }

  const collection = db.collection?.(CHARACTER_COLLECTION);

  if (!collection) {
    return;
  }

  await createIndexWithHandling(collection, { userId: 1, deletedAt: 1 });
  await createIndexWithHandling(collection, { userId: 1, name: 'text' });
  await createIndexWithHandling(collection, { userId: 1, createdAt: -1 });
  // Soft deletes keep characters for a 30-day grace period; cleanup job lands in Feature 004.
  await createIndexWithHandling(collection, { deletedAt: 1 });
}
