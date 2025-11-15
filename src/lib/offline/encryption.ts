/**
 * Encryption utilities for offline queue
 *
 * Provides AES-GCM encryption/decryption for sensitive data in queued operations.
 * Uses Web Crypto API for secure client-side encryption.
 *
 * @module offline/encryption
 */

/* global btoa, atob, CryptoKey, TextEncoder, TextDecoder */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits

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
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

/**
 * Import key from base64 string
 */
export async function importKey(keyData: string): Promise<CryptoKey> {
  const keyBytes = new Uint8Array(
    atob(keyData)
      .split('')
      .map((c) => c.charCodeAt(0))
  );

  return crypto.subtle.importKey(
    'raw',
    keyBytes,
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
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
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
  const encrypted = new Uint8Array(
    atob(encryptedData)
      .split('')
      .map((c) => c.charCodeAt(0))
  );
  const ivBytes = new Uint8Array(
    atob(iv)
      .split('')
      .map((c) => c.charCodeAt(0))
  );

  const decrypted = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: ivBytes,
    },
    key,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
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
