// Simple request helper utilities to be used by tests via alias `@test-helpers/request-helpers`.
// We intentionally implement these here so the jest alias (`@test-helpers`) resolves reliably
// in all environments (CI / local) without relying on path-specific re-exports.
export function createMockRequest(
  url: string,
  method: string = 'GET',
  body?: unknown,
  headers: Record<string, string> = {}
) {
  const bodyText =
    body && typeof body !== 'string'
      ? JSON.stringify(body)
      : (body as string | undefined);
  return new Request(url, {
    method,
    headers,
    body: bodyText,
  });
}

export function createInvalidJsonRequest(
  url: string,
  method: string = 'POST',
  rawBody: string,
  headers: Record<string, string> = {}
) {
  // Intentionally pass a raw, invalid JSON string in the body
  return new Request(url, {
    method,
    headers,
    body: rawBody,
  });
}
