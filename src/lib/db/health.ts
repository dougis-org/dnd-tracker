/**
 * Database health check utilities
 * Simple health checking with minimal complexity
 */
import mongoose from 'mongoose'

/**
 * Ping database to verify connection
 * Simple ping operation
 */
async function pingDatabase(): Promise<boolean> {
  const adminDb = mongoose.connection.db?.admin()
  if (!adminDb) {
    return false
  }

  try {
    await adminDb.ping()
    return true
  } catch {
    return false
  }
}

/**
 * Check database health with existing connection
 * Simple health check that assumes connection exists
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    if (mongoose.connection.readyState !== 1) {
      return false
    }
    return await pingDatabase()
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}