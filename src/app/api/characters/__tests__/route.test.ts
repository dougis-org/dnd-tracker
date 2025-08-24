/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
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
            find: jest.fn(),
            create: jest.fn(),
            countDocuments: jest.fn()
      }
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockConnectToDatabase = connectToDatabase as jest.MockedFunction<typeof connectToDatabase>;
describe('/api/characters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/characters', () => {
    it('should return 401 when user is not authenticated', async () => {
<<<<<<< HEAD
      setupUnauthenticatedUser();

      const response = await GET(createMockRequest('http://localhost:3000/api/characters'));
=======
      mockAuth.mockReturnValue({ userId: null });

      const response = await GET(new NextRequest('http://localhost:3000/api/characters'));
>>>>>>> 27ae597 (Issue: #14 Character API Endpoints)
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return characters for authenticated user', async () => {
<<<<<<< HEAD
      setupAuthenticatedUser();
=======
      const mockUserId = 'user_12345';
>>>>>>> 27ae597 (Issue: #14 Character API Endpoints)
      const mockCharacters = [
        {
          _id: 'char_1',
          userId: mockUserId,
          name: 'Aragorn',
          totalLevel: 5,
          createdAt: '2025-08-24T04:08:58.104Z',
          updatedAt: '2025-08-24T04:08:58.104Z'
        },
        {
          _id: 'char_2', 
          userId: mockUserId,
          name: 'Legolas',
          totalLevel: 4,
          createdAt: '2025-08-24T04:08:58.104Z',
          updatedAt: '2025-08-24T04:08:58.104Z'
        }
      ];

<<<<<<< HEAD
=======
      mockAuth.mockReturnValue({ userId: mockUserId });
      mockConnectToDatabase.mockResolvedValue(undefined);
>>>>>>> 27ae597 (Issue: #14 Character API Endpoints)
      (CharacterModel.countDocuments as jest.Mock).mockResolvedValue(2);
      
      const mockSort = jest.fn().mockResolvedValue(mockCharacters);
      const mockLimit = jest.fn().mockReturnValue({ sort: mockSort });
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockFind = jest.fn().mockReturnValue({ skip: mockSkip });
      (CharacterModel.find as jest.Mock) = mockFind;

<<<<<<< HEAD
      const response = await GET(createMockRequest('http://localhost:3000/api/characters'));
=======
      const response = await GET(new NextRequest('http://localhost:3000/api/characters'));
>>>>>>> 27ae597 (Issue: #14 Character API Endpoints)
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.characters).toEqual(mockCharacters);
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
      });
      expect(mockFind).toHaveBeenCalledWith({ userId: mockUserId });
    });

    it('should handle database connection errors', async () => {
<<<<<<< HEAD
      setupAuthenticatedUser();
      const { mockConnectToDatabase } = require('../_utils/test-utils');
      mockConnectToDatabase.mockRejectedValue(new Error('Database connection failed'));

      const response = await GET(createMockRequest('http://localhost:3000/api/characters'));
=======
      mockAuth.mockReturnValue({ userId: 'user_12345' });
      mockConnectToDatabase.mockRejectedValue(new Error('Database connection failed'));

      const response = await GET(new NextRequest('http://localhost:3000/api/characters'));
>>>>>>> 27ae597 (Issue: #14 Character API Endpoints)
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });

    it('should handle character query errors', async () => {
<<<<<<< HEAD
      setupAuthenticatedUser();
=======
      mockAuth.mockReturnValue({ userId: 'user_12345' });
      mockConnectToDatabase.mockResolvedValue(undefined);
>>>>>>> 27ae597 (Issue: #14 Character API Endpoints)
      
      const mockSort = jest.fn().mockRejectedValue(new Error('Query failed'));
      const mockFind = jest.fn().mockReturnValue({ sort: mockSort });
      (CharacterModel.find as jest.Mock) = mockFind;

<<<<<<< HEAD
      const response = await GET(createMockRequest('http://localhost:3000/api/characters'));
=======
      const response = await GET(new NextRequest('http://localhost:3000/api/characters'));
>>>>>>> 27ae597 (Issue: #14 Character API Endpoints)
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch characters' });
    });

    it('should support pagination with query parameters', async () => {
<<<<<<< HEAD
      setupAuthenticatedUser();
=======
      const mockUserId = 'user_12345';
>>>>>>> 27ae597 (Issue: #14 Character API Endpoints)
      const mockCharacters = [
        {
          _id: 'char_1',
          userId: mockUserId,
          name: 'Character 1',
          totalLevel: 1
        },
        {
          _id: 'char_2',
          userId: mockUserId,
          name: 'Character 2', 
          totalLevel: 2
        }
      ];
<<<<<<< HEAD
=======

      mockAuth.mockReturnValue({ userId: mockUserId });
      mockConnectToDatabase.mockResolvedValue(undefined);
>>>>>>> 27ae597 (Issue: #14 Character API Endpoints)
      (CharacterModel.countDocuments as jest.Mock).mockResolvedValue(10);

      const mockSort = jest.fn().mockResolvedValue(mockCharacters);
      const mockLimit = jest.fn().mockReturnValue({ sort: mockSort });
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockFind = jest.fn().mockReturnValue({ skip: mockSkip });
      (CharacterModel.find as jest.Mock) = mockFind;

<<<<<<< HEAD
      const request = createMockRequest('http://localhost:3000/api/characters?page=2&limit=5');
=======
      const request = new NextRequest('http://localhost:3000/api/characters?page=2&limit=5');
>>>>>>> 27ae597 (Issue: #14 Character API Endpoints)
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.characters).toEqual(mockCharacters);
      expect(data.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 10,
        totalPages: 2
      });
    });
  });

  describe('POST /api/characters', () => {
<<<<<<< HEAD
    it('should return 401 when user is not authenticated', async () => {
      setupUnauthenticatedUser();

      const request = createMockRequest('http://localhost:3000/api/characters', {
=======
    const validCharacterData = {
      name: 'Gandalf',
      race: 'Human',
      background: 'Hermit',
      alignment: 'Neutral Good',
      experiencePoints: 0,
      classes: [{
        className: 'Wizard',
        level: 1,
        hitDiceSize: 6,
        hitDiceUsed: 0
      }],
      abilities: {
        strength: 10,
        dexterity: 14,
        constitution: 12,
        intelligence: 18,
        wisdom: 16,
        charisma: 13
      }
    };

    it('should return 401 when user is not authenticated', async () => {
      mockAuth.mockReturnValue({ userId: null });

      const request = new NextRequest('http://localhost:3000/api/characters', {
>>>>>>> 27ae597 (Issue: #14 Character API Endpoints)
        method: 'POST',
        body: JSON.stringify(validCharacterData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should create character for authenticated user with valid data', async () => {
<<<<<<< HEAD
      setupAuthenticatedUser();
=======
      const mockUserId = 'user_12345';
>>>>>>> 27ae597 (Issue: #14 Character API Endpoints)
      const mockCreatedCharacter = {
        _id: 'char_123',
        ...validCharacterData,
        userId: mockUserId,
        totalLevel: 1,
        proficiencyBonus: 2,
        createdAt: '2025-08-24T04:08:58.131Z',
        updatedAt: '2025-08-24T04:08:58.131Z'
      };

<<<<<<< HEAD
      (CharacterModel.create as jest.Mock).mockResolvedValue(mockCreatedCharacter);

      const request = createMockRequest('http://localhost:3000/api/characters', {
=======
      mockAuth.mockReturnValue({ userId: mockUserId });
      mockConnectToDatabase.mockResolvedValue(undefined);
      (CharacterModel.create as jest.Mock).mockResolvedValue(mockCreatedCharacter);

      const request = new NextRequest('http://localhost:3000/api/characters', {
>>>>>>> 27ae597 (Issue: #14 Character API Endpoints)
        method: 'POST',
        body: JSON.stringify(validCharacterData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockCreatedCharacter);
      expect(CharacterModel.create).toHaveBeenCalledWith({
        ...validCharacterData,
        userId: mockUserId
      });
    });

    it('should return 400 with validation errors for invalid data', async () => {
<<<<<<< HEAD
      setupAuthenticatedUser();
=======
      mockAuth.mockReturnValue({ userId: 'user_12345' });
      mockConnectToDatabase.mockResolvedValue(undefined);
>>>>>>> 27ae597 (Issue: #14 Character API Endpoints)
      
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      (CharacterModel.create as jest.Mock).mockRejectedValue(validationError);

<<<<<<< HEAD
      const request = createMockRequest('http://localhost:3000/api/characters', {
=======
      const request = new NextRequest('http://localhost:3000/api/characters', {
>>>>>>> 27ae597 (Issue: #14 Character API Endpoints)
        method: 'POST',
        body: JSON.stringify({ name: '' }) // Invalid data
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Validation failed' });
    });

    it('should return 400 for malformed JSON', async () => {
<<<<<<< HEAD
      setupAuthenticatedUser();

      const request = createMockRequest('http://localhost:3000/api/characters', {
=======
      mockAuth.mockReturnValue({ userId: 'user_12345' });

      const request = new NextRequest('http://localhost:3000/api/characters', {
>>>>>>> 27ae597 (Issue: #14 Character API Endpoints)
        method: 'POST',
        body: 'invalid json'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid JSON data' });
    });

    it('should handle database connection errors during creation', async () => {
<<<<<<< HEAD
      setupAuthenticatedUser();
      const { mockConnectToDatabase } = require('../_utils/test-utils');
      mockConnectToDatabase.mockRejectedValue(new Error('Database connection failed'));

      const request = createMockRequest('http://localhost:3000/api/characters', {
=======
      mockAuth.mockReturnValue({ userId: 'user_12345' });
      mockConnectToDatabase.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/characters', {
>>>>>>> 27ae597 (Issue: #14 Character API Endpoints)
        method: 'POST',
        body: JSON.stringify(validCharacterData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });

    it('should handle character creation errors', async () => {
<<<<<<< HEAD
      setupAuthenticatedUser();
      (CharacterModel.create as jest.Mock).mockRejectedValue(new Error('Creation failed'));

      const request = createMockRequest('http://localhost:3000/api/characters', {
=======
      mockAuth.mockReturnValue({ userId: 'user_12345' });
      mockConnectToDatabase.mockResolvedValue(undefined);
      (CharacterModel.create as jest.Mock).mockRejectedValue(new Error('Creation failed'));

      const request = new NextRequest('http://localhost:3000/api/characters', {
>>>>>>> 27ae597 (Issue: #14 Character API Endpoints)
        method: 'POST',
        body: JSON.stringify(validCharacterData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create character' });
    });
  });
});