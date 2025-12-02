/**
 * Unit tests for IndexedDB wrapper
 */

import 'fake-indexeddb/auto';
import {
  openDB,
  getItem,
  putItem,
  deleteItem,
  getAllItems,
  clearStore,
  STORES,
} from '@/lib/offline/indexeddb';

// Polyfill structuredClone for Node < 17
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj: unknown) => JSON.parse(JSON.stringify(obj));
}

describe('IndexedDB Wrapper', () => {
  beforeEach(async () => {
    // Clear all stores before each test instead of deleting the database
    // This is more reliable with fake-indexeddb
    try {
      await clearStore(STORES.QUEUE);
      await clearStore(STORES.EVENT_LOG);
    } catch {
      // Stores might not exist yet, that's fine
    }
  });

  describe('STORES', () => {
    it('should export store names', () => {
      expect(STORES.QUEUE).toBe('offline-queue');
      expect(STORES.EVENT_LOG).toBe('event-log');
    });
  });

  describe('openDB', () => {
    it('should create database with correct structure', async () => {
      const db = await openDB();

      expect(db.name).toBe('dnd-tracker-offline');
      expect(db.version).toBe(1);
      expect(db.objectStoreNames.contains(STORES.QUEUE)).toBe(true);
      expect(db.objectStoreNames.contains(STORES.EVENT_LOG)).toBe(true);

      db.close();
    });
  });

  describe('putItem and getItem', () => {
    it('should store and retrieve item', async () => {
      const testItem = { id: 'test-1', data: 'value' };

      await putItem(STORES.QUEUE, testItem);
      const result = await getItem(STORES.QUEUE, 'test-1');

      expect(result).toEqual(testItem);
    });

    it('should return null for non-existent item', async () => {
      const result = await getItem(STORES.QUEUE, 'non-existent');
      expect(result).toBeNull();
    });

    it('should update existing item', async () => {
      const item1 = { id: 'test-1', data: 'original' };
      const item2 = { id: 'test-1', data: 'updated' };

      await putItem(STORES.QUEUE, item1);
      await putItem(STORES.QUEUE, item2);

      const result = await getItem(STORES.QUEUE, 'test-1');
      expect(result).toEqual(item2);
    });
  });

  describe('getAllItems', () => {
    it('should retrieve all items from store', async () => {
      const items = [
        { id: 'item-1', data: 'first' },
        { id: 'item-2', data: 'second' },
        { id: 'item-3', data: 'third' },
      ];

      for (const item of items) {
        await putItem(STORES.QUEUE, item);
      }

      const result = await getAllItems(STORES.QUEUE);

      expect(result).toHaveLength(3);
      expect(result).toEqual(expect.arrayContaining(items));
    });

    it('should return empty array for empty store', async () => {
      const result = await getAllItems(STORES.QUEUE);
      expect(result).toEqual([]);
    });
  });

  describe('deleteItem', () => {
    it('should delete item by id', async () => {
      const item = { id: 'test-1', data: 'value' };

      await putItem(STORES.QUEUE, item);
      await deleteItem(STORES.QUEUE, 'test-1');

      const result = await getItem(STORES.QUEUE, 'test-1');
      expect(result).toBeNull();
    });

    it('should not error when deleting non-existent item', async () => {
      await expect(
        deleteItem(STORES.QUEUE, 'non-existent')
      ).resolves.not.toThrow();
    });
  });

  describe('clearStore', () => {
    it('should remove all items from store', async () => {
      const items = [
        { id: 'item-1', data: 'first' },
        { id: 'item-2', data: 'second' },
      ];

      for (const item of items) {
        await putItem(STORES.QUEUE, item);
      }

      await clearStore(STORES.QUEUE);

      const result = await getAllItems(STORES.QUEUE);
      expect(result).toEqual([]);
    });

    it('should not error when clearing empty store', async () => {
      await expect(clearStore(STORES.QUEUE)).resolves.not.toThrow();
    });
  });

  describe('multiple stores', () => {
    it('should keep stores separate', async () => {
      const queueItem = { id: 'queue-1', type: 'queue-data' };
      const logItem = { id: 'log-1', type: 'log-data' };

      await putItem(STORES.QUEUE, queueItem);
      await putItem(STORES.EVENT_LOG, logItem);

      const queueResult = await getItem(STORES.QUEUE, 'queue-1');
      const logResult = await getItem(STORES.EVENT_LOG, 'log-1');

      expect(queueResult).toEqual(queueItem);
      expect(logResult).toEqual(logItem);

      // Cross-store check - shouldn't find item in wrong store
      const wrongStoreResult = await getItem(STORES.EVENT_LOG, 'queue-1');
      expect(wrongStoreResult).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle item with complex nested data', async () => {
      const complexItem = {
        id: 'complex-1',
        data: {
          nested: {
            deeply: {
              value: 'test',
              array: [1, 2, 3],
            },
          },
        },
      };

      await putItem(STORES.QUEUE, complexItem);
      const result = await getItem(STORES.QUEUE, 'complex-1');

      expect(result).toEqual(complexItem);
    });

    it('should handle null/undefined values in item', async () => {
      const itemWithNulls = {
        id: 'nulls-1',
        value: null,
        optional: undefined,
      };

      await putItem(STORES.QUEUE, itemWithNulls);
      const result = await getItem(STORES.QUEUE, 'nulls-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('nulls-1');
    });

    it('should handle large number of items', async () => {
      const itemCount = 50;
      for (let i = 0; i < itemCount; i++) {
        await putItem(STORES.QUEUE, {
          id: `item-${i}`,
          index: i,
        });
      }

      const allItems = await getAllItems(STORES.QUEUE);
      expect(allItems).toHaveLength(itemCount);
    });

    it('should handle deleteItem on already-deleted item gracefully', async () => {
      const item = { id: 'dup-delete-1', data: 'test' };

      await putItem(STORES.QUEUE, item);
      await deleteItem(STORES.QUEUE, 'dup-delete-1');
      // Should not throw when deleting non-existent item
      await expect(
        deleteItem(STORES.QUEUE, 'dup-delete-1')
      ).resolves.not.toThrow();
    });

    it('should handle special characters in ID', async () => {
      const specialIds = ['test:123', 'test/456', 'test@789', 'test-中文'];
      for (const id of specialIds) {
        const item = { id, data: 'test' };
        await putItem(STORES.QUEUE, item);
        const result = await getItem(STORES.QUEUE, id);
        expect(result).toEqual(item);
      }
    });

    it('should handle concurrent puts to same store', async () => {
      const items = Array.from({ length: 10 }, (_, i) => ({
        id: `concurrent-${i}`,
        data: `item-${i}`,
      }));

      // Put all items concurrently
      await Promise.all(items.map((item) => putItem(STORES.QUEUE, item)));

      const allItems = await getAllItems(STORES.QUEUE);
      expect(allItems).toHaveLength(10);
    });
  });
});
