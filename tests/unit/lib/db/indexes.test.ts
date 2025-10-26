jest.mock('mongoose', () => {
  const connection = { db: undefined as unknown };

  return {
    __esModule: true,
    default: { connection },
    connection,
  };
});

import mongoose from 'mongoose';
import { createCharacterCollectionIndexes } from '@/lib/db/indexes';

describe('createCharacterCollectionIndexes', () => {
  const createIndexMock = jest.fn().mockResolvedValue(undefined);
  const collectionMock = { createIndex: createIndexMock };
  const collectionFn = jest.fn().mockReturnValue(collectionMock);

  beforeEach(() => {
    jest.clearAllMocks();
    (mongoose.connection as unknown as { db: unknown }).db = {
      collection: collectionFn,
    } as unknown;
  });

  it('creates the expected indexes for the characters collection', async () => {
    await createCharacterCollectionIndexes();

    expect(collectionFn).toHaveBeenCalledWith('characters');
    expect(createIndexMock).toHaveBeenNthCalledWith(1, { userId: 1, deletedAt: 1 }, { background: true });
    expect(createIndexMock).toHaveBeenNthCalledWith(2, { userId: 1, name: 'text' }, { background: true });
    expect(createIndexMock).toHaveBeenNthCalledWith(3, { userId: 1, createdAt: -1 }, { background: true });
    expect(createIndexMock).toHaveBeenNthCalledWith(4, { deletedAt: 1 }, { background: true });
  });

  it('resolves gracefully when database connection is unavailable', async () => {
    (mongoose.connection as unknown as { db?: unknown }).db = undefined;

    await expect(createCharacterCollectionIndexes()).resolves.toBeUndefined();

    expect(collectionFn).not.toHaveBeenCalled();
    expect(createIndexMock).not.toHaveBeenCalled();
  });
});
