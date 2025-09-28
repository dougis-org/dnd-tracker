/**
 * MongoDB connection configuration options
 * Extracted from connection.ts to reduce complexity
 */
import type { ConnectOptions } from 'mongoose'

/**
 * Get MongoDB connection options optimized for Atlas
 */
export function getConnectionOptions(): ConnectOptions {
  return {
    bufferCommands: false, // Disable mongoose buffering
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4, // Use IPv4, skip trying IPv6

    // Atlas-specific optimizations
    retryWrites: true,
    w: 'majority' as const,

    // Connection naming for monitoring
    appName: 'DnD-Tracker-MVP',

    // Enable compression for better performance
    compressors: ['zlib' as const],

    // Heartbeat frequency
    heartbeatFrequencyMS: 10000,
  }
}

/**
 * Validate and get MongoDB URI from environment
 */
export function getMongoDbUri(): string {
  const MONGODB_URI = process.env.MONGODB_URI

  if (!MONGODB_URI) {
    // During build time, provide a more helpful error message
    if (process.env.NODE_ENV === 'production' && process.env.CI) {
      throw new Error('MONGODB_URI environment variable is required for build. Please set it in your CI environment.')
    }
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
  }

  return MONGODB_URI
}