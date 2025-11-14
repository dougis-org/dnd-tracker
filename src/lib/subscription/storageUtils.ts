/**
 * Storage and JSON parsing utilities for subscription adapter
 */

export function getStorage(): Storage {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
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
