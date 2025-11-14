/**
 * Storage and JSON parsing utilities for subscription adapter
 */

export function getStorage(): Storage {
  // Browser environment
  if (typeof window !== 'undefined' && window.localStorage) {
    console.log('[getStorage] Returning window.localStorage');
    return window.localStorage;
  }
  
  // Node/test environment (Jest)
  if (typeof global !== 'undefined' && (global as any).localStorage) {
    console.log('[getStorage] Returning global.localStorage', {
      isGlobalLocalStorage: (global as any).localStorage === global.localStorage,
      hasGetItem: typeof (global as any).localStorage?.getItem === 'function',
      hasRemoveItem: typeof (global as any).localStorage?.removeItem === 'function',
    });
    return (global as any).localStorage;
  }
  
  // Fallback: no-op storage for SSR/environments without localStorage
  console.log('[getStorage] Returning no-op fallback storage');
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
