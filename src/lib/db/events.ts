/**
 * Database connection event handlers
 * Simple event handling with minimal complexity
 */
import mongoose from 'mongoose'

/**
 * Log successful connection in development
 * Simple logging function
 */
function logConnection(): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔗 Mongoose connected to MongoDB')
  }
}

/**
 * Log connection error
 * Simple error logging function
 */
function logConnectionError(error: unknown): void {
  console.error('❌ Mongoose connection error:', error)
}

/**
 * Log disconnection in development
 * Simple logging function
 */
function logDisconnection(): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔌 Mongoose disconnected from MongoDB')
  }
}

/**
 * Setup database connection event listeners
 * Simple event listener setup
 */
export function setupConnectionEvents(): void {
  mongoose.connection.on('connected', logConnection)
  mongoose.connection.on('error', logConnectionError)
  mongoose.connection.on('disconnected', logDisconnection)
}