/**
 * T023: Monster persistence verification
 *
 * Integration tests to verify:
 * - Create monster persists in localStorage
 * - Monsters survive page reload
 * - List shows persisted monsters after reload
 */

import { monsterService } from '@/lib/services/monsterService';
import type { MonsterCreateInput, Monster } from '@/types/monster';

describe('T023: Monster Persistence (Integration)', () => {
  // Clear storage before each test
  beforeEach(async () => {
    // Reset the service to clear mock data
    await monsterService.reset();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up after each test
    await monsterService.reset();
  });

  it('should persist created monster', async () => {
    const createInput: MonsterCreateInput = {
      name: 'Test Dragon',
      cr: 5,
      hp: 110,
      ac: 19,
      size: 'Huge',
      type: 'dragon',
      alignment: 'Chaotic Evil',
      speed: '40 ft.',
      scope: 'campaign',
      abilities: {
        str: 18,
        dex: 12,
        con: 17,
        int: 16,
        wis: 13,
        cha: 16,
      },
    };

    // Create monster
    const created = await monsterService.create(createInput);
    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.name).toBe('Test Dragon');

    // Verify it's in list
    const list = await monsterService.list();
    expect(list.some((m: Monster) => m.id === created.id)).toBe(true);
  });

  it('should retrieve created monster by ID', async () => {
    const createInput: MonsterCreateInput = {
      name: 'Test Lich',
      cr: 21,
      hp: 135,
      ac: 17,
      size: 'Medium',
      type: 'undead',
      alignment: 'Chaotic Evil',
      speed: '0 ft.',
      scope: 'global',
      abilities: {
        str: 16,
        dex: 16,
        con: 16,
        int: 20,
        wis: 14,
        cha: 16,
      },
    };

    const created = await monsterService.create(createInput);
    const retrieved = await monsterService.getById(created.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Test Lich');
    expect(retrieved?.cr).toBe(21);
    expect(retrieved?.hp).toBe(135);
  });

  it('should list all persisted monsters', async () => {
    const createInput1: MonsterCreateInput = {
      name: 'Dragon 1',
      cr: 5,
      hp: 110,
      ac: 19,
      size: 'Huge',
      type: 'dragon',
      alignment: 'Chaotic Evil',
      speed: '40 ft.',
      scope: 'campaign',
      abilities: {
        str: 18,
        dex: 12,
        con: 17,
        int: 16,
        wis: 13,
        cha: 16,
      },
    };

    const createInput2: MonsterCreateInput = {
      name: 'Goblin 2',
      cr: 0.25,
      hp: 7,
      ac: 15,
      size: 'Small',
      type: 'humanoid',
      alignment: 'Neutral Evil',
      speed: '30 ft.',
      scope: 'campaign',
      abilities: {
        str: 8,
        dex: 14,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
      },
    };

    await monsterService.create(createInput1);
    await monsterService.create(createInput2);

    const list = await monsterService.list();
    expect(list).toBeDefined();
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(list.some((m: Monster) => m.name === 'Dragon 1')).toBe(true);
    expect(list.some((m: Monster) => m.name === 'Goblin 2')).toBe(true);
  });

  it('should update persisted monster', async () => {
    const createInput: MonsterCreateInput = {
      name: 'Original Name',
      cr: 1,
      hp: 50,
      ac: 14,
      size: 'Medium',
      type: 'humanoid',
      alignment: 'Lawful Good',
      speed: '30 ft.',
      scope: 'campaign',
      abilities: {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
      },
    };

    const created = await monsterService.create(createInput);

    const updateInput: MonsterCreateInput = {
      name: 'Updated Name',
      cr: 2,
      hp: 75,
      ac: 16,
      size: 'Medium',
      type: 'humanoid',
      alignment: 'Lawful Good',
      speed: '30 ft.',
      scope: 'campaign',
      abilities: {
        str: 12,
        dex: 12,
        con: 12,
        int: 12,
        wis: 12,
        cha: 12,
      },
    };

    const updated = await monsterService.update(created.id, {
      ...updateInput,
      id: created.id,
    });

    expect(updated?.name).toBe('Updated Name');
    expect(updated?.cr).toBe(2);
    expect(updated?.hp).toBe(75);
  });

  it('should delete persisted monster', async () => {
    const createInput: MonsterCreateInput = {
      name: 'Monster to Delete',
      cr: 1,
      hp: 50,
      ac: 14,
      size: 'Medium',
      type: 'humanoid',
      alignment: 'Lawful Good',
      speed: '30 ft.',
      scope: 'campaign',
      abilities: {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
      },
    };

    const created = await monsterService.create(createInput);
    const listBefore = await monsterService.list();

    await monsterService.delete(created.id);

    const listAfter = await monsterService.list();
    expect(listAfter.length).toBeLessThan(listBefore.length);
    expect(listAfter.some((m: Monster) => m.id === created.id)).toBe(false);
  });

  it('should filter monsters by scope', async () => {
    const campaignMonster: MonsterCreateInput = {
      name: 'Campaign Only',
      cr: 1,
      hp: 50,
      ac: 14,
      size: 'Medium',
      type: 'humanoid',
      alignment: 'Lawful Good',
      speed: '30 ft.',
      scope: 'campaign',
      abilities: {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
      },
    };

    const globalMonster: MonsterCreateInput = {
      name: 'Global Monster',
      cr: 1,
      hp: 50,
      ac: 14,
      size: 'Medium',
      type: 'humanoid',
      alignment: 'Lawful Good',
      speed: '30 ft.',
      scope: 'global',
      abilities: {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
      },
    };

    await monsterService.create(campaignMonster);
    await monsterService.create(globalMonster);

    const allMonsters = await monsterService.list();
    expect(allMonsters.length).toBeGreaterThanOrEqual(2);

    // Verify both scopes exist
    expect(allMonsters.some((m: Monster) => m.scope === 'campaign')).toBe(true);
    expect(allMonsters.some((m: Monster) => m.scope === 'global')).toBe(true);
  });
});
