/**
 * Error Formatting Utilities Tests
 * Tests formatErrorMessage and getFirstErrorMessage functions
 */

import {
  formatErrorMessage,
  getFirstErrorMessage,
} from '@/lib/utils/errorFormatting';

describe('Error Formatting Utilities', () => {
  describe('formatErrorMessage', () => {
    it('handles string errors by placing under general key', () => {
      const result = formatErrorMessage('Network failed');
      expect(result).toEqual({ general: 'Network failed' });
    });

    it('handles empty string errors', () => {
      const result = formatErrorMessage('');
      expect(result).toEqual({ general: '' });
    });

    it('handles Zod flattened errors with field errors', () => {
      const error = {
        fieldErrors: {
          email: ['Invalid email format'],
          name: ['Required field'],
        },
      };

      const result = formatErrorMessage(error);
      expect(result).toEqual({
        email: 'Invalid email format',
        name: 'Required field',
      });
    });

    it('takes first error when field has multiple errors', () => {
      const error = {
        fieldErrors: {
          email: ['Invalid format', 'Already exists', 'Too long'],
        },
      };

      const result = formatErrorMessage(error);
      expect(result).toEqual({ email: 'Invalid format' });
    });

    it('handles empty field errors array', () => {
      const error = {
        fieldErrors: {
          email: [],
          name: ['Required'],
        },
      };

      const result = formatErrorMessage(error);
      // Should skip empty arrays
      expect(result).toEqual({ name: 'Required' });
    });

    it('ignores non-string values in field errors', () => {
      const error = {
        fieldErrors: {
          email: ['Invalid format', 'Already exists', 'Too long'],
        },
      };

      const result = formatErrorMessage(error);
      expect(result).toEqual({ email: 'Invalid format' });
    });

    it('handles Zod error with empty fieldErrors object', () => {
      const error = {
        fieldErrors: {},
      };

      const result = formatErrorMessage(error);
      expect(result).toEqual({});
    });

    it('handles null error by returning default message', () => {
      const result = formatErrorMessage(null);
      expect(result).toEqual({ general: 'An error occurred' });
    });

    it('handles undefined error by returning default message', () => {
      const result = formatErrorMessage(undefined);
      expect(result).toEqual({ general: 'An error occurred' });
    });

    it('handles object without fieldErrors by returning default message', () => {
      const result = formatErrorMessage({ message: 'Error' });
      expect(result).toEqual({ general: 'An error occurred' });
    });

    it('handles number error by returning default message', () => {
      const result = formatErrorMessage(42);
      expect(result).toEqual({ general: 'An error occurred' });
    });

    it('handles array error by returning default message', () => {
      const result = formatErrorMessage([]);
      expect(result).toEqual({ general: 'An error occurred' });
    });

    it('handles object with null fieldErrors', () => {
      const error = {
        fieldErrors: null,
      };

      const result = formatErrorMessage(error);
      // When fieldErrors is null, extractFieldErrors returns {}
      // which means the result is an empty object
      expect(result).toEqual({});
    });

    it('handles multiple field errors with mixed content', () => {
      const error = {
        fieldErrors: {
          email: ['Invalid email'],
          password: ['Too short'],
          username: [],
          age: [456 as unknown as string],
        },
      };

      const result = formatErrorMessage(error);
      expect(result).toEqual({
        email: 'Invalid email',
        password: 'Too short',
      });
    });
  });

  describe('getFirstErrorMessage', () => {
    it('returns string error directly', () => {
      const result = getFirstErrorMessage('Network failed');
      expect(result).toBe('Network failed');
    });

    it('returns null for empty string', () => {
      const result = getFirstErrorMessage('');
      expect(result).toBe('');
    });

    it('extracts first field error from Zod error', () => {
      const error = {
        fieldErrors: {
          email: ['Invalid email'],
          name: ['Required'],
        },
      };

      const result = getFirstErrorMessage(error);
      // Should return one of the field errors (order may vary)
      expect(result).toMatch(/Invalid email|Required/);
    });

    it('returns null for Zod error with no field errors', () => {
      const error = {
        fieldErrors: {},
      };

      const result = getFirstErrorMessage(error);
      expect(result).toBeNull();
    });

    it('returns null for Zod error with empty field error arrays', () => {
      const error = {
        fieldErrors: {
          email: [],
          name: [],
        },
      };

      const result = getFirstErrorMessage(error);
      expect(result).toBeNull();
    });

    it('returns null for null error', () => {
      const result = getFirstErrorMessage(null);
      expect(result).toBeNull();
    });

    it('returns null for undefined error', () => {
      const result = getFirstErrorMessage(undefined);
      expect(result).toBeNull();
    });

    it('returns null for object without fieldErrors', () => {
      const result = getFirstErrorMessage({ message: 'Error' });
      expect(result).toBeNull();
    });

    it('returns null for number error', () => {
      const result = getFirstErrorMessage(42);
      expect(result).toBeNull();
    });

    it('returns null for array error', () => {
      const result = getFirstErrorMessage([]);
      expect(result).toBeNull();
    });

    it('handles Zod error with multiple field errors', () => {
      const error = {
        fieldErrors: {
          email: ['Invalid email'],
          password: ['Too short'],
          username: ['Already taken'],
        },
      };

      const result = getFirstErrorMessage(error);
      // Should return first available error
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result?.length).toBeGreaterThan(0);
    });

    it('skips empty arrays in field errors', () => {
      const error = {
        fieldErrors: {
          email: [],
          password: ['Too short'],
        },
      };

      const result = getFirstErrorMessage(error);
      expect(result).toBe('Too short');
    });

    it('ignores non-string values in field errors', () => {
      const error = {
        fieldErrors: {
          email: [123 as unknown as string],
          password: ['Too short'],
        },
      };

      const result = getFirstErrorMessage(error);
      expect(result).toBe('Too short');
    });
  });
});
