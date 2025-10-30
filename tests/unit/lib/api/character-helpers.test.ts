import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { NextResponse } from 'next/server';
import {
  handleCharacterNotFound,
  handleCharacterErrors,
} from '../../../../src/lib/api/character-helpers';

describe('Character API Helpers', () => {
  describe('handleCharacterNotFound', () => {
    it('returns notFound response for RangeError with correct message', () => {
      const error = new RangeError('Character not found');
      const result = handleCharacterNotFound(error);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.status).toBe(404);
        expect(typeof result.json).toBe('function');
      }
    });

    it('returns null for RangeError with different message', () => {
      const error = new RangeError('Some other error');
      const result = handleCharacterNotFound(error);

      expect(result).toBeNull();
    });

    it('returns null for non-RangeError', () => {
      const error = new Error('Generic error');
      const result = handleCharacterNotFound(error);

      expect(result).toBeNull();
    });

    it('returns null for null error', () => {
      const result = handleCharacterNotFound(null);
      expect(result).toBeNull();
    });

    it('returns null for undefined error', () => {
      const result = handleCharacterNotFound(undefined);
      expect(result).toBeNull();
    });

    it('returns null for string error', () => {
      const result = handleCharacterNotFound('Character not found');
      expect(result).toBeNull();
    });
  });

  describe('handleCharacterErrors', () => {
    const consoleSpy = { error: jest.fn() };

    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(consoleSpy.error);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('logs error with correct endpoint prefix', () => {
      const error = new Error('Test error');
      expect(() => {
        handleCharacterErrors('POST /api/characters', error);
      }).toThrow(error);

      expect(consoleSpy.error).toHaveBeenCalledWith(
        'POST /api/characters error:',
        error
      );
    });

    it('rethrows the error', () => {
      const error = new RangeError('Character not found');

      expect(() => {
        handleCharacterErrors('GET /api/characters/123', error);
      }).toThrow(error);
    });

    it('works with different error types', () => {
      const typeError = new TypeError('Invalid type');

      expect(() => {
        handleCharacterErrors('PATCH /api/characters/123', typeError);
      }).toThrow(typeError);

      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('logs non-Error objects', () => {
      const stringError = 'String error';

      expect(() => {
        handleCharacterErrors('DELETE /api/characters/123', stringError);
      }).toThrow(stringError);

      expect(consoleSpy.error).toHaveBeenCalledWith(
        'DELETE /api/characters/123 error:',
        stringError
      );
    });
  });
});
