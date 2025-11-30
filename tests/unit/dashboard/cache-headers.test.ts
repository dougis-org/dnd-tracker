/**
 * Cache Header Validation Tests
 * Tests for no-cache header configuration
 */

import { CACHE_HEADERS } from './fixtures';

describe('Cache Header Validation', () => {
  it('should set Cache-Control: no-store header', () => {
    const cacheControl = CACHE_HEADERS['Cache-Control'];
    expect(cacheControl).toContain('no-store');
  });

  it('should include no-cache directive', () => {
    const cacheControl = CACHE_HEADERS['Cache-Control'];
    expect(cacheControl).toContain('no-cache');
  });

  it('should include must-revalidate directive', () => {
    const cacheControl = CACHE_HEADERS['Cache-Control'];
    expect(cacheControl).toContain('must-revalidate');
  });

  it('should include proxy-revalidate directive', () => {
    const cacheControl = CACHE_HEADERS['Cache-Control'];
    expect(cacheControl).toContain('proxy-revalidate');
  });

  it('should set Pragma: no-cache header', () => {
    const pragma = CACHE_HEADERS['Pragma'];
    expect(pragma).toBe('no-cache');
  });

  it('should set Expires: 0 header', () => {
    const expires = CACHE_HEADERS['Expires'];
    expect(expires).toBe('0');
  });

  it('should have all required cache headers', () => {
    expect(CACHE_HEADERS['Cache-Control']).toBeDefined();
    expect(CACHE_HEADERS['Pragma']).toBeDefined();
    expect(CACHE_HEADERS['Expires']).toBeDefined();
  });
});
