/**
 * MongoDB connection with Atlas
 * Reference: plan.md:Database Design decisions (lines 159-162)
 */
import mongoose from 'mongoose'
import { getConnectionOptions, validateMongoUri } from './config'
import { getCachedConnection, resetConnectionCache } from './cache'

/**
 * Log successful connection in development
 * Simple logging function
 */
function logConnectionSuccess(): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Connected to MongoDB Atlas')
  }
}

/**
 * Handle connection error and reset cache
 * Simple error handling
 */
function handleConnectionError(error: unknown, cached: ReturnType<typeof getCachedConnection>): never {
  cached.promise = null
  console.error('❌ MongoDB connection error:', error)
  throw error
}

/**
 * Connect to MongoDB database
 * Main connection function with simplified logic
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = validateMongoUri()
  const cached = getCachedConnection()

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = getConnectionOptions()
    cached.promise = mongoose.connect(uri, opts)
  }

  try {
    cached.conn = await cached.promise
    logConnectionSuccess()
    return cached.conn
  } catch (error) {
    return handleConnectionError(error, cached)
  }
}

/**
 * Log development disconnection message
 * Simple logging function
 */
function logDisconnection(): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔌 Disconnected from MongoDB')
  }
}

/**
 * Disconnect from database (mainly for testing)
 * Simple disconnection with cache reset
 */
export async function disconnectFromDatabase(): Promise<void> {
  try {
    await mongoose.connection.close()
    resetConnectionCache()
    logDisconnection()
  } catch (error) {
    console.error('Error disconnecting from database:', error)
    throw error
  }
}

export default connectToDatabase