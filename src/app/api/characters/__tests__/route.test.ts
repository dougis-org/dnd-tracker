/**
 * @jest-environment node
 */
import { GET, POST } from '../route';
import { CharacterModel } from '@/models/schemas';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import {
  mockUserId,
  validCharacterData,
  setupAuthenticatedUser,
  setupUnauthenticatedUser,
  createMockRequest,
  mockAuth,
  mockConnectToDatabase,
} from '../_utils/test-utils';

// Mock dependencies
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));
jest.mock('@/lib/mongodb', () => ({
  connectToDatabase: jest.fn(),
}));
jest.mock('@/models/schemas', () => ({
  CharacterModel: {
    find: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

// Remove duplicate mock declarations - they're imported from test-utils

describe('/api/characters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/characters', () => {
    it('should return 401 when user is not authenticated', async () => {
      setupUnauthenticatedUser();
      const response = await GET(
        createMockRequest('http://localhost:3000/api/characters')
      );
      const data = await response.json();
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return characters for authenticated user', async () => {
      const mockCharacters = [
        {
          _id: 'char_1',
          userId: mockUserId,
          name: 'Aragorn',
          totalLevel: 5,
          createdAt: '2025-08-24T04:08:58.104Z',
          updatedAt: '2025-08-24T04:08:58.104Z',
        },
        {
          _id: 'char_2',
          userId: mockUserId,
          name: 'Legolas',
          totalLevel: 4,
          createdAt: '2025-08-24T04:08:58.104Z',
          updatedAt: '2025-08-24T04:08:58.104Z',
        },
      ];

      setupAuthenticatedUser();
      (CharacterModel.countDocuments as jest.Mock).mockResolvedValue(2);

      const mockSort = jest.fn().mockResolvedValue(mockCharacters);
      const mockLimit = jest.fn().mockReturnValue({ sort: mockSort });
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      (CharacterModel.find as jest.Mock).mockReturnValue({ skip: mockSkip });

      const response = await GET(
        createMockRequest('http://localhost:3000/api/characters')
      );
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.characters).toEqual(mockCharacters);
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
      expect(CharacterModel.find).toHaveBeenCalledWith({ userId: mockUserId });
    });

    it('should handle database connection errors', async () => {
      setupAuthenticatedUser();
      mockConnectToDatabase.mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await GET(
        createMockRequest('http://localhost:3000/api/characters')
      );
      const data = await response.json();
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });

    it('should handle character query errors', async () => {
      setupAuthenticatedUser();
      mockConnectToDatabase.mockResolvedValue({
        connection: {} as any,
        db: {} as any,
      });

      const mockSort = jest.fn().mockRejectedValue(new Error('Query failed'));
      (CharacterModel.find as jest.Mock).mockReturnValue({ sort: mockSort });

      const response = await GET(
        createMockRequest('http://localhost:3000/api/characters')
      );
      const data = await response.json();
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch characters' });
    });

    it('should support pagination with query parameters', async () => {
      const mockCharacters = [
        {
          _id: 'char_1',
          userId: mockUserId,
          name: 'Character 1',
          totalLevel: 1,
        },
        {
          _id: 'char_2',
          userId: mockUserId,
          name: 'Character 2',
          totalLevel: 2,
        },
      ];

      setupAuthenticatedUser();
      (CharacterModel.countDocuments as jest.Mock).mockResolvedValue(10);

      const mockSort = jest.fn().mockResolvedValue(mockCharacters);
      const mockLimit = jest.fn().mockReturnValue({ sort: mockSort });
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      (CharacterModel.find as jest.Mock).mockReturnValue({ skip: mockSkip });

      const request = createMockRequest(
        'http://localhost:3000/api/characters?page=2&limit=5'
      );
      const response = await GET(request);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.characters).toEqual(mockCharacters);
      expect(data.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 10,
        totalPages: 2,
      });
    });
  });

  describe('POST /api/characters', () => {
    it('should return 401 when user is not authenticated', async () => {
      setupUnauthenticatedUser();

      const request = createMockRequest(
        'http://localhost:3000/api/characters',
        {
          method: 'POST',
          body: JSON.stringify(validCharacterData),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should create character for authenticated user with valid data', async () => {
      const mockCreatedCharacter = {
        _id: 'char_123',
        ...validCharacterData,
        userId: mockUserId,
        totalLevel: 1,
        proficiencyBonus: 2,
        createdAt: '2025-08-24T04:08:58.131Z',
        updatedAt: '2025-08-24T04:08:58.131Z',
      };

      setupAuthenticatedUser();
      (CharacterModel.create as jest.Mock).mockResolvedValue(
        mockCreatedCharacter
      );

      const request = createMockRequest(
        'http://localhost:3000/api/characters',
        {
          method: 'POST',
          body: JSON.stringify(validCharacterData),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockCreatedCharacter);
      expect(CharacterModel.create).toHaveBeenCalledWith({
        ...validCharacterData,
        userId: mockUserId,
      });
    });

    it('should return 400 with validation errors for invalid data', async () => {
      setupAuthenticatedUser();

      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      (CharacterModel.create as jest.Mock).mockRejectedValue(validationError);

      const request = createMockRequest(
        'http://localhost:3000/api/characters',
        {
          method: 'POST',
          body: JSON.stringify({ name: '' }), // Invalid data
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Validation failed' });
    });

    it('should return 400 for malformed JSON', async () => {
      setupAuthenticatedUser();

      const request = createMockRequest(
        'http://localhost:3000/api/characters',
        {
          method: 'POST',
          body: 'invalid json',
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid JSON data' });
    });

    it('should handle database connection errors during creation', async () => {
      setupAuthenticatedUser();
      mockConnectToDatabase.mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = createMockRequest(
        'http://localhost:3000/api/characters',
        {
          method: 'POST',
          body: JSON.stringify(validCharacterData),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });

    it('should handle character creation errors', async () => {
      setupAuthenticatedUser();
      (CharacterModel.create as jest.Mock).mockRejectedValue(
        new Error('Creation failed')
      );
      const request = createMockRequest(
        'http://localhost:3000/api/characters',
        {
          method: 'POST',
          body: JSON.stringify(validCharacterData),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create character' });
    });
  });
});
