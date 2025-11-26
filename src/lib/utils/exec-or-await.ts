/**
 * execOrAwait helper
 * Accepts either a Mongoose Query (exposes .exec()) or a Promise or value.
 * If `.exec` exists, call `.exec()` and await the result.
 * If the object is thenable (Promise-like), await it.
 * Otherwise, return the value synchronously.
 */
export async function execOrAwait<T>(
  maybeQuery: unknown
): Promise<T> {
  if (!maybeQuery) {
    return maybeQuery as T;
  }
  // Type guard: check if has .exec() method (Mongoose Query)
  if (
    typeof maybeQuery === 'object' &&
    maybeQuery !== null &&
    'exec' in maybeQuery &&
    typeof (maybeQuery as { exec?: unknown }).exec === 'function'
  ) {
    return await ((maybeQuery as { exec: () => Promise<T> }).exec());
  }
  // Type guard: check if thenable (Promise-like)
  if (
    typeof maybeQuery === 'object' &&
    maybeQuery !== null &&
    'then' in maybeQuery &&
    typeof (maybeQuery as { then?: unknown }).then === 'function'
  ) {
    return await (maybeQuery as Promise<T>);
  }
  return maybeQuery as T;
}

export default execOrAwait;
