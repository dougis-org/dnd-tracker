/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET as GetCharacters, POST as CreateCharacter } from '../route';
import { GET as GetCharacter, PUT as UpdateCharacter, DELETE as DeleteCharacter } from '../[id]/route';
import { POST as DuplicateCharacter } from '../[id]/duplicate/route';
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
    countDocuments: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn()
  }
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockConnectToDatabase = connectToDatabase as jest.MockedFunction<typeof connectToDatabase>;

describe('Character API Integration Tests', () => {
  const mockUserId = 'user_12345';
  const characterId = '507f1f77bcf86cd799439011';
  
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockReturnValue({ userId: mockUserId });
    mockConnectToDatabase.mockResolvedValue(undefined);
  });

  describe('Full CRUD Workflow Integration', () => {
    it('should handle complete character lifecycle: create -> read -> update -> duplicate -> delete', async () => {
      // Step 1: Create a character
      const createdCharacter = {
        _id: characterId,
        ...validCharacterData,
        userId: mockUserId,
        totalLevel: 1,
        proficiencyBonus: 2,
        createdAt: '2025-08-24T04:08:58.131Z',
        updatedAt: '2025-08-24T04:08:58.131Z'
      };

      (CharacterModel.create as jest.Mock).mockResolvedValue(createdCharacter);

      const createRequest = new NextRequest('http://localhost:3000/api/characters', {
        method: 'POST',
        body: JSON.stringify(validCharacterData)
      });

      const createResponse = await CreateCharacter(createRequest);
      const createData = await createResponse.json();

      expect(createResponse.status).toBe(201);
      expect(createData).toEqual(createdCharacter);

      // Step 2: Read the created character
      (CharacterModel.findOne as jest.Mock).mockResolvedValue(createdCharacter);

      const getRequest = new NextRequest('http://localhost:3000');
      const getParams = { params: Promise.resolve({ id: characterId }) };
      
      const getResponse = await GetCharacter(getRequest, getParams);
      const getData = await getResponse.json();

      expect(getResponse.status).toBe(200);
      expect(getData).toEqual(createdCharacter);

      // Step 3: Update the character
      const updateData = { name: 'Gandalf the Grey', experiencePoints: 1000 };
      const updatedCharacter = {
        ...createdCharacter,
        ...updateData,
        updatedAt: '2025-08-24T04:10:00.000Z'
      };

      (CharacterModel.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedCharacter);

      const updateRequest = new NextRequest('http://localhost:3000', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      const updateResponse = await UpdateCharacter(updateRequest, { params: Promise.resolve({ id: characterId }) });
      const updateResponseData = await updateResponse.json();

      expect(updateResponse.status).toBe(200);
      expect(updateResponseData).toEqual(updatedCharacter);

      // Step 4: Duplicate the character
      const duplicatedCharacter = {
        _id: '507f1f77bcf86cd799439022',
        ...updatedCharacter,
        _id: '507f1f77bcf86cd799439022',
        name: 'Gandalf the Grey (Copy)',
        createdAt: '2025-08-24T04:11:00.000Z',
        updatedAt: '2025-08-24T04:11:00.000Z'
      };

      (CharacterModel.findOne as jest.Mock).mockResolvedValue(updatedCharacter);
      (CharacterModel.create as jest.Mock).mockResolvedValue(duplicatedCharacter);

      const duplicateRequest = new NextRequest('http://localhost:3000');
      const duplicateResponse = await DuplicateCharacter(duplicateRequest, { params: Promise.resolve({ id: characterId }) });
      const duplicateData = await duplicateResponse.json();

      expect(duplicateResponse.status).toBe(201);
      expect(duplicateData).toEqual(duplicatedCharacter);

      // Step 5: List characters (should show both original and duplicate)
      const characters = [updatedCharacter, duplicatedCharacter];
      (CharacterModel.countDocuments as jest.Mock).mockResolvedValue(2);
      
      const mockSort = jest.fn().mockResolvedValue(characters);
      const mockLimit = jest.fn().mockReturnValue({ sort: mockSort });
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockFind = jest.fn().mockReturnValue({ skip: mockSkip });
      (CharacterModel.find as jest.Mock) = mockFind;

      const listRequest = new NextRequest('http://localhost:3000/api/characters');
      const listResponse = await GetCharacters(listRequest);
      const listData = await listResponse.json();

      expect(listResponse.status).toBe(200);
      expect(listData.characters).toEqual(characters);
      expect(listData.pagination.total).toBe(2);

      // Step 6: Delete the original character
      (CharacterModel.findOneAndDelete as jest.Mock).mockResolvedValue(updatedCharacter);

      const deleteRequest = new NextRequest('http://localhost:3000');
      const deleteResponse = await DeleteCharacter(deleteRequest, { params: Promise.resolve({ id: characterId }) });
      const deleteData = await deleteResponse.json();

      expect(deleteResponse.status).toBe(200);
      expect(deleteData).toEqual({ message: 'Character deleted successfully' });
    });
  });

  describe('Pagination Integration Tests', () => {
    it('should handle paginated character listing correctly', async () => {
      const totalCharacters = 25;
      const charactersPage1 = Array.from({ length: 10 }, (_, i) => ({
        _id: `507f1f77bcf86cd79943901${i.toString().padStart(1, '0')}`,
        userId: mockUserId,
        name: `Character ${i + 1}`,
        totalLevel: i + 1
      }));

      const charactersPage2 = Array.from({ length: 10 }, (_, i) => ({
        _id: `507f1f77bcf86cd79943902${i.toString().padStart(1, '0')}`,
        userId: mockUserId,
        name: `Character ${i + 11}`,
        totalLevel: i + 11
      }));

      // Test Page 1
      (CharacterModel.countDocuments as jest.Mock).mockResolvedValue(totalCharacters);
      
      const mockSort1 = jest.fn().mockResolvedValue(charactersPage1);
      const mockLimit1 = jest.fn().mockReturnValue({ sort: mockSort1 });
      const mockSkip1 = jest.fn().mockReturnValue({ limit: mockLimit1 });
      const mockFind1 = jest.fn().mockReturnValue({ skip: mockSkip1 });
      (CharacterModel.find as jest.Mock) = mockFind1;

      const page1Request = new NextRequest('http://localhost:3000/api/characters?page=1&limit=10');
      const page1Response = await GetCharacters(page1Request);
      const page1Data = await page1Response.json();

      expect(page1Response.status).toBe(200);
      expect(page1Data.characters).toEqual(charactersPage1);
      expect(page1Data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3
      });
      expect(mockSkip1).toHaveBeenCalledWith(0);
      expect(mockLimit1).toHaveBeenCalledWith(10);

      // Test Page 2
      const mockSort2 = jest.fn().mockResolvedValue(charactersPage2);
      const mockLimit2 = jest.fn().mockReturnValue({ sort: mockSort2 });
      const mockSkip2 = jest.fn().mockReturnValue({ limit: mockLimit2 });
      const mockFind2 = jest.fn().mockReturnValue({ skip: mockSkip2 });
      (CharacterModel.find as jest.Mock) = mockFind2;

      const page2Request = new NextRequest('http://localhost:3000/api/characters?page=2&limit=10');
      const page2Response = await GetCharacters(page2Request);
      const page2Data = await page2Response.json();

      expect(page2Response.status).toBe(200);
      expect(page2Data.characters).toEqual(charactersPage2);
      expect(page2Data.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3
      });
      expect(mockSkip2).toHaveBeenCalledWith(10);
      expect(mockLimit2).toHaveBeenCalledWith(10);
    });

    it('should enforce maximum page limit of 100', async () => {
      const characters = Array.from({ length: 100 }, (_, i) => ({
        _id: `507f1f77bcf86cd79943901${i.toString().padStart(2, '0')}`,
        userId: mockUserId,
        name: `Character ${i + 1}`,
        totalLevel: 1
      }));

      (CharacterModel.countDocuments as jest.Mock).mockResolvedValue(150);
      
      const mockSort = jest.fn().mockResolvedValue(characters);
      const mockLimit = jest.fn().mockReturnValue({ sort: mockSort });
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockFind = jest.fn().mockReturnValue({ skip: mockSkip });
      (CharacterModel.find as jest.Mock) = mockFind;

      // Request 200 items but should be capped at 100
      const request = new NextRequest('http://localhost:3000/api/characters?page=1&limit=200');
      const response = await GetCharacters(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.limit).toBe(100); // Should be capped at 100
      expect(mockLimit).toHaveBeenCalledWith(100);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle cascading errors gracefully', async () => {
      // Simulate database connection failure affecting multiple operations
      mockConnectToDatabase.mockRejectedValue(new Error('Database connection failed'));

      // Test that all endpoints handle the connection failure
      const endpoints = [
        () => GetCharacters(new NextRequest('http://localhost:3000/api/characters')),
        () => CreateCharacter(new NextRequest('http://localhost:3000', {
          method: 'POST',
          body: JSON.stringify(validCharacterData)
        })),
        () => GetCharacter(new NextRequest('http://localhost:3000'), { params: Promise.resolve({ id: characterId }) }),
        () => UpdateCharacter(new NextRequest('http://localhost:3000', {
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated' })
        }), { params: Promise.resolve({ id: characterId }) }),
        () => DeleteCharacter(new NextRequest('http://localhost:3000'), { params: Promise.resolve({ id: characterId }) }),
        () => DuplicateCharacter(new NextRequest('http://localhost:3000'), { params: Promise.resolve({ id: characterId }) })
      ];

      for (const endpoint of endpoints) {
        const response = await endpoint();
        const data = await response.json();
        
        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Internal server error' });
      }
    });

    it('should handle authentication consistently across all endpoints', async () => {
      mockAuth.mockReturnValue({ userId: null });

      const endpoints = [
        () => GetCharacters(new NextRequest('http://localhost:3000/api/characters')),
        () => CreateCharacter(new NextRequest('http://localhost:3000', {
          method: 'POST',
          body: JSON.stringify(validCharacterData)
        })),
        () => GetCharacter(new NextRequest('http://localhost:3000'), { params: Promise.resolve({ id: characterId }) }),
        () => UpdateCharacter(new NextRequest('http://localhost:3000', {
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated' })
        }), { params: Promise.resolve({ id: characterId }) }),
        () => DeleteCharacter(new NextRequest('http://localhost:3000'), { params: Promise.resolve({ id: characterId }) }),
        () => DuplicateCharacter(new NextRequest('http://localhost:3000'), { params: Promise.resolve({ id: characterId }) })
      ];

      for (const endpoint of endpoints) {
        const response = await endpoint();
        const data = await response.json();
        
        expect(response.status).toBe(401);
        expect(data).toEqual({ error: 'Unauthorized' });
      }
    });
  });

  describe('Data Consistency Integration', () => {
    it('should maintain data integrity during complex operations', async () => {
      // Setup initial character data
      const originalCharacter = {
        _id: characterId,
        ...validCharacterData,
        userId: mockUserId,
        totalLevel: 1,
        proficiencyBonus: 2
      };

      // Test creating, updating, and duplicating maintains data consistency
      (CharacterModel.create as jest.Mock).mockResolvedValue(originalCharacter);
      (CharacterModel.findOne as jest.Mock).mockResolvedValue(originalCharacter);
      (CharacterModel.findOneAndUpdate as jest.Mock).mockResolvedValue({
        ...originalCharacter,
        experiencePoints: 1000,
        updatedAt: '2025-08-24T04:10:00.000Z'
      });

      // Create character
      const createRequest = new NextRequest('http://localhost:3000/api/characters', {
        method: 'POST',
        body: JSON.stringify(validCharacterData)
      });
      
      const createResponse = await CreateCharacter(createRequest);
      expect(createResponse.status).toBe(201);

      // Update character
      const updateRequest = new NextRequest('http://localhost:3000', {
        method: 'PUT',
        body: JSON.stringify({ experiencePoints: 1000 })
      });
      
      const updateResponse = await UpdateCharacter(updateRequest, { params: { id: characterId } });
      expect(updateResponse.status).toBe(200);

      // Verify creation call preserves user association
      expect(CharacterModel.create).toHaveBeenCalledWith({
        ...validCharacterData,
        userId: mockUserId
      });

      // Verify update call includes user filter for security
      expect(CharacterModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: characterId, userId: mockUserId },
        { experiencePoints: 1000 },
        { new: true, runValidators: true }
      );
    });
  });

  describe('Duplication Integration', () => {
    it('should duplicate characters with proper name handling', async () => {
      const originalCharacter = {
        _id: characterId,
        userId: mockUserId,
        name: 'Aragorn',
        race: 'Human',
        background: 'Ranger'
      };

      const duplicatedCharacter = {
        _id: '507f1f77bcf86cd799439022',
        userId: mockUserId,
        name: 'Aragorn (Copy)',
        race: 'Human',
        background: 'Ranger'
      };

      (CharacterModel.findOne as jest.Mock).mockResolvedValue(originalCharacter);
      (CharacterModel.create as jest.Mock).mockResolvedValue(duplicatedCharacter);

      const duplicateRequest = new NextRequest('http://localhost:3000');
      const duplicateResponse = await DuplicateCharacter(duplicateRequest, { params: Promise.resolve({ id: characterId }) });
      const duplicateData = await duplicateResponse.json();

      expect(duplicateResponse.status).toBe(201);
      expect(duplicateData.name).toBe('Aragorn (Copy)');
      expect(duplicateData.race).toBe(originalCharacter.race);
      expect(duplicateData.background).toBe(originalCharacter.background);
      
      // Verify that duplication excludes MongoDB-specific fields and adds (Copy) to name
      expect(CharacterModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUserId,
          name: 'Aragorn (Copy)',
          race: 'Human',
          background: 'Ranger'
        })
      );
    });
  });
});