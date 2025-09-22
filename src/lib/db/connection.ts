/**
 * MongoDB connection with Atlas
 * Reference: plan.md:Database Design decisions (lines 159-162)
 */
import mongoose from 'mongoose'

// MongoDB connection state
interface MongooseConnection {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseConnection | undefined
}

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

// Global mongoose instance to prevent multiple connections in development
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached?.conn) {
    return cached.conn
  }

  if (!cached?.promise) {
    const opts = {
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

    cached!.promise = mongoose.connect(MONGODB_URI!, opts)
  }

  try {
    cached!.conn = await cached!.promise

    // Log successful connection in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Connected to MongoDB Atlas')
    }

    return cached!.conn
  } catch (error) {
    cached!.promise = null
    console.error('❌ MongoDB connection error:', error)
    throw error
  }
}

// Connection event listeners
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

// Graceful shutdown
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

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await connectToDatabase()

    // Simple ping to verify connection
    const adminDb = mongoose.connection.db?.admin()
    if (adminDb) {
      await adminDb.ping()
      return true
    }

    return false
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

// Database initialization function
export async function initializeDatabase(): Promise<void> {
  try {
    await connectToDatabase()

    // Create indexes if they don't exist
    const collections = await mongoose.connection.db?.collections()

    if (collections) {
      for (const collection of collections) {
        try {
          await collection.createIndex({ createdAt: 1 })
          await collection.createIndex({ updatedAt: 1 })
        } catch (error) {
          // Index might already exist, ignore duplicate key errors
          if ((error as any).code !== 11000) {
            console.warn(`Warning: Could not create index for ${collection.collectionName}:`, error)
          }
        }
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Database initialized successfully')
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}

// Utility to close connection (mainly for testing)
export async function disconnectFromDatabase(): Promise<void> {
  try {
    await mongoose.connection.close()

    // Reset cached connection
    if (global.mongoose) {
      global.mongoose.conn = null
      global.mongoose.promise = null
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('🔌 Disconnected from MongoDB')
    }
  } catch (error) {
    console.error('Error disconnecting from database:', error)
    throw error
  }
}

export default connectToDatabase