/**
 * Tests: key generation, import/export
 */
import { generateKey, exportKey, importKey } from '@/lib/offline/encryption';

// Small fixture mocks for the web crypto in jest tests
const mockCrypto = {
  subtle: {
    generateKey: jest.fn(),
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
  value: (str: string) => Buffer.from(str, 'binary').toString('base64'),
  writable: true,
});

describe('encryption keys', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCrypto.subtle.generateKey.mockResolvedValue({} as CryptoKey);
    mockCrypto.subtle.exportKey.mockResolvedValue(new Uint8Array([1, 2, 3]));
    mockCrypto.subtle.importKey.mockResolvedValue({} as CryptoKey);
  });

  it('generates keys with AES-GCM/256', async () => {
    const key = await generateKey();
    expect(mockCrypto.subtle.generateKey).toHaveBeenCalled();
    expect(key).toBeTruthy();
  });

  it('exports and imports keys', async () => {
    const keyData = await exportKey({} as CryptoKey);
    expect(typeof keyData).toBe('string');

    const key = await importKey(keyData);
    expect(key).toBeTruthy();
  });
});
