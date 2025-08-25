
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
});
