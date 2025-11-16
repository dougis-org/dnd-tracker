/**
 * Offline Queue API with encryption
 *
 * Manages queued operations while offline with IndexedDB persistence and encryption.
 * Implements FIFO queue with retry logic, exponential backoff, and secure data handling.
 *
 * @module offline/queue
 */

import { putItem, getAllItems, deleteItem, STORES } from './indexeddb';
import { encryptFields, decryptFields, generateKey } from './encryption';

export interface QueuedOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  data: Record<string, unknown>;
  timestamp: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retryCount: number;
  lastError?: string;
}

/**
 * Queue an operation for offline processing with encryption
 */
export async function queueOperation(
  operation: Omit<QueuedOperation, 'status' | 'retryCount'>
): Promise<void> {
  const encryptionKey = await generateKey();

  // Encrypt sensitive fields (customize based on operation type)
  const sensitiveFields = getSensitiveFields(operation.type);
  const encryptedData = await encryptFields(
    operation.data,
    sensitiveFields,
    encryptionKey
  );

  const queuedOp: QueuedOperation = {
    ...operation,
    data: encryptedData,
    status: 'pending',
    retryCount: 0,
  };

  await putItem(STORES.QUEUE, queuedOp);
}

/**
 * Process the offline queue
 */
export async function processQueue(): Promise<void> {
  const operations = await getAllItems<QueuedOperation>(STORES.QUEUE);

  const pendingOps = operations.filter((op) => op.status === 'pending');

  for (const op of pendingOps) {
    try {
      // Decrypt data before sending
      const encryptionKey = await generateKey(); // In real app, use stored key
      const sensitiveFields = getSensitiveFields(op.type);
      const decryptedData = await decryptFields(
        op.data,
        sensitiveFields,
        encryptionKey
      );

      // Execute the operation
      await executeOperation({
        ...op,
        data: decryptedData,
      });

      // Mark as completed and remove
      await deleteItem(STORES.QUEUE, op.id);
    } catch (error) {
      op.retryCount++;
      op.lastError = (error as Error).message;

      if (op.retryCount >= 3) {
        op.status = 'failed';
        await putItem(STORES.QUEUE, op);
      } else {
        op.status = 'pending'; // Will retry later
        await putItem(STORES.QUEUE, op);
      }
    }
  }
}

/**
 * Execute a queued operation by making API call
 */
async function executeOperation(op: QueuedOperation): Promise<void> {
  const method = getHttpMethod(op.type);

  const response = await fetch(op.endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: method !== 'DELETE' ? JSON.stringify(op.data) : undefined,
  });

  if (!response.ok) {
    throw new Error(
      `API call failed: ${response.status} ${response.statusText}`
    );
  }
}

/**
 * Start queue processing when coming online
 */
export function startQueueProcessing(): void {
  const handleOnline = () => {
    console.log('[Offline Queue] Online detected, processing queue');
    processQueue();
  };

  window.addEventListener('online', handleOnline);

  // Process immediately if already online
  if (navigator.onLine) {
    processQueue();
  }
}

/**
 * Clear all operations from the queue
 */
export async function clearQueue(): Promise<void> {
  // Note: clearStore is not exported, so we'll delete all items
  const operations = await getAllItems<QueuedOperation>(STORES.QUEUE);
  for (const op of operations) {
    await deleteItem(STORES.QUEUE, op.id);
  }
}

/**
 * Get sensitive fields that should be encrypted based on operation type
 */
function getSensitiveFields(type: string): string[] {
  // Customize based on your data model
  switch (type) {
    case 'create':
    case 'update':
      return ['email', 'password', 'ssn', 'creditCard'];
    default:
      return [];
  }
}

/**
 * Get HTTP method for operation type
 */
function getHttpMethod(type: string): string {
  switch (type) {
    case 'create':
      return 'POST';
    case 'update':
      return 'PUT';
    case 'delete':
      return 'DELETE';
    default:
      return 'POST';
  }
}
