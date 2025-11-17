/**
 * Encryption utilities for offline queue
 *
 * Provides AES-GCM encryption/decryption for sensitive data in queued operations.
 * Uses Web Crypto API for secure client-side encryption.
 *
 * @module offline/encryption
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits

// BufferSource is a DOM type; some lint rules / TS configs treat it oddly in
// Node test environments. Define a local alias to avoid lint/no-undef errors
// while still giving us the type-safety we want.
// BufferSourceLocal removed — casting to `any` is used where necessary in this
// Node/Jest environment to avoid type mismatches between DOM BufferSource
// variants and the Node runtime. Keep casts minimal and targeted.

/**
 * Generate a new encryption key
 */
export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Export key as base64 string for storage
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return uint8ArrayToBase64(new Uint8Array(exported));
}

/**
 * Import key from base64 string
 */
export async function importKey(keyData: string): Promise<CryptoKey> {
  const keyBytes = base64ToUint8Array(keyData);

  // Web Crypto allows ArrayBuffer or ArrayBufferView. Tests and mocks in
  // our suite assert a Uint8Array is passed; use the typed view to keep
  // expectations stable across environments.
  // Keep the typed value but cast to any to satisfy TypeScript types in the
  // Node/Jest environment — runtime will still get Uint8Array as expected.
  // @ts-ignore
  return crypto.subtle.importKey(
    'raw',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    keyBytes as any,
    ALGORITHM,
    false, // not extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-GCM
 */
export async function encrypt(
  data: string,
  key: CryptoKey
): Promise<{ encrypted: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encodedData = new TextEncoder().encode(data);

  const encrypted = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv,
    },
    key,
    encodedData
  );

  return {
    encrypted: uint8ArrayToBase64(new Uint8Array(encrypted)),
    iv: uint8ArrayToBase64(iv),
  };
}

/**
 * Decrypt data using AES-GCM
 */
export async function decrypt(
  encryptedData: string,
  iv: string,
  key: CryptoKey
): Promise<string> {
  const encrypted = base64ToUint8Array(encryptedData);

  const ivBytes = base64ToUint8Array(iv);

  // Pass Uint8Array (ArrayBufferView) — our tests mock the subtle.decrypt
  // call expecting a Uint8Array for both iv and data. Passing the typed
  // view keeps the interface consistent between runtime and test.
  // @ts-ignore
  const decrypted = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      iv: ivBytes as any,
    },
    key,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    encrypted as any
  );

  return new TextDecoder().decode(decrypted);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Encrypt sensitive fields in an object
 */
export async function encryptFields(
  obj: Record<string, unknown>,
  sensitiveFields: string[],
  key: CryptoKey
): Promise<Record<string, unknown>> {
  const result = { ...obj };

  for (const field of sensitiveFields) {
    if (result[field] && typeof result[field] === 'string') {
      const { encrypted, iv } = await encrypt(result[field] as string, key);
      result[field] = {
        encrypted,
        iv,
        __encrypted: true,
      };
    }
  }

  return result;
}

/**
 * Decrypt sensitive fields in an object
 */
export async function decryptFields(
  obj: Record<string, unknown>,
  sensitiveFields: string[],
  key: CryptoKey
): Promise<Record<string, unknown>> {
  const result = { ...obj };

  for (const field of sensitiveFields) {
    const fieldValue = result[field];
    if (
      fieldValue &&
      typeof fieldValue === 'object' &&
      (fieldValue as { __encrypted?: boolean }).__encrypted
    ) {
      const { encrypted, iv } = fieldValue as {
        encrypted: string;
        iv: string;
        __encrypted: boolean;
      };
      result[field] = await decrypt(encrypted, iv, key);
    }
  }

  return result;
}
