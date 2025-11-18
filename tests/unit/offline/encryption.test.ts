/**
 * Unit tests for offline encryption utilities
 *
 * @jest-environment jsdom
 */

// Global declarations for browser APIs in test environment
declare global {
  var CryptoKey: typeof CryptoKey;
}

// 12-byte IV used across tests to keep expectations deterministic
const DEFAULT_IV = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

// Mock Web Crypto API
const mockCrypto = createMockCrypto();

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true,
});

setupGlobalMocks();

/**
 * Create mock crypto object with Web Crypto API methods
 */
function createMockCrypto() {
  return {
    subtle: {
      generateKey: jest.fn(),
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      exportKey: jest.fn(),
      importKey: jest.fn(),
    },
    getRandomValues: jest.fn(),
  };
}

/**
 * Setup global mocks for encoding/decoding
 */
function setupGlobalMocks() {
  Object.defineProperty(global, 'btoa', {
    value: jest.fn((str) => Buffer.from(str, 'binary').toString('base64')),
    writable: true,
  });

  Object.defineProperty(global, 'atob', {
    value: jest.fn((str) => Buffer.from(str, 'base64').toString('binary')),
    writable: true,
  });

  Object.defineProperty(global, 'TextEncoder', {
    value: jest.fn().mockImplementation(() => ({
      encode: jest.fn((str) => new Uint8Array(Buffer.from(str))),
    })),
    writable: true,
  });

  Object.defineProperty(global, 'TextDecoder', {
    value: jest.fn().mockImplementation(() => ({
      decode: jest.fn((arr) => Buffer.from(arr).toString()),
    })),
    writable: true,
  });
}

import { encrypt, decrypt } from '@/lib/offline/encryption';

describe('encryption utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockCrypto.getRandomValues.mockReturnValue(DEFAULT_IV);
    mockCrypto.subtle.generateKey.mockResolvedValue({} as CryptoKey);
    mockCrypto.subtle.exportKey.mockResolvedValue(new Uint8Array([1, 2, 3, 4]));
    mockCrypto.subtle.importKey.mockResolvedValue({} as CryptoKey);
    mockCrypto.subtle.encrypt.mockResolvedValue(new Uint8Array([5, 6, 7, 8]));
    mockCrypto.subtle.decrypt.mockResolvedValue(
      new Uint8Array([116, 101, 115, 116, 32, 100, 97, 116, 97])
    ); // 'test data'
  });

  describe('encrypt', () => {
    it('should encrypt data and return encrypted object', async () => {
      const mockKey = {} as CryptoKey;
      const data = 'test data';

      const result = await encrypt(data, mockKey);

      expect(mockCrypto.subtle.encrypt).toHaveBeenCalledWith(
        {
          name: 'AES-GCM',
          iv: expect.any(Uint8Array),
        },
        mockKey,
        expect.any(Uint8Array)
      );

      expect(result).toEqual({
        encrypted: 'BQYHCA==', // base64 of mockEncrypted
        iv: 'AQIDBAUGBwgJCgsM', // base64 of 12-byte IV
      });
    });
  });

  describe('decrypt', () => {
    it('should decrypt data from encrypted object', async () => {
      const mockKey = {} as CryptoKey;
      const encryptedData = 'BQYHCA=='; // base64 of [5,6,7,8]
      const iv = 'AQIDBAUGBwgJCgsM'; // base64 of 12-byte IV

      const result = await decrypt(encryptedData, iv, mockKey);

      expect(mockCrypto.subtle.decrypt).toHaveBeenCalledWith(
        {
          name: 'AES-GCM',
          iv: DEFAULT_IV,
        },
        mockKey,
        new Uint8Array([5, 6, 7, 8])
      );

      expect(result).toBe('test data');
    });
  });

  // Keep low-level encrypt/decrypt tests here
});
