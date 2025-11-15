/**
 * IndexedDB Wrapper Utilities
 *
 * Provides lightweight wrapper around IndexedDB for offline queue and event log storage.
 * Uses promise-based API for async operations.
 *
 * @module offline/indexeddb
 */

// Browser check to ensure IndexedDB is available
if (typeof window !== 'undefined' && !window.indexedDB) {
  console.warn('[IndexedDB] IndexedDB not supported in this browser');
}

const DB_NAME = 'dnd-tracker-offline';
const DB_VERSION = 1;

// Store names
export const STORES = {
  QUEUE: 'offline-queue',
  EVENT_LOG: 'event-log',
} as const;

/**
 * Generic helper for IndexedDB requests
 */
function executeRequest<T>(request: IDBRequest): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error(`IndexedDB error: ${request.error?.message}`));
  });
}

/**
 * Open IndexedDB connection
 */
export async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create offline queue store
      if (!db.objectStoreNames.contains(STORES.QUEUE)) {
        const queueStore = db.createObjectStore(STORES.QUEUE, {
          keyPath: 'id',
          autoIncrement: false,
        });
        queueStore.createIndex('status', 'status', { unique: false });
        queueStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Create event log store
      if (!db.objectStoreNames.contains(STORES.EVENT_LOG)) {
        const logStore = db.createObjectStore(STORES.EVENT_LOG, {
          keyPath: 'id',
          autoIncrement: false,
        });
        logStore.createIndex('level', 'level', { unique: false });
        logStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

/**
 * Get item from store by ID
 */
export async function getItem<T>(
  storeName: string,
  id: string
): Promise<T | null> {
  const db = await openDB();
  const transaction = db.transaction(storeName, 'readonly');
  const store = transaction.objectStore(storeName);
  const result = await executeRequest<T>(store.get(id));
  return result || null;
}

/**
 * Put item into store (insert or update)
 */
export async function putItem<T>(storeName: string, item: T): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);
  await executeRequest(store.put(item));
}

/**
 * Delete item from store by ID
 */
export async function deleteItem(storeName: string, id: string): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);
  await executeRequest(store.delete(id));
}

/**
 * Get all items from store
 */
export async function getAllItems<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  const transaction = db.transaction(storeName, 'readonly');
  const store = transaction.objectStore(storeName);
  const result = await executeRequest<T[]>(store.getAll());
  return result || [];
}

/**
 * Clear all items from store
 */
export async function clearStore(storeName: string): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);
  await executeRequest(store.clear());
}
