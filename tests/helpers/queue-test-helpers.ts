/**
 * Test helpers for offline queue tests
 */

import {
  enqueue,
  dequeue,
  markFailed,
  type OfflineQueueEntry,
} from '@/lib/offline/queue';

/**
 * Fail an operation multiple times
 */
export async function failOperationNTimes(
  id: string,
  times: number,
  errorMsg = 'Test error'
): Promise<void> {
  for (let i = 0; i < times; i++) {
    await dequeue();
    await markFailed(id, `${errorMsg} (attempt ${i + 1})`);
  }
}

/**
 * Enqueue multiple test operations
 */
export async function enqueueMultiple(count: number): Promise<string[]> {
  const ids: string[] = [];
  for (let i = 1; i <= count; i++) {
    const id = await enqueue(`OP${i}`, { order: i });
    ids.push(id);
  }
  return ids;
}

/**
 * Find entry with specific status
 */
export function findEntryWithStatus(
  entries: OfflineQueueEntry[],
  status: OfflineQueueEntry['status']
): OfflineQueueEntry | undefined {
  return entries.find((e) => e.status === status);
}

/**
 * Count entries by status
 */
export function countByStatus(
  entries: OfflineQueueEntry[],
  status: OfflineQueueEntry['status']
): number {
  return entries.filter((e) => e.status === status).length;
}

/**
 * Verify timestamp is within range
 */
export function verifyTimestampInRange(
  timestamp: string,
  beforeMs: number,
  afterMs: number
): boolean {
  const time = new Date(timestamp).getTime();
  return time >= beforeMs && time <= afterMs;
}
