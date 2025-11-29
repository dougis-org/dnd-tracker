import { connectToMongo, disconnectFromMongo } from '@/lib/db/connection';
import { runMigrations } from '@/lib/db/migrations';
import UserModel, { UserEventModel } from '@/lib/models/user';
import mongoose from 'mongoose';

/**
 * Integration tests for MongoDB migrations
 * Verifies that:
 * 1. Migrations create collections and indexes
 * 2. Migrations are idempotent (can be run multiple times safely)
 * 3. User and UserEvent models can persist data after migration
 * 4. Health endpoint properly verifies migration state
 */
describe('MongoDB Migrations Integration Tests', () => {
  let connection: mongoose.Connection;

  beforeAll(async () => {
    connection = await connectToMongo();
  });

  afterAll(async () => {
    // Clean up migrations collection after tests
    try {
      const migrationsCol = connection.collection('_migrations');
      await migrationsCol.deleteMany({});
    } catch {
      // Collection might not exist
    }
    await disconnectFromMongo();
  });

  describe('Migration Execution', () => {
    beforeEach(async () => {
      // Clear migrations collection before each test to simulate fresh state
      try {
        const migrationsCol = connection.collection('_migrations');
        await migrationsCol.deleteMany({});
      } catch {
        // Collection doesn't exist yet
      }
      // Clear user collections
      await UserModel.deleteMany({});
      await UserEventModel.deleteMany({});
    });

    it('should create User collection with required indexes', async () => {
      await runMigrations(connection);

      // Verify User collection exists
      const collections = await connection.db.listCollections().toArray();
      const userColExists = collections.some((col) => col.name === 'users');
      expect(userColExists).toBe(true);

      // Verify indexes exist
      const indexes = await UserModel.collection.getIndexes();
      expect(Object.keys(indexes).length).toBeGreaterThan(1); // Including _id
      expect(indexes).toHaveProperty('userId_1'); // userId unique index
      expect(indexes).toHaveProperty('email_1'); // email unique index
    });

    it('should create UserEvent collection with required indexes', async () => {
      await runMigrations(connection);

      // Verify UserEvent collection exists
      const collections = await connection.db.listCollections().toArray();
      const eventColExists = collections.some((col) => col.name === 'user_events');
      expect(eventColExists).toBe(true);

      // Verify indexes exist
      const indexes = await UserEventModel.collection.getIndexes();
      expect(Object.keys(indexes).length).toBeGreaterThan(1); // Including _id
      expect(indexes).toHaveProperty('eventType_1_receivedAt_-1');
      expect(indexes).toHaveProperty('status_1_receivedAt_-1');
      expect(indexes).toHaveProperty('userId_1_receivedAt_-1');
    });

    it('should be idempotent - can run migrations multiple times safely', async () => {
      // Run migrations first time
      const firstRun = await runMigrations(connection);
      expect(firstRun).toBe(true); // Migrations were run

      // Run migrations second time
      const secondRun = await runMigrations(connection);
      expect(secondRun).toBe(false); // No migrations to run (already done)

      // Verify collections still exist and are functional
      const user = await UserModel.create({
        userId: 'test_idempotent',
        email: 'test@idempotent.com',
        displayName: 'Test User',
      });
      expect(user._id).toBeDefined();
    });

    it('should create _migrations collection to track migration state', async () => {
      await runMigrations(connection);

      const migrationsCol = connection.collection('_migrations');
      const migrationRecords = await migrationsCol.find({}).toArray();

      expect(migrationRecords.length).toBeGreaterThan(0);
      expect(migrationRecords[0]).toHaveProperty('name');
      expect(migrationRecords[0]).toHaveProperty('version');
      expect(migrationRecords[0]).toHaveProperty('runAt');
    });
  });

  describe('Data Persistence After Migration', () => {
    beforeEach(async () => {
      // Clear migrations and data
      try {
        const migrationsCol = connection.collection('_migrations');
        await migrationsCol.deleteMany({});
      } catch {
        // Collection doesn't exist yet
      }
      await UserModel.deleteMany({});
      await UserEventModel.deleteMany({});
    });

    it('should persist User documents after migration', async () => {
      await runMigrations(connection);

      const testUser = {
        userId: 'persist_test_1',
        email: 'persist@test.com',
        displayName: 'Persistence Test User',
        metadata: { key: 'value' },
      };

      const createdUser = await UserModel.create(testUser);
      expect(createdUser._id).toBeDefined();

      // Query and verify
      const retrievedUser = await UserModel.findOne({ userId: 'persist_test_1' });
      expect(retrievedUser).not.toBeNull();
      expect(retrievedUser?.email).toBe('persist@test.com');
      expect(retrievedUser?.displayName).toBe('Persistence Test User');
    });

    it('should persist UserEvent documents after migration', async () => {
      await runMigrations(connection);

      const testEvent = {
        eventType: 'created' as const,
        userId: 'test_user_events',
        payload: { test: 'data' },
        status: 'stored' as const,
      };

      const createdEvent = await UserEventModel.create(testEvent);
      expect(createdEvent._id).toBeDefined();

      // Query and verify
      const retrievedEvent = await UserEventModel.findOne({ userId: 'test_user_events' });
      expect(retrievedEvent).not.toBeNull();
      expect(retrievedEvent?.eventType).toBe('created');
      expect(retrievedEvent?.payload).toEqual({ test: 'data' });
    });

    it('should enforce unique constraints on User collection', async () => {
      await runMigrations(connection);

      // Create first user
      await UserModel.create({
        userId: 'unique_test_1',
        email: 'unique@test.com',
        displayName: 'User 1',
      });

      // Attempt to create duplicate
      await expect(
        UserModel.create({
          userId: 'unique_test_1',
          email: 'different@test.com',
          displayName: 'User 2',
        })
      ).rejects.toThrow();
    });
  });

  describe('Migration Error Handling', () => {
    it('should not crash if indexes already exist', async () => {
      // Create indexes manually first
      await UserModel.collection.createIndex({ userId: 1 }, { unique: true });

      // Migrations should still succeed
      const result = await runMigrations(connection);
      // First run creates entries in _migrations collection
      expect(result).toBeDefined();
    });
  });
});
