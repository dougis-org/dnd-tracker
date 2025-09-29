/**
 * Tests for database configuration utilities
 */
import { getConnectionOptions, getMongoDbUri } from '@/lib/db/config'

describe('Database Configuration', () => {
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

    it('should return consistent options on multiple calls', () => {
      const options1 = getConnectionOptions()
      const options2 = getConnectionOptions()

      expect(options1).toEqual(options2)
    })
  })

  describe('getMongoDbUri', () => {
    const originalEnv = process.env

    beforeEach(() => {
      jest.resetModules()
      process.env = { ...originalEnv }
    })

    afterAll(() => {
      process.env = originalEnv
    })

    it('should return MongoDB URI when environment variable is set', () => {
      const testUri = 'mongodb://test-uri'
      process.env.MONGODB_URI = testUri

      const uri = getMongoDbUri()
      expect(uri).toBe(testUri)
    })

    it('should throw error when MONGODB_URI is not set', () => {
      delete process.env.MONGODB_URI

      expect(() => getMongoDbUri()).toThrow(
        'Please define the MONGODB_URI environment variable inside .env.local'
      )
    })

    it('should throw build-specific error in production CI environment', () => {
      delete process.env.MONGODB_URI
      process.env.NODE_ENV = 'production'
      process.env.CI = 'true'

      expect(() => getMongoDbUri()).toThrow(
        'MONGODB_URI environment variable is required for build. Please set it in your CI environment.'
      )
    })
  })
})