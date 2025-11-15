/**
 * Unit tests for Offline Queue API
 */

import 'fake-indexeddb/auto';
import {
  enqueue,
  dequeue,
  list,
  markSucceeded,
  markFailed,
  calculateBackoff,
  retryAll,
  type OfflineQueueEntry,
} from '@/lib/offline/queue';
import { clearStore, getItem, STORES } from '@/lib/offline/indexeddb';
import {
  failOperationNTimes,
  enqueueMultiple,
  findEntryWithStatus,
  countByStatus,
  verifyTimestampInRange,
} from '../../../tests/helpers/queue-test-helpers';

// Polyfill structuredClone for Node < 17
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj: unknown) => JSON.parse(JSON.stringify(obj));
}

// Mock crypto.randomUUID
if (typeof crypto.randomUUID === 'undefined') {
  let counter = 0;
  crypto.randomUUID = () =>
    `test-uuid-${++counter}-0000-0000-0000-000000000000` as `${string}-${string}-${string}-${string}-${string}`;
}

describe('Offline Queue', () => {
  beforeEach(async () => {
    // Clear queue before each test
    try {
      await clearStore(STORES.QUEUE);
    } catch {
      // Store might not exist yet
    }
  });

  describe('enqueue', () => {
    it('should enqueue operation with valid payload', async () => {
      const operation = 'CREATE_CHARACTER';
      const payload = { name: 'Test Hero', class: 'Fighter' };

      const id = await enqueue(operation, payload);

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');

      const entries = await list();
      expect(entries).toHaveLength(1);
      expect(entries[0]).toMatchObject({
        id,
        operation,
        payload,
        status: 'queued',
        attempts: 0,
      });
    });

    it('should reject payload exceeding size limit', async () => {
      const largePayload = {
        data: 'x'.repeat(300 * 1024), // 300 KB
      };

      await expect(enqueue('LARGE_OP', largePayload)).rejects.toThrow(
        /Payload too large/
      );
    });

    it('should accept payload at size limit', async () => {
      // Create payload just under 256KB
      const payload = {
        data: 'x'.repeat(250 * 1024),
      };

      const id = await enqueue('MAX_SIZE_OP', payload);
      expect(id).toBeDefined();
    });

    it('should store optional metadata', async () => {
      const meta = { userId: '123', source: 'mobile-app' };

      await enqueue('TEST_OP', {}, meta);

      const entries = await list();
      expect(entries[0].meta).toEqual(meta);
    });

    it('should set initial status and timestamps', async () => {
      const beforeEnqueue = Date.now();
      const id = await enqueue('TEST_OP', {});
      const afterEnqueue = Date.now();

      const entry = await getItem<OfflineQueueEntry>(STORES.QUEUE, id);

      expect(entry?.status).toBe('queued');
      expect(entry?.attempts).toBe(0);
      expect(entry?.lastAttemptAt).toBeNull();
      expect(entry?.createdAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
      expect(
        verifyTimestampInRange(entry!.createdAt, beforeEnqueue, afterEnqueue)
      ).toBe(true);
    });
  });

  describe('dequeue', () => {
    it('should dequeue next queued operation', async () => {
      await enqueueMultiple(2);

      const entry = await dequeue();

      expect(entry).not.toBeNull();
      expect(entry?.operation).toMatch(/OP[12]/);
      expect(entry?.status).toBe('in-progress');
      expect(entry?.attempts).toBe(1);
      expect(entry?.lastAttemptAt).not.toBeNull();
    });

    it('should return null when queue is empty', async () => {
      const entry = await dequeue();
      expect(entry).toBeNull();
    });

    it('should skip in-progress operations', async () => {
      await enqueue('OP1', {});
      await dequeue(); // Marks first as in-progress

      const id2 = await enqueue('OP2', {});
      const entry = await dequeue();

      expect(entry?.id).toBe(id2);
    });

    it('should skip failed operations', async () => {
      const id1 = await enqueue('OP1', {});
      await failOperationNTimes(id1, 5);

      const id2 = await enqueue('OP2', {});
      const entry = await dequeue();

      expect(entry?.id).toBe(id2);
    });

    it('should increment attempt counter', async () => {
      const id = await enqueue('TEST_OP', {});

      const entry1 = await dequeue();
      expect(entry1?.attempts).toBe(1);

      // Re-queue and dequeue again
      await markFailed(id);
      const entry2 = await dequeue();
      expect(entry2?.attempts).toBe(2);
    });
  });

  describe('list', () => {
    it('should return empty array when queue is empty', async () => {
      const entries = await list();
      expect(entries).toEqual([]);
    });

    it('should return all queue entries', async () => {
      await enqueueMultiple(3);

      const entries = await list();
      expect(entries).toHaveLength(3);
    });

    it('should include entries in all statuses', async () => {
      await enqueueMultiple(2);
      const dequeued = await dequeue();

      const entries = await list();
      expect(entries).toHaveLength(2);
      expect(findEntryWithStatus(entries, 'in-progress')?.id).toBe(
        dequeued?.id
      );
      expect(countByStatus(entries, 'queued')).toBe(1);
    });
  });

  describe('markSucceeded', () => {
    it('should remove succeeded operation from queue', async () => {
      const id = await enqueue('TEST_OP', {});
      await dequeue();

      await markSucceeded(id);

      const entries = await list();
      expect(entries).toHaveLength(0);
    });

    it('should handle non-existent ID gracefully', async () => {
      await expect(markSucceeded('non-existent')).resolves.not.toThrow();
    });
  });

  describe('markFailed', () => {
    it('should re-queue operation for retry', async () => {
      const id = await enqueue('TEST_OP', {});
      await dequeue(); // attempts = 1, status = in-progress

      await markFailed(id, 'Network error');

      const entries = await list();
      const entry = entries.find((e: OfflineQueueEntry) => e.id === id);

      expect(entry?.status).toBe('queued');
      expect(entry?.attempts).toBe(1);
      expect(entry?.meta?.lastError).toBe('Network error');
    });

    it('should mark as failed after max retries', async () => {
      const id = await enqueue('TEST_OP', {});
      await failOperationNTimes(id, 5);

      const entries = await list();
      const entry = findEntryWithStatus(entries, 'failed');

      expect(entry?.id).toBe(id);
      expect(entry?.attempts).toBe(5);
      expect(entry?.meta?.maxRetriesReached).toBe(true);
    });

    it('should preserve metadata when failing', async () => {
      const meta = { userId: '123' };
      const id = await enqueue('TEST_OP', {}, meta);
      await dequeue();

      await markFailed(id, 'Error');

      const entries = await list();
      const entry = entries.find((e: OfflineQueueEntry) => e.id === id);

      expect(entry?.meta?.userId).toBe('123');
      expect(entry?.meta?.lastError).toBe('Error');
    });

    it('should handle non-existent ID gracefully', async () => {
      await expect(markFailed('non-existent')).resolves.not.toThrow();
    });
  });

  describe('calculateBackoff', () => {
    it('should calculate exponential backoff', () => {
      expect(calculateBackoff(1)).toBe(1000); // 1s
      expect(calculateBackoff(2)).toBe(2000); // 2s
      expect(calculateBackoff(3)).toBe(4000); // 4s
      expect(calculateBackoff(4)).toBe(8000); // 8s
      expect(calculateBackoff(5)).toBe(16000); // 16s
    });

    it('should cap backoff at 30 seconds', () => {
      expect(calculateBackoff(10)).toBe(30000);
      expect(calculateBackoff(20)).toBe(30000);
    });

    it('should handle zero attempts', () => {
      expect(calculateBackoff(0)).toBe(500); // 2^-1 = 0.5
    });
  });

  describe('retryAll', () => {
    it('should reset failed operations to queued', async () => {
      const ids = await enqueueMultiple(2);

      // Fail both operations a few times (but not max)
      for (const id of ids) {
        await dequeue();
        await markFailed(id);
      }

      await retryAll();

      const entries = await list();
      expect(countByStatus(entries, 'queued')).toBeGreaterThan(0);
    });

    it('should not affect queued or in-progress operations', async () => {
      await enqueueMultiple(2);
      const dequeued = await dequeue();

      await retryAll();

      const entries = await list();
      expect(findEntryWithStatus(entries, 'in-progress')?.id).toBe(
        dequeued?.id
      );
      expect(countByStatus(entries, 'queued')).toBe(1);
    });

    it('should handle empty queue gracefully', async () => {
      await expect(retryAll()).resolves.not.toThrow();
    });
  });
});
