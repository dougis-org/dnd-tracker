import { connectToDatabase } from '@/lib/mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

describe('Migration Package Security Update', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    process.env.MONGODB_URI = uri;
    process.env.MONGODB_DB_NAME = 'test';
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  describe('Database Connection', () => {
    it('should connect to database successfully', async () => {
      const { connection, db } = await connectToDatabase();
      expect(connection.readyState).toBe(1); // 1 = connected
      expect(db).toBeDefined();
    });

    it('should maintain connection string format compatibility', async () => {
      // Test that the connection still works with existing config
      const { db } = await connectToDatabase();
      expect(db.databaseName).toBe('test');
    });
  });

  describe('Schema Compatibility', () => {
    it('should support existing User schema structure', async () => {
      await connectToDatabase();

      // Test that the user schema can be created (mimicking migration)
      const userSchema = new mongoose.Schema({
        clerkId: {
          type: String,
          required: true,
          unique: true,
          trim: true,
          index: true,
        },
        email: {
          type: String,
          required: true,
          unique: true,
          lowercase: true,
          trim: true,
        },
        username: {
          type: String,
          required: true,
          trim: true,
        },
      });

      const TestUser = mongoose.model('TestUser', userSchema);
      expect(TestUser).toBeDefined();

      // Clean up
      await mongoose.models.TestUser?.deleteMany({});
      delete mongoose.models.TestUser;
    });

    it('should support existing Character schema structure', async () => {
      await connectToDatabase();

      // Test that the character schema can be created (mimicking migration)
      const characterSchema = new mongoose.Schema({
        userId: {
          type: String,
          required: true,
          trim: true,
          index: true,
        },
        name: {
          type: String,
          required: true,
          trim: true,
        },
        race: {
          type: String,
          required: true,
          trim: true,
        },
      });

      const TestCharacter = mongoose.model('TestCharacter', characterSchema);
      expect(TestCharacter).toBeDefined();

      // Clean up
      await mongoose.models.TestCharacter?.deleteMany({});
      delete mongoose.models.TestCharacter;
    });
  });

  describe('Migration Collection Support', () => {
    it('should support migration tracking collection', async () => {
      const { db } = await connectToDatabase();

      // Test creating a migrations collection (what migration tools use)
      const migrationsCollection = db.collection('migrations');

      // Insert a test migration record
      await migrationsCollection.insertOne({
        name: '20250824223000-test-migration',
        createdAt: new Date(),
      });

      const migrations = await migrationsCollection.find({}).toArray();
      expect(migrations).toHaveLength(1);
      expect(migrations[0].name).toBe('20250824223000-test-migration');

      // Clean up
      await migrationsCollection.deleteMany({});
    });
  });

  describe('Package Security Requirements', () => {
    it('should not use vulnerable mongoose version', () => {
      // This test ensures no vulnerable mongoose versions are in use
      const mongooseVersion = require('mongoose/package.json').version;
      const majorVersion = parseInt(mongooseVersion.split('.')[0]);

      // Ensure we're using mongoose 6+ (secure versions: 8.9.5+, 7.8.4+, 6.13.6+)
      expect(majorVersion).toBeGreaterThanOrEqual(6);

      if (majorVersion === 6) {
        const [major, minor, patch] = mongooseVersion.split('.').map(Number);
        expect(major).toBe(6);
        expect(minor).toBeGreaterThanOrEqual(13);
        if (minor === 13) {
          expect(patch).toBeGreaterThanOrEqual(6);
        }
      } else if (majorVersion === 7) {
        const [major, minor, patch] = mongooseVersion.split('.').map(Number);
        expect(major).toBe(7);
        expect(minor).toBeGreaterThanOrEqual(8);
        if (minor === 8) {
          expect(patch).toBeGreaterThanOrEqual(4);
        }
      } else if (majorVersion === 8) {
        const [major, minor, patch] = mongooseVersion.split('.').map(Number);
        expect(major).toBe(8);
        expect(minor).toBeGreaterThanOrEqual(9);
        if (minor === 9) {
          expect(patch).toBeGreaterThanOrEqual(5);
        }
      }
    });

    it('should not have vulnerable yargs-parser in dependency tree', async () => {
      // Check that no vulnerable yargs-parser versions are accessible
      const packageLock = require('../../package-lock.json');

      // Function to recursively check all dependencies
      const checkForVulnerableYargsParser = (dependencies: any) => {
        for (const [name, details] of Object.entries(dependencies || {})) {
          if (name === 'yargs-parser') {
            const version = (details as any).version;
            const [major, minor] = version.split('.').map(Number);

            // Vulnerable version is 2.4.1, fixed versions: 13.1.2+, 15.0.1+, 18.1.1+, 5.0.1+
            if (major === 2 && minor <= 4) {
              throw new Error(
                `Vulnerable yargs-parser version ${version} found in dependency tree`
              );
            }
          }

          // Recursively check nested dependencies
          if ((details as any).dependencies) {
            checkForVulnerableYargsParser((details as any).dependencies);
          }
        }
      };

      expect(() => {
        checkForVulnerableYargsParser(packageLock.dependencies);
      }).not.toThrow();
    });
  });
});
