/**
 * Tests de/serialization of fields encrypted by offline utilities
 */
import { encryptFields, decryptFields } from '@/lib/offline/encryption';

const mockCrypto = {
  subtle: {
    encrypt: jest.fn(),
    decrypt: jest.fn(),
  },
  getRandomValues: jest.fn(),
};

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true,
});

Object.defineProperty(global, 'btoa', {
  value: (str: string) => Buffer.from(str, 'binary').toString('base64'),
  writable: true,
});

Object.defineProperty(global, 'atob', {
  value: (str: string) => Buffer.from(str, 'base64').toString('binary'),
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

describe('encryptFields/decryptFields split tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCrypto.getRandomValues.mockReturnValue(
      new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    );
    // subtle.encrypt/decrypt normally return ArrayBuffer
    mockCrypto.subtle.encrypt.mockResolvedValue(
      new Uint8Array([5, 6, 7, 8]).buffer
    );
    mockCrypto.subtle.decrypt.mockResolvedValue(
      new Uint8Array([116, 101, 115, 116]).buffer
    );
  });

  it('encryptFields returns object with encrypted placeholders', async () => {
    const key = {} as CryptoKey;
    const src = { a: 'hello', b: 123 };

    const out = await encryptFields(src, ['a'], key);
    expect(out.a).toHaveProperty('__encrypted', true);
  });

  it('decryptFields decrypts fields', async () => {
    const key = {} as CryptoKey;
    const src = {
      a: { encrypted: 'abc', iv: 'iv', __encrypted: true },
      b: 123,
    };

    const out = await decryptFields(src, ['a'], key);
    expect(out.a).toEqual(expect.any(String));
  });
});
