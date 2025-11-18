import '@testing-library/jest-dom';

// Setup Web API globals for Next.js server code
setupWebApiGlobals();

// Setup database mocks
setupDatabaseMocks();

// Setup localStorage mock
setupLocalStorage();

/**
 * Setup Web API globals required by Next.js API routes
 */
function setupWebApiGlobals() {
  if (typeof global === 'undefined') return;

  global.Request = global.Request || createMockRequest();
  global.Response = global.Response || createMockResponse();
  global.Headers = global.Headers || createMockHeaders();
  global.Event = global.Event || createMockEvent();
}

/**
 * Create mock Request class
 */
function createMockRequest() {
  return class MockRequest {
    constructor(input, init) {
      this.url = typeof input === 'string' ? input : input?.url;
      this.method = init?.method || 'GET';
      this.headers = new Map(Object.entries(init?.headers || {}));
    }
  };
}

/**
 * Create mock Response class
 */
function createMockResponse() {
  return class MockResponse {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = new Map(Object.entries(init?.headers || {}));
      this.statusText = init?.statusText || '';
      this.type = init?.type || 'basic';
    }

    get ok() {
      return this.status >= 200 && this.status < 300;
    }
  };
}

/**
 * Create mock Headers class
 */
function createMockHeaders() {
  return class MockHeaders {
    constructor(init = {}) {
      this.map = new Map(Object.entries(init));
    }
    get(name) {
      return this.map.get(name);
    }
    set(name, value) {
      this.map.set(name, value);
    }
    entries() {
      return this.map.entries();
    }
  };
}

/**
 * Create mock Event class
 */
function createMockEvent() {
  return class MockEvent {
    constructor(type, options = {}) {
      this.type = type;
      this.bubbles = options.bubbles || false;
      this.cancelable = options.cancelable || false;
    }
  };
}

/**
 * Setup database-related mocks
 */
function setupDatabaseMocks() {
  mockBson();
  mockMongooseIfServer();
}

/**
 * Mock bson ObjectId for tests
 */
function mockBson() {
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
}

/**
 * Mock mongoose only in server environment
 */
function mockMongooseIfServer() {
  if (typeof window === 'undefined') {
    jest.mock('mongoose', () => createMongooseMock());
  }
}

/**
 * Setup localStorage mock for client-side tests
 */
function setupLocalStorage() {
  if (typeof global === 'undefined') return;

  // Create localStorage mock
  const localStorageMock = (() => {
    let store = {};

    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => {
        store[key] = String(value);
      },
      removeItem: (key) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      key: (index) => {
        const keys = Object.keys(store);
        return keys[index] || null;
      },
      get length() {
        return Object.keys(store).length;
      },
    };
  })();

  global.localStorage = localStorageMock;
}

/**
 * Create mongoose mock object
 */
function createMongooseMock() {
  const Schema = jest.fn(function () {
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
}
