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
    const basicTests = [
      { input: 'Network failed', expected: { general: 'Network failed' }, desc: 'string error' },
      { input: '', expected: { general: '' }, desc: 'empty string' },
      { input: null, expected: { general: 'An error occurred' }, desc: 'null' },
      { input: undefined, expected: { general: 'An error occurred' }, desc: 'undefined' },
      { input: { message: 'Error' }, expected: { general: 'An error occurred' }, desc: 'object without fieldErrors' },
      { input: 42, expected: { general: 'An error occurred' }, desc: 'number' },
      { input: [], expected: { general: 'An error occurred' }, desc: 'array' },
    ];

    basicTests.forEach(({ input, expected, desc }) => {
      it(`handles ${desc}`, () => {
        expect(formatErrorMessage(input as any)).toEqual(expected);
      });
    });

    it('extracts field errors from Zod error', () => {
      const error = {
        fieldErrors: {
          email: ['Invalid email format'],
          name: ['Required field'],
        },
      };
      expect(formatErrorMessage(error)).toEqual({
        email: 'Invalid email format',
        name: 'Required field',
      });
    });

    it('takes first error when field has multiple errors', () => {
      const error = {
        fieldErrors: { email: ['Invalid format', 'Already exists', 'Too long'] },
      };
      expect(formatErrorMessage(error)).toEqual({ email: 'Invalid format' });
    });

    const edgeCaseTests = [
      { fieldErrors: {}, desc: 'empty fieldErrors' },
      { fieldErrors: { email: [], name: ['Required'] }, desc: 'with empty array' },
      { fieldErrors: null, desc: 'null fieldErrors' },
      { fieldErrors: { email: ['Invalid'], password: [], age: [456 as unknown as string] }, desc: 'mixed content' },
    ];

    edgeCaseTests.forEach(({ fieldErrors, desc }) => {
      it(`handles ${desc}`, () => {
        const result = formatErrorMessage({ fieldErrors } as any);
        expect(typeof result).toBe('object');
      });
    });
  });

  describe('getFirstErrorMessage', () => {
    const basicTests = [
      { input: 'Network failed', expected: 'Network failed', desc: 'string error' },
      { input: '', expected: '', desc: 'empty string' },
      { input: null, expected: null, desc: 'null' },
      { input: undefined, expected: null, desc: 'undefined' },
      { input: { message: 'Error' }, expected: null, desc: 'object without fieldErrors' },
      { input: 42, expected: null, desc: 'number' },
      { input: [], expected: null, desc: 'array' },
    ];

    basicTests.forEach(({ input, expected, desc }) => {
      it(`handles ${desc}`, () => {
        expect(getFirstErrorMessage(input as any)).toBe(expected);
      });
    });

    it('extracts first field error from Zod error', () => {
      const error = {
        fieldErrors: {
          email: ['Invalid email'],
          name: ['Required'],
        },
      };
      const result = getFirstErrorMessage(error);
      expect(result).toMatch(/Invalid email|Required/);
    });

    const edgeCaseTests = [
      { error: { fieldErrors: {} }, expected: null, desc: 'empty fieldErrors' },
      { error: { fieldErrors: { email: [], name: [] } }, expected: null, desc: 'all empty arrays' },
      { error: { fieldErrors: { email: [], password: ['Too short'] } }, expected: 'Too short', desc: 'skip empty arrays' },
      { error: { fieldErrors: { email: [123 as unknown as string], password: ['Too short'] } }, expected: 'Too short', desc: 'skip non-strings' },
      { error: { fieldErrors: { email: ['Invalid'], password: ['Too short'], user: ['Taken'] } }, expected: 'string', desc: 'multiple errors' },
    ];

    edgeCaseTests.forEach(({ error, expected, desc }) => {
      it(`handles ${desc}`, () => {
        const result = getFirstErrorMessage(error as any);
        if (expected === null) expect(result).toBeNull();
        else if (expected === 'string') expect(typeof result).toBe('string');
        else expect(result).toBe(expected);
      });
    });
  });
});
