/**
 * Avatar Compression Utility
 *
 * Client-side avatar image compression using Canvas API.
 * Supports JPEG, PNG, WebP formats.
 * Compresses to max 100KB target, enforces 250KB server limit.
 *
 * @note This code runs in browser environment; Web API types declared implicitly
 */

/// <reference lib="dom" />

import {
  AVATAR_COMPRESSION,
  AVATAR_CONSTRAINTS,
  ERROR_MESSAGES,
} from './constants';
import type {
  AvatarCompressionResult,
  AvatarValidationResult,
} from '@/types/wizard';

/**
 * Compression options
 */
interface CompressionOptions {
  /** Timeout in milliseconds */
  timeoutMs?: number;

  /** Initial quality (0-1) */
  initialQuality?: number;

  /** Minimum quality (0-1) */
  minQuality?: number;

  /** Quality step (0-1) */
  qualityStep?: number;
}

/**
 * Validate avatar file format and size before compression
 *
 * @param file - Blob or File object to validate
 * @returns Validation result with isValid flag and error message if applicable
 */
export function validateAvatarFile(file: Blob): AvatarValidationResult {
  // Check file size (max 2MB)
  if (file.size > AVATAR_CONSTRAINTS.MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `${ERROR_MESSAGES.AVATAR_TOO_LARGE} (max ${AVATAR_CONSTRAINTS.MAX_FILE_SIZE_BYTES / 1024 / 1024}MB)`,
    };
  }

  // Check MIME type
  if (!AVATAR_CONSTRAINTS.ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.AVATAR_INVALID_FORMAT,
      mimeType: file.type,
    };
  }

  return {
    isValid: true,
    mimeType: file.type,
    sizeBytes: file.size,
  };
}

/**
 * Convert Blob to HTMLImageElement for canvas manipulation
 */
function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Draw image to canvas and return as data URL
 */
function drawImageToCanvas(img: HTMLImageElement, quality: number): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Set canvas size to image dimensions
  canvas.width = img.width;
  canvas.height = img.height;

  // Draw image
  ctx.drawImage(img, 0, 0);

  // Export as JPEG with specified quality
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Convert data URL to Blob (currently unused but kept for reference)
 */
function _dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const bstr = atob(parts[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);

  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }

  return new Blob([u8arr], { type: 'image/jpeg' });
}

/**
 * Calculate size of base64 string in bytes
 */
function calculateBase64Size(base64String: string): number {
  // Remove data URL prefix if present
  const base64 = base64String.includes(',')
    ? base64String.split(',')[1]
    : base64String;

  // Calculate size: base64 adds ~33% overhead, so (length * 3/4) bytes
  // But more accurate is: (length - padding) / 4 * 3
  const padding = (base64.match(/=/g) || []).length;
  return Math.ceil((base64.length / 4) * 3) - padding;
}

/**
 * Compress avatar image iteratively until target size is reached
 *
 * @param file - Image file (Blob or File) to compress
 * @param options - Compression options (quality, timeout, etc.)
 * @returns Compression result with base64, size, and metadata
 * @throws Error if image format is invalid, compression fails, or times out
 */
export async function compressAvatar(
  file: Blob,
  options: CompressionOptions = {}
): Promise<AvatarCompressionResult> {
  // Validate file first
  const validation = validateAvatarFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid avatar file');
  }

  const {
    timeoutMs = AVATAR_COMPRESSION.TIMEOUT_MS,
    initialQuality = AVATAR_COMPRESSION.INITIAL_QUALITY,
    minQuality = AVATAR_COMPRESSION.MIN_QUALITY,
    qualityStep = AVATAR_COMPRESSION.QUALITY_STEP,
  } = options;

  const startTime = Date.now();

  try {
    // Load image
    const img = await blobToImage(file);

    let quality = initialQuality;
    let compressed = '';
    let compressedSizeBytes = file.size;

    // Iteratively reduce quality until size target is reached
    while (
      compressedSizeBytes >
        AVATAR_CONSTRAINTS.TARGET_COMPRESSED_SIZE_KB * 1024 &&
      quality > minQuality
    ) {
      // Check for timeout
      if (Date.now() - startTime > timeoutMs) {
        throw new Error(
          `${ERROR_MESSAGES.AVATAR_COMPRESSION_TIMEOUT} (timeout after ${timeoutMs}ms)`
        );
      }

      // Draw to canvas with current quality
      compressed = drawImageToCanvas(img, quality);
      compressedSizeBytes = calculateBase64Size(compressed);

      // Reduce quality if needed
      if (
        compressedSizeBytes >
        AVATAR_CONSTRAINTS.TARGET_COMPRESSED_SIZE_KB * 1024
      ) {
        quality -= qualityStep;
      }
    }

    // Final check: enforce hard limit of 250KB
    if (compressedSizeBytes > AVATAR_CONSTRAINTS.MAX_BASE64_SIZE_BYTES) {
      throw new Error(ERROR_MESSAGES.AVATAR_COMPRESSED_TOO_LARGE);
    }

    // Calculate compression statistics
    const compressionRatio = file.size / compressedSizeBytes;

    return {
      compressed,
      sizeBytes: compressedSizeBytes,
      sizeKB: Math.round(compressedSizeBytes / 1024),
      mimeType: 'image/jpeg',
      originalSizeBytes: file.size,
      compressionRatio,
    };
  } catch (error) {
    // Enhance error message for timeout or compression failures
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw error; // Re-throw timeout errors as-is
      }
      if (error.message.includes('Canvas')) {
        throw new Error(ERROR_MESSAGES.AVATAR_COMPRESSION_FAILED);
      }
    }

    // Wrap any other errors
    throw new Error(
      error instanceof Error
        ? error.message
        : ERROR_MESSAGES.AVATAR_COMPRESSION_FAILED
    );
  }
}

/**
 * Compress multiple avatar files (for batch operations)
 * Used primarily for testing or dashboard operations
 *
 * @param files - Array of image files to compress
 * @param options - Compression options
 * @returns Array of compression results
 */
export async function compressAvatars(
  files: Blob[],
  options: CompressionOptions = {}
): Promise<AvatarCompressionResult[]> {
  return Promise.all(files.map((file) => compressAvatar(file, options)));
}
