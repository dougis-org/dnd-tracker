// Lightweight, dependency-free ObjectId generator compatible with MongoDB's 24-hex format.
// Uses secure random sources when available (Node's crypto or Web Crypto API).
export function generateObjectId(): string {
  // 12 bytes -> 24 hex chars
  const bytes = new Uint8Array(12);

  // Node.js crypto (when running server-side)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodeCrypto = require('crypto');
    if (nodeCrypto && typeof nodeCrypto.randomFillSync === 'function') {
      nodeCrypto.randomFillSync(bytes);
      return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch (e) {
    // fall through to web crypto below
  }

  // Browser / Web Crypto
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  ) {
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Fallback to Math.random (not ideal, but ensures function returns an ID)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default generateObjectId;
