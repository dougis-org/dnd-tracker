import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const connectToDatabaseMock = jest.fn(async () => undefined);
const setupConnectionEventsMock = jest.fn(() => undefined);
const setupGracefulShutdownMock = jest.fn(() => undefined);
const createDatabaseIndexesMock = jest.fn(async () => undefined);
const createCharacterCollectionIndexesMock = jest.fn(async () => undefined);
const seedSystemEntitiesMock = jest.fn(async () => undefined);

jest.mock('@/lib/db/connection', () => ({
  __esModule: true,
  connectToDatabase: connectToDatabaseMock,
  default: connectToDatabaseMock,
}));

jest.mock('@/lib/db/events', () => ({
  __esModule: true,
  setupConnectionEvents: setupConnectionEventsMock,
}));

jest.mock('@/lib/db/shutdown', () => ({
  __esModule: true,
  setupGracefulShutdown: setupGracefulShutdownMock,
}));

jest.mock('@/lib/db/indexes', () => ({
  __esModule: true,
  createDatabaseIndexes: createDatabaseIndexesMock,
  createCharacterCollectionIndexes: createCharacterCollectionIndexesMock,
}));

jest.mock('@/lib/db/seeders', () => ({
  __esModule: true,
  seedSystemEntities: seedSystemEntitiesMock,
}));

describe('initializeDatabase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createDatabaseIndexesMock.mockResolvedValue(undefined);
    createCharacterCollectionIndexesMock.mockResolvedValue(undefined);
  });

  it('creates both global and character-specific indexes during initialization', async () => {
    const { initializeDatabase } = await import(
      '../../../../src/lib/db/initialize'
    );

    await initializeDatabase();

    expect(connectToDatabaseMock).toHaveBeenCalledTimes(1);
    expect(createDatabaseIndexesMock).toHaveBeenCalledTimes(1);
    expect(createCharacterCollectionIndexesMock).toHaveBeenCalledTimes(1);
    expect(createDatabaseIndexesMock.mock.invocationCallOrder[0]).toBeLessThan(
      createCharacterCollectionIndexesMock.mock.invocationCallOrder[0]
    );
    expect(seedSystemEntitiesMock).toHaveBeenCalledTimes(1);
  });

  it('propagates index creation errors and stops subsequent initialization steps', async () => {
    const { initializeDatabase } = await import(
      '../../../../src/lib/db/initialize'
    );

    createDatabaseIndexesMock.mockRejectedValueOnce(new Error('index failure'));

    await expect(initializeDatabase()).rejects.toThrow('index failure');

    expect(createCharacterCollectionIndexesMock).not.toHaveBeenCalled();
    expect(seedSystemEntitiesMock).not.toHaveBeenCalled();
  });
});
