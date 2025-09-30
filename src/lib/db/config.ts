/**
 * Database connection configuration
 * Simple configuration setup with minimal complexity
 */

/**
 * Get connection options for MongoDB
 * Simple function returning static configuration
 */
export function getConnectionOptions() {
  return {
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true,
    w: 'majority' as const,
    appName: 'DnD-Tracker-MVP',
    compressors: ['zlib' as const],
    heartbeatFrequencyMS: 10000,
  }
}

/**
 * Validate MongoDB URI environment variable
 * Simple validation with clear error messages
 */
export function validateMongoUri(): string {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    if (process.env.NODE_ENV === 'production' && process.env.CI) {
      throw new Error('MONGODB_URI environment variable is required for build. Please set it in your CI environment.')
    }
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
  }

  return uri
}