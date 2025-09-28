/**
 * Database index management utilities
 * Extracted from connection.ts to reduce complexity
 */
import mongoose from 'mongoose'
import type { Collection } from 'mongodb'

/**
 * Create standard indexes for a single collection
 */
async function createCollectionIndexes(collection: Collection): Promise<void> {
  try {
    await collection.createIndex({ createdAt: 1 })
    await collection.createIndex({ updatedAt: 1 })
  } catch (error) {
    // Index might already exist, ignore duplicate key errors
    if (error instanceof Error && 'code' in error && typeof (error as { code: number }).code === 'number' && (error as { code: number }).code !== 11000) {
      console.warn(`Warning: Could not create index for ${collection.collectionName}:`, error)
    }
  }
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