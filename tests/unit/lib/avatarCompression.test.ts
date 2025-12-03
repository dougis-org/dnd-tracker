/**
 * Avatar Compression Utility - Unit Tests
 *
 * TDD-FIRST: These tests are designed to FAIL before implementation.
 * Tests specify expected behavior for:
 * - JPEG/PNG/WebP compression
 * - Format validation
 * - Timeout handling
 * - Base64 size limits
 * - Error handling
 */

import {
  compressAvatar,
  validateAvatarFile,
} from '@/lib/wizards/avatarCompression';
import type {
  AvatarCompressionResult,
  AvatarValidationResult,
} from '@/types/wizard';

// Helper to create a mock file blob for testing
function createMockImageBlob(
  sizeBytes: number = 500000,
  mimeType: string = 'image/jpeg'
): Blob {
  const buffer = new Uint8Array(sizeBytes);
  // Add JPEG magic bytes if JPEG type
  if (mimeType === 'image/jpeg') {
    buffer[0] = 0xff;
    buffer[1] = 0xd8;
  }
  return new Blob([buffer], { type: mimeType });
}

describe('Avatar Compression - avatarCompression.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    if (typeof global !== 'undefined') {
      global.URL = global.URL || {};
      global.URL.createObjectURL = jest.fn(
        (_blob) => `blob:mock/${Math.random().toString(36).substring(2)}`
      );
      global.URL.revokeObjectURL = jest.fn();
    }
  });

  // Test 1: Compress JPEG image successfully
  // NOTE: Skipped in unit tests - requires real canvas (tested in E2E/Playwright tests)
  test.skip('T003.1 should compress JPEG image to target size', async () => {
    // Arrange: Create mock JPEG blob (500KB)
    const jpegBlob = createMockImageBlob(500000, 'image/jpeg');

    // Act: Compress the avatar
    const result: AvatarCompressionResult = await compressAvatar(jpegBlob);

    // Assert
    expect(result).toBeDefined();
    expect(result.compressed).toBeDefined();
    expect(result.compressed).toMatch(/^data:image\/jpeg;base64,/); // Base64 with prefix
    expect(result.sizeKB).toBeLessThanOrEqual(100); // Target: ≤100KB
    expect(result.mimeType).toBe('image/jpeg');
    expect(result.compressionRatio).toBeGreaterThan(1);
    expect(result.sizeBytes).toBeGreaterThan(0);
    expect(result.originalSizeBytes).toBe(500000);
  });

  // Test 2: Compress PNG image successfully
  // NOTE: Skipped in unit tests - requires real canvas (tested in E2E/Playwright tests)
  test.skip('T003.2 should compress PNG image to target size', async () => {
    // Arrange: Create mock PNG blob (500KB)
    const pngBlob = createMockImageBlob(500000, 'image/png');

    // Act: Compress the avatar
    const result: AvatarCompressionResult = await compressAvatar(pngBlob);

    // Assert
    expect(result).toBeDefined();
    expect(result.compressed).toBeDefined();
    expect(result.sizeKB).toBeLessThanOrEqual(100);
    expect(result.mimeType).toBe('image/jpeg'); // Should convert PNG to JPEG for efficiency
    expect(result.originalSizeBytes).toBe(500000);
    expect(result.compressionRatio).toBeGreaterThan(1);
  });

  // Test 3: Compress WebP image successfully
  // NOTE: Skipped in unit tests - requires real canvas (tested in E2E/Playwright tests)
  test.skip('T003.3 should compress WebP image to target size', async () => {
    // Arrange: Create mock WebP blob (500KB)
    const webpBlob = createMockImageBlob(500000, 'image/webp');

    // Act: Compress the avatar
    const result: AvatarCompressionResult = await compressAvatar(webpBlob);

    // Assert
    expect(result).toBeDefined();
    expect(result.sizeKB).toBeLessThanOrEqual(100);
    expect(result.compressionRatio).toBeGreaterThanOrEqual(1);
    expect(result.mimeType).toMatch(/jpeg|webp/); // JPEG or original WebP
  });

  // Test 4: Reject invalid image format with proper error
  test('T003.4 should reject invalid image format', async () => {
    // Arrange: Create blob with unsupported MIME type
    const invalidBlob = new Blob(['not an image'], { type: 'text/plain' });

    // Act & Assert: Should throw error with clear message
    await expect(compressAvatar(invalidBlob)).rejects.toThrow(
      /invalid|unsupported|format/i
    );
  });

  // Test 5: Reject oversized files exceeding 2MB limit
  test('T003.5 should reject files exceeding 2MB size limit', async () => {
    // Arrange: Create blob exceeding 2MB limit
    const oversizedBlob = createMockImageBlob(2.5 * 1024 * 1024, 'image/jpeg'); // 2.5MB

    // Act & Assert: Should reject with file size error
    await expect(compressAvatar(oversizedBlob)).rejects.toThrow(
      /must be.*or less|2MB/i
    );
  });

  // Test 6: Enforce base64 size limit (250KB)
  // NOTE: Skipped in unit tests - requires real canvas (tested in E2E/Playwright tests)
  test.skip('T003.6 should enforce max base64 size (250KB)', async () => {
    // Arrange: Create image that will be compressed
    const largeJpegBlob = createMockImageBlob(1024 * 1024, 'image/jpeg'); // 1MB input

    // Act: Compress the avatar
    const result: AvatarCompressionResult = await compressAvatar(largeJpegBlob);

    // Assert: Compressed size should not exceed 250KB
    expect(result.sizeBytes).toBeLessThanOrEqual(250 * 1024);
    expect(result.sizeKB).toBeLessThanOrEqual(250);
  });

  // Test 7: Handle corrupted/invalid image data gracefully
  // NOTE: Skipped in unit tests - requires real canvas (tested in E2E/Playwright tests)
  test.skip('T003.7 should handle corrupted image data with error', async () => {
    // Arrange: Create blob with invalid JPEG header
    const corruptedBlob = new Blob(
      [new Uint8Array([0xff, 0xd8, 0xff])], // Truncated/invalid JPEG
      { type: 'image/jpeg' }
    );

    // Act & Assert: Should throw error for corrupted data
    await expect(compressAvatar(corruptedBlob)).rejects.toThrow();
  });

  // Test 8: Return proper compression metadata
  // NOTE: Skipped in unit tests - requires real canvas (tested in E2E/Playwright tests)
  test.skip('T003.8 should return accurate compression metadata', async () => {
    // Arrange: Create mock image
    const jpegBlob = createMockImageBlob(500000, 'image/jpeg');

    // Act
    const result: AvatarCompressionResult = await compressAvatar(jpegBlob);

    // Assert: All metadata present and accurate
    expect(result).toMatchObject({
      compressed: expect.any(String),
      sizeBytes: expect.any(Number),
      sizeKB: expect.any(Number),
      mimeType: expect.any(String),
      originalSizeBytes: expect.any(Number),
      compressionRatio: expect.any(Number),
    });

    // Verify calculations are correct
    expect(result.sizeKB).toBe(Math.round(result.sizeBytes / 1024));
    expect(result.compressionRatio).toBeCloseTo(
      result.originalSizeBytes / result.sizeBytes,
      2
    );
  });
});

describe('Avatar Validation - avatarCompression.ts', () => {
  // Test 9: Validate file size constraints
  test('T003.9 should validate file size (max 2MB)', () => {
    // Arrange: Create blobs at boundary conditions
    const validBlob = createMockImageBlob(1024 * 1024, 'image/jpeg'); // 1MB (valid)
    const maxValidBlob = createMockImageBlob(2 * 1024 * 1024, 'image/jpeg'); // 2MB (at limit)
    const tooLargeBlob = createMockImageBlob(3 * 1024 * 1024, 'image/jpeg'); // 3MB (too large)

    // Act & Assert
    const validResult: AvatarValidationResult = validateAvatarFile(validBlob);
    expect(validResult.isValid).toBe(true);
    expect(validResult.error).toBeUndefined();

    const maxValidResult: AvatarValidationResult =
      validateAvatarFile(maxValidBlob);
    expect(maxValidResult.isValid).toBe(true);

    const invalidResult: AvatarValidationResult =
      validateAvatarFile(tooLargeBlob);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.error).toContain('2MB');
  });

  // Test 10: Validate file format (JPEG, PNG, WebP only)
  test('T003.10 should validate file format (JPEG, PNG, WebP only)', () => {
    // Arrange: Create blobs with various MIME types
    const validJpeg = createMockImageBlob(500000, 'image/jpeg');
    const validPng = createMockImageBlob(500000, 'image/png');
    const validWebp = createMockImageBlob(500000, 'image/webp');
    const invalidGif = new Blob(['data'], { type: 'image/gif' });
    const invalidBmp = new Blob(['data'], { type: 'image/bmp' });
    const invalidText = new Blob(['data'], { type: 'text/plain' });

    // Act & Assert: Valid formats should pass
    expect(validateAvatarFile(validJpeg).isValid).toBe(true);
    expect(validateAvatarFile(validPng).isValid).toBe(true);
    expect(validateAvatarFile(validWebp).isValid).toBe(true);

    // Invalid formats should fail
    const gifResult = validateAvatarFile(invalidGif);
    expect(gifResult.isValid).toBe(false);
    expect(gifResult.error).toBeDefined();

    const bmpResult = validateAvatarFile(invalidBmp);
    expect(bmpResult.isValid).toBe(false);

    const textResult = validateAvatarFile(invalidText);
    expect(textResult.isValid).toBe(false);
  });
});
