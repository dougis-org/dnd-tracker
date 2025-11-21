import { connectToMongo, disconnectFromMongo } from '@/lib/db/connection';
import UserModel, { UserEventModel, UserDoc } from '@/lib/models/user';

/**
 * Unit tests for User and UserEvent models
 * Tests schema validation, uniqueness, immutability, and soft-delete behavior
 */
describe('User & UserEvent Models (Unit Tests)', () => {
  beforeAll(async () => {
    await connectToMongo();
  });

  afterAll(async () => {
    await disconnectFromMongo();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await UserModel.deleteMany({});
    await UserEventModel.deleteMany({});
  });

  describe('User Model', () => {
    describe('Create User', () => {
      it('should create a user with required fields', async () => {
        const user = await UserModel.create({
          userId: 'user_123',
          email: 'test@example.com',
          displayName: 'Test User',
        });

        expect(user._id).toBeDefined();
        expect(user.userId).toBe('user_123');
        expect(user.email).toBe('test@example.com');
        expect(user.displayName).toBe('Test User');
        expect(user.createdAt).toBeDefined();
        expect(user.updatedAt).toBeDefined();
        expect(user.deletedAt).toBeNull();
      });

      it('should set default metadata to empty object', async () => {
        const user = await UserModel.create({
          userId: 'user_123',
          email: 'test@example.com',
          displayName: 'Test User',
        });

        expect(user.metadata).toEqual({});
      });

      it('should accept and store metadata', async () => {
        const metadata = { role: 'player', level: 5 };
        const user = await UserModel.create({
          userId: 'user_123',
          email: 'test@example.com',
          displayName: 'Test User',
          metadata,
        });

        expect(user.metadata).toEqual(metadata);
      });

      it('should enforce userId uniqueness', async () => {
        await UserModel.create({
          userId: 'user_123',
          email: 'test1@example.com',
          displayName: 'Test User 1',
        });

        await expect(
          UserModel.create({
            userId: 'user_123',
            email: 'test2@example.com',
            displayName: 'Test User 2',
          })
        ).rejects.toThrow(/duplicate key/);
      });

      it('should enforce email uniqueness (case-insensitive)', async () => {
        await UserModel.create({
          userId: 'user_1',
          email: 'test@example.com',
          displayName: 'Test User 1',
        });

        await expect(
          UserModel.create({
            userId: 'user_2',
            email: 'TEST@EXAMPLE.COM',
            displayName: 'Test User 2',
          })
        ).rejects.toThrow(/duplicate key/);
      });

      it('should lowercase email on creation', async () => {
        const user = await UserModel.create({
          userId: 'user_123',
          email: 'Test@EXAMPLE.COM',
          displayName: 'Test User',
        });

        expect(user.email).toBe('test@example.com');
      });

      it('should set createdAt and updatedAt timestamps', async () => {
        const beforeCreate = new Date();
        const user = await UserModel.create({
          userId: 'user_123',
          email: 'test@example.com',
          displayName: 'Test User',
        });
        const afterCreate = new Date();

        expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(
          beforeCreate.getTime()
        );
        expect(user.createdAt.getTime()).toBeLessThanOrEqual(
          afterCreate.getTime()
        );
        expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
          beforeCreate.getTime()
        );
        expect(user.updatedAt.getTime()).toBeLessThanOrEqual(
          afterCreate.getTime()
        );
      });
    });

    describe('Update User', () => {
      let user: UserDoc;

      beforeEach(async () => {
        user = await UserModel.create({
          userId: 'user_123',
          email: 'test@example.com',
          displayName: 'Test User',
        });
      });

      it('should allow updating displayName', async () => {
        user.displayName = 'Updated User';
        const updated = await user.save();

        expect(updated.displayName).toBe('Updated User');
      });

      it('should allow updating metadata', async () => {
        user.metadata = { role: 'dm', level: 10 };
        const updated = await user.save();

        expect(updated.metadata).toEqual({ role: 'dm', level: 10 });
      });

      it('should prevent userId modification (immutable)', async () => {
        expect(() => {
          user.userId = 'user_999';
        }).toThrow();
      });

      it('should prevent email modification (immutable)', async () => {
        expect(() => {
          user.email = 'newemail@example.com';
        }).toThrow();
      });

      it('should update updatedAt on modification', async () => {
        const originalUpdatedAt = user.updatedAt;
        await new Promise((resolve) => setTimeout(resolve, 10));
        user.displayName = 'Updated';
        const updated = await user.save();

        expect(updated.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime()
        );
      });
    });

    describe('Soft Delete', () => {
      let user: UserDoc;

      beforeEach(async () => {
        user = await UserModel.create({
          userId: 'user_123',
          email: 'test@example.com',
          displayName: 'Test User',
        });
      });

      it('should set deletedAt timestamp on soft-delete', async () => {
        const beforeDelete = new Date();
        user.deletedAt = new Date();
        const deleted = await user.save();
        const afterDelete = new Date();

        expect(deleted.deletedAt).toBeDefined();
        expect(deleted.deletedAt!.getTime()).toBeGreaterThanOrEqual(
          beforeDelete.getTime()
        );
        expect(deleted.deletedAt!.getTime()).toBeLessThanOrEqual(
          afterDelete.getTime()
        );
      });

      it('should exclude soft-deleted users from default queries', async () => {
        user.deletedAt = new Date();
        await user.save();

        const activeUsers = await UserModel.find({ deletedAt: null });
        expect(activeUsers).toHaveLength(0);
      });

      it('should allow querying deleted users explicitly', async () => {
        user.deletedAt = new Date();
        await user.save();

        const allUsers = await UserModel.find({});
        expect(allUsers).toHaveLength(1);
        expect(allUsers[0].deletedAt).toBeDefined();
      });
    });

    describe('Indexes', () => {
      it('should have unique index on userId', async () => {
        const indexes = await UserModel.collection.getIndexes();
        const userIdIndex = Object.values(indexes).find(
          (idx) => idx.key && idx.key.userId === 1 && idx.unique === true
        );
        expect(userIdIndex).toBeDefined();
      });

      it('should have unique index on email', async () => {
        const indexes = await UserModel.collection.getIndexes();
        const emailIndex = Object.values(indexes).find(
          (idx) => idx.key && idx.key.email === 1 && idx.unique === true
        );
        expect(emailIndex).toBeDefined();
      });

      it('should have index on updatedAt', async () => {
        const indexes = await UserModel.collection.getIndexes();
        const updatedAtIndex = Object.values(indexes).find(
          (idx) => idx.key && idx.key.updatedAt === -1
        );
        expect(updatedAtIndex).toBeDefined();
      });

      it('should have compound index on deletedAt + updatedAt', async () => {
        const indexes = await UserModel.collection.getIndexes();
        const compoundIndex = Object.values(indexes).find(
          (idx) =>
            idx.key && idx.key.deletedAt === 1 && idx.key.updatedAt === -1
        );
        expect(compoundIndex).toBeDefined();
      });
    });
  });

  describe('UserEvent Model', () => {
    describe('Create Event', () => {
      it('should create an event with required fields', async () => {
        const payload = { userId: 'user_123', email: 'test@example.com' };
        const event = await UserEventModel.create({
          eventType: 'created',
          userId: 'user_123',
          payload,
        });

        expect(event._id).toBeDefined();
        expect(event.eventType).toBe('created');
        expect(event.userId).toBe('user_123');
        expect(event.payload).toEqual(payload);
        expect(event.receivedAt).toBeDefined();
        expect(event.status).toBe('stored');
      });

      it('should set default status to stored', async () => {
        const event = await UserEventModel.create({
          eventType: 'created',
          payload: {},
        });

        expect(event.status).toBe('stored');
      });

      it('should accept optional eventId', async () => {
        const event = await UserEventModel.create({
          eventId: 'evt_123',
          eventType: 'created',
          payload: {},
        });

        expect(event.eventId).toBe('evt_123');
      });

      it('should enforce eventType enum', async () => {
        await expect(
          UserEventModel.create({
            eventType: 'invalid_type',
            payload: {},
          })
        ).rejects.toThrow();
      });

      it('should accept all valid event types', async () => {
        for (const eventType of ['created', 'updated', 'deleted']) {
          const event = await UserEventModel.create({
            eventType: eventType as 'created' | 'updated' | 'deleted',
            payload: {},
          });
          expect(event.eventType).toBe(eventType);
        }
      });

      it('should store payload as-is (no mutation)', async () => {
        const payload = {
          userId: 'user_123',
          email: 'test@example.com',
          displayName: 'Test',
          metadata: { role: 'player' },
        };
        const event = await UserEventModel.create({
          eventType: 'created',
          payload,
        });

        expect(event.payload).toEqual(payload);
      });

      it('should accept optional source, signature, and signatureValid', async () => {
        const event = await UserEventModel.create({
          eventType: 'created',
          payload: {},
          source: 'clerk',
          signature: 'sha256=abc123',
          signatureValid: true,
        });

        expect(event.source).toBe('clerk');
        expect(event.signature).toBe('sha256=abc123');
        expect(event.signatureValid).toBe(true);
      });
    });

    describe('Status Transitions', () => {
      it('should allow status to be marked as processed', async () => {
        const event = await UserEventModel.create({
          eventType: 'created',
          payload: {},
        });

        event.status = 'processed';
        event.processedAt = new Date();
        const updated = await event.save();

        expect(updated.status).toBe('processed');
        expect(updated.processedAt).toBeDefined();
      });

      it('should allow status to be marked as failed', async () => {
        const event = await UserEventModel.create({
          eventType: 'created',
          payload: {},
        });

        event.status = 'failed';
        event.error = 'Database connection timeout';
        const updated = await event.save();

        expect(updated.status).toBe('failed');
        expect(updated.error).toBe('Database connection timeout');
      });

      it('should enforce status enum', async () => {
        await expect(
          UserEventModel.create({
            eventType: 'created',
            payload: {},
            status: 'invalid_status' as unknown,
          })
        ).rejects.toThrow();
      });
    });

    describe('Indexes', () => {
      it('should have index on eventType', async () => {
        const indexes = await UserEventModel.collection.getIndexes();
        const eventTypeIndex = Object.values(indexes).find(
          (idx) => idx.key && idx.key.eventType === 1
        );
        expect(eventTypeIndex).toBeDefined();
      });

      it('should have index on receivedAt', async () => {
        const indexes = await UserEventModel.collection.getIndexes();
        const receivedAtIndex = Object.values(indexes).find(
          (idx) => idx.key && idx.key.receivedAt === -1
        );
        expect(receivedAtIndex).toBeDefined();
      });

      it('should have compound index on eventType + receivedAt', async () => {
        const indexes = await UserEventModel.collection.getIndexes();
        const compoundIndex = Object.values(indexes).find(
          (idx) =>
            idx.key && idx.key.eventType === 1 && idx.key.receivedAt === -1
        );
        expect(compoundIndex).toBeDefined();
      });

      it('should have compound index on status + receivedAt', async () => {
        const indexes = await UserEventModel.collection.getIndexes();
        const compoundIndex = Object.values(indexes).find(
          (idx) => idx.key && idx.key.status === 1 && idx.key.receivedAt === -1
        );
        expect(compoundIndex).toBeDefined();
      });

      it('should have compound index on userId + receivedAt', async () => {
        const indexes = await UserEventModel.collection.getIndexes();
        const compoundIndex = Object.values(indexes).find(
          (idx) => idx.key && idx.key.userId === 1 && idx.key.receivedAt === -1
        );
        expect(compoundIndex).toBeDefined();
      });
    });
  });
});
