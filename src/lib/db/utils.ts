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
 * Handle connection event
 */
function handleConnectionEvent(): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔗 Mongoose connected to MongoDB')
  }
}

/**
 * Handle connection error event
 */
function handleConnectionErrorEvent(error: unknown): void {
  console.error('❌ Mongoose connection error:', error)
}

/**
 * Handle disconnection event
 */
function handleDisconnectionEvent(): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔌 Mongoose disconnected from MongoDB')
  }
}

/**
 * Setup connection event listeners
 */
export function setupConnectionListeners(): void {
  mongoose.connection.on('connected', handleConnectionEvent)
  mongoose.connection.on('error', handleConnectionErrorEvent)
  mongoose.connection.on('disconnected', handleDisconnectionEvent)
}

/**
 * Handle graceful shutdown process
 */
async function handleGracefulShutdown(): Promise<void> {
  try {
    await mongoose.connection.close()
    console.log('🛑 Mongoose connection closed through app termination')
    process.exit(0)
  } catch (error) {
    console.error('Error during database disconnection:', error)
    process.exit(1)
  }
}

/**
 * Setup graceful shutdown handler
 */
export function setupGracefulShutdown(): void {
  process.on('SIGINT', handleGracefulShutdown)
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