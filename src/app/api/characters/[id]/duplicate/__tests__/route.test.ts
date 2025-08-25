/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '../route';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { CharacterModel } from '../../../../models/schemas';

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
    create: jest.fn()
  }
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockConnectToDatabase = connectToDatabase as jest.MockedFunction<typeof connectToDatabase>;

describe('POST /api/characters/[id]/duplicate', () => {
  const characterId = '507f1f77bcf86cd799439011'; // Valid ObjectId
  const params = { params: Promise.resolve({ id: characterId }) };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 when user is not authenticated', async () => {
    mockAuth.mockReturnValue({ userId: null });

    const response = await POST(new NextRequest('http://localhost:3000'), params);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 for invalid character ID', async () => {
    mockAuth.mockReturnValue({ userId: 'user_12345' });
    
    const invalidParams = { params: Promise.resolve({ id: 'invalid-id' }) };
    const response = await POST(new NextRequest('http://localhost:3000'), invalidParams);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid character ID' });
  });

  it('should return 404 when character not found', async () => {
    mockAuth.mockReturnValue({ userId: 'user_12345' });
    mockConnectToDatabase.mockResolvedValue(undefined);
    (CharacterModel.findOne as jest.Mock).mockResolvedValue(null);

    const response = await POST(new NextRequest('http://localhost:3000'), params);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Character not found' });
  });

  it('should duplicate character for authenticated user', async () => {
    const mockUserId = 'user_12345';
    const originalCharacter = {
      _id: characterId,
      userId: mockUserId,
      name: 'Aragorn',
      race: 'Human',
      background: 'Ranger',
      alignment: 'Chaotic Good',
      experiencePoints: 1000,
      classes: [{
        className: 'Ranger',
        level: 5,
        hitDiceSize: 10,
        hitDiceUsed: 2
      }],
      abilities: {
        strength: 16,
        dexterity: 18,
        constitution: 14,
        intelligence: 12,
        wisdom: 15,
        charisma: 10
      },
      totalLevel: 5,
      proficiencyBonus: 3,
      createdAt: '2025-08-24T04:08:58.104Z',
      updatedAt: '2025-08-24T04:08:58.104Z',
      toObject: () => originalCharacter,
    };

    const duplicatedCharacter = {
      _id: '507f1f77bcf86cd799439022',
      userId: mockUserId,
      name: 'Aragorn (Copy)',
      race: 'Human',
      background: 'Ranger',
      alignment: 'Chaotic Good',
      experiencePoints: 1000,
      classes: [{
        className: 'Ranger',
        level: 5,
        hitDiceSize: 10,
        hitDiceUsed: 2
      }],
      abilities: {
        strength: 16,
        dexterity: 18,
        constitution: 14,
        intelligence: 12,
        wisdom: 15,
        charisma: 10
      },
      totalLevel: 5,
      proficiencyBonus: 3,
      createdAt: '2025-08-24T04:10:00.000Z',
      updatedAt: '2025-08-24T04:10:00.000Z'
    };

    mockAuth.mockReturnValue({ userId: mockUserId });
    mockConnectToDatabase.mockResolvedValue(undefined);
    (CharacterModel.findOne as jest.Mock).mockResolvedValue(originalCharacter);
    (CharacterModel.create as jest.Mock).mockResolvedValue(duplicatedCharacter);

    const response = await POST(new NextRequest('http://localhost:3000'), params);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual(duplicatedCharacter);
    expect(CharacterModel.findOne).toHaveBeenCalledWith({ 
      _id: characterId, 
      userId: mockUserId 
    });
    expect(CharacterModel.create).toHaveBeenCalledWith(expect.objectContaining({
      userId: mockUserId,
      name: 'Aragorn (Copy)',
      race: 'Human',
      background: 'Ranger',
      alignment: 'Chaotic Good',
      experiencePoints: 1000,
      classes: [{
        className: 'Ranger',
        level: 5,
        hitDiceSize: 10,
        hitDiceUsed: 2
      }],
      abilities: {
        strength: 16,
        dexterity: 18,
        constitution: 14,
        intelligence: 12,
        wisdom: 15,
        charisma: 10
      }
    }));
  });

  it('should handle duplicate name by adding (Copy) suffix', async () => {
    const mockUserId = 'user_12345';
    const originalCharacter = {
      _id: characterId,
      userId: mockUserId,
      name: 'Gandalf (Copy)',
      race: 'Human',
      background: 'Hermit',
      alignment: 'Neutral Good',
      toObject: () => originalCharacter,
    };

    const duplicatedCharacter = {
      _id: '507f1f77bcf86cd799439022',
      userId: mockUserId,
      name: 'Gandalf (Copy) (Copy)',
      race: 'Human',
      background: 'Hermit',
      alignment: 'Neutral Good'
    };

    mockAuth.mockReturnValue({ userId: mockUserId });
    mockConnectToDatabase.mockResolvedValue(undefined);
    (CharacterModel.findOne as jest.Mock).mockResolvedValue(originalCharacter);
    (CharacterModel.create as jest.Mock).mockResolvedValue(duplicatedCharacter);

    const response = await POST(new NextRequest('http://localhost:3000'), params);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual(duplicatedCharacter);
    expect(CharacterModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Gandalf (Copy) (Copy)'
      })
    );
  });

  it('should handle database connection errors', async () => {
    mockAuth.mockReturnValue({ userId: 'user_12345' });
    mockConnectToDatabase.mockRejectedValue(new Error('Database connection failed'));

    const response = await POST(new NextRequest('http://localhost:3000'), params);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });

  it('should handle character creation errors', async () => {
    const mockUserId = 'user_12345';
    const originalCharacter = {
      _id: characterId,
      userId: mockUserId,
      name: 'Aragorn',
      toObject: () => originalCharacter,
    };

    mockAuth.mockReturnValue({ userId: mockUserId });
    mockConnectToDatabase.mockResolvedValue(undefined);
    (CharacterModel.findOne as jest.Mock).mockResolvedValue(originalCharacter);
    (CharacterModel.create as jest.Mock).mockRejectedValue(new Error('Creation failed'));

    const response = await POST(new NextRequest('http://localhost:3000'), params);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to duplicate character' });
  });

  it('should handle validation errors during creation', async () => {
    const mockUserId = 'user_12345';
    const originalCharacter = {
      _id: characterId,
      userId: mockUserId,
      name: 'Aragorn',
      toObject: () => originalCharacter,
    };

    const validationError = new Error('Validation failed');
    validationError.name = 'ValidationError';

    mockAuth.mockReturnValue({ userId: mockUserId });
    mockConnectToDatabase.mockResolvedValue(undefined);
    (CharacterModel.findOne as jest.Mock).mockResolvedValue(originalCharacter);
    (CharacterModel.create as jest.Mock).mockRejectedValue(validationError);

    const response = await POST(new NextRequest('http://localhost:3000'), params);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Validation failed' });
  });
});