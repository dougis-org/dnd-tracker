/**
 * Unit tests for offline queue functionality
 *
 * @jest-environment jsdom
 */

import {
  queueOperation,
  processQueue,
  startQueueProcessing,
  clearQueue,
} from '@/lib/offline/queue';
import { encryptFields, decryptFields } from '@/lib/offline/encryption';

// Mock dependencies
jest.mock('@/lib/offline/indexeddb', () => ({
  putItem: jest.fn(),
  getAllItems: jest.fn(),
  deleteItem: jest.fn(),
  STORES: { QUEUE: 'offline-queue' },
}));

jest.mock('@/lib/offline/encryption', () => ({
  encryptFields: jest.fn(),
  decryptFields: jest.fn(),
  generateKey: jest.fn(),
}));

const mockIndexedDB = require('@/lib/offline/indexeddb');
const mockEncryptFields = encryptFields as jest.MockedFunction<
  typeof encryptFields
>;
const mockDecryptFields = decryptFields as jest.MockedFunction<
  typeof decryptFields
>;
const mockGenerateKey = require('@/lib/offline/encryption')
  .generateKey as jest.MockedFunction<() => Promise<CryptoKey>>;

// Mock fetch for API calls
global.fetch = jest.fn();

describe('offline queue', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockIndexedDB.putItem.mockResolvedValue(undefined);
    mockIndexedDB.getAllItems.mockResolvedValue([]);
    mockIndexedDB.deleteItem.mockResolvedValue(undefined);

    // Setup encryption mocks
    mockEncryptFields.mockImplementation((data: Record<string, unknown>) =>
      Promise.resolve(data)
    );
    mockDecryptFields.mockImplementation((data: Record<string, unknown>) =>
      Promise.resolve(data)
    );
    mockGenerateKey.mockResolvedValue({} as CryptoKey);
  });

  describe('queueOperation', () => {
    it('should queue operation with encryption', async () => {
      const operation = {
        id: 'op1',
        type: 'create' as const,
        endpoint: '/api/test',
        data: { name: 'test', email: 'secret@example.com' },
        timestamp: Date.now(),
      };

      const encryptedData = {
        ...operation.data,
        email: { encrypted: 'data', __encrypted: true },
      };
      mockEncryptFields.mockResolvedValue(encryptedData);

      await queueOperation(operation);

      expect(mockGenerateKey).toHaveBeenCalled();
      expect(mockEncryptFields).toHaveBeenCalledWith(
        operation.data,
        ['email', 'password', 'ssn', 'creditCard'],
        expect.any(Object)
      );

      expect(mockIndexedDB.putItem).toHaveBeenCalledWith('offline-queue', {
        ...operation,
        data: encryptedData,
        status: 'pending',
        retryCount: 0,
      });
    });

    it('should handle encryption failure', async () => {
      mockEncryptFields.mockRejectedValue(new Error('Encryption failed'));

      const operation = {
        id: 'op1',
        type: 'create' as const,
        endpoint: '/api/test',
        data: { name: 'test' },
        timestamp: Date.now(),
      };

      await expect(queueOperation(operation)).rejects.toThrow(
        'Encryption failed'
      );
    });
  });

  describe('processQueue', () => {
    it('should process pending operations successfully', async () => {
      const operations = [
        {
          id: 'op1',
          type: 'create',
          endpoint: '/api/test',
          data: { name: 'test' },
          status: 'pending',
          retryCount: 0,
          timestamp: Date.now(),
        },
      ];

      mockIndexedDB.getAllItems.mockResolvedValue(operations);
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      await processQueue();

      expect(mockDecryptFields).toHaveBeenCalledWith(
        { name: 'test' },
        ['email', 'password', 'ssn', 'creditCard'],
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'test' }),
      });

      expect(mockIndexedDB.deleteItem).toHaveBeenCalledWith(
        'offline-queue',
        'op1'
      );
    });

    it('should handle API failure with retry', async () => {
      const operations = [
        {
          id: 'op1',
          type: 'create',
          endpoint: '/api/test',
          data: { name: 'test' },
          status: 'pending',
          retryCount: 0,
          timestamp: Date.now(),
        },
      ];

      mockIndexedDB.getAllItems.mockResolvedValue(operations);
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await processQueue();

      // Should update operation with retry info
      expect(mockIndexedDB.putItem).toHaveBeenCalledWith('offline-queue', {
        ...operations[0],
        retryCount: 1,
        lastError: 'Network error',
        status: 'pending',
      });
    });

    it('should mark as failed after max retries', async () => {
      const operations = [
        {
          id: 'op1',
          type: 'create',
          endpoint: '/api/test',
          data: { name: 'test' },
          status: 'pending',
          retryCount: 2, // One less than max
          timestamp: Date.now(),
        },
      ];

      mockIndexedDB.getAllItems.mockResolvedValue(operations);
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await processQueue();

      expect(mockIndexedDB.putItem).toHaveBeenCalledWith('offline-queue', {
        ...operations[0],
        retryCount: 3,
        lastError: 'Network error',
        status: 'failed',
      });
    });

    it('should handle different HTTP methods', async () => {
      const operations = [
        {
          id: 'op1',
          type: 'update',
          endpoint: '/api/test/1',
          data: { name: 'updated' },
          status: 'pending',
          retryCount: 0,
          timestamp: Date.now(),
        },
        {
          id: 'op2',
          type: 'delete',
          endpoint: '/api/test/2',
          data: {},
          status: 'pending',
          retryCount: 0,
          timestamp: Date.now(),
        },
      ];

      mockIndexedDB.getAllItems.mockResolvedValue(operations);
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      await processQueue();

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/test/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'updated' }),
      });
      expect(global.fetch).toHaveBeenNthCalledWith(2, '/api/test/2', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: undefined,
      });
    });
  });

  describe('clearQueue', () => {
    it('should clear all operations from queue', async () => {
      const operations = [
        {
          id: 'op1',
          type: 'create',
          endpoint: '/api/test',
          data: {},
          status: 'pending',
          retryCount: 0,
          timestamp: 0,
        },
        {
          id: 'op2',
          type: 'create',
          endpoint: '/api/test',
          data: {},
          status: 'pending',
          retryCount: 0,
          timestamp: 0,
        },
      ];

      mockIndexedDB.getAllItems.mockResolvedValue(operations);

      await clearQueue();

      expect(mockIndexedDB.deleteItem).toHaveBeenCalledTimes(2);
      expect(mockIndexedDB.deleteItem).toHaveBeenCalledWith(
        'offline-queue',
        'op1'
      );
      expect(mockIndexedDB.deleteItem).toHaveBeenCalledWith(
        'offline-queue',
        'op2'
      );
    });
  });

  describe('startQueueProcessing', () => {
    let addEventListenerSpy: jest.SpyInstance;

    beforeEach(() => {
      addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    });

    afterEach(() => {
      addEventListenerSpy.mockRestore();
    });

    it('should add online event listener', () => {
      startQueueProcessing();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'online',
        expect.any(Function)
      );
    });

    it('should process queue when coming online', () => {
      mockIndexedDB.getAllItems.mockResolvedValue([]);
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      startQueueProcessing();

      // Simulate online event
      const onlineHandler = addEventListenerSpy.mock.calls[0][1];
      onlineHandler();

      expect(mockIndexedDB.getAllItems).toHaveBeenCalled();
    });
  });
});
