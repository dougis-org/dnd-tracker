/**
 * Tests for database index management utilities
 */
import { createDatabaseIndexes, logInitializationSuccess } from '@/lib/db/indexes'
import mongoose from 'mongoose'

// Mock console methods
jest.spyOn(console, 'log').mockImplementation()
jest.spyOn(console, 'warn').mockImplementation()

// Mock mongoose connection
const mockCollection = {
  createIndex: jest.fn(),
  collectionName: 'test-collection'
}

const mockDb = {
  collections: jest.fn()
}

jest.mock('mongoose', () => ({
  connection: {
    db: {
      collections: jest.fn()
    }
  }
}))

describe('Database Indexes', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('createDatabaseIndexes', () => {
    it('should create indexes for all collections', async () => {
      const mockMongoose = require('mongoose')
      mockMongoose.connection.db.collections.mockResolvedValue([mockCollection])
      mockCollection.createIndex.mockResolvedValue('index_created')

      await createDatabaseIndexes()

      expect(mockCollection.createIndex).toHaveBeenCalledWith({ createdAt: 1 })
      expect(mockCollection.createIndex).toHaveBeenCalledWith({ updatedAt: 1 })
      expect(mockCollection.createIndex).toHaveBeenCalledTimes(2)
    })

    it('should handle missing database connection', async () => {
      const mockMongoose = require('mongoose')
      mockMongoose.connection.db.collections.mockResolvedValue(undefined)

      await expect(createDatabaseIndexes()).resolves.not.toThrow()
    })

    it('should handle index creation errors (ignore duplicate key errors)', async () => {
      const mockMongoose = require('mongoose')
      mockMongoose.connection.db.collections.mockResolvedValue([mockCollection])
      const duplicateKeyError = new Error('Duplicate key error')
      Object.assign(duplicateKeyError, { code: 11000 })
      mockCollection.createIndex.mockRejectedValue(duplicateKeyError)

      await expect(createDatabaseIndexes()).resolves.not.toThrow()
    })

    it('should warn about other index creation errors', async () => {
      const mockMongoose = require('mongoose')
      mockMongoose.connection.db.collections.mockResolvedValue([mockCollection])
      const otherError = new Error('Other error')
      Object.assign(otherError, { code: 12345 })
      mockCollection.createIndex.mockRejectedValue(otherError)

      await createDatabaseIndexes()

      expect(console.warn).toHaveBeenCalledWith(
        `Warning: Could not create index for ${mockCollection.collectionName}:`,
        otherError
      )
    })
  })

  describe('logInitializationSuccess', () => {
    it('should log success message in development', () => {
      process.env.NODE_ENV = 'development'

      logInitializationSuccess()

      expect(console.log).toHaveBeenCalledWith('✅ Database initialized successfully')
    })

    it('should not log in production', () => {
      process.env.NODE_ENV = 'production'

      logInitializationSuccess()

      expect(console.log).not.toHaveBeenCalled()
    })
  })
})