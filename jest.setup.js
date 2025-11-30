/* eslint-disable @typescript-eslint/no-var-requires,no-undef,no-extend-native */
/* eslint-env node, jest */
/* eslint-disable no-undef */
import '@testing-library/jest-dom';

// Ensure navigator and clipboard exist for user-event and DOM interactions in tests
if (typeof global.navigator === 'undefined') {
  global.navigator = {
    userAgent: 'node.js',
    clipboard: {
      writeText: jest.fn(),
      readText: jest.fn().mockResolvedValue(''),
    },
  };
} else if (!global.navigator.clipboard) {
  global.navigator.clipboard = {
    writeText: jest.fn(),
    readText: jest.fn().mockResolvedValue(''),
  };
}

// IMPORTANT: Do not connect to MongoDB in the global jest worker setup.
// Requiring `mongoose` there triggers nested ESM imports (bson.mjs) before
// the babel-jest transformer has a chance to transpile node_modules. This
// caused Jest to fail parsing `export` tokens in bson.mjs in some worker
// environments. Instead, tests that need a real MongoDB connection should
// call the `connectToMongo` helper in their `beforeAll` and `disconnectFromMongo`
// in `afterAll`. Bringing database connections down to the test level avoids
// unnecessary imports for DOM-only tests and prevents ESM transform errors.

// Example per-test usage:
// import { connectToMongo, disconnectFromMongo } from '@test-helpers/mongo-testcontainers';
// beforeAll(async () => await connectToMongo());
// afterAll(async () => await disconnectFromMongo());

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

// Increase default maximum listeners in test environment to avoid Next.js
// unhandled-rejection extension causing a large number of listeners to be
// registered across test workers which can result in a RangeError/stack overflow.
if (typeof process !== 'undefined' && process?.setMaxListeners) {
  process.setMaxListeners(100);
}

// TextEncoder / TextDecoder are expected to be available in newer runtimes and by some libraries
// Ensure they are available in Node jest environment (some versions of Node/Jest don't expose them)
if (typeof global.TextDecoder === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { TextDecoder } = require('util');
  global.TextDecoder = TextDecoder;
}
if (typeof global.TextEncoder === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { TextEncoder } = require('util');
  global.TextEncoder = TextEncoder;
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
      this._body = init?.body;
    }
    async text() {
      if (typeof this._body === 'string') return this._body;
      return JSON.stringify(this._body);
    }
    async json() {
      return JSON.parse(await this.text());
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

    static json(payload, init = {}) {
      const body = JSON.stringify(payload);
      return new MockResponse(body, init);
    }

    async text() {
      return typeof this.body === 'string'
        ? this.body
        : JSON.stringify(this.body);
    }
    async json() {
      return JSON.parse(await this.text());
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
  // If running integration tests, don't mock Mongoose/bson; we need the real
  // modules to exercise actual DB operations.
  if (process.env.JEST_INTEGRATION === 'true') {
    return;
  }

  mockBson();
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
// Note: We intentionally do not re-mock mongoose here. The full mock for
// mongoose is installed via `jest.setup-node-mocks.js`, which is loaded as
// a pre-test setup file (via `setupFiles`) so it runs before any module
// imports. Re-mocking here would overwrite that richer factory and cause
// inconsistent behavior between tests.

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
 * Setup URL API mocks for canvas/image compression tests
 */
function setupURLAPIMocks() {
  if (typeof global === 'undefined') return;

  // Mock URL.createObjectURL and revokeObjectURL only if not already defined
  if (!global.URL || !global.URL.createObjectURL) {
    global.URL = global.URL || {};
    global.URL.createObjectURL = jest.fn((blob) => `blob:mock-${Math.random().toString(36).substring(2)}`);
    global.URL.revokeObjectURL = jest.fn();
  }

  // Only setup canvas mock if not using JSDOM (which provides real Canvas)
  if (typeof global.HTMLCanvasElement === 'undefined') {
    global.HTMLCanvasElement = class HTMLCanvasElement {
      constructor() {
        this.width = 800;
        this.height = 600;
      }

      toDataURL(type = 'image/png', quality = 0.92) {
        // Return a realistic base64 data URL
        const qualityFactor = Math.max(0.1, quality);
        const sizeMultiplier = Math.ceil(100 * qualityFactor);
        const baseData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        return `data:${type};base64,${baseData.repeat(sizeMultiplier)}`;
      }

      getContext(contextType) {
        return {
          drawImage: jest.fn(),
          fillRect: jest.fn(),
          clearRect: jest.fn(),
          getImageData: jest.fn(() => ({
            data: new Uint8ClampedArray(4),
          })),
          putImageData: jest.fn(),
          createImageData: jest.fn(() => ({
            data: new Uint8ClampedArray(4),
          })),
          setTransform: jest.fn(),
          fillText: jest.fn(),
        };
      }
    };
  }

  // Mock Image constructor to auto-fire onload for avatar compression tests
  if (typeof global.Image === 'function') {
    const OriginalImage = global.Image;
    global.Image = class MockImage extends OriginalImage {
      constructor() {
        super();
        this.width = 800;
        this.height = 600;
        // Auto-fire onload asynchronously to simulate image loading
        setTimeout(() => {
          if (this.onload) {
            this.onload();
          }
        }, 0);
      }
    };
  }
}

setupURLAPIMocks();

/**
 * Create mongoose mock object
 */
// Note: createMongooseMock is inlined in mockMongooseIfServer to avoid jest.mock factory referencing
