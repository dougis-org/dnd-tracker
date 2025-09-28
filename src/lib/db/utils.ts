/**
 * Database utility functions
 * Extracted from connection.ts to reduce complexity
 */
import mongoose from 'mongoose'

/**
 * Log connection success in development environment
 */
export function logConnectionSuccess(): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Connected to MongoDB Atlas')
  }
}

/**
 * Handle connection error and reset cached promise
 */
export function handleConnectionError(error: unknown, cached: { promise: Promise<typeof import('mongoose')> | null }): never {
  cached.promise = null
  console.error('❌ MongoDB connection error:', error)
  throw error
}

/**
 * Setup connection event listeners
 */
export function setupConnectionListeners(): void {
  mongoose.connection.on('connected', () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔗 Mongoose connected to MongoDB')
    }
  })

  mongoose.connection.on('error', (error) => {
    console.error('❌ Mongoose connection error:', error)
  })

  mongoose.connection.on('disconnected', () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔌 Mongoose disconnected from MongoDB')
    }
  })
}

/**
 * Setup graceful shutdown handler
 */
export function setupGracefulShutdown(): void {
  process.on('SIGINT', async () => {
    try {
      await mongoose.connection.close()
      console.log('🛑 Mongoose connection closed through app termination')
      process.exit(0)
    } catch (error) {
      console.error('Error during database disconnection:', error)
      process.exit(1)
    }
  })
}

/**
 * Reset cached connection state
 */
export function resetCachedConnection(): void {
  if (global.mongoose) {
    global.mongoose.conn = null
    global.mongoose.promise = null
  }
}