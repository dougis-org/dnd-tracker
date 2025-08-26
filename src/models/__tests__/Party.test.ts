import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Party, IParty } from '../Party';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Party Model', () => {
  it('should create a new party', async () => {
    const partyData: Partial<IParty> = {
      userId: 'user123',
      name: 'The Fellowship',
      description: 'A group of adventurers on a quest to destroy the One Ring.',
      campaignName: 'The Lord of the Rings',
      maxSize: 9,
    };

    const party = new Party(partyData);
    const savedParty = await party.save();

    expect(savedParty._id).toBeDefined();
    expect(savedParty.userId).toBe(partyData.userId);
    expect(savedParty.name).toBe(partyData.name);
    expect(savedParty.description).toBe(partyData.description);
    expect(savedParty.campaignName).toBe(partyData.campaignName);
    expect(savedParty.maxSize).toBe(partyData.maxSize);
    expect(savedParty.createdAt).toBeDefined();
    expect(savedParty.updatedAt).toBeDefined();
  });

  it('should fail validation if character limit is exceeded', async () => {
    const partyData: Partial<IParty> = {
      userId: 'user456',
      name: 'Big Party',
      maxSize: 2,
      characters: [
        { characterId: new mongoose.Types.ObjectId(), isActive: true, joinedAt: new Date() },
        { characterId: new mongoose.Types.ObjectId(), isActive: true, joinedAt: new Date() },
        { characterId: new mongoose.Types.ObjectId(), isActive: true, joinedAt: new Date() },
      ],
    };
    const party = new Party(partyData);
    await expect(party.validate()).rejects.toThrow('Party exceeds character limit of 3 for subscription tier.');
  });

  it('should support sharing and collaboration roles', async () => {
    const partyData: Partial<IParty> = {
      userId: 'user789',
      name: 'Shared Party',
      sharedWith: [
        { userId: 'userA', role: 'viewer', sharedAt: new Date() },
        { userId: 'userB', role: 'editor', sharedAt: new Date() },
      ],
      maxSize: 5,
    };
    const party = new Party(partyData);
    const savedParty = await party.save();
    expect(savedParty.sharedWith.length).toBe(2);
    expect(savedParty.sharedWith[0].role).toBe('viewer');
    expect(savedParty.sharedWith[1].role).toBe('editor');
  });

  it('should support template creation and categorization', async () => {
    const partyData: Partial<IParty> = {
      userId: 'userTemplate',
      name: 'Template Party',
      isTemplate: true,
      templateCategory: 'Dungeon Crawl',
      maxSize: 6,
    };
    const party = new Party(partyData);
    const savedParty = await party.save();
    expect(savedParty.isTemplate).toBe(true);
    expect(savedParty.templateCategory).toBe('Dungeon Crawl');
  });
});