import '@testing-library/jest-dom';

// Setup Web API globals for Next.js server code
if (typeof global !== 'undefined') {
  // Mock Web API Request/Response for Next.js API routes
  global.Request = global.Request || class MockRequest {
    constructor(input, init) {
      this.url = typeof input === 'string' ? input : input?.url;
      this.method = init?.method || 'GET';
      this.headers = new Map(Object.entries(init?.headers || {}));
    }
  };
  
  global.Response = global.Response || class MockResponse {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = new Map(Object.entries(init?.headers || {}));
      this.statusText = init?.statusText || '';
    }
  };

  global.Headers = global.Headers || class MockHeaders {
    constructor(init = {}) {
      this.map = new Map(Object.entries(init));
    }
    get(name) { return this.map.get(name); }
    set(name, value) { this.map.set(name, value); }
    entries() { return this.map.entries(); }
  };
}

// Mock bson ObjectId for tests
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

// Mock mongoose to prevent connection attempts in tests
// Only needed when not in browser environment
if (typeof window === 'undefined') {
  jest.mock('mongoose', () => {
    const Schema = jest.fn(function() {
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
      String: String,
      Number: Number,
      Boolean: Boolean,
      Date: Date,
      Array: Array,
    };
    
    const mockModel = jest.fn((...args) => ({
      find: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      findAllByOwner: jest.fn(),
      _name: args[0],
    }));
    
    return {
      Schema,
      Document: jest.fn(),
      model: mockModel,
      Types: {
        ObjectId: jest.fn((id) => id),
      },
      connect: jest.fn(),
    };
  });
}
