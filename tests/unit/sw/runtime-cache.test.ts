import {
  CACHE_NAMES,
  shouldUseCacheFirst,
  shouldUseNetworkFirst,
  isCacheable,
} from '@/lib/sw/strategies';

// Mock caches API
const mockCaches = {
  open: jest.fn(),
  match: jest.fn(),
  keys: jest.fn(),
  delete: jest.fn(),
};

Object.defineProperty(window, 'caches', {
  value: mockCaches,
  writable: true,
});

// Test data
const STATIC_ASSET_REQUESTS = [
  new Request('/static/app.js'),
  new Request('/styles/main.css'),
  new Request('/images/logo.png'),
  new Request('/fonts/icon.woff2'),
];

const NON_STATIC_REQUESTS = [
  new Request('/api/users'),
  new Request('/dashboard'),
  new Request('/sync/offline-ops'),
];

const API_REQUESTS = [
  new Request('/api/users'),
  new Request('/api/posts'),
  new Request('/sync/offline-ops'),
];

const NON_API_REQUESTS = [
  new Request('/static/app.js'),
  new Request('/dashboard'),
  new Request('/images/logo.png'),
];

/**
 * Helper to test multiple requests against a condition
 */
function testRequestCondition(requests: Request[], condition: (r: Request) => boolean, expected: boolean) {
  requests.forEach((request) => {
    expect(condition(request)).toBe(expected);
  });
}

describe('Service Worker Strategies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cache Names', () => {
    it('should have correct cache names', () => {
      expect(CACHE_NAMES.PRECACHE).toBe('precache-v1');
      expect(CACHE_NAMES.RUNTIME).toBe('runtime-v1');
      expect(CACHE_NAMES.QUEUE).toBe('queue-v1');
    });
  });

  describe('shouldUseCacheFirst', () => {
    it('should return true for static assets', () => {
      testRequestCondition(STATIC_ASSET_REQUESTS, shouldUseCacheFirst, true);
    });

    it('should return false for non-static assets', () => {
      testRequestCondition(NON_STATIC_REQUESTS, shouldUseCacheFirst, false);
    });
  });

  describe('shouldUseNetworkFirst', () => {
    it('should return true for API requests', () => {
      testRequestCondition(API_REQUESTS, shouldUseNetworkFirst, true);
    });

    it('should return false for non-API requests', () => {
      testRequestCondition(NON_API_REQUESTS, shouldUseNetworkFirst, false);
    });
  });

  describe('isCacheable', () => {
    it('should return true for successful basic responses', () => {
      const response = new Response('OK', { status: 200 });
      expect(isCacheable(response)).toBe(true);
    });

    it('should return false for error responses', () => {
      const response = new Response('Not Found', { status: 404 });
      expect(isCacheable(response)).toBe(false);
    });

    it('should return false for non-basic responses', () => {
      // Create a response with cors type
      const response = Object.assign(new Response('OK', { status: 200 }), {
        type: 'cors',
      });
      expect(isCacheable(response)).toBe(false);
    });
  });
});
