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
    console.warn(
      '[Queue] Operation failed, will retry:',
      id,
      `(${entry.attempts}/${MAX_RETRY_ATTEMPTS})`
    );
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
  const failed = entries.filter(
    (e) => e.status === 'failed' && !e.meta?.maxRetriesReached
  );

  console.log('[Queue] Retrying failed operations:', failed.length);

  for (const entry of failed) {
    // Reset to queued for retry
    entry.status = 'queued';
    entry.attempts = 0;
    entry.lastAttemptAt = null;
    await putItem(STORES.QUEUE, entry);
  }
}

/**
 * Process the queue - attempt to execute operations
 */
export async function processQueue(): Promise<void> {
  let entry = await dequeue();

  while (entry) {
    try {
      // Attempt to execute the operation
      await executeOperation(entry);

      // Mark as succeeded
      await markSucceeded(entry.id);
    } catch (error) {
      // Mark as failed
      await markFailed(entry.id, (error as Error).message);
    }

    // Get next entry
    entry = await dequeue();
  }
}

/**
 * Execute a queued operation (placeholder - integrate with actual API)
 */
async function executeOperation(entry: OfflineQueueEntry): Promise<void> {
  // This would integrate with the actual API endpoints
  // For now, simulate API call
  console.log('[Queue] Executing operation:', entry.operation, entry.payload);

  // Simulate network request
  if (navigator.onLine) {
    // In real implementation, make actual API call to /sync/offline-ops
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate random success/failure
        if (Math.random() > 0.3) {
          resolve(void 0);
        } else {
          reject(new Error('Simulated network error'));
        }
      }, 100);
    });
  } else {
    throw new Error('Offline - cannot execute operation');
  }
}

/**
 * Start queue processing on online event
 */
export function startQueueProcessing(): void {
  // Process queue immediately if online
  if (navigator.onLine) {
    processQueue();
  }

  // Listen for online events
  window.addEventListener('online', () => {
    console.log('[Queue] Online detected, processing queue');
    processQueue();
  });
}
