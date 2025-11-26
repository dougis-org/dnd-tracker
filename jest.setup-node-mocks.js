/* eslint-env node, jest */
/* eslint no-redeclare: "off" */
/* global jest, process */

// CommonJS pre-test mocks to load before any module imports

// This ensures mongoose/bson are mocked so Jest doesn't attempt to parse ESM .mjs files
// Use CommonJS 'require' & module.exports for safety

// jest-mock no longer required here; jest globals are available

// Ensure env var exists so connectToMongo doesn't throw when called (we mock mongoose.connect)
process.env.MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/dnd-tracker-test';
process.env.MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'dnd-tracker-test';

// Mock bson minimal API used by the code
jest.mock('bson', () => ({
  ObjectId: class MockObjectId {
    constructor() {
      this.id = Math.random().toString(36).substring(2, 15);
    }
    toHexString() {
      return this.id;
    }
  },
}));

// Shared document storage across model instances
const modelDocs = {};

// Mock mongoose minimal API used by the code
jest.mock('mongoose', () => {
  const Schema = jest.fn(function Schema() {
    return {
      methods: {},
      statics: {},
      index: jest.fn(),
      pre: jest.fn(),
      post: jest.fn(),
    };
  });
  Schema.Types = {
    ObjectId: jest.fn(),
    Mixed: jest.fn(),
    String,
    Number,
    Boolean,
    Date,
    Array,
  };

  const mockModel = jest.fn((name) => {
    const docs = modelDocs[name] || (modelDocs[name] = []);

    return {
      find: jest.fn(async (filter = {}) => {
        if (Object.keys(filter).length === 0) return docs;
        if ('deletedAt' in filter) {
          return docs.filter((d) =>
            filter.deletedAt === null ? d.deletedAt === null : d.deletedAt !== null
          );
        }
        return docs.filter((d) =>
          Object.entries(filter).every(([k, v]) => d[k] === v)
        );
      }),
      findById: jest.fn(async (id) => docs.find((d) => d._id === id) || null),
      findOne: jest.fn(async (filter = {}) =>
        docs.find((d) => Object.entries(filter).every(([k, v]) => d[k] === v)) || null
      ),
      create: jest.fn(async (payload) => {
        // Check User uniqueness
        if (name === 'User') {
          if (payload.userId && docs.find((d) => d.userId === payload.userId)) {
            const err = new Error('duplicate key');
            err.code = 11000;
            err.keyPattern = { userId: 1 };
            throw err;
          }
          if (payload.email && docs.find((d) => String(d.email).toLowerCase() === String(payload.email).toLowerCase())) {
            const err = new Error('duplicate key');
            err.code = 11000;
            err.keyPattern = { email: 1 };
            throw err;
          }
        }

        // Validate UserEvent
        if (name === 'UserEvent') {
          const allowedEventTypes = ['created', 'updated', 'deleted'];
          const allowedStatuses = ['stored', 'processed', 'failed'];
          if (!payload.eventType || !allowedEventTypes.includes(payload.eventType)) {
            const err = new Error('validation failed');
            err.name = 'ValidationError';
            throw err;
          }
          if (payload.status && !allowedStatuses.includes(payload.status)) {
            const err = new Error('validation failed');
            err.name = 'ValidationError';
            throw err;
          }
        }

        const normalizedEmail = payload.email ? String(payload.email).toLowerCase() : payload.email;
        const doc = Object.assign({}, {
          _id: Math.random().toString(36).slice(2),
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: payload.deletedAt || null,
        }, payload, {
          email: normalizedEmail,
          metadata: payload.metadata === undefined ? {} : payload.metadata,
          save: jest.fn(async function save() {
            this.updatedAt = new Date();
            return this;
          }),
        });

        // Apply User behavior
        if (name === 'User') {
          if ('userId' in doc) {
            Object.defineProperty(doc, 'userId', {
              writable: false,
              enumerable: true,
            });
          }
          if ('email' in doc) {
            Object.defineProperty(doc, 'email', {
              writable: false,
              enumerable: true,
            });
          }
        }

        // Set UserEvent defaults
        if (name === 'UserEvent') {
          if (!doc.receivedAt) doc.receivedAt = new Date();
          if (!doc.status) doc.status = 'stored';
        }

        docs.push(doc);
        return doc;
      }),
      updateOne: jest.fn(async () => ({ matchedCount: 1, modifiedCount: 1 })),
      deleteOne: jest.fn(async () => ({ deletedCount: 1 })),
      deleteMany: jest.fn(async () => {
        const count = docs.length;
        docs.length = 0;
        return { deletedCount: count, acknowledged: true };
      }),
      findAllByOwner: jest.fn(),
      _name: name,
      collection: {
        getIndexes: async () => ({
          userId_1: { key: { userId: 1 }, unique: true },
          email_1: { key: { email: 1 }, unique: true },
          'updatedAt_-1': { key: { updatedAt: -1 } },
          'deletedAt_1_updatedAt_-1': { key: { deletedAt: 1, updatedAt: -1 } },
          eventType_1: { key: { eventType: 1 } },
          'receivedAt_-1': { key: { receivedAt: -1 } },
          'eventType_1_receivedAt_-1': { key: { eventType: 1, receivedAt: -1 } },
          'status_1_receivedAt_-1': { key: { status: 1, receivedAt: -1 } },
          'userId_1_receivedAt_-1': { key: { userId: 1, receivedAt: -1 } },
        }),
      },
    };
  });

  const connection = { readyState: 0 };

  function mockConnect() {
    connection.readyState = 1;
    return Promise.resolve(connection);
  }

  function mockDisconnect() {
    connection.readyState = 0;
    return Promise.resolve();
  }

  return {
    Schema,
    Document: jest.fn(),
    model: mockModel,
    Types: {
      ObjectId: jest.fn((id) => id),
    },
    connect: mockConnect,
    disconnect: mockDisconnect,
    connection,
  };
});
