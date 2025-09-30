/**
 * Database graceful shutdown utilities
 * Simple shutdown handling with minimal complexity
 */
import mongoose from 'mongoose'
import { resetConnectionCache } from './cache'

/**
 * Close database connection gracefully
 * Simple connection closing
 */
async function closeDatabaseConnection(): Promise<void> {
  await mongoose.connection.close()
  resetConnectionCache()
}

/**
 * Log shutdown success in development
 * Simple logging function
 */
function logShutdownSuccess(): void {
  console.log('🛑 Mongoose connection closed through app termination')
}

/**
 * Handle graceful shutdown process
 * Simple shutdown handler
 */
async function handleGracefulShutdown(): Promise<void> {
  try {
    await closeDatabaseConnection()
    logShutdownSuccess()
    process.exit(0)
  } catch (error) {
    console.error('Error during database disconnection:', error)
    process.exit(1)
  }
}

/**
 * Setup graceful shutdown listener
 * Simple event listener setup
 */
export function setupGracefulShutdown(): void {
  process.on('SIGINT', handleGracefulShutdown)
}