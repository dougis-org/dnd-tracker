import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CharacterModel } from '@/models/schemas';

export const mockUserId = 'user_12345';
export const mockCharacterId = '507f1f77bcf86cd799439011';

export const validCharacterData = {
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

export const sampleCharacter = {
  _id: mockCharacterId,
  userId: mockUserId,
  ...validCharacterData,
  totalLevel: 1,
  proficiencyBonus: 2,
  createdAt: '2025-08-24T04:08:58.131Z',
  updatedAt: '2025-08-24T04:08:58.131Z'
};

export const mockAuth = auth as jest.MockedFunction<typeof auth>;
export const mockConnectToDatabase = connectToDatabase as jest.MockedFunction<typeof connectToDatabase>;

export function setupAuthenticatedUser() {
  mockAuth.mockReturnValue({ userId: mockUserId });
  mockConnectToDatabase.mockResolvedValue(undefined);
}

export function setupUnauthenticatedUser() {
  mockAuth.mockReturnValue({ userId: null });
}

export function setupDatabaseError() {
  mockConnectToDatabase.mockRejectedValue(new Error('Database connection failed'));
}

export function createMockRequest(url: string, options?: RequestInit): NextRequest {
  return new NextRequest(url, options);
}

export function createMockRouteParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

export function setupCharacterModelMocks() {
  return {
    findOne: CharacterModel.findOne as jest.Mock,
    findOneAndUpdate: CharacterModel.findOneAndUpdate as jest.Mock,
    findOneAndDelete: CharacterModel.findOneAndDelete as jest.Mock,
    find: CharacterModel.find as jest.Mock,
    create: CharacterModel.create as jest.Mock,
    countDocuments: CharacterModel.countDocuments as jest.Mock
  };
}

export function createValidationError(message: string = 'Validation failed') {
  const error = new Error(message);
  error.name = 'ValidationError';
  return error;
}

export function expectUnauthorizedResponse(response: any, data: any) {
  expect(response.status).toBe(401);
  expect(data).toEqual({ error: 'Unauthorized' });
}

export function expectNotFoundResponse(response: any, data: any) {
  expect(response.status).toBe(404);
  expect(data).toEqual({ error: 'Character not found' });
}

export function expectInternalServerError(response: any, data: any) {
  expect(response.status).toBe(500);
  expect(data).toEqual({ error: 'Internal server error' });
}