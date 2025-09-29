/**
 * Database index management utilities
 * Extracted from connection.ts to reduce complexity
 */
import mongoose from 'mongoose'
import type { Collection } from 'mongodb'

/**
 * Check if error is a duplicate key error (code 11000)
 */
function isDuplicateKeyError(error: unknown): boolean {
  return error instanceof Error &&
         'code' in error &&
         typeof (error as { code: number }).code === 'number' &&
         (error as { code: number }).code === 11000
}

/**
 * Create a single index with error handling
 */
async function createSingleIndex(collection: Collection, indexSpec: Record<string, number>): Promise<void> {
  try {
    await collection.createIndex(indexSpec)
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      console.warn(`Warning: Could not create index for ${collection.collectionName}:`, error)
    }
  }
}

/**
 * Create standard indexes for a single collection
 */
async function createCollectionIndexes(collection: Collection): Promise<void> {
  await createSingleIndex(collection, { createdAt: 1 })
  await createSingleIndex(collection, { updatedAt: 1 })
}

/**
 * Create indexes for all collections in the database
 */
export async function createDatabaseIndexes(): Promise<void> {
  const collections = await mongoose.connection.db?.collections()

  if (collections) {
    for (const collection of collections) {
      await createCollectionIndexes(collection)
    }
  }
}

/**
 * Log successful database initialization
 */
export function logInitializationSuccess(): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Database initialized successfully')
  }
}