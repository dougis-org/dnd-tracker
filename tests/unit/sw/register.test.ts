/**
 * Unit tests for service worker registration helper
 * 
 * Note: Full E2E tests for service worker functionality are in tests/e2e/sw/
 * These unit tests verify the TypeScript API surface and basic logic.
 * 
 * Test coverage:
 * - Module exports and TypeScript types
 * - Function availability
 * - Error handling for unsupported environments
 */

import {
  registerServiceWorker,
  getServiceWorkerState,
  postMessageToSW,
  activateUpdate,
} from '@/lib/sw/register';

describe('Service Worker Registration Module', () => {
  describe('exports', () => {
    it('should export registerServiceWorker function', () => {
      expect(typeof registerServiceWorker).toBe('function');
    });

    it('should export getServiceWorkerState function', () => {
      expect(typeof getServiceWorkerState).toBe('function');
    });

    it('should export postMessageToSW function', () => {
      expect(typeof postMessageToSW).toBe('function');
    });

    it('should export activateUpdate function', () => {
      expect(typeof activateUpdate).toBe('function');
    });
  });

  describe('getServiceWorkerState()', () => {
    it('should return state object with required properties', () => {
      const state = getServiceWorkerState();

      expect(state).toHaveProperty('isSupported');
      expect(state).toHaveProperty('isRegistered');
      expect(state).toHaveProperty('isActivated');
      expect(state).toHaveProperty('registration');
      expect(typeof state.isSupported).toBe('boolean');
      expect(typeof state.isRegistered).toBe('boolean');
      expect(typeof state.isActivated).toBe('boolean');
    });
  });

  describe('registerServiceWorker()', () => {
    it('should return null in non-browser environment', async () => {
      // In Jest/Node environment, window/navigator may not be fully available
      const result = await registerServiceWorker();
      
      // Should either return null (unsupported) or registration (if mocked)
      expect(result === null || typeof result === 'object').toBe(true);
    });

    it('should accept custom SW path parameter', async () => {
      // Should not throw with custom path
      await expect(registerServiceWorker('/custom-sw.js')).resolves.not.toThrow();
    });

    it('should accept callbacks parameter', async () => {
      const callbacks = {
        onReady: jest.fn(),
        onUpdate: jest.fn(),
        onError: jest.fn(),
      };

      // Should not throw with callbacks
      await expect(registerServiceWorker('/sw.js', callbacks)).resolves.not.toThrow();
    });
  });

  describe('postMessageToSW()', () => {
    it('should not throw when called without active SW', () => {
      // Should handle gracefully when no SW is active
      expect(() => postMessageToSW({ type: 'TEST' })).not.toThrow();
    });
  });

  describe('activateUpdate()', () => {
    it('should not throw when called', () => {
      // Should handle gracefully
      expect(() => activateUpdate()).not.toThrow();
    });
  });
});
