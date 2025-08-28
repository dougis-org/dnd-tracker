/**
 * @jest-environment node
 */
import { POST } from '../route';
import { DELETE, PUT } from '../[characterId]/route';
import { Party } from '@/models/Party';
import { CharacterModel as Character } from '@/models/schemas';
import { User } from '@/models/User';
import { setupTestDatabase, teardownTestDatabase } from '@/models/_utils/test-utils';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { Types } from 'mongoose';

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

// Mock the tier limits utility
jest.mock('@/lib/utils/tier-limits', () => ({
  canAddCharacterToParty: jest.fn(),
}));

// Mock the user context utility
jest.mock('@/lib/utils/user-context', () => ({
  getUserTier: jest.fn(),
  canEditParty: jest.fn(),
}));

const mockAuth = auth as unknown as jest.Mock;
const mockCanAddCharacterToParty = jest.requireMock('@/lib/utils/tier-limits').canAddCharacterToParty;
const mockGetUserTier = jest.requireMock('@/lib/utils/user-context').getUserTier;
const mockCanEditParty = jest.requireMock('@/lib/utils/user-context').canEditParty;

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});

beforeEach(async () => {
  await Party.deleteMany({});
  await Character.deleteMany({});
  await User.deleteMany({});
  jest.clearAllMocks();
});

describe('POST /api/parties/[id]/characters', () => {
  const testUserId = 'test-user-123';
  const testPartyId = new Types.ObjectId().toString();
  const testCharacterId = new Types.ObjectId().toString();

  it('should return 401 if user is not authenticated', async () => {
    mockAuth.mockReturnValue({ userId: null });

    const req = new NextRequest('http://localhost:3000/api/parties/123/characters', {
      method: 'POST',
      body: JSON.stringify({ characterId: testCharacterId }),
    });

    const response = await POST(req, { params: { id: '123' } });
    expect(response.status).toBe(401);
  });

  it('should return 400 for invalid party ID format', async () => {
    mockAuth.mockReturnValue({ userId: testUserId });

    const req = new NextRequest('http://localhost:3000/api/parties/invalid/characters', {
      method: 'POST',
      body: JSON.stringify({ characterId: testCharacterId }),
    });

    const response = await POST(req, { params: { id: 'invalid' } });
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Invalid party ID format');
  });

  it('should return 400 if characterId is missing', async () => {
    mockAuth.mockReturnValue({ userId: testUserId });

    const req = new NextRequest(`http://localhost:3000/api/parties/${testPartyId}/characters`, {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(req, { params: { id: testPartyId } });
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Character ID is required');
  });

  it('should return 400 for invalid character ID format', async () => {
    mockAuth.mockReturnValue({ userId: testUserId });

    const req = new NextRequest(`http://localhost:3000/api/parties/${testPartyId}/characters`, {
      method: 'POST',
      body: JSON.stringify({ characterId: 'invalid' }),
    });

    const response = await POST(req, { params: { id: testPartyId } });
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Invalid character ID format');
  });

  it('should return 404 if party not found', async () => {
    mockAuth.mockReturnValue({ userId: testUserId });

    const req = new NextRequest(`http://localhost:3000/api/parties/${testPartyId}/characters`, {
      method: 'POST',
      body: JSON.stringify({ characterId: testCharacterId }),
    });

    const response = await POST(req, { params: { id: testPartyId } });
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('Party not found');
  });

  it('should return 403 if user cannot edit party', async () => {
    mockAuth.mockReturnValue({ userId: testUserId });
    mockCanEditParty.mockReturnValue(false);

    // Create a party
    const party = new Party({
      _id: testPartyId,
      userId: 'other-user',
      name: 'Test Party',
      maxSize: 5,
    });
    await party.save();

    const req = new NextRequest(`http://localhost:3000/api/parties/${testPartyId}/characters`, {
      method: 'POST',
      body: JSON.stringify({ characterId: testCharacterId }),
    });

    const response = await POST(req, { params: { id: testPartyId } });
    expect(response.status).toBe(403);
    expect(await response.text()).toBe('Insufficient permissions to edit this party');
  });

  it('should return 404 if character not found', async () => {
    mockAuth.mockReturnValue({ userId: testUserId });
    mockCanEditParty.mockReturnValue(true);

    // Create a party
    const party = new Party({
      _id: testPartyId,
      userId: testUserId,
      name: 'Test Party',
      maxSize: 5,
    });
    await party.save();

    const req = new NextRequest(`http://localhost:3000/api/parties/${testPartyId}/characters`, {
      method: 'POST',
      body: JSON.stringify({ characterId: testCharacterId }),
    });

    const response = await POST(req, { params: { id: testPartyId } });
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('Character not found');
  });

  it('should return 403 if user tries to add character they do not own', async () => {
    mockAuth.mockReturnValue({ userId: testUserId });
    mockCanEditParty.mockReturnValue(true);

    // Create a party
    const party = new Party({
      _id: testPartyId,
      userId: testUserId,
      name: 'Test Party',
      maxSize: 5,
    });
    await party.save();

    // Create a character owned by another user
    const character = new Character({
      _id: testCharacterId,
      userId: 'other-user',
      name: 'Test Character',
      race: 'Human',
      background: 'Soldier',
      alignment: 'Lawful Good',
      experiencePoints: 0,
      classes: [{ className: 'Fighter', level: 1, hitDiceSize: 10, hitDiceUsed: 0 }],
      totalLevel: 1,
      abilities: {
        strength: 16,
        dexterity: 14,
        constitution: 15,
        intelligence: 12,
        wisdom: 13,
        charisma: 10,
      },
    });
    await character.save();

    const req = new NextRequest(`http://localhost:3000/api/parties/${testPartyId}/characters`, {
      method: 'POST',
      body: JSON.stringify({ characterId: testCharacterId }),
    });

    const response = await POST(req, { params: { id: testPartyId } });
    expect(response.status).toBe(403);
    expect(await response.text()).toBe('You can only add your own characters to parties');
  });

  it('should return 409 if character is already in party', async () => {
    mockAuth.mockReturnValue({ userId: testUserId });
    mockCanEditParty.mockReturnValue(true);

    // Create a character
    const character = new Character({
      _id: testCharacterId,
      userId: testUserId,
      name: 'Test Character',
      race: 'Human',
      background: 'Soldier',
      alignment: 'Lawful Good',
      experiencePoints: 0,
      classes: [{ className: 'Fighter', level: 1, hitDiceSize: 10, hitDiceUsed: 0 }],
      totalLevel: 1,
      abilities: {
        strength: 16,
        dexterity: 14,
        constitution: 15,
        intelligence: 12,
        wisdom: 13,
        charisma: 10,
      },
    });
    await character.save();

    // Create a party with the character already assigned
    const party = new Party({
      _id: testPartyId,
      userId: testUserId,
      name: 'Test Party',
      maxSize: 5,
      characters: [
        {
          characterId: testCharacterId,
          playerName: 'Player 1',
          isActive: true,
          joinedAt: new Date(),
        },
      ],
    });
    await party.save();

    const req = new NextRequest(`http://localhost:3000/api/parties/${testPartyId}/characters`, {
      method: 'POST',
      body: JSON.stringify({ characterId: testCharacterId }),
    });

    const response = await POST(req, { params: { id: testPartyId } });
    expect(response.status).toBe(409);
    expect(await response.text()).toBe('Character is already in this party');
  });

  it('should return 403 if party size limit is exceeded', async () => {
    mockAuth.mockReturnValue({ userId: testUserId });
    mockCanEditParty.mockReturnValue(true);
    mockGetUserTier.mockReturnValue('free');
    mockCanAddCharacterToParty.mockReturnValue(false);

    // Create a character
    const character = new Character({
      _id: testCharacterId,
      userId: testUserId,
      name: 'Test Character',
      race: 'Human',
      background: 'Soldier',
      alignment: 'Lawful Good',
      experiencePoints: 0,
      classes: [{ className: 'Fighter', level: 1, hitDiceSize: 10, hitDiceUsed: 0 }],
      totalLevel: 1,
      abilities: {
        strength: 16,
        dexterity: 14,
        constitution: 15,
        intelligence: 12,
        wisdom: 13,
        charisma: 10,
      },
    });
    await character.save();

    // Create a party at capacity
    const party = new Party({
      _id: testPartyId,
      userId: testUserId,
      name: 'Test Party',
      maxSize: 4,
      characters: [],
    });
    await party.save();

    const req = new NextRequest(`http://localhost:3000/api/parties/${testPartyId}/characters`, {
      method: 'POST',
      body: JSON.stringify({ characterId: testCharacterId }),
    });

    const response = await POST(req, { params: { id: testPartyId } });
    expect(response.status).toBe(403);
    expect(await response.text()).toContain('Party size limit exceeded for free tier');
  });

  it('should return 400 for invalid email format', async () => {
    mockAuth.mockReturnValue({ userId: testUserId });
    mockCanEditParty.mockReturnValue(true);
    mockGetUserTier.mockReturnValue('free');
    mockCanAddCharacterToParty.mockReturnValue(true);

    // Create a character
    const character = new Character({
      _id: testCharacterId,
      userId: testUserId,
      name: 'Test Character',
      race: 'Human',
      background: 'Soldier',
      alignment: 'Lawful Good',
      experiencePoints: 0,
      classes: [{ className: 'Fighter', level: 1, hitDiceSize: 10, hitDiceUsed: 0 }],
      totalLevel: 1,
      abilities: {
        strength: 16,
        dexterity: 14,
        constitution: 15,
        intelligence: 12,
        wisdom: 13,
        charisma: 10,
      },
    });
    await character.save();

    // Create a party
    const party = new Party({
      _id: testPartyId,
      userId: testUserId,
      name: 'Test Party',
      maxSize: 5,
    });
    await party.save();

    const req = new NextRequest(`http://localhost:3000/api/parties/${testPartyId}/characters`, {
      method: 'POST',
      body: JSON.stringify({
        characterId: testCharacterId,
        playerEmail: 'invalid-email',
      }),
    });

    const response = await POST(req, { params: { id: testPartyId } });
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Invalid email format');
  });

  it('should successfully add character to party', async () => {
    mockAuth.mockReturnValue({ userId: testUserId });
    mockCanEditParty.mockReturnValue(true);
    mockGetUserTier.mockReturnValue('free');
    mockCanAddCharacterToParty.mockReturnValue(true);

    // Create a character
    const character = new Character({
      _id: testCharacterId,
      userId: testUserId,
      name: 'Test Character',
      race: 'Human',
      background: 'Soldier',
      alignment: 'Lawful Good',
      experiencePoints: 0,
      classes: [{ className: 'Fighter', level: 1, hitDiceSize: 10, hitDiceUsed: 0 }],
      totalLevel: 1,
      abilities: {
        strength: 16,
        dexterity: 14,
        constitution: 15,
        intelligence: 12,
        wisdom: 13,
        charisma: 10,
      },
    });
    await character.save();

    // Create a party
    const party = new Party({
      _id: testPartyId,
      userId: testUserId,
      name: 'Test Party',
      maxSize: 5,
    });
    await party.save();

    const req = new NextRequest(`http://localhost:3000/api/parties/${testPartyId}/characters`, {
      method: 'POST',
      body: JSON.stringify({
        characterId: testCharacterId,
        playerName: 'John Doe',
        playerEmail: 'john@example.com',
      }),
    });

    const response = await POST(req, { params: { id: testPartyId } });
    expect(response.status).toBe(200);

    const responseData = await response.json();
    expect(responseData.characters).toHaveLength(1);
    expect(responseData.characters[0].characterId).toBe(testCharacterId);
    expect(responseData.characters[0].playerName).toBe('John Doe');
    expect(responseData.characters[0].playerEmail).toBe('john@example.com');
    expect(responseData.characters[0].isActive).toBe(true);
  });
});

describe('DELETE /api/parties/[id]/characters/[characterId]', () => {
  const testUserId = 'test-user-123';
  const testPartyId = new Types.ObjectId().toString();
  const testCharacterId = new Types.ObjectId().toString();

  it('should return 401 if user is not authenticated', async () => {
    mockAuth.mockReturnValue({ userId: null });

    const req = new NextRequest(
      `http://localhost:3000/api/parties/${testPartyId}/characters/${testCharacterId}`,
      { method: 'DELETE' }
    );

    const response = await DELETE(req, { params: { id: testPartyId, characterId: testCharacterId } });
    expect(response.status).toBe(401);
  });

  it('should return 400 for invalid party ID format', async () => {
    mockAuth.mockReturnValue({ userId: testUserId });

    const req = new NextRequest(
      `http://localhost:3000/api/parties/invalid/characters/${testCharacterId}`,
      { method: 'DELETE' }
    );

    const response = await DELETE(req, { params: { id: 'invalid', characterId: testCharacterId } });
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Invalid party ID format');
  });

  it('should return 400 for invalid character ID format', async () => {
    mockAuth.mockReturnValue({ userId: testUserId });

    const req = new NextRequest(
      `http://localhost:3000/api/parties/${testPartyId}/characters/invalid`,
      { method: 'DELETE' }
    );

    const response = await DELETE(req, { params: { id: testPartyId, characterId: 'invalid' } });
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Invalid character ID format');
  });

  it('should return 404 if party not found', async () => {
    mockAuth.mockReturnValue({ userId: testUserId });

    const req = new NextRequest(
      `http://localhost:3000/api/parties/${testPartyId}/characters/${testCharacterId}`,
      { method: 'DELETE' }
    );

    const response = await DELETE(req, { params: { id: testPartyId, characterId: testCharacterId } });
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('Party not found');
  });

  it('should return 403 if user cannot edit party', async () => {
    mockAuth.mockReturnValue({ userId: testUserId });
    mockCanEditParty.mockReturnValue(false);

    // Create a party
    const party = new Party({
      _id: testPartyId,
      userId: 'other-user',
      name: 'Test Party',
      maxSize: 5,
    });
    await party.save();

    const req = new NextRequest(
      `http://localhost:3000/api/parties/${testPartyId}/characters/${testCharacterId}`,
      { method: 'DELETE' }
    );

    const response = await DELETE(req, { params: { id: testPartyId, characterId: testCharacterId } });
    expect(response.status).toBe(403);
    expect(await response.text()).toBe('Insufficient permissions to edit this party');
  });

  it('should return 404 if character not found in party', async () => {
    mockAuth.mockReturnValue({ userId: testUserId });
    mockCanEditParty.mockReturnValue(true);

    // Create a party without the character
    const party = new Party({
      _id: testPartyId,
      userId: testUserId,
      name: 'Test Party',
      maxSize: 5,
    });
    await party.save();

    const req = new NextRequest(
      `http://localhost:3000/api/parties/${testPartyId}/characters/${testCharacterId}`,
      { method: 'DELETE' }
    );

    const response = await DELETE(req, { params: { id: testPartyId, characterId: testCharacterId } });
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('Character not found in this party');
  });

  it('should successfully remove character from party', async () => {
    mockAuth.mockReturnValue({ userId: testUserId });
    mockCanEditParty.mockReturnValue(true);

    // Create a party with the character
    const party = new Party({
      _id: testPartyId,
      userId: testUserId,
      name: 'Test Party',
      maxSize: 5,
      characters: [
        {
          characterId: testCharacterId,
          playerName: 'John Doe',
          isActive: true,
          joinedAt: new Date(),
        },
      ],
    });
    await party.save();

    const req = new NextRequest(
      `http://localhost:3000/api/parties/${testPartyId}/characters/${testCharacterId}`,
      { method: 'DELETE' }
    );

    const response = await DELETE(req, { params: { id: testPartyId, characterId: testCharacterId } });
    expect(response.status).toBe(204);

    // Verify character was removed
    const updatedParty = await Party.findById(testPartyId);
    expect(updatedParty?.characters).toHaveLength(0);
  });
});

describe('PUT /api/parties/[id]/characters/[characterId]', () => {
  const testUserId = 'test-user-123';
  const testPartyId = new Types.ObjectId().toString();
  const testCharacterId = new Types.ObjectId().toString();

  it('should return 401 if user is not authenticated', async () => {
    mockAuth.mockReturnValue({ userId: null });

    const req = new NextRequest(
      `http://localhost:3000/api/parties/${testPartyId}/characters/${testCharacterId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ playerName: 'Updated Name' }),
      }
    );

    const response = await PUT(req, { params: { id: testPartyId, characterId: testCharacterId } });
    expect(response.status).toBe(401);
  });

  it('should return 400 for invalid email format', async () => {
    mockAuth.mockReturnValue({ userId: testUserId });
    mockCanEditParty.mockReturnValue(true);

    // Create a party with the character
    const party = new Party({
      _id: testPartyId,
      userId: testUserId,
      name: 'Test Party',
      maxSize: 5,
      characters: [
        {
          characterId: testCharacterId,
          playerName: 'John Doe',
          isActive: true,
          joinedAt: new Date(),
        },
      ],
    });
    await party.save();

    const req = new NextRequest(
      `http://localhost:3000/api/parties/${testPartyId}/characters/${testCharacterId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ playerEmail: 'invalid-email' }),
      }
    );

    const response = await PUT(req, { params: { id: testPartyId, characterId: testCharacterId } });
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Invalid email format');
  });

  it('should successfully update character assignment details', async () => {
    mockAuth.mockReturnValue({ userId: testUserId });
    mockCanEditParty.mockReturnValue(true);

    // Create a party with the character
    const party = new Party({
      _id: testPartyId,
      userId: testUserId,
      name: 'Test Party',
      maxSize: 5,
      characters: [
        {
          characterId: testCharacterId,
          playerName: 'John Doe',
          playerEmail: 'john@example.com',
          isActive: true,
          joinedAt: new Date(),
        },
      ],
    });
    await party.save();

    const req = new NextRequest(
      `http://localhost:3000/api/parties/${testPartyId}/characters/${testCharacterId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          playerName: 'Jane Smith',
          playerEmail: 'jane@example.com',
          isActive: false,
        }),
      }
    );

    const response = await PUT(req, { params: { id: testPartyId, characterId: testCharacterId } });
    expect(response.status).toBe(200);

    const responseData = await response.json();
    expect(responseData.characters[0].playerName).toBe('Jane Smith');
    expect(responseData.characters[0].playerEmail).toBe('jane@example.com');
    expect(responseData.characters[0].isActive).toBe(false);
  });
});