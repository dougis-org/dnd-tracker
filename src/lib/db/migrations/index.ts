import mongoose from 'mongoose';
import * as mongodb from 'mongodb';
import UserModel, { UserEventModel } from '../../models/user';
import { logStructured } from '../../utils/logger';

/**
 * Migration interface for versioning and tracking
 */
export interface Migration {
  name: string;
  version: number;
  description: string;
  up: (db: mongoose.Connection) => Promise<void>;
}

/**
 * List of all migrations in order
 */
const migrations: Migration[] = [
  {
    name: 'create-user-and-event-collections',
    version: 1,
    description: 'Create User and UserEvent collections with indexes',
    up: async (_db: mongoose.Connection) => {
      logStructured('info', 'Running migration: create-user-and-event-collections');

      try {
        // Ensure models are registered and indexes are created
        // This will create collections if they don't exist
        await UserModel.collection.createIndex({ userId: 1 }, { unique: true });
        await UserModel.collection.createIndex({ email: 1 }, { unique: true });
        await UserModel.collection.createIndex({ deletedAt: 1, updatedAt: -1 });

        logStructured('info', 'Created User collection indexes');

        // Create UserEvent indexes
        await UserEventModel.collection.createIndex({ eventType: 1, receivedAt: -1 });
        await UserEventModel.collection.createIndex({ status: 1, receivedAt: -1 });
        await UserEventModel.collection.createIndex({ userId: 1, receivedAt: -1 });
        await UserEventModel.collection.createIndex({ receivedAt: 1 });

        logStructured('info', 'Created UserEvent collection indexes');
      } catch (err) {
        logStructured('error', 'Migration failed: create-user-and-event-collections', {
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
    },
  },
];

/**
 * Get or create migrations collection
 */
async function getMigrationsCollection(db: mongoose.Connection): Promise<mongodb.Collection> {
  try {
    return db.collection('_migrations');
  } catch (err) {
    logStructured('error', 'Failed to get migrations collection', {
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

/**
 * Check if migration has been run
 */
async function hasMigrationRun(
  migrationsCol: mongodb.Collection,
  migrationName: string
): Promise<boolean> {
  const record = await migrationsCol.findOne({ name: migrationName });
  return !!record;
}

/**
 * Record migration as completed
 */
async function recordMigration(
  migrationsCol: mongodb.Collection,
  migration: Migration
): Promise<void> {
  await migrationsCol.insertOne({
    name: migration.name,
    version: migration.version,
    description: migration.description,
    runAt: new Date(),
  });
}

/**
 * Run all pending migrations
 * Returns true if any migrations were run, false otherwise
 */
export async function runMigrations(db: mongoose.Connection): Promise<boolean> {
  try {
    logStructured('info', 'Starting migration process');

    const migrationsCol = await getMigrationsCollection(db);

    let migrationsRun = false;

    for (const migration of migrations) {
      const hasRun = await hasMigrationRun(migrationsCol, migration.name);

      if (hasRun) {
        logStructured('info', 'Migration already run, skipping', {
          migration: migration.name,
        });
        continue;
      }

      logStructured('info', 'Running migration', {
        migration: migration.name,
        version: migration.version,
        description: migration.description,
      });

      await migration.up(db);
      await recordMigration(migrationsCol, migration);

      migrationsRun = true;

      logStructured('info', 'Migration completed successfully', {
        migration: migration.name,
      });
    }

    if (!migrationsRun) {
      logStructured('info', 'All migrations already run');
    } else {
      logStructured('info', 'All pending migrations completed successfully');
    }

    return migrationsRun;
  } catch (err) {
    logStructured('error', 'Migration process failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
