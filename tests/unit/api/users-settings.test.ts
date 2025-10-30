/**
 * Unit tests for /api/users/[id]/settings route handlers
 *
 * @jest-environment node
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GET } from '@/app/api/users/[id]/settings/route';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/db/connection';
import User from '@/lib/db/models/User';
import {
  createMockUser,
  setupAuthMocks,
  setupAuthFailure,
  expectErrorResponse,
  expectSuccessResponse,
  createError,
} from '@tests/utils/test-helpers';

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockConnectToDatabase = connectToDatabase as jest.MockedFunction<
  typeof connectToDatabase
>;
const mockUser = User as any;

describe('/api/users/[id]/settings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    const mockRequest = {} as Request;
    const createMockContext = (id: string) => ({
      params: Promise.resolve({ id }),
    });

    it('should return user settings for authenticated user', async () => {
      const userId = 'test-user-id';
      const mockUserDoc = createMockUser({
        _id: 'user-mongo-id',
        id: userId,
        profile: {
          displayName: 'Test User',
          timezone: 'America/New_York',
          dndEdition: '5th Edition',
          experienceLevel: 'intermediate',
          primaryRole: 'dm',
          profileSetupCompleted: true,
        },
        preferences: {
          theme: 'dark',
          emailNotifications: true,
          browserNotifications: false,
          timezone: 'America/New_York',
          language: 'en',
          diceRollAnimations: true,
          autoSaveEncounters: false,
        },
      });

      mockAuth.mockResolvedValue({ userId });
      mockConnectToDatabase.mockResolvedValue(undefined);
      mockUser.findById = jest.fn().mockResolvedValue(mockUserDoc);

      const response = await GET(mockRequest, createMockContext('user-mongo-id'));
      const data = await expectSuccessResponse(response, 200, [
        'profile',
        'preferences',
      ]);

      expect(data.profile.displayName).toBe('Test User');
      expect(data.profile.timezone).toBe('America/New_York');
      expect(data.preferences.theme).toBe('dark');
      expect(mockUser.findById).toHaveBeenCalledWith('user-mongo-id');
    });

    it('should return default values for missing profile fields', async () => {
      const userId = 'test-user-id';
      const mockUserDoc = createMockUser({
        _id: 'user-mongo-id',
        id: userId,
        profile: {},
        preferences: {},
      });

      mockAuth.mockResolvedValue({ userId });
      mockConnectToDatabase.mockResolvedValue(undefined);
      mockUser.findById = jest.fn().mockResolvedValue(mockUserDoc);

      const response = await GET(mockRequest, createMockContext('user-mongo-id'));
      const data = await expectSuccessResponse(response, 200);

      expect(data.profile.displayName).toBe(null);
      expect(data.profile.timezone).toBe('UTC');
      expect(data.profile.dndEdition).toBe('5th Edition');
      expect(data.preferences.theme).toBe('system');
      expect(data.preferences.emailNotifications).toBe(true);
    });

    it('should return 401 for unauthenticated user', async () => {
      setupAuthFailure(mockAuth, 'no-user');

      const response = await GET(mockRequest, createMockContext('user-mongo-id'));
      await expectErrorResponse(response, 401, 'Unauthorized');
    });

    it('should return 404 if user not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'test-user-id' });
      mockConnectToDatabase.mockResolvedValue(undefined);
      mockUser.findById = jest.fn().mockResolvedValue(null);

      const response = await GET(mockRequest, createMockContext('user-mongo-id'));
      await expectErrorResponse(response, 404, 'User not found');
    });

    it('should return 403 if userId does not match authenticated user', async () => {
      const mockUserDoc = createMockUser({
        _id: 'user-mongo-id',
        id: 'different-user-id',
      });

      mockAuth.mockResolvedValue({ userId: 'test-user-id' });
      mockConnectToDatabase.mockResolvedValue(undefined);
      mockUser.findById = jest.fn().mockResolvedValue(mockUserDoc);

      const response = await GET(mockRequest, createMockContext('user-mongo-id'));
      await expectErrorResponse(response, 403, 'Forbidden');
    });

    it('should return 500 on database connection error', async () => {
      setupAuthFailure(mockAuth, 'db-error', mockConnectToDatabase);

      const response = await GET(mockRequest, createMockContext('user-mongo-id'));
      await expectErrorResponse(response, 500, 'Internal server error');
    });

    it('should return 500 on unexpected error', async () => {
      mockAuth.mockResolvedValue({ userId: 'test-user-id' });
      mockConnectToDatabase.mockResolvedValue(undefined);
      mockUser.findById = jest
        .fn()
        .mockRejectedValue(createError('Error', 'Database query failed'));

      const response = await GET(mockRequest, createMockContext('user-mongo-id'));
      await expectErrorResponse(response, 500, 'Internal server error');
    });
  });
});
