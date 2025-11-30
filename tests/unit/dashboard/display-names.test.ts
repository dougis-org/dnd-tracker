/**
 * Display Name Fallback Tests
 * Tests for display name fallback to email logic
 */

import { DISPLAY_NAME_CASES } from './fixtures';

describe('Display Name Fallback', () => {
  it.each(DISPLAY_NAME_CASES)(
    'should display "$expected" for displayName="$displayName"',
    ({ displayName, email, expected }) => {
      const displayed = displayName || email;
      expect(displayed).toBe(expected);
    }
  );

  it('should use displayName when available', () => {
    const displayName = 'John Doe';
    const email = 'john@example.com';
    const displayed = displayName || email;
    expect(displayed).toBe('John Doe');
  });

  it('should fall back to email when displayName is null', () => {
    const displayName: string | null = null;
    const email = 'john@example.com';
    const displayed = displayName || email;
    expect(displayed).toBe('john@example.com');
  });

  it('should fall back to email when displayName is empty string', () => {
    const displayName = '';
    const email = 'john@example.com';
    const displayed = displayName || email;
    expect(displayed).toBe('john@example.com');
  });

  it('should fall back to email when displayName is undefined', () => {
    const displayName: string | undefined = undefined;
    const email = 'john@example.com';
    const displayed = displayName || email;
    expect(displayed).toBe('john@example.com');
  });
});
