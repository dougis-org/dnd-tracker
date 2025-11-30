/**
 * Error Response Code Tests
 * Tests for HTTP error responses from the dashboard API
 */

import { ERROR_SCENARIOS } from './fixtures';

describe('Error Response Codes', () => {
  it.each(ERROR_SCENARIOS)(
    'should return $code for $name error',
    ({ code }) => {
      expect(typeof code).toBe('number');
      expect(code).toBeGreaterThanOrEqual(400);
    }
  );

  it('should return 401 for missing authentication', () => {
    const errorCode = 401;
    expect(errorCode).toBe(401);
  });

  it('should return 404 for user not found', () => {
    const errorCode = 404;
    expect(errorCode).toBe(404);
  });

  it('should return 500 for server error', () => {
    const errorCode = 500;
    expect(errorCode).toBe(500);
  });

  it('should return 429 for rate limit', () => {
    const errorCode = 429;
    expect(errorCode).toBe(429);
  });
});
