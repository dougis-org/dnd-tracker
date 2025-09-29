/**
 * Database initialization utilities
 * Simple initialization combining connection, events, and indexes
 */
import { connectToDatabase } from './connection'
import { setupConnectionEvents } from './events'
import { setupGracefulShutdown } from './shutdown'
import { createDatabaseIndexes } from './indexes'

/**
 * Log initialization success in development
 * Simple logging function
 */
function logInitializationSuccess(): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Database initialized successfully')
  }
}

/**
 * Initialize database with connection, events, and indexes
 * Simple initialization orchestration
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await connectToDatabase()
    setupConnectionEvents()
    setupGracefulShutdown()
    await createDatabaseIndexes()
    logInitializationSuccess()
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}