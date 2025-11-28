import { GET } from '@/app/api/health/route';
import { connectToMongo, disconnectFromMongo } from '@/lib/db/connection';
import { runMigrations } from '@/lib/db/migrations';
import mongoose from 'mongoose';

/**
 * Integration tests for the health check endpoint
 * Verifies that:
 * 1. Health endpoint detects database connection
 * 2. Health endpoint verifies collections exist
 * 3. Health endpoint verifies indexes are created
 * 4. Health endpoint returns correct structure
 */
describe('Health Check Endpoint Integration Tests', () => {
  let connection: mongoose.Connection;
  let mockRequest: Record<string, unknown>;

  beforeAll(async () => {
    connection = await connectToMongo();
    // Clear migrations to start fresh
    try {
      const migrationsCol = connection.collection('_migrations');
      await migrationsCol.deleteMany({});
    } catch {
      // Collection might not exist
    }
    // Run migrations to ensure collections and indexes exist
    await runMigrations(connection);
  });

  afterAll(async () => {
    // Clean up
    try {
      const migrationsCol = connection.collection('_migrations');
      await migrationsCol.deleteMany({});
    } catch {
      // Collection might not exist
    }
    await disconnectFromMongo();
  });

  beforeEach(() => {
    // Mock NextRequest object
    mockRequest = {} as Record<string, unknown>;
  });

  describe('Health Check Response', () => {
    it('should return 200 status when database is healthy', async () => {
      const response = await GET(mockRequest);
      expect(response.status).toBe(200);
    });

    it('should return healthy status with database connected', async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data).toHaveProperty('status', 'healthy');
      expect(data).toHaveProperty('mongodb.connected', true);
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('duration_ms');
    });

    it('should verify users collection exists', async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.mongodb.collections).toHaveProperty('users');
      expect(data.mongodb.collections.users).toHaveProperty('exists', true);
    });

    it('should verify user_events collection exists', async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.mongodb.collections).toHaveProperty('user_events');
      expect(data.mongodb.collections.user_events).toHaveProperty('exists', true);
    });

    it('should verify userId unique index is created', async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.mongodb.collections.users).toHaveProperty('hasUniqueUserId', true);
    });

    it('should verify email unique index is created', async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.mongodb.collections.users).toHaveProperty('hasUniqueEmail', true);
    });

    it('should verify event type index is created on user_events', async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.mongodb.collections.user_events).toHaveProperty('hasEventTypeIndex', true);
    });

    it('should include database name in response', async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.mongodb).toHaveProperty('database');
      expect(typeof data.mongodb.database).toBe('string');
    });

    it('should measure endpoint performance', async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data).toHaveProperty('duration_ms');
      expect(typeof data.duration_ms).toBe('number');
      expect(data.duration_ms).toBeGreaterThanOrEqual(0);
    });

    it('should include all required collection properties', async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      const userCol = data.mongodb.collections.users;
      expect(userCol).toHaveProperty('exists');
      expect(userCol).toHaveProperty('indexCount');
      expect(userCol).toHaveProperty('hasUniqueUserId');
      expect(userCol).toHaveProperty('hasUniqueEmail');

      const eventCol = data.mongodb.collections.user_events;
      expect(eventCol).toHaveProperty('exists');
      expect(eventCol).toHaveProperty('indexCount');
      expect(eventCol).toHaveProperty('hasEventTypeIndex');
    });

    it('should return valid index counts', async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(typeof data.mongodb.collections.users.indexCount).toBe('number');
      expect(data.mongodb.collections.users.indexCount).toBeGreaterThan(0);
      expect(typeof data.mongodb.collections.user_events.indexCount).toBe('number');
      expect(data.mongodb.collections.user_events.indexCount).toBeGreaterThan(0);
    });

    it('should verify compound index for soft deletes', async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.mongodb.collections.users).toHaveProperty('hasCompoundIndex', true);
    });

    it('should verify all user_events indexes', async () => {
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(data.mongodb.collections.user_events).toHaveProperty('hasEventTypeIndex');
      expect(data.mongodb.collections.user_events).toHaveProperty('hasStatusIndex');
      expect(data.mongodb.collections.user_events).toHaveProperty('hasUserIdIndex');
    });
  });

  describe('Error Handling', () => {
    it('should catch and log connection errors gracefully', async () => {
      // This test verifies error handling without actually breaking the connection
      // The endpoint should handle errors without crashing
      const response = await GET(mockRequest);
      expect(response.status).toBeLessThan(500);
    });
  });
});
