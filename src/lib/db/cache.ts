/**
 * Database connection caching utilities
 * Simple caching logic with minimal complexity
 */
import mongoose from 'mongoose'

// Connection state interface
interface MongooseConnection {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseConnection | undefined
}

/**
 * Get cached connection instance
 * Simple getter for global connection cache
 */
export function getCachedConnection(): MongooseConnection {
  if (!global.mongoose) {
    global.mongoose = { conn: null, promise: null }
  }
  return global.mongoose
}

/**
 * Reset connection cache
 * Simple cache clearing function
 */
export function resetConnectionCache(): void {
  if (global.mongoose) {
    global.mongoose.conn = null
    global.mongoose.promise = null
  }
}