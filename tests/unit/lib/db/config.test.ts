/**
 * Tests for database configuration utilities
 */
import { getConnectionOptions, validateMongoUri } from '@/lib/db/config'

describe('Database Config', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('getConnectionOptions', () => {
    it('should return correct connection options', () => {
      const options = getConnectionOptions()

      expect(options).toEqual({
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
        retryWrites: true,
        w: 'majority',
        appName: 'DnD-Tracker-MVP',
        compressors: ['zlib'],
        heartbeatFrequencyMS: 10000,
      })
    })
  })

  describe('validateMongoUri', () => {
    it('should return URI when present', () => {
      process.env.MONGODB_URI = 'mongodb://test-uri'

      const uri = validateMongoUri()

      expect(uri).toBe('mongodb://test-uri')
    })

    it('should throw CI error in production CI environment', () => {
      delete process.env.MONGODB_URI
      process.env.NODE_ENV = 'production'
      process.env.CI = 'true'

      expect(() => validateMongoUri()).toThrow('MONGODB_URI environment variable is required for build')
    })

    it('should throw standard error in other environments', () => {
      delete process.env.MONGODB_URI
      process.env.NODE_ENV = 'development'

      expect(() => validateMongoUri()).toThrow('Please define the MONGODB_URI environment variable')
    })
  })
})