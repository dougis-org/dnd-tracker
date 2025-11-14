/**
 * Offline Queue API
 * 
 * Manages queued operations while offline with IndexedDB persistence.
 * Implements FIFO queue with retry logic and exponential backoff.
 * 
 * @module offline/queue
 */

import { putItem, getItem, getAllItems, deleteItem, STORES } from './indexeddb';

export interface OfflineQueueEntry {
  id: string;
  operation: string;
  payload: Record<string, unknown>;
  createdAt: string;
  attempts: number;
  lastAttemptAt: string | null;
  status: 'queued' | 'in-progress' | 'failed' | 'succeeded';
  meta?: Record<string, unknown>;
}

const MAX_PAYLOAD_SIZE = 256 * 1024; // 256 KB
const MAX_RETRY_ATTEMPTS = 5;
const INITIAL_BACKOFF_MS = 1000;

/**
 * Enqueue an operation for offline processing
 */
export async function enqueue(
  operation: string,
  payload: Record<string, unknown>,
  meta?: Record<string, unknown>
): Promise<string> {
  // Validate payload size
  const payloadSize = JSON.stringify(payload).length;
  if (payloadSize > MAX_PAYLOAD_SIZE) {
    throw new Error(
      `Payload too large: ${payloadSize} bytes (max: ${MAX_PAYLOAD_SIZE})`
    );
  }

  const entry: OfflineQueueEntry = {
    id: crypto.randomUUID(),
    operation,
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0,
    lastAttemptAt: null,
    status: 'queued',
    meta,
  };

  await putItem(STORES.QUEUE, entry);
  console.log('[Queue] Enqueued operation:', entry.id, operation);
  
  return entry.id;
}

/**
 * Dequeue next operation for processing
 */
export async function dequeue(): Promise<OfflineQueueEntry | null> {
  const entries = await list();
  const queued = entries.find((e) => e.status === 'queued');
  
  if (queued) {
    // Mark as in-progress
    queued.status = 'in-progress';
    queued.attempts += 1;
    queued.lastAttemptAt = new Date().toISOString();
    await putItem(STORES.QUEUE, queued);
    return queued;
  }
  
  return null;
}

/**
 * List all queue entries
 */
export async function list(): Promise<OfflineQueueEntry[]> {
  return getAllItems<OfflineQueueEntry>(STORES.QUEUE);
}

/**
 * Mark operation as succeeded and remove from queue
 */
export async function markSucceeded(id: string): Promise<void> {
  await deleteItem(STORES.QUEUE, id);
  console.log('[Queue] Operation succeeded:', id);
}

/**
 * Mark operation as failed and update retry info
 */
export async function markFailed(id: string, error?: string): Promise<void> {
  const entry = await getItem<OfflineQueueEntry>(STORES.QUEUE, id);
  
  if (!entry) {
    console.warn('[Queue] Entry not found for failure:', id);
    return;
  }

  if (entry.attempts >= MAX_RETRY_ATTEMPTS) {
    // Max retries reached, mark as failed
    entry.status = 'failed';
    entry.meta = { ...entry.meta, error, maxRetriesReached: true };
    await putItem(STORES.QUEUE, entry);
    console.error('[Queue] Operation failed after max retries:', id);
  } else {
    // Re-queue for retry
    entry.status = 'queued';
    entry.meta = { ...entry.meta, lastError: error };
    await putItem(STORES.QUEUE, entry);
    console.warn('[Queue] Operation failed, will retry:', id, `(${entry.attempts}/${MAX_RETRY_ATTEMPTS})`);
  }
}

/**
 * Calculate backoff delay for retry
 */
export function calculateBackoff(attempts: number): number {
  return Math.min(INITIAL_BACKOFF_MS * Math.pow(2, attempts - 1), 30000);
}

/**
 * Retry failed operations (called on reconnect)
 */
export async function retryAll(): Promise<void> {
  const entries = await list();
  const failed = entries.filter((e) => e.status === 'failed' && !e.meta?.maxRetriesReached);
  
  console.log('[Queue] Retrying failed operations:', failed.length);
  
  for (const entry of failed) {
    // Reset to queued for retry
    entry.status = 'queued';
    entry.attempts = 0;
    entry.lastAttemptAt = null;
    await putItem(STORES.QUEUE, entry);
  }
}
