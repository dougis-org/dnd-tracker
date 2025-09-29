/**
 * Tests for database utility functions
 */

// Mock console methods
jest.spyOn(console, 'log').mockImplementation()
jest.spyOn(console, 'error').mockImplementation()

// Mock mongoose completely to avoid BSON issues
jest.mock('mongoose', () => ({
  connection: {
    on: jest.fn(),
    close: jest.fn(),
    removeAllListeners: jest.fn(),
    listenerCount: jest.fn(),
    emit: jest.fn()
  }
}))

import {
  logConnectionSuccess,
  handleConnectionError,
  setupConnectionListeners,
  setupGracefulShutdown,
  resetCachedConnection
} from '@/lib/db/utils'

describe('Database Utils', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('logConnectionSuccess', () => {
    it('should log success message in development', () => {
      process.env.NODE_ENV = 'development'

      logConnectionSuccess()

      expect(console.log).toHaveBeenCalledWith('✅ Connected to MongoDB Atlas')
    })

    it('should not log in production', () => {
      process.env.NODE_ENV = 'production'

      logConnectionSuccess()

      expect(console.log).not.toHaveBeenCalled()
    })
  })

  describe('handleConnectionError', () => {
    it('should reset cached promise and throw error', () => {
      const mockCached = { promise: jest.fn() }
      const testError = new Error('Connection failed')

      expect(() => handleConnectionError(testError, mockCached)).toThrow(testError)
      expect(mockCached.promise).toBeNull()
      expect(console.error).toHaveBeenCalledWith('❌ MongoDB connection error:', testError)
    })
  })

  describe('setupConnectionListeners', () => {
    it('should setup connection event listeners', () => {
      const mongoose = require('mongoose')

      setupConnectionListeners()

      expect(mongoose.connection.on).toHaveBeenCalledWith('connected', expect.any(Function))
      expect(mongoose.connection.on).toHaveBeenCalledWith('error', expect.any(Function))
      expect(mongoose.connection.on).toHaveBeenCalledWith('disconnected', expect.any(Function))
    })

    it('should log connected event in development', () => {
      const mongoose = require('mongoose')
      process.env.NODE_ENV = 'development'

      setupConnectionListeners()

      // Get the connected callback and call it
      const connectedCallback = mongoose.connection.on.mock.calls.find(
        (call: any) => call[0] === 'connected'
      )?.[1]

      if (connectedCallback) {
        connectedCallback()
        expect(console.log).toHaveBeenCalledWith('🔗 Mongoose connected to MongoDB')
      }
    })

    it('should log error events', () => {
      const mongoose = require('mongoose')

      setupConnectionListeners()

      // Get the error callback and call it
      const errorCallback = mongoose.connection.on.mock.calls.find(
        (call: any) => call[0] === 'error'
      )?.[1]

      if (errorCallback) {
        const testError = new Error('Connection error')
        errorCallback(testError)
        expect(console.error).toHaveBeenCalledWith('❌ Mongoose connection error:', testError)
      }
    })
  })

  describe('setupGracefulShutdown', () => {
    const originalProcessOn = process.on
    const originalProcessExit = process.exit
    let mockProcessOn: jest.Mock
    let mockProcessExit: jest.Mock

    beforeEach(() => {
      mockProcessOn = jest.fn()
      mockProcessExit = jest.fn()
      process.on = mockProcessOn
      process.exit = mockProcessExit
    })

    afterEach(() => {
      process.on = originalProcessOn
      process.exit = originalProcessExit
    })

    it('should setup SIGINT handler', () => {
      setupGracefulShutdown()

      expect(mockProcessOn).toHaveBeenCalledWith('SIGINT', expect.any(Function))
    })

    it('should handle graceful shutdown successfully', async () => {
      const mongoose = require('mongoose')
      mongoose.connection.close.mockResolvedValue()

      setupGracefulShutdown()

      // Get the SIGINT callback and call it
      const sigintCallback = mockProcessOn.mock.calls[0][1]
      await sigintCallback()

      expect(mongoose.connection.close).toHaveBeenCalled()
      expect(console.log).toHaveBeenCalledWith('🛑 Mongoose connection closed through app termination')
      expect(mockProcessExit).toHaveBeenCalledWith(0)
    })

    it('should handle shutdown error', async () => {
      const mongoose = require('mongoose')
      const shutdownError = new Error('Shutdown failed')
      mongoose.connection.close.mockRejectedValue(shutdownError)

      setupGracefulShutdown()

      // Get the SIGINT callback and call it
      const sigintCallback = mockProcessOn.mock.calls[0][1]
      await sigintCallback()

      expect(console.error).toHaveBeenCalledWith('Error during database disconnection:', shutdownError)
      expect(mockProcessExit).toHaveBeenCalledWith(1)
    })
  })

  describe('resetCachedConnection', () => {
    it('should reset global mongoose cache', () => {
      global.mongoose = { conn: {} as any, promise: {} as any }

      resetCachedConnection()

      expect(global.mongoose.conn).toBeNull()
      expect(global.mongoose.promise).toBeNull()
    })

    it('should handle missing global mongoose', () => {
      delete (global as any).mongoose

      expect(() => resetCachedConnection()).not.toThrow()
    })
  })
})