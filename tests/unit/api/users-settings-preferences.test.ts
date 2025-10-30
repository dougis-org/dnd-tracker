/**
 * Unit tests for /api/users/[id]/settings/preferences route handlers
 *
 * @jest-environment node
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { PATCH } from '@/app/api/users/[id]/settings/preferences/route';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/db/connection';
import User from '@/lib/db/models/User';
import {
  createMockRequest,
  setupAuthFailure,
  expectErrorResponse,
  expectSuccessResponse,
  createError,
  createMockContext,
  setupSettingsRouteMocks,
  createSettingsUrl,
} from '@tests/utils/test-helpers';

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockConnectToDatabase = connectToDatabase as jest.MockedFunction<
  typeof connectToDatabase
>;
const mockUser = User as any;

describe('/api/users/[id]/settings/preferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PATCH', () => {

    it('should update user preferences with valid data', async () => {
      const userId = 'test-user-id';
      const mongoId = 'user-mongo-id';
      const mockUserDoc = setupSettingsRouteMocks(
        mockAuth,
        mockConnectToDatabase,
        mockUser,
        userId,
        mongoId,
        {
          preferences: {
            theme: 'light',
            emailNotifications: false,
          },
        }
      );

      const request = createMockRequest(
        createSettingsUrl(mongoId, '/preferences'),
        'PATCH',
        {
          theme: 'dark',
          emailNotifications: true,
          diceRollAnimations: false,
        }
      );

      const response = await PATCH(request, createMockContext('user-mongo-id'));
      const data = await expectSuccessResponse(response, 200, [
        'profile',
        'preferences',
      ]);

      expect(data.preferences.theme).toBe('dark');
      expect(data.preferences.emailNotifications).toBe(true);
      expect(data.preferences.diceRollAnimations).toBe(false);
      expect(mockUserDoc.save).toHaveBeenCalled();
    });

    it('should support partial updates', async () => {
      const userId = 'test-user-id';
      const mongoId = 'user-mongo-id';
      const mockUserDoc = setupSettingsRouteMocks(
        mockAuth,
        mockConnectToDatabase,
        mockUser,
        userId,
        mongoId,
        {
          preferences: {
            theme: 'dark',
            emailNotifications: true,
            browserNotifications: false,
          },
        }
      );

      const request = createMockRequest(
        createSettingsUrl(mongoId, '/preferences'),
        'PATCH',
        { theme: 'light' }
      );

      const response = await PATCH(request, createMockContext('user-mongo-id'));
      const data = await expectSuccessResponse(response, 200);

      expect(data.preferences.theme).toBe('light');
      // Other preferences should remain unchanged
      expect(mockUserDoc.save).toHaveBeenCalled();
    });

    it('should initialize preferences if not set', async () => {
      const userId = 'test-user-id';
      const mongoId = 'user-mongo-id';
      const mockUserDoc = setupSettingsRouteMocks(
        mockAuth,
        mockConnectToDatabase,
        mockUser,
        userId,
        mongoId,
        { preferences: undefined }
      );

      const request = createMockRequest(
        createSettingsUrl(mongoId, '/preferences'),
        'PATCH',
        { theme: 'dark' }
      );

      const response = await PATCH(request, createMockContext('user-mongo-id'));
      await expectSuccessResponse(response, 200);

      expect(mockUserDoc.preferences).toBeDefined();
      expect(mockUserDoc.save).toHaveBeenCalled();
    });

    it('should return 401 for unauthenticated user', async () => {
      setupAuthFailure(mockAuth, 'no-user');

      const request = createMockRequest(
        createSettingsUrl('user-mongo-id', '/preferences'),
        'PATCH',
        { theme: 'dark' }
      );

      const response = await PATCH(request, createMockContext('user-mongo-id'));
      await expectErrorResponse(response, 401, 'Unauthorized');
    });

    it('should return 400 for invalid theme', async () => {
      mockAuth.mockResolvedValue({ userId: 'test-user-id' });

      const request = createMockRequest(
        createSettingsUrl('user-mongo-id', '/preferences'),
        'PATCH',
        { theme: 'invalid-theme' }
      );

      const response = await PATCH(request, createMockContext('user-mongo-id'));
      await expectErrorResponse(response, 400, 'ValidationError');
    });

    it('should return 400 for invalid data types', async () => {
      mockAuth.mockResolvedValue({ userId: 'test-user-id' });

      const request = createMockRequest(
        createSettingsUrl('user-mongo-id', '/preferences'),
        'PATCH',
        { emailNotifications: 'not-a-boolean' }
      );

      const response = await PATCH(request, createMockContext('user-mongo-id'));
      await expectErrorResponse(response, 400, 'ValidationError');
    });

    it('should return 404 if user not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'test-user-id' });
      mockConnectToDatabase.mockResolvedValue(undefined);
      mockUser.findById = jest.fn().mockResolvedValue(null);

      const request = createMockRequest(
        'http://localhost:3000/api/users/user-mongo-id/settings/preferences',
        'PATCH',
        { theme: 'dark' }
      );

      const response = await PATCH(request, createMockContext('user-mongo-id'));
      await expectErrorResponse(response, 404, 'User not found');
    });

    it('should return 403 if userId does not match authenticated user', async () => {
      const mongoId = 'user-mongo-id';
      setupSettingsRouteMocks(
        mockAuth,
        mockConnectToDatabase,
        mockUser,
        'test-user-id',
        mongoId,
        { id: 'different-user-id' }
      );

      const request = createMockRequest(
        createSettingsUrl(mongoId, '/preferences'),
        'PATCH',
        { theme: 'dark' }
      );

      const response = await PATCH(request, createMockContext('user-mongo-id'));
      await expectErrorResponse(response, 403, 'Forbidden');
    });

    it('should return 500 on database connection error', async () => {
      setupAuthFailure(mockAuth, 'db-error', mockConnectToDatabase);

      const request = createMockRequest(
        'http://localhost:3000/api/users/user-mongo-id/settings/preferences',
        'PATCH',
        { theme: 'dark' }
      );

      const response = await PATCH(request, createMockContext('user-mongo-id'));
      await expectErrorResponse(response, 500, 'Internal server error');
    });

    it('should return 500 on save error', async () => {
      const mongoId = 'user-mongo-id';
      const mockUserDoc = setupSettingsRouteMocks(
        mockAuth,
        mockConnectToDatabase,
        mockUser,
        'test-user-id',
        mongoId,
        { save: jest.fn().mockRejectedValue(createError('Error', 'Save failed')) }
      );

      const request = createMockRequest(
        createSettingsUrl(mongoId, '/preferences'),
        'PATCH',
        { theme: 'dark' }
      );

      const response = await PATCH(request, createMockContext('user-mongo-id'));
      await expectErrorResponse(response, 500, 'Internal server error');
    });

    it('should update all preference fields', async () => {
      const userId = 'test-user-id';
      const mongoId = 'user-mongo-id';
      const mockUserDoc = setupSettingsRouteMocks(
        mockAuth,
        mockConnectToDatabase,
        mockUser,
        userId,
        mongoId,
        { preferences: {} }
      );

      const request = createMockRequest(
        createSettingsUrl(mongoId, '/preferences'),
        'PATCH',
        {
          theme: 'dark',
          emailNotifications: true,
          browserNotifications: true,
          timezone: 'America/New_York',
          language: 'es',
          diceRollAnimations: false,
          autoSaveEncounters: false,
        }
      );

      const response = await PATCH(request, createMockContext('user-mongo-id'));
      const data = await expectSuccessResponse(response, 200);

      expect(data.preferences.theme).toBe('dark');
      expect(data.preferences.emailNotifications).toBe(true);
      expect(data.preferences.browserNotifications).toBe(true);
      expect(data.preferences.timezone).toBe('America/New_York');
      expect(data.preferences.language).toBe('es');
      expect(data.preferences.diceRollAnimations).toBe(false);
      expect(data.preferences.autoSaveEncounters).toBe(false);
      expect(mockUserDoc.save).toHaveBeenCalled();
    });
  });
});
