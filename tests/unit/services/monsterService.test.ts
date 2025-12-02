/**
 * Monster Service Tests
 * Tests for the monsterService wrapper
 */

import { monsterService } from '@/lib/services/monsterService';
import { monsterAdapter } from '@/lib/mocks/monsterAdapter';

// Mock the adapter
jest.mock('@/lib/mocks/monsterAdapter', () => ({
  monsterAdapter: {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    search: jest.fn(),
    reset: jest.fn(),
  },
}));

describe('Monster Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const adapterMethods = [
    {
      method: 'list',
      input: { cr: { min: 5 } },
      expected: [{ id: '1', name: 'Dragon' }],
      desc: 'list with filters',
    },
    {
      method: 'getById',
      input: '1',
      expected: { id: '1', name: 'Goblin' },
      desc: 'getById returns monster',
    },
    {
      method: 'search',
      input: 'dragon',
      expected: [{ id: '1', name: 'Dragon' }],
      desc: 'search returns results',
    },
  ];

  adapterMethods.forEach(({ method, input, expected, desc }) => {
    it(`should call adapter.${method} and return result for ${desc}`, async () => {
      (
        monsterAdapter[method as keyof typeof monsterAdapter] as jest.Mock
      ).mockResolvedValue(expected);

      const result =
        await monsterService[method as keyof typeof monsterService](input);

      expect(
        monsterAdapter[method as keyof typeof monsterAdapter]
      ).toHaveBeenCalledWith(input);
      expect(result).toEqual(expected);
    });
  });

  it('should call adapter.list without filters', async () => {
    (monsterAdapter.list as jest.Mock).mockResolvedValue([]);
    await monsterService.list();
    expect(monsterAdapter.list).toHaveBeenCalledWith(undefined);
  });

  it('should return null if getById not found', async () => {
    (monsterAdapter.getById as jest.Mock).mockResolvedValue(null);
    const result = await monsterService.getById('999');
    expect(result).toBeNull();
  });

  it('should return empty array if search has no matches', async () => {
    (monsterAdapter.search as jest.Mock).mockResolvedValue([]);
    const result = await monsterService.search('nonexistent');
    expect(result).toEqual([]);
  });

  describe('create', () => {
    it('should call adapter.create with input and userId', async () => {
      const input = { name: 'New Monster', challenge: 5 };
      const mockMonster = { id: '1', ...input };
      (monsterAdapter.create as jest.Mock).mockResolvedValue(mockMonster);

      const result = await monsterService.create(input, 'user-123');

      expect(monsterAdapter.create).toHaveBeenCalledWith(input, 'user-123');
      expect(result).toEqual(mockMonster);
    });

    it('should use default userId if not provided', async () => {
      (monsterAdapter.create as jest.Mock).mockResolvedValue({});
      await monsterService.create({ name: 'Test', challenge: 3 });
      expect(monsterAdapter.create).toHaveBeenCalledWith(
        expect.any(Object),
        'current-user'
      );
    });
  });

  describe('update', () => {
    it('should call adapter.update with id and input', async () => {
      const input = { name: 'Updated Monster' };
      const mockMonster = { id: '1', name: 'Updated Monster' };
      (monsterAdapter.update as jest.Mock).mockResolvedValue(mockMonster);

      const result = await monsterService.update('1', input, 'user-123');

      expect(monsterAdapter.update).toHaveBeenCalledWith(
        '1',
        input,
        'user-123'
      );
      expect(result).toEqual(mockMonster);
    });

    it('should return null if update fails', async () => {
      (monsterAdapter.update as jest.Mock).mockResolvedValue(null);
      const result = await monsterService.update('999', {}, 'user-123');
      expect(result).toBeNull();
    });

    it('should use default userId for update', async () => {
      (monsterAdapter.update as jest.Mock).mockResolvedValue({});
      await monsterService.update('1', { name: 'Test' });
      expect(monsterAdapter.update).toHaveBeenCalledWith(
        '1',
        expect.any(Object),
        'current-user'
      );
    });
  });

  describe('delete', () => {
    it('should call adapter.delete with id', async () => {
      (monsterAdapter.delete as jest.Mock).mockResolvedValue(true);
      const result = await monsterService.delete('1');
      expect(monsterAdapter.delete).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
    });

    it('should return false if delete fails', async () => {
      (monsterAdapter.delete as jest.Mock).mockResolvedValue(false);
      const result = await monsterService.delete('999');
      expect(result).toBe(false);
    });
  });

  describe('reset', () => {
    it('should call adapter.reset', async () => {
      (monsterAdapter.reset as jest.Mock).mockResolvedValue(undefined);

      await monsterService.reset();

      expect(monsterAdapter.reset).toHaveBeenCalled();
    });
  });
});
