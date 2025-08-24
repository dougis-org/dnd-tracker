/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '../route';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CharacterModel } from '@/models/schemas';

// Mock dependencies
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn()
}));
jest.mock('@/lib/mongodb', () => ({
  connectToDatabase: jest.fn()
}));
jest.mock('@/models/schemas', () => ({
  CharacterModel: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn()
  }
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockConnectToDatabase = connectToDatabase as jest.MockedFunction<typeof connectToDatabase>;

describe('/api/characters/[id]', () => {
  const characterId = '507f1f77bcf86cd799439011'; // Valid ObjectId
  const params = { params: Promise.resolve({ id: characterId }) };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/characters/[id]', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockAuth.mockReturnValue({ userId: null });

      const response = await GET(new NextRequest('http://localhost:3000'), params);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return character for authenticated user', async () => {
      const mockUserId = 'user_12345';
      const mockCharacter = {
        _id: characterId,
        userId: mockUserId,
        name: 'Aragorn',
        totalLevel: 5,
        createdAt: '2025-08-24T04:08:58.104Z',
        updatedAt: '2025-08-24T04:08:58.104Z'
      };

      mockAuth.mockReturnValue({ userId: mockUserId });
      mockConnectToDatabase.mockResolvedValue(undefined);
      (CharacterModel.findOne as jest.Mock).mockResolvedValue(mockCharacter);

      const response = await GET(new NextRequest('http://localhost:3000'), params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCharacter);
      expect(CharacterModel.findOne).toHaveBeenCalledWith({ 
        _id: characterId, 
        userId: mockUserId 
      });
    });

    it('should return 404 when character not found', async () => {
      mockAuth.mockReturnValue({ userId: 'user_12345' });
      mockConnectToDatabase.mockResolvedValue(undefined);
      (CharacterModel.findOne as jest.Mock).mockResolvedValue(null);

      const response = await GET(new NextRequest('http://localhost:3000'), params);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Character not found' });
    });

    it('should return 400 for invalid character ID', async () => {
      mockAuth.mockReturnValue({ userId: 'user_12345' });
      
      const invalidParams = { params: Promise.resolve({ id: 'invalid-id' }) };
      const response = await GET(new NextRequest('http://localhost:3000'), invalidParams);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid character ID' });
    });

    it('should handle database errors', async () => {
      mockAuth.mockReturnValue({ userId: 'user_12345' });
      mockConnectToDatabase.mockResolvedValue(undefined);
      (CharacterModel.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

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
      mockAuth.mockReturnValue({ userId: null });

      const request = new NextRequest('http://localhost:3000', {
        method: 'PUT',
        body: JSON.stringify(validUpdateData)
      });

      const response = await PUT(request, params);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should update character for authenticated user', async () => {
      const mockUserId = 'user_12345';
      const mockUpdatedCharacter = {
        _id: characterId,
        userId: mockUserId,
        ...validUpdateData,
        totalLevel: 5,
        createdAt: '2025-08-24T04:08:58.104Z',
        updatedAt: '2025-08-24T04:08:58.200Z'
      };

      mockAuth.mockReturnValue({ userId: mockUserId });
      mockConnectToDatabase.mockResolvedValue(undefined);
      (CharacterModel.findOneAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedCharacter);

      const request = new NextRequest('http://localhost:3000', {
        method: 'PUT',
        body: JSON.stringify(validUpdateData)
      });

      const response = await PUT(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUpdatedCharacter);
      expect(CharacterModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: characterId, userId: mockUserId },
        validUpdateData,
        { new: true, runValidators: true }
      );
    });

    it('should return 404 when character not found for update', async () => {
      mockAuth.mockReturnValue({ userId: 'user_12345' });
      mockConnectToDatabase.mockResolvedValue(undefined);
      (CharacterModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000', {
        method: 'PUT',
        body: JSON.stringify(validUpdateData)
      });

      const response = await PUT(request, params);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Character not found' });
    });

    it('should return 400 for invalid JSON', async () => {
      mockAuth.mockReturnValue({ userId: 'user_12345' });

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
      mockAuth.mockReturnValue({ userId: 'user_12345' });
      mockConnectToDatabase.mockResolvedValue(undefined);
      
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      (CharacterModel.findOneAndUpdate as jest.Mock).mockRejectedValue(validationError);

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
      mockAuth.mockReturnValue({ userId: null });

      const response = await DELETE(new NextRequest('http://localhost:3000'), params);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should delete character for authenticated user', async () => {
      const mockUserId = 'user_12345';
      const mockDeletedCharacter = {
        _id: characterId,
        userId: mockUserId,
        name: 'Aragorn',
        totalLevel: 5
      };

      mockAuth.mockReturnValue({ userId: mockUserId });
      mockConnectToDatabase.mockResolvedValue(undefined);
      (CharacterModel.findOneAndDelete as jest.Mock).mockResolvedValue(mockDeletedCharacter);

      const response = await DELETE(new NextRequest('http://localhost:3000'), params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ message: 'Character deleted successfully' });
      expect(CharacterModel.findOneAndDelete).toHaveBeenCalledWith({ 
        _id: characterId, 
        userId: mockUserId 
      });
    });

    it('should return 404 when character not found for deletion', async () => {
      mockAuth.mockReturnValue({ userId: 'user_12345' });
      mockConnectToDatabase.mockResolvedValue(undefined);
      (CharacterModel.findOneAndDelete as jest.Mock).mockResolvedValue(null);

      const response = await DELETE(new NextRequest('http://localhost:3000'), params);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Character not found' });
    });

    it('should handle database errors during deletion', async () => {
      mockAuth.mockReturnValue({ userId: 'user_12345' });
      mockConnectToDatabase.mockResolvedValue(undefined);
      (CharacterModel.findOneAndDelete as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      const response = await DELETE(new NextRequest('http://localhost:3000'), params);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to delete character' });
    });
  });
});