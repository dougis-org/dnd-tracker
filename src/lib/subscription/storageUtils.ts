/**
 * Storage and JSON parsing utilities for subscription adapter
 */

// Type for global with optional localStorage (for Jest environment)
interface GlobalWithStorage {
  localStorage?: Storage;
}

export function getStorage(): Storage {
  // Browser environment
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }

  // Node/test environment (Jest)
  const globalObj = global as unknown as GlobalWithStorage;
  if (typeof global !== 'undefined' && globalObj.localStorage) {
    return globalObj.localStorage;
  }

  // Fallback: no-op storage for SSR/environments without localStorage
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  } as Storage;
}

export function safeJsonParse(jsonString: string | null): unknown {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse JSON from localStorage:', error);
    return null;
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
