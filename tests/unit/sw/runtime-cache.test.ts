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
      const requests = [
        new Request('/static/app.js'),
        new Request('/styles/main.css'),
        new Request('/images/logo.png'),
        new Request('/fonts/icon.woff2'),
      ];

      requests.forEach((request) => {
        expect(shouldUseCacheFirst(request)).toBe(true);
      });
    });

    it('should return false for non-static assets', () => {
      const requests = [
        new Request('/api/users'),
        new Request('/dashboard'),
        new Request('/sync/offline-ops'),
      ];

      requests.forEach((request) => {
        expect(shouldUseCacheFirst(request)).toBe(false);
      });
    });
  });

  describe('shouldUseNetworkFirst', () => {
    it('should return true for API requests', () => {
      const requests = [
        new Request('/api/users'),
        new Request('/api/posts'),
        new Request('/sync/offline-ops'),
      ];

      requests.forEach((request) => {
        expect(shouldUseNetworkFirst(request)).toBe(true);
      });
    });

    it('should return false for non-API requests', () => {
      const requests = [
        new Request('/static/app.js'),
        new Request('/dashboard'),
        new Request('/images/logo.png'),
      ];

      requests.forEach((request) => {
        expect(shouldUseNetworkFirst(request)).toBe(false);
      });
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
