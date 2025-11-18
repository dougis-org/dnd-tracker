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
  encryptFields: jest.fn((data) => Promise.resolve(data)),
  decryptFields: jest.fn((data) => Promise.resolve(data)),
  generateKey: jest.fn(() => Promise.resolve('mock-key')),
}));

import {
  putItem,
  getAllItems,
  deleteItem,
} from '../../../src/lib/offline/indexeddb';

/**
 * Create a test operation
 */
function createTestOperation(
  id: string,
  type: 'create' | 'update' | 'delete' = 'create',
  endpoint: string = '/api/users',
  data: Record<string, unknown> = {}
) {
  return {
    id,
    type,
    endpoint,
    data: { name: 'User 1', ...data },
    timestamp: Date.now(),
  };
}

/**
 * Setup successful API responses
 */
function setupSuccessfulApiResponse() {
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
  });
}

/**
 * Setup offline navigator state
 */
function setOfflineState(isOffline: boolean) {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: !isOffline,
  });
}

describe('Offline Queue Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
    setupSuccessfulApiResponse();
  });

  afterEach(async () => {
    await clearQueue();
  });

  it('should queue operations while offline and process them when online', async () => {
    (getAllItems as jest.Mock).mockResolvedValue([]);
    setOfflineState(true);

    const operation = createTestOperation('test-op-1', 'create', '/api/users', {
      name: 'John Doe',
      email: 'john@example.com',
    });

    await queueOperation(operation);

    expect(putItem).toHaveBeenCalledWith(
      'queue',
      expect.objectContaining({
        id: 'test-op-1',
        type: 'create',
        status: 'pending',
        retryCount: 0,
      })
    );

    setOfflineState(false);
    (getAllItems as jest.Mock).mockResolvedValue([
      { ...operation, status: 'pending', retryCount: 0 },
    ]);

    await processQueue();

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/users',
      expect.objectContaining({ method: 'POST' })
    );
    expect(deleteItem).toHaveBeenCalledWith('queue', 'test-op-1');
  });

  it('should handle multiple queued operations', async () => {
    (getAllItems as jest.Mock).mockResolvedValue([]);

    const op1 = createTestOperation('op-1', 'create', '/api/users', {
      name: 'User 1',
    });
    const op2 = createTestOperation('op-2', 'update', '/api/users/123', {
      name: 'Updated User',
    });

    await queueOperation(op1);
    await queueOperation(op2);

    (getAllItems as jest.Mock).mockResolvedValue([
      { ...op1, status: 'pending', retryCount: 0 },
      { ...op2, status: 'pending', retryCount: 0 },
    ]);

    await processQueue();

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(deleteItem).toHaveBeenCalledTimes(2);
  });

  it('should retry failed operations with exponential backoff', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

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

    expect(putItem).toHaveBeenCalledWith(
      'queue',
      expect.objectContaining({
        id: 'failed-op',
        status: 'pending',
        retryCount: 1,
        lastError: 'Network error',
      })
    );
    expect(deleteItem).not.toHaveBeenCalled();
  });

  it('should mark operations as failed after max retries', async () => {
    mockFetch.mockRejectedValue(new Error('Persistent network error'));

    (getAllItems as jest.Mock).mockResolvedValue([
      {
        id: 'max-retries-op',
        type: 'create',
        endpoint: '/api/users',
        data: { name: 'Max Retries User' },
        timestamp: Date.now(),
        status: 'pending',
        retryCount: 2,
      },
    ]);

    await processQueue();

    expect(putItem).toHaveBeenCalledWith(
      'queue',
      expect.objectContaining({
        id: 'max-retries-op',
        status: 'failed',
        retryCount: 3,
      })
    );
  });

  it('should start processing queue when online event fires', async () => {
    (getAllItems as jest.Mock).mockResolvedValue([]);

    startQueueProcessing();
    setOfflineState(true);

    const operation = createTestOperation('online-event-op', 'create', '/api/posts', {
      title: 'Test Post',
    });

    await queueOperation(operation);

    (getAllItems as jest.Mock).mockResolvedValue([
      { ...operation, status: 'pending', retryCount: 0 },
    ]);

    setOfflineState(false);
    window.dispatchEvent(new Event('online'));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/posts',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('should handle DELETE operations correctly', async () => {
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

    expect(mockFetch).toHaveBeenCalledWith('/api/users/123', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: undefined,
    });

    expect(deleteItem).toHaveBeenCalledWith('queue', 'delete-op');
  });
});
