/**
 * execOrAwait helper
 * Accepts either a Mongoose Query (exposes .exec()) or a Promise or value.
 * If `.exec` exists, call `.exec()` and await the result.
 * If the object is thenable (Promise-like), await it.
 * Otherwise, return the value synchronously.
 */
export async function execOrAwait<T>(maybeQuery: any): Promise<T> {
  if (!maybeQuery) {
    return maybeQuery as T;
  }
  if (typeof maybeQuery.exec === 'function') {
    return await maybeQuery.exec();
  }
  // If it's thenable (Promise-like)
  if (typeof maybeQuery.then === 'function') {
    return await maybeQuery;
  }
  return maybeQuery as T;
}

export default execOrAwait;
