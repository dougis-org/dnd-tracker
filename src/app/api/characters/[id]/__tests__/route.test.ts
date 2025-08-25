/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '../route';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { CharacterModel } from '../../../../models/schemas';
import {
  mockUserId,
  mockCharacterId,
  sampleCharacter,
  setupAuthenticatedUser,
  setupUnauthenticatedUser,
  setupCharacterModelMocks,
  createMockRouteParams,
  createValidationError,
  expectUnauthorizedResponse,
  expectNotFoundResponse,
  expectInternalServerError
} from '../../_utils/test-utils';

// Mock dependencies
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));
jest.mock('../../../../lib/mongodb', () => ({
  connectToDatabase: jest.fn(),
}));
jest.mock('../../../../models/schemas', () => ({
  CharacterModel: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  },
}));

describe('/api/characters/[id]', () => {
  const params = createMockRouteParams(mockCharacterId);
  const mocks = setupCharacterModelMocks();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/characters/[id]', () => {
    it('should return 401 when user is not authenticated', async () => {
      setupUnauthenticatedUser();

      const response = await GET(new NextRequest('http://localhost:3000'), params);
      const data = await response.json();

      expectUnauthorizedResponse(response, data);
    });

    it('should return character for authenticated user', async () => {
      setupAuthenticatedUser();
      mocks.findOne.mockResolvedValue(sampleCharacter);

      const response = await GET(new NextRequest('http://localhost:3000'), params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(sampleCharacter);
      expect(mocks.findOne).toHaveBeenCalledWith({ 
        _id: mockCharacterId, 
        userId: mockUserId 
      });
    });

    it('should return 404 when character not found', async () => {
      setupAuthenticatedUser();
      mocks.findOne.mockResolvedValue(null);

      const response = await GET(new NextRequest('http://localhost:3000'), params);
      const data = await response.json();

      expectNotFoundResponse(response, data);
    });

    it('should return 400 for invalid character ID', async () => {
      setupAuthenticatedUser();
      
      const invalidParams = createMockRouteParams('invalid-id');
      const response = await GET(new NextRequest('http://localhost:3000'), invalidParams);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid character ID' });
    });

    it('should handle database errors', async () => {
      setupAuthenticatedUser();
      mocks.findOne.mockRejectedValue(new Error('Database error'));

      const response = await GET(new NextRequest('http://localhost:3000'), params);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch character' });
    });
  });

  describe('PUT /api/characters/[id]', () => {
    const validUpdateData = {
      name: 'Aragorn Updated',
      experiencePoints: 1000
    };

    it('should return 401 when user is not authenticated', async () => {
      setupUnauthenticatedUser();

      const request = new NextRequest('http://localhost:3000', {
        method: 'PUT',
        body: JSON.stringify(validUpdateData)
      });

      const response = await PUT(request, params);
      const data = await response.json();

      expectUnauthorizedResponse(response, data);
    });

    it('should update character for authenticated user', async () => {
      const mockUpdatedCharacter = { ...sampleCharacter, ...validUpdateData };
      setupAuthenticatedUser();
      mocks.findOneAndUpdate.mockResolvedValue(mockUpdatedCharacter);

      const request = new NextRequest('http://localhost:3000', {
        method: 'PUT',
        body: JSON.stringify(validUpdateData)
      });

      const response = await PUT(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUpdatedCharacter);
      expect(mocks.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockCharacterId, userId: mockUserId },
        validUpdateData,
        { new: true, runValidators: true }
      );
    });

    it('should return 404 when character not found for update', async () => {
      setupAuthenticatedUser();
      mocks.findOneAndUpdate.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000', {
        method: 'PUT',
        body: JSON.stringify(validUpdateData)
      });

      const response = await PUT(request, params);
      const data = await response.json();

      expectNotFoundResponse(response, data);
    });

    it('should return 400 for invalid JSON', async () => {
      setupAuthenticatedUser();

      const request = new NextRequest('http://localhost:3000', {
        method: 'PUT',
        body: 'invalid json'
      });

      const response = await PUT(request, params);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid JSON data' });
    });

    it('should return 400 for validation errors', async () => {
      setupAuthenticatedUser();
      mocks.findOneAndUpdate.mockRejectedValue(createValidationError());

      const request = new NextRequest('http://localhost:3000', {
        method: 'PUT',
        body: JSON.stringify({ name: '' })
      });

      const response = await PUT(request, params);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Validation failed' });
    });
  });

  describe('DELETE /api/characters/[id]', () => {
    it('should return 401 when user is not authenticated', async () => {
      setupUnauthenticatedUser();

      const response = await DELETE(new NextRequest('http://localhost:3000'), params);
      const data = await response.json();

      expectUnauthorizedResponse(response, data);
    });

    it('should delete character for authenticated user', async () => {
      setupAuthenticatedUser();
      mocks.findOneAndDelete.mockResolvedValue(sampleCharacter);

      const response = await DELETE(new NextRequest('http://localhost:3000'), params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ message: 'Character deleted successfully' });
      expect(mocks.findOneAndDelete).toHaveBeenCalledWith({ 
        _id: mockCharacterId, 
        userId: mockUserId 
      });
    });

    it('should return 404 when character not found for deletion', async () => {
      setupAuthenticatedUser();
      mocks.findOneAndDelete.mockResolvedValue(null);

      const response = await DELETE(new NextRequest('http://localhost:3000'), params);
      const data = await response.json();

      expectNotFoundResponse(response, data);
    });

    it('should handle database errors during deletion', async () => {
      setupAuthenticatedUser();
      mocks.findOneAndDelete.mockRejectedValue(new Error('Delete failed'));

      const response = await DELETE(new NextRequest('http://localhost:3000'), params);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to delete character' });
    });
  });
});