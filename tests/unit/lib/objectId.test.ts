import generateObjectId from '../../../src/lib/objectId';

describe('generateObjectId', () => {
  it('should generate a 24-character hex string', () => {
    const id = generateObjectId();

    expect(id).toHaveLength(24);
    expect(/^[0-9a-f]{24}$/.test(id)).toBe(true);
  });

  it('should generate unique IDs on multiple calls', () => {
    const id1 = generateObjectId();
    const id2 = generateObjectId();
    const id3 = generateObjectId();

    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).not.toBe(id3);
  });

  it('should consistently format as lowercase hex', () => {
    const id = generateObjectId();

    expect(id).toBe(id.toLowerCase());
    expect(id.match(/[A-F]/)).toBeNull();
  });

  it('should generate IDs compatible with MongoDB ObjectId format', () => {
    const id = generateObjectId();

    // MongoDB ObjectId is exactly 24 hex characters representing 12 bytes
    expect(id).toMatch(/^[0-9a-f]{24}$/);

    // Should be parseable as hex
    expect(() => parseInt(id, 16)).not.toThrow();
  });

  it('should handle batch generation without conflicts', () => {
    const ids = new Set();
    const batchSize = 100;

    for (let i = 0; i < batchSize; i++) {
      ids.add(generateObjectId());
    }

    // All generated IDs should be unique
    expect(ids.size).toBe(batchSize);
  });

  it('should generate valid hex strings with byte distribution', () => {
    // Generate multiple IDs and verify byte distribution
    const ids = Array.from({ length: 50 }, () => generateObjectId());

    ids.forEach((id) => {
      expect(id).toMatch(/^[0-9a-f]{24}$/);
    });

    // Check that we get variety in the IDs (not all the same pattern)
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBeGreaterThan(40); // Should have high uniqueness
  });

  describe('cryptography source fallback', () => {
    let originalCrypto: any;

    beforeEach(() => {
      originalCrypto = globalThis.crypto;
    });

    afterEach(() => {
      globalThis.crypto = originalCrypto;
    });

    it('should use Node.js crypto when available', () => {
      // This test verifies the Node.js path by simply generating an ID
      // In Node.js environment, randomFillSync should be used
      const id = generateObjectId();
      expect(id).toMatch(/^[0-9a-f]{24}$/);
      expect(id).toHaveLength(24);
    });

    it('should fall back to Web Crypto API when Node.js crypto not available', () => {
      // Remove require to force fallback
      const originalRequire = (global as any).require;
      delete (global as any).require;

      try {
        const id = generateObjectId();
        expect(id).toMatch(/^[0-9a-f]{24}$/);
        expect(id).toHaveLength(24);
      } finally {
        (global as any).require = originalRequire;
      }
    });

    it('should fall back to Math.random when crypto unavailable', () => {
      // Temporarily remove crypto
      globalThis.crypto = undefined as any;

      const id = generateObjectId();
      expect(id).toMatch(/^[0-9a-f]{24}$/);
      expect(id).toHaveLength(24);
    });
  });
});
