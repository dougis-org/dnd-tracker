import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from '@jest/globals';
import EncounterModel from '@/lib/models/encounter';
import type { EncounterDoc } from '@/lib/models/encounter';
import {
  startMongoContainer,
  stopMongoContainer,
  connectToMongo,
  clearMongoDatabase,
  disconnectMongo,
} from '@test-helpers/mongo-testcontainers';

// T016: Full integration tests for Encounter model with real MongoDB (testcontainers)
describe('Encounter model integration tests (T016 - MongoDB)', () => {
  beforeAll(async () => {
    // Start MongoDB testcontainer
    await startMongoContainer();
    // Connect to the running container
    await connectToMongo();
  }, 30000); // 30s timeout for container startup

  afterAll(async () => {
    // Clean up
    await disconnectMongo();
    await stopMongoContainer();
  }, 30000);

  beforeEach(async () => {
    // Clear database before each test
    await clearMongoDatabase();
  });

  it('should create an encounter with valid data', async () => {
    const encounterData = {
      name: 'Goblin Ambush',
      description: 'A surprise encounter in the forest',
      participants: [
        { type: 'monster' as const, displayName: 'Goblin', quantity: 3, hp: 7 },
      ],
      owner_id: 'user-001',
    };

    const created = await EncounterModel.create(encounterData);
    expect(created).toBeDefined();
    expect(created._id).toBeDefined();
    expect(created.name).toBe('Goblin Ambush');
    expect(created.owner_id).toBe('user-001');
    expect(created.participants).toHaveLength(1);
    expect(created.participants[0].displayName).toBe('Goblin');
    expect(created.created_at).toBeInstanceOf(Date);
    expect(created.updated_at).toBeInstanceOf(Date);
  });

  it('should retrieve an encounter by id', async () => {
    const encounterData = {
      name: 'Dragon Lair',
      participants: [
        {
          type: 'monster' as const,
          displayName: 'Ancient Red Dragon',
          quantity: 1,
          hp: 297,
        },
      ],
      owner_id: 'user-002',
    };

    const created = await EncounterModel.create(encounterData);
    const retrieved = await EncounterModel.findById(created._id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Dragon Lair');
    expect(retrieved?.owner_id).toBe('user-002');
  });

  it('should update an encounter and modify timestamps', async () => {
    const encounterData = {
      name: 'Original Name',
      participants: [
        { type: 'monster' as const, displayName: 'Goblin', quantity: 2 },
      ],
      owner_id: 'user-003',
    };

    const created = await EncounterModel.create(encounterData);
    const originalUpdatedAt = created.updated_at.getTime();

    const updated = await EncounterModel.findByIdAndUpdate(
      created._id,
      { name: 'Updated Name', description: 'New description' },
      { new: true }
    );

    expect(updated).toBeDefined();
    expect(updated?.name).toBe('Updated Name');
    expect(updated?.description).toBe('New description');
    expect(updated?.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt);
  });

  it('should delete an encounter', async () => {
    const encounterData = {
      name: 'Temporary Encounter',
      participants: [
        { type: 'monster' as const, displayName: 'Orc', quantity: 1 },
      ],
      owner_id: 'user-004',
    };

    const created = await EncounterModel.create(encounterData);
    await EncounterModel.findByIdAndDelete(created._id);

    const retrieved = await EncounterModel.findById(created._id);
    expect(retrieved).toBeNull();
  });

  it('should find all encounters for a specific owner', async () => {
    const owner = 'user-005';

    // Create multiple encounters for different owners
    await EncounterModel.create({
      name: 'Encounter 1',
      participants: [
        { type: 'monster' as const, displayName: 'Goblin', quantity: 1 },
      ],
      owner_id: owner,
    });
    await EncounterModel.create({
      name: 'Encounter 2',
      participants: [
        { type: 'monster' as const, displayName: 'Orc', quantity: 1 },
      ],
      owner_id: owner,
    });
    await EncounterModel.create({
      name: 'Other User Encounter',
      participants: [
        { type: 'monster' as const, displayName: 'Troll', quantity: 1 },
      ],
      owner_id: 'user-999',
    });

    const ownerEncounters = await EncounterModel.find({ owner_id: owner });
    expect(ownerEncounters).toHaveLength(2);
    expect(
      ownerEncounters.every((e: EncounterDoc) => e.owner_id === owner)
    ).toBe(true);
  });

  it('should enforce name validation (min length)', async () => {
    const encounterData = {
      name: '', // Empty name should fail
      participants: [
        { type: 'monster' as const, displayName: 'Goblin', quantity: 1 },
      ],
      owner_id: 'user-006',
    };

    await expect(EncounterModel.create(encounterData)).rejects.toThrow();
  });

  it('should enforce name validation (max length)', async () => {
    const encounterData = {
      name: 'a'.repeat(201), // Exceeds max length
      participants: [
        { type: 'monster' as const, displayName: 'Goblin', quantity: 1 },
      ],
      owner_id: 'user-007',
    };

    await expect(EncounterModel.create(encounterData)).rejects.toThrow();
  });

  it('should enforce participant validation (min participants)', async () => {
    const encounterData = {
      name: 'Empty Encounter',
      participants: [], // No participants
      owner_id: 'user-008',
    };

    await expect(EncounterModel.create(encounterData)).rejects.toThrow();
  });

  it('should enforce participant quantity validation (min 1)', async () => {
    const encounterData = {
      name: 'Bad Quantity',
      participants: [
        { type: 'monster' as const, displayName: 'Goblin', quantity: 0 }, // Invalid
      ],
      owner_id: 'user-009',
    };

    await expect(EncounterModel.create(encounterData)).rejects.toThrow();
  });

  it('should enforce HP validation (non-negative)', async () => {
    const encounterData = {
      name: 'Negative HP',
      participants: [
        {
          type: 'monster' as const,
          displayName: 'Goblin',
          quantity: 1,
          hp: -5,
        }, // Invalid
      ],
      owner_id: 'user-010',
    };

    await expect(EncounterModel.create(encounterData)).rejects.toThrow();
  });

  it('should support multiple participant types', async () => {
    const encounterData = {
      name: 'Mixed Party',
      participants: [
        { type: 'monster' as const, displayName: 'Goblin', quantity: 3 },
        {
          type: 'party_member' as const,
          displayName: 'Barbarian',
          quantity: 1,
        },
        {
          type: 'custom' as const,
          displayName: 'Hired Mercenary',
          quantity: 2,
        },
      ],
      owner_id: 'user-011',
    };

    const created = await EncounterModel.create(encounterData);
    expect(created.participants).toHaveLength(3);
    expect(created.participants[0].type).toBe('monster');
    expect(created.participants[1].type).toBe('party_member');
    expect(created.participants[2].type).toBe('custom');
  });

  it('should support optional fields', async () => {
    const encounterData = {
      name: 'Full Encounter',
      description: 'Complete encounter with all fields',
      participants: [
        { type: 'monster' as const, displayName: 'Goblin', quantity: 1 },
      ],
      tags: ['outdoor', 'combat', 'forest'],
      template_flag: true,
      owner_id: 'user-012',
      org_id: 'org-001',
    };

    const created = await EncounterModel.create(encounterData);
    expect(created.description).toBe('Complete encounter with all fields');
    expect(created.tags).toEqual(['outdoor', 'combat', 'forest']);
    expect(created.template_flag).toBe(true);
    expect(created.org_id).toBe('org-001');
  });

  it('should support metadata on participants', async () => {
    const encounterData = {
      name: 'Encounter with Metadata',
      participants: [
        {
          type: 'monster' as const,
          displayName: 'Named Goblin',
          quantity: 1,
          metadata: { sourceMonsterIndex: 42, legendary: false },
        },
      ],
      owner_id: 'user-013',
    };

    const created = await EncounterModel.create(encounterData);
    expect(created.participants[0].metadata).toEqual({
      sourceMonsterIndex: 42,
      legendary: false,
    });
  });

  it('should query by compound index (owner_id + name)', async () => {
    const owner = 'user-014';

    await EncounterModel.create({
      name: 'Unique Encounter',
      participants: [
        { type: 'monster' as const, displayName: 'Goblin', quantity: 1 },
      ],
      owner_id: owner,
    });

    // Query by compound key
    const found = await EncounterModel.findOne({
      owner_id: owner,
      name: 'Unique Encounter',
    });
    expect(found).toBeDefined();
    expect(found?.owner_id).toBe(owner);
  });

  it('should query by created_at timestamp', async () => {
    const now = new Date();

    const created = await EncounterModel.create({
      name: 'Recent Encounter',
      participants: [
        { type: 'monster' as const, displayName: 'Goblin', quantity: 1 },
      ],
      owner_id: 'user-015',
    });

    // Query recent encounters
    const recent = await EncounterModel.find({
      created_at: { $gte: new Date(now.getTime() - 5000) },
    });

    expect(recent.some((e: EncounterDoc) => e._id.equals(created._id))).toBe(
      true
    );
  });
});
