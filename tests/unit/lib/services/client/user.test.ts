/**
 * Unit tests for client-side user service
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { updateUserProfile } from '@/lib/services/client/user';

// Mock global fetch
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('Client User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateUserProfile', () => {
    test('should make PUT request to profile API', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({}),
      } as Response;

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse);

      const data = { displayName: 'Test User', profileSetupCompleted: true };
      await updateUserProfile(data);

      expect(global.fetch).toHaveBeenCalledWith('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    });

    test('should throw error with API error message on failure', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({ error: 'Profile update failed' }),
      } as Response;

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse);

      await expect(updateUserProfile({ displayName: 'Test' })).rejects.toThrow(
        'Profile update failed'
      );
    });

    test('should use custom error message if API error not provided', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({}),
      } as Response;

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse);

      await expect(
        updateUserProfile({ displayName: 'Test' }, 'Custom error message')
      ).rejects.toThrow('Custom error message');
    });

    test('should use default error message if none provided', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({}),
      } as Response;

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse);

      await expect(updateUserProfile({ displayName: 'Test' })).rejects.toThrow(
        'Failed to update profile'
      );
    });
  });
});
