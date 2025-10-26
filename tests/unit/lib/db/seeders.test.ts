import { jest } from '@jest/globals';

const raceUpdateOneMock = jest.fn();
const classUpdateOneMock = jest.fn();

jest.mock('@/lib/db/models/CharacterRace', () => ({
  __esModule: true,
  CharacterRace: {
    collection: {
      updateOne: raceUpdateOneMock,
    },
  },
}));

jest.mock('@/lib/db/models/CharacterClass', () => ({
  __esModule: true,
  CharacterClass: {
    collection: {
      updateOne: classUpdateOneMock,
    },
  },
}));

import { seedSystemEntities } from '@/lib/db/seeders';

describe('seedSystemEntities', () => {
  beforeEach(() => {
    raceUpdateOneMock.mockReset();
    classUpdateOneMock.mockReset();
  });

  it('upserts all PHB races and classes with upsert enabled', async () => {
    await seedSystemEntities();

    expect(raceUpdateOneMock).toHaveBeenCalledTimes(9);
    expect(classUpdateOneMock).toHaveBeenCalledTimes(12);

    expect(raceUpdateOneMock).toHaveBeenCalledWith(
      { name: 'Human' },
      expect.objectContaining({
        $set: expect.objectContaining({
          name: 'Human',
          abilityBonuses: expect.any(Object),
        }),
      }),
      expect.objectContaining({ upsert: true })
    );

    expect(classUpdateOneMock).toHaveBeenCalledWith(
      { name: 'Barbarian' },
      expect.objectContaining({
        $set: expect.objectContaining({
          name: 'Barbarian',
          hitDie: 'd12',
        }),
      }),
      expect.objectContaining({ upsert: true })
    );
  });

  it('propagates seeding errors', async () => {
    const failure = new Error('Race seed failed');
    raceUpdateOneMock.mockRejectedValueOnce(failure);

    await expect(seedSystemEntities()).rejects.toThrow('Race seed failed');

    expect(classUpdateOneMock).not.toHaveBeenCalled();
  });
});
