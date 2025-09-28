/**
 * MongoDB connection with Atlas
 * Reference: plan.md:Database Design decisions (lines 159-162)
 */
import mongoose from 'mongoose'
import { getConnectionOptions, getMongoDbUri } from './config'
import { logConnectionSuccess, handleConnectionError, setupConnectionListeners, setupGracefulShutdown, resetCachedConnection } from './utils'
import { createDatabaseIndexes, logInitializationSuccess } from './indexes'

// MongoDB connection state
interface MongooseConnection {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseConnection | undefined
}

// Global mongoose instance to prevent multiple connections in development
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

/**
 * Connect to MongoDB database with caching
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  const MONGODB_URI = getMongoDbUri()

  if (cached?.conn) {
    return cached.conn
  }

  if (!cached?.promise) {
    const opts = getConnectionOptions()
    cached!.promise = mongoose.connect(MONGODB_URI, opts)
  }

  try {
    cached!.conn = await cached!.promise
    logConnectionSuccess()
    return cached!.conn
  } catch (error) {
    return handleConnectionError(error, cached!)
  }
}

// Setup connection event listeners and graceful shutdown
setupConnectionListeners()
setupGracefulShutdown()

/**
 * Check if database connection is healthy
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await connectToDatabase()
    return await performHealthPing()
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

/**
 * Perform database ping to verify connection
 */
async function performHealthPing(): Promise<boolean> {
  const adminDb = mongoose.connection.db?.admin()
  if (adminDb) {
    await adminDb.ping()
    return true
  }
  return false
}

/**
 * Initialize database with connection and indexes
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await connectToDatabase()
    await createDatabaseIndexes()
    logInitializationSuccess()
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}

/**
 * Disconnect from database (mainly for testing)
 */
export async function disconnectFromDatabase(): Promise<void> {
  try {
    await mongoose.connection.close()
    resetCachedConnection()
    logDisconnectionSuccess()
  } catch (error) {
    console.error('Error disconnecting from database:', error)
    throw error
  }
}

/**
 * Log successful disconnection in development
 */
function logDisconnectionSuccess(): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔌 Disconnected from MongoDB')
  }
}

export default connectToDatabase