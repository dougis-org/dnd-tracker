import { describe, it, expect } from '@jest/globals';
import adapter from '../../../src/lib/api/encounters';

// T014: Unit tests for Encounters API adapter
describe('Encounters API adapter (T014)', () => {
  it('should export a client adapter for encounters', () => {
    expect(adapter).toBeDefined();
    expect(adapter.list).toBeDefined();
    expect(adapter.create).toBeDefined();
    expect(adapter.get).toBeDefined();
    expect(adapter.update).toBeDefined();
    expect(adapter.delete).toBeDefined();
  });

  it('should create an encounter', async () => {
    const payload = {
      name: 'Test Encounter',
      participants: [
        { type: 'monster' as const, displayName: 'Goblin', quantity: 1 },
      ],
      owner_id: 'user123',
    };
    const created = await adapter.create(payload);
    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.name).toBe('Test Encounter');
  });

  it('should retrieve an encounter by id', async () => {
    const payload = {
      name: 'Retrievable Encounter',
      participants: [
        { type: 'monster' as const, displayName: 'Ogre', quantity: 1 },
      ],
      owner_id: 'user456',
    };
    const created = await adapter.create(payload);
    const retrieved = await adapter.get(created.id!);
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Retrievable Encounter');
  });

  it('should return null for non-existent encounter', async () => {
    const result = await adapter.get('nonexistent-id');
    expect(result).toBeNull();
  });

  it('should update an encounter', async () => {
    const payload = {
      name: 'Original Name',
      participants: [
        { type: 'monster' as const, displayName: 'Goblin', quantity: 1 },
      ],
      owner_id: 'user789',
    };
    const created = await adapter.create(payload);
    const updated = await adapter.update(created.id!, { name: 'Updated Name' });
    expect(updated).toBeDefined();
    expect(updated?.name).toBe('Updated Name');
  });

  it('should delete an encounter', async () => {
    const payload = {
      name: 'Deletable Encounter',
      participants: [
        { type: 'monster' as const, displayName: 'Troll', quantity: 1 },
      ],
      owner_id: 'user999',
    };
    const created = await adapter.create(payload);
    const deleted = await adapter.delete(created.id!);
    expect(deleted).toBe(true);
    const retrieved = await adapter.get(created.id!);
    expect(retrieved).toBeNull();
  });

  it('should list all encounters', async () => {
    const payload1 = {
      name: 'Encounter 1',
      participants: [
        { type: 'monster' as const, displayName: 'Goblin', quantity: 1 },
      ],
      owner_id: 'user001',
    };
    const payload2 = {
      name: 'Encounter 2',
      participants: [
        { type: 'monster' as const, displayName: 'Ogre', quantity: 1 },
      ],
      owner_id: 'user002',
    };
    await adapter.create(payload1);
    await adapter.create(payload2);
    const all = await adapter.list();
    expect(all.length).toBeGreaterThanOrEqual(2);
  });

  it('should list encounters filtered by owner', async () => {
    const owner = `unique-owner-${  Date.now()}`;
    const payload = {
      name: 'Owner Encounter',
      participants: [
        { type: 'monster' as const, displayName: 'Dragon', quantity: 1 },
      ],
      owner_id: owner,
    };
    await adapter.create(payload);
    const filtered = await adapter.list(owner);
    expect(
      filtered.some((e: { owner_id: string }) => e.owner_id === owner)
    ).toBe(true);
  });
});
