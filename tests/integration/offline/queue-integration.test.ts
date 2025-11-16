/**
 * Integration test for offline queue processing
 *
 * Tests the complete flow of queuing operations while offline,
 * then processing them when connectivity is restored.
 */

import {
  queueOperation,
  processQueue,
  startQueueProcessing,
  clearQueue,
} from '../../../src/lib/offline/queue';

// Mock fetch for API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock IndexedDB operations
jest.mock('../../../src/lib/offline/indexeddb', () => ({
  putItem: jest.fn(),
  getAllItems: jest.fn(),
  deleteItem: jest.fn(),
  STORES: {
    QUEUE: 'queue',
  },
}));

// Mock encryption functions
jest.mock('../../../src/lib/offline/encryption', () => ({
  encryptFields: jest.fn((data) => Promise.resolve(data)), // Return data as-is for simplicity
  decryptFields: jest.fn((data) => Promise.resolve(data)), // Return data as-is for simplicity
  generateKey: jest.fn(() => Promise.resolve('mock-key')),
}));

import {
  putItem,
  getAllItems,
  deleteItem,
} from '../../../src/lib/offline/indexeddb';

describe('Offline Queue Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    // Mock successful API responses
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
    });
  });

  afterEach(async () => {
    await clearQueue();
  });

  it('should queue operations while offline and process them when online', async () => {
    // Mock IndexedDB to return empty initially
    (getAllItems as jest.Mock).mockResolvedValue([]);

    // Simulate offline state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    // Queue an operation while offline
    const operation = {
      id: 'test-op-1',
      type: 'create' as const,
      endpoint: '/api/users',
      data: { name: 'John Doe', email: 'john@example.com' },
      timestamp: Date.now(),
    };

    await queueOperation(operation);

    // Verify operation was stored in IndexedDB
    expect(putItem).toHaveBeenCalledWith(
      'queue',
      expect.objectContaining({
        id: 'test-op-1',
        type: 'create',
        endpoint: '/api/users',
        status: 'pending',
        retryCount: 0,
      })
    );

    // Simulate coming back online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    // Mock IndexedDB to return the queued operation
    (getAllItems as jest.Mock).mockResolvedValue([
      {
        ...operation,
        status: 'pending',
        retryCount: 0,
      },
    ]);

    // Process the queue
    await processQueue();

    // Verify the API call was made with correct data
    expect(mockFetch).toHaveBeenCalledWith('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' }),
    });

    // Verify operation was removed from queue after successful processing
    expect(deleteItem).toHaveBeenCalledWith('queue', 'test-op-1');
  });

  it('should handle multiple queued operations', async () => {
    // Mock IndexedDB to return empty initially
    (getAllItems as jest.Mock).mockResolvedValue([]);

    // Simulate offline state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    // Queue multiple operations
    const op1 = {
      id: 'op-1',
      type: 'create' as const,
      endpoint: '/api/users',
      data: { name: 'User 1' },
      timestamp: Date.now(),
    };

    const op2 = {
      id: 'op-2',
      type: 'update' as const,
      endpoint: '/api/users/123',
      data: { name: 'Updated User' },
      timestamp: Date.now(),
    };

    await queueOperation(op1);
    await queueOperation(op2);

    // Simulate coming back online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    // Mock IndexedDB to return both queued operations
    (getAllItems as jest.Mock).mockResolvedValue([
      { ...op1, status: 'pending', retryCount: 0 },
      { ...op2, status: 'pending', retryCount: 0 },
    ]);

    // Process the queue
    await processQueue();

    // Verify both API calls were made
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/users',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'User 1' }),
      })
    );
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/users/123',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated User' }),
      })
    );

    // Verify both operations were removed from queue
    expect(deleteItem).toHaveBeenCalledTimes(2);
  });

  it('should retry failed operations with exponential backoff', async () => {
    // Mock API failure
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    // Mock IndexedDB operations
    (getAllItems as jest.Mock).mockResolvedValue([
      {
        id: 'failed-op',
        type: 'create',
        endpoint: '/api/users',
        data: { name: 'Failing User' },
        timestamp: Date.now(),
        status: 'pending',
        retryCount: 0,
      },
    ]);

    await processQueue();

    // Verify operation was updated with retry count and error
    expect(putItem).toHaveBeenCalledWith(
      'queue',
      expect.objectContaining({
        id: 'failed-op',
        status: 'pending', // Still pending for retry
        retryCount: 1,
        lastError: 'Network error',
      })
    );

    // Verify operation was not deleted
    expect(deleteItem).not.toHaveBeenCalled();
  });

  it('should mark operations as failed after max retries', async () => {
    // Mock persistent API failure
    mockFetch.mockRejectedValue(new Error('Persistent network error'));

    // Mock operation that has already been retried 2 times
    (getAllItems as jest.Mock).mockResolvedValue([
      {
        id: 'max-retries-op',
        type: 'create',
        endpoint: '/api/users',
        data: { name: 'Max Retries User' },
        timestamp: Date.now(),
        status: 'pending',
        retryCount: 2, // One more retry will exceed limit
      },
    ]);

    await processQueue();

    // Verify operation was marked as failed
    expect(putItem).toHaveBeenCalledWith(
      'queue',
      expect.objectContaining({
        id: 'max-retries-op',
        status: 'failed',
        retryCount: 3,
        lastError: 'Persistent network error',
      })
    );

    // Verify operation was not deleted
    expect(deleteItem).not.toHaveBeenCalled();
  });

  it('should start processing queue when online event fires', async () => {
    // Mock empty queue initially
    (getAllItems as jest.Mock).mockResolvedValue([]);

    // Start queue processing
    startQueueProcessing();

    // Simulate offline initially
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    // Queue an operation while offline
    const operation = {
      id: 'online-event-op',
      type: 'create' as const,
      endpoint: '/api/posts',
      data: { title: 'Test Post' },
      timestamp: Date.now(),
    };

    await queueOperation(operation);

    // Mock queue now has the operation
    (getAllItems as jest.Mock).mockResolvedValue([
      { ...operation, status: 'pending', retryCount: 0 },
    ]);

    // Simulate coming back online (triggers online event)
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    window.dispatchEvent(new Event('online'));

    // Wait for async processing
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Verify the API call was made
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/posts',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'Test Post' }),
      })
    );
  });

  it('should handle DELETE operations correctly', async () => {
    // Mock IndexedDB to return a delete operation
    (getAllItems as jest.Mock).mockResolvedValue([
      {
        id: 'delete-op',
        type: 'delete',
        endpoint: '/api/users/123',
        data: {},
        timestamp: Date.now(),
        status: 'pending',
        retryCount: 0,
      },
    ]);

    await processQueue();

    // Verify DELETE request was made without body
    expect(mockFetch).toHaveBeenCalledWith('/api/users/123', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: undefined,
    });

    // Verify operation was removed from queue
    expect(deleteItem).toHaveBeenCalledWith('queue', 'delete-op');
  });
});
