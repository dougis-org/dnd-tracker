/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '../route';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/mongodb';
import { CharacterModel } from '@/models/schemas';
import { MongoMemoryServer } from 'mongodb-memory-server';

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('POST /api/characters/[id]/duplicate (Integration)', () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;
    await connectToDatabase();
  });

  afterAll(async () => {
    await disconnectFromDatabase();
    await mongod.stop();
  });

  beforeEach(async () => {
    await CharacterModel.deleteMany({});
    jest.clearAllMocks();
  });

  it('should duplicate a character and include totalLevel', async () => {
    const mockUserId = 'user_12345';
    mockAuth.mockReturnValue({ userId: mockUserId });

    const originalCharacterData = {
      userId: mockUserId,
      name: 'Test Character',
      race: 'Human',
      background: 'Acolyte',
      alignment: 'Lawful Good',
      experiencePoints: 0,
      classes: [{ className: 'Fighter', level: 5, hitDiceSize: 10, hitDiceUsed: 0 }],
      totalLevel: 5,
      abilities: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      },
    };

    const originalCharacter = await CharacterModel.create(originalCharacterData);
    const characterId = originalCharacter._id.toString();

    const params = { params: { id: characterId } };
    const response = await POST(new NextRequest('http://localhost:3000'), params);
    const newCharacter = await response.json();

    expect(response.status).toBe(201);
    expect(newCharacter.name).toBe('Test Character (Copy)');
    expect(newCharacter.totalLevel).toBe(5);

    const newCharacterInDb = await CharacterModel.findById(newCharacter._id);
    expect(newCharacterInDb).not.toBeNull();
    expect(newCharacterInDb?.totalLevel).toBe(5);
  });
});
