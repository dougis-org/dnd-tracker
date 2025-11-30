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
});
