/**
 * Mock Cache API for testing cache-evictor
 */

/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Mock Cache implementation
 */
export class MockCache {
  private entries: Map<string, Response> = new Map();

  async put(request: RequestInfo | URL, response: Response): Promise<void> {
    const key = typeof request === 'string' ? request : request.toString();
    this.entries.set(key, response);
  }

  async match(request: RequestInfo | URL): Promise<Response | undefined> {
    const key =
      typeof request === 'string' ? request : (request as Request).url;
    return this.entries.get(key);
  }

  async delete(request: RequestInfo | URL): Promise<boolean> {
    const key =
      typeof request === 'string' ? request : (request as Request).url;
    return this.entries.delete(key);
  }

  async keys(): Promise<Request[]> {
    return Array.from(this.entries.keys()).map((url) => new Request(url));
  }
}

/**
 * Mock CacheStorage implementation
 */
export class MockCacheStorage {
  private caches: Map<string, MockCache> = new Map();

  async open(name: string): Promise<Cache> {
    if (!this.caches.has(name)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.caches.set(name, new MockCache() as any);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.caches.get(name)! as any;
  }

  async keys(): Promise<string[]> {
    return Array.from(this.caches.keys());
  }

  async delete(name: string): Promise<boolean> {
    return this.caches.delete(name);
  }

  async has(name: string): Promise<boolean> {
    return this.caches.has(name);
  }

  async match(request: RequestInfo | URL): Promise<Response | undefined> {
    for (const cache of this.caches.values()) {
      const response = await cache.match(request);
      if (response) return response;
    }
    return undefined;
  }
}

/**
 * Mock Blob with size calculation
 */
export class MockBlob {
  size: number;

  constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
    this.size = this.calculateSize(parts);
  }

  private calculateSize(parts?: BlobPart[]): number {
    if (!parts || parts.length === 0) return 0;

    return parts.reduce((sum: number, part: BlobPart) => {
      if (typeof part === 'string') return sum + part.length;
      if (part instanceof ArrayBuffer) return sum + part.byteLength;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ('size' in part) return sum + (part as any).size;
      return sum;
    }, 0);
  }
}

/**
 * Mock Response with clone support
 */
export class MockResponse {
  private _body: BodyInit | null;
  body: null = null;
  headers: Headers;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this._body = body ?? null;
    this.headers = new Headers(init?.headers);
  }

  clone(): Response {
    return new Response(this._body, { headers: this.headers });
  }

  async blob(): Promise<Blob> {
    if (this._body === null || this._body === undefined) {
      return new Blob();
    }
    if (typeof this._body === 'string') {
      return new Blob([this._body]);
    }
    if (this._body instanceof Blob) {
      return this._body;
    }
    return new Blob([this._body as BlobPart]);
  }
}

/**
 * Mock Headers implementation
 */
export class MockHeaders {
  private map: Map<string, string> = new Map();

  constructor(init?: HeadersInit) {
    if (init) {
      const entries = Array.isArray(init) ? init : Object.entries(init);
      for (const [key, value] of entries) {
        this.set(key, value);
      }
    }
  }

  get(name: string): string | null {
    return this.map.get(name.toLowerCase()) || null;
  }

  set(name: string, value: string): void {
    this.map.set(name.toLowerCase(), value);
  }

  has(name: string): boolean {
    return this.map.has(name.toLowerCase());
  }
}

/**
 * Mock Request implementation
 */
export class MockRequest {
  url: string;

  constructor(input: string | Request) {
    this.url = typeof input === 'string' ? input : input.url;
  }
}

/**
 * Install all Cache API mocks globally
 */
export function installCacheAPIMocks(): void {
  if (typeof global.caches === 'undefined') {
    (global as Record<string, unknown>).caches = new MockCacheStorage();
  }

  if (typeof global.Request === 'undefined') {
    global.Request = MockRequest as typeof globalThis.Request;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.Blob = MockBlob as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.Response = MockResponse as any;

  if (typeof global.Headers === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.Headers = MockHeaders as any;
  }
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<void> {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));
}
