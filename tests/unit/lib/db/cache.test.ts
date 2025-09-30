/**
 * Tests for database connection caching utilities
 */
import { getCachedConnection, resetConnectionCache } from '@/lib/db/cache'

describe('Database Cache', () => {
  const originalGlobal = global.mongoose

  afterEach(() => {
    global.mongoose = originalGlobal
  })

  describe('getCachedConnection', () => {
    it('should initialize cache when not present', () => {
      delete global.mongoose

      const cached = getCachedConnection()

      expect(cached).toEqual({ conn: null, promise: null })
      expect(global.mongoose).toEqual({ conn: null, promise: null })
    })

    it('should return existing cache when present', () => {
      const mockCache = { conn: 'mock-conn', promise: 'mock-promise' }
      global.mongoose = mockCache

      const cached = getCachedConnection()

      expect(cached).toBe(mockCache)
    })
  })

  describe('resetConnectionCache', () => {
    it('should reset cache when present', () => {
      global.mongoose = { conn: 'mock-conn', promise: 'mock-promise' }

      resetConnectionCache()

      expect(global.mongoose.conn).toBeNull()
      expect(global.mongoose.promise).toBeNull()
    })

    it('should handle missing cache gracefully', () => {
      delete global.mongoose

      expect(() => resetConnectionCache()).not.toThrow()
    })
  })
})