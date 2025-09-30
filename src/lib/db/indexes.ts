/**
 * Database index management utilities
 * Simple index creation with minimal complexity
 */
import mongoose from 'mongoose'
import type { Collection } from 'mongodb'

/**
 * Check if error is duplicate key error
 * Simple error type checking
 */
function isDuplicateKeyError(error: unknown): boolean {
  return error instanceof Error &&
         'code' in error &&
         typeof (error as { code: number }).code === 'number' &&
         (error as { code: number }).code === 11000
}

/**
 * Create index for single collection with error handling
 * Simple index creation
 */
async function createCollectionIndexes(collection: Collection): Promise<void> {
  try {
    await collection.createIndex({ createdAt: 1 })
    await collection.createIndex({ updatedAt: 1 })
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      console.warn(`Warning: Could not create index for ${collection.collectionName}:`, error)
    }
  }
}

/**
 * Create indexes for all database collections
 * Simple iteration over collections
 */
export async function createDatabaseIndexes(): Promise<void> {
  const collections = await mongoose.connection.db?.collections()

  if (collections) {
    for (const collection of collections) {
      await createCollectionIndexes(collection)
    }
  }
}