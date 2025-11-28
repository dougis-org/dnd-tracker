import { connectToMongo, disconnectFromMongo } from '@/lib/db/connection';
import { runMigrations } from '@/lib/db/migrations';
import mongoose from 'mongoose';

/**
 * Integration tests for the migration CLI script
 * Verifies that migrations can be run programmatically (as the CLI script does)
 * This tests the core behavior that the migrate.js script wraps
 */
describe('Migration Script CLI Integration Tests', () => {
  let connection: mongoose.Connection;

  beforeAll(async () => {
    connection = await connectToMongo();
  });

  afterAll(async () => {
    // Clear migrations collection
    try {
      const migrationsCol = connection.collection('_migrations');
      await migrationsCol.deleteMany({});
    } catch {
      // Collection might not exist
    }
    await disconnectFromMongo();
  });

  describe('Script Execution (via runMigrations)', () => {
    it('should execute migrations without errors', async () => {
      const result = await runMigrations(connection);
      expect(typeof result).toBe('boolean');
    });

    it('should create users collection', async () => {
      const collections = await connection.db.listCollections().toArray();
      const collectionNames = collections.map((c) => c.name);
      expect(collectionNames).toContain('users');
    });

    it('should create user_events collection', async () => {
      const collections = await connection.db.listCollections().toArray();
      const collectionNames = collections.map((c) => c.name);
      expect(collectionNames).toContain('user_events');
    });

    it('should create _migrations tracking collection', async () => {
      const collections = await connection.db.listCollections().toArray();
      const collectionNames = collections.map((c) => c.name);
      expect(collectionNames).toContain('_migrations');
    });

    it('should track migration execution in _migrations collection', async () => {
      const migrationsCol = connection.collection('_migrations');
      const migrations = await migrationsCol.find({}).toArray();
      expect(migrations.length).toBeGreaterThan(0);
      expect(migrations[0]).toHaveProperty('name');
      expect(migrations[0]).toHaveProperty('runAt');
    });
  });
});
