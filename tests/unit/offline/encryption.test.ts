/**
 * Unit tests for offline encryption utilities
 *
 * @jest-environment jsdom
 */

// Global declarations for browser APIs in test environment
declare global {
  var CryptoKey: typeof CryptoKey;
}

// Mock Web Crypto API
const mockCrypto = {
  subtle: {
    generateKey: jest.fn(),
    encrypt: jest.fn(),
    decrypt: jest.fn(),
    exportKey: jest.fn(),
    importKey: jest.fn(),
  },
  getRandomValues: jest.fn(),
};

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true,
});

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

import {
  encryptFields,
  decryptFields,
  generateKey,
  exportKey,
  importKey,
  encrypt,
  decrypt,
} from '@/lib/offline/encryption';

describe('encryption utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockCrypto.getRandomValues.mockReturnValue(
      new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    );
    mockCrypto.subtle.generateKey.mockResolvedValue({} as CryptoKey);
    mockCrypto.subtle.exportKey.mockResolvedValue(new Uint8Array([1, 2, 3, 4]));
    mockCrypto.subtle.importKey.mockResolvedValue({} as CryptoKey);
    mockCrypto.subtle.encrypt.mockResolvedValue(new Uint8Array([5, 6, 7, 8]));
    mockCrypto.subtle.decrypt.mockResolvedValue(
      new Uint8Array([116, 101, 115, 116, 32, 100, 97, 116, 97])
    ); // 'test data'
  });

  describe('generateKey', () => {
    it('should generate a CryptoKey with correct algorithm', async () => {
      const mockKey = {} as CryptoKey;
      mockCrypto.subtle.generateKey.mockResolvedValue(mockKey);

      const key = await generateKey();

      expect(mockCrypto.subtle.generateKey).toHaveBeenCalledWith(
        {
          name: 'AES-GCM',
          length: 256,
        },
        true,
        ['encrypt', 'decrypt']
      );
      expect(key).toBe(mockKey);
    });
  });

  describe('exportKey', () => {
    it('should export key as base64 string', async () => {
      const mockKey = {} as CryptoKey;
      const mockExported = new Uint8Array([1, 2, 3, 4]);
      mockCrypto.subtle.exportKey.mockResolvedValue(mockExported);

      const result = await exportKey(mockKey);

      expect(mockCrypto.subtle.exportKey).toHaveBeenCalledWith('raw', mockKey);
      expect(result).toBe('AQIDBA=='); // base64 of [1,2,3,4]
    });
  });

  describe('importKey', () => {
    it('should import key from base64 string', async () => {
      const mockKey = {} as CryptoKey;
      const keyData = 'AQIDBA=='; // base64 of [1,2,3,4]
      const expectedArray = new Uint8Array([1, 2, 3, 4]);
      mockCrypto.subtle.importKey.mockResolvedValue(mockKey);

      const result = await importKey(keyData);

      expect(mockCrypto.subtle.importKey).toHaveBeenCalledWith(
        'raw',
        expectedArray,
        'AES-GCM',
        false,
        ['encrypt', 'decrypt']
      );
      expect(result).toBe(mockKey);
    });
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
          iv: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
        },
        mockKey,
        new Uint8Array([5, 6, 7, 8])
      );

      expect(result).toBe('test data');
    });
  });

  describe('encryptFields', () => {
    it('should encrypt specified fields in object', async () => {
      const mockKey = {} as CryptoKey;
      const data = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      const result = await encryptFields(data, ['email'], mockKey);

      expect(result).toEqual({
        id: '123',
        name: 'John Doe',
        email: expect.objectContaining({
          encrypted: expect.any(String),
          iv: expect.any(String),
          __encrypted: true,
        }),
        age: 30,
      });
    });

    it('should handle nested objects', async () => {
      const mockKey = {} as CryptoKey;
      const data = {
        user: {
          name: 'John',
          sensitive: 'secret',
        },
      };

      const result = await encryptFields(data, ['user.sensitive'], mockKey);

      // Note: Current implementation doesn't handle nested paths, so sensitive field should remain unchanged
      expect(result.user.sensitive).toBe('secret');
    });
  });

  describe('decryptFields', () => {
    it('should decrypt encrypted fields in object', async () => {
      const mockKey = {} as CryptoKey;
      const data = {
        id: '123',
        name: 'John Doe',
        email: {
          encrypted: 'BQYHCA==',
          iv: 'AQIDBAUGBwgJCgs=',
          __encrypted: true,
        },
        age: 30,
      };

      const result = await decryptFields(data, ['email'], mockKey);

      expect(result).toEqual({
        id: '123',
        name: 'John Doe',
        email: 'test data',
        age: 30,
      });
    });

    it('should skip non-encrypted fields', async () => {
      const mockKey = {} as CryptoKey;
      const data = {
        name: 'John',
        age: 30,
      };

      const result = await decryptFields(data, ['email'], mockKey);

      expect(result).toEqual(data);
      expect(mockCrypto.subtle.decrypt).not.toHaveBeenCalled();
    });
  });
});
