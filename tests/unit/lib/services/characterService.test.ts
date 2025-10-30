import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  MOCK_DERIVED_STATS,
  MOCK_USER_ID,
  BASE_CHARACTER_PAYLOAD,
  createMockCharacterDocument,
  createMockCharacterDocuments,
  DEFAULT_USER_FILTERS,
} from './characterService.fixtures';

jest.mock('@/lib/db/models/Character', () => {
  return {
    CharacterModel: {
      create: jest.fn(),
      calculateDerivedStats: jest.fn(),
      getDerivedStats: jest.fn(),
      fromUserQuery: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findOneAndUpdate: jest.fn(),
      countDocuments: jest.fn(),
    },
  };
});

const { CharacterModel } = require('@/lib/db/models/Character');
const { CharacterService } = require('@/lib/services/characterService');

const mockedCharacterModel = CharacterModel as jest.Mocked<
  typeof CharacterModel
>;

describe('CharacterService.createCharacter', () => {
  let createMock: jest.Mock;
  let calculateMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    createMock = mockedCharacterModel.create as jest.Mock;
    calculateMock = mockedCharacterModel.calculateDerivedStats as jest.Mock;
  });

  it('stores derived stats and returns a serializable character record', async () => {
    calculateMock.mockReturnValue(MOCK_DERIVED_STATS);

    const documentId = '60f7d16d2f1bbf1a3c3f1f3a';
    const persistedRecord = createMockCharacterDocument({
      _id: documentId,
      userId: MOCK_USER_ID,
    });

    createMock.mockResolvedValue(persistedRecord as never);

    const result = await CharacterService.createCharacter({
      userId: MOCK_USER_ID,
      payload: BASE_CHARACTER_PAYLOAD,
    });

    expect(calculateMock).toHaveBeenCalledWith({
      abilityScores: BASE_CHARACTER_PAYLOAD.abilityScores,
      classes: BASE_CHARACTER_PAYLOAD.classes,
    });

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: MOCK_USER_ID,
        maxHitPoints: MOCK_DERIVED_STATS.maxHitPoints,
        armorClass: MOCK_DERIVED_STATS.armorClass,
        initiative: MOCK_DERIVED_STATS.initiative,
        cachedStats: {
          abilityModifiers: MOCK_DERIVED_STATS.abilityModifiers,
          proficiencyBonus: MOCK_DERIVED_STATS.proficiencyBonus,
          skills: MOCK_DERIVED_STATS.skills,
          savingThrows: MOCK_DERIVED_STATS.savingThrows,
        },
      })
    );

    expect(result).toMatchObject({
      id: documentId,
      userId: MOCK_USER_ID,
      name: BASE_CHARACTER_PAYLOAD.name,
      maxHitPoints: MOCK_DERIVED_STATS.maxHitPoints,
      armorClass: MOCK_DERIVED_STATS.armorClass,
      initiative: MOCK_DERIVED_STATS.initiative,
      cachedStats: {
        abilityModifiers: MOCK_DERIVED_STATS.abilityModifiers,
        proficiencyBonus: MOCK_DERIVED_STATS.proficiencyBonus,
        skills: MOCK_DERIVED_STATS.skills,
        savingThrows: MOCK_DERIVED_STATS.savingThrows,
      },
    });
  });
});

describe('CharacterService.getCharacter', () => {
  const characterId = '64f7d16d2f1bbf1a3c3f1f3b';

  let fromUserQueryMock: jest.Mock;
  let findOneMock: jest.Mock;
  let getDerivedStatsMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    fromUserQueryMock = mockedCharacterModel.fromUserQuery as jest.Mock;
    findOneMock = mockedCharacterModel.findOne as jest.Mock;
    getDerivedStatsMock = mockedCharacterModel.getDerivedStats as jest.Mock;
  });

  it('returns a character that belongs to the provided user', async () => {
    const storedCharacter = createMockCharacterDocument({
      _id: characterId,
      userId: MOCK_USER_ID,
    });

    const expectedFilter = DEFAULT_USER_FILTERS;

    fromUserQueryMock.mockReturnValue(expectedFilter);
    findOneMock.mockResolvedValue(storedCharacter as never);
    getDerivedStatsMock.mockReturnValue(MOCK_DERIVED_STATS);

    const result = await CharacterService.getCharacter({
      userId: MOCK_USER_ID,
      characterId,
    });

    expect(fromUserQueryMock).toHaveBeenCalledWith(MOCK_USER_ID, false);
    expect(findOneMock).toHaveBeenCalledWith({
      ...expectedFilter,
      _id: characterId,
    });
    expect(getDerivedStatsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        abilityScores: BASE_CHARACTER_PAYLOAD.abilityScores,
        classes: BASE_CHARACTER_PAYLOAD.classes,
        cachedStats: storedCharacter.cachedStats,
        maxHitPoints: MOCK_DERIVED_STATS.maxHitPoints,
        armorClass: MOCK_DERIVED_STATS.armorClass,
        initiative: MOCK_DERIVED_STATS.initiative,
      })
    );

    expect(result).toMatchObject({
      id: characterId,
      userId: MOCK_USER_ID,
      name: BASE_CHARACTER_PAYLOAD.name,
      maxHitPoints: MOCK_DERIVED_STATS.maxHitPoints,
      armorClass: MOCK_DERIVED_STATS.armorClass,
      initiative: MOCK_DERIVED_STATS.initiative,
      totalLevel: MOCK_DERIVED_STATS.totalLevel,
      proficiencyBonus: MOCK_DERIVED_STATS.proficiencyBonus,
      cachedStats: {
        abilityModifiers: MOCK_DERIVED_STATS.abilityModifiers,
        proficiencyBonus: MOCK_DERIVED_STATS.proficiencyBonus,
        skills: MOCK_DERIVED_STATS.skills,
        savingThrows: MOCK_DERIVED_STATS.savingThrows,
      },
    });
  });

  it('throws when the character does not exist for the user', async () => {
    fromUserQueryMock.mockReturnValue(DEFAULT_USER_FILTERS);
    findOneMock.mockResolvedValue(null as never);

    await expect(
      CharacterService.getCharacter({ userId: MOCK_USER_ID, characterId })
    ).rejects.toThrow(RangeError);
  });
});

describe('CharacterService.listCharacters', () => {
  let fromUserQueryMock: jest.Mock;
  let findMock: jest.Mock;
  let countDocumentsMock: jest.Mock;
  let getDerivedStatsMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    fromUserQueryMock = mockedCharacterModel.fromUserQuery as jest.Mock;
    findMock = mockedCharacterModel.find as jest.Mock;
    countDocumentsMock = mockedCharacterModel.countDocuments as jest.Mock;
    getDerivedStatsMock = mockedCharacterModel.getDerivedStats as jest.Mock;
  });

  it('returns paginated character records with derived stats applied', async () => {
    const characters = createMockCharacterDocuments(2);
    characters[1] = {
      ...characters[1],
      name: 'Another Character',
      cachedStats: undefined,
    };

    fromUserQueryMock.mockReturnValue(DEFAULT_USER_FILTERS);
    findMock.mockResolvedValue(characters as never);
    countDocumentsMock.mockResolvedValue(25 as never);
    getDerivedStatsMock.mockReturnValue(MOCK_DERIVED_STATS);

    const result = await CharacterService.listCharacters({
      userId: MOCK_USER_ID,
      page: 2,
      pageSize: 10,
    });

    expect(fromUserQueryMock).toHaveBeenCalledWith(MOCK_USER_ID, false);
    expect(findMock).toHaveBeenCalledWith(
      DEFAULT_USER_FILTERS,
      null,
      expect.objectContaining({
        skip: 10,
        limit: 10,
        sort: { createdAt: -1 },
      })
    );
    expect(countDocumentsMock).toHaveBeenCalledWith(DEFAULT_USER_FILTERS);
    expect(getDerivedStatsMock).toHaveBeenCalledTimes(2);

    expect(result.pagination).toEqual({
      page: 2,
      pageSize: 10,
      total: 25,
      pages: 3,
    });

    expect(result.characters).toHaveLength(2);
    expect(result.characters[0]).toMatchObject({
      id: characters[0]._id,
      userId: MOCK_USER_ID,
      name: BASE_CHARACTER_PAYLOAD.name,
      maxHitPoints: MOCK_DERIVED_STATS.maxHitPoints,
    });
    expect(result.characters[1]).toMatchObject({
      id: characters[1]._id,
      userId: MOCK_USER_ID,
      name: 'Another Character',
      maxHitPoints: MOCK_DERIVED_STATS.maxHitPoints,
    });
  });

  it('includes deleted records when requested', async () => {
    const includeDeletedFilters = { userId: MOCK_USER_ID };

    fromUserQueryMock.mockReturnValue(includeDeletedFilters);
    findMock.mockResolvedValue([] as never);
    countDocumentsMock.mockResolvedValue(0 as never);

    const result = await CharacterService.listCharacters({
      userId: MOCK_USER_ID,
      includeDeleted: true,
    });

    expect(fromUserQueryMock).toHaveBeenCalledWith(MOCK_USER_ID, true);
    expect(findMock).toHaveBeenCalledWith(
      includeDeletedFilters,
      null,
      expect.objectContaining({
        skip: 0,
        limit: 25,
        sort: { createdAt: -1 },
      })
    );
    expect(countDocumentsMock).toHaveBeenCalledWith(includeDeletedFilters);
    expect(getDerivedStatsMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      characters: [],
      pagination: {
        page: 1,
        pageSize: 25,
        total: 0,
        pages: 0,
      },
    });
  });

  it('rejects when page or pageSize are invalid', async () => {
    await expect(
      CharacterService.listCharacters({ userId: MOCK_USER_ID, page: 0 })
    ).rejects.toThrow(RangeError);

    await expect(
      CharacterService.listCharacters({ userId: MOCK_USER_ID, pageSize: 0 })
    ).rejects.toThrow(RangeError);
  });
});

describe('CharacterService.updateCharacter', () => {
  const characterId = '64f7d16d2f1bbf1a3c3f1f3b';

  let fromUserQueryMock: jest.Mock;
  let findOneAndUpdateMock: jest.Mock;
  let getDerivedStatsMock: jest.Mock;
  let calculateMock: jest.Mock;
  let findOneMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    fromUserQueryMock = mockedCharacterModel.fromUserQuery as jest.Mock;
    findOneAndUpdateMock = mockedCharacterModel.findOneAndUpdate as jest.Mock;
    findOneMock = mockedCharacterModel.findOne as jest.Mock;
    getDerivedStatsMock = mockedCharacterModel.getDerivedStats as jest.Mock;
    calculateMock = mockedCharacterModel.calculateDerivedStats as jest.Mock;
  });

  it('updates character name and returns updated record', async () => {
    const updatedDocument = createMockCharacterDocument({
      _id: characterId,
      userId: MOCK_USER_ID,
      name: 'Updated Name',
    });

    fromUserQueryMock.mockReturnValue(DEFAULT_USER_FILTERS);
    findOneAndUpdateMock.mockResolvedValue(updatedDocument as never);
    getDerivedStatsMock.mockReturnValue(MOCK_DERIVED_STATS);

    const result = await CharacterService.updateCharacter({
      userId: MOCK_USER_ID,
      characterId,
      updates: { name: 'Updated Name' },
    });

    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { _id: characterId, userId: MOCK_USER_ID },
      { name: 'Updated Name' },
      expect.objectContaining({
        new: true,
        runValidators: true,
        lean: true,
      })
    );
    expect(getDerivedStatsMock).toHaveBeenCalled();
    expect(result).toMatchObject({
      id: characterId,
      name: 'Updated Name',
    });
  });

  it('recalculates derived stats when ability scores change', async () => {
    const newAbilityScores = {
      str: 16,
      dex: 14,
      con: 15,
      int: 12,
      wis: 11,
      cha: 9,
    };

    const updatedDerivedStats = { ...MOCK_DERIVED_STATS, totalLevel: 6 };

    const updatedDocument = createMockCharacterDocument({
      _id: characterId,
      userId: MOCK_USER_ID,
      name: BASE_CHARACTER_PAYLOAD.name,
      abilityScores: newAbilityScores,
      cachedStats: undefined,
      maxHitPoints: updatedDerivedStats.maxHitPoints,
      armorClass: updatedDerivedStats.armorClass,
      initiative: updatedDerivedStats.initiative,
    });

    fromUserQueryMock.mockReturnValue({ userId: MOCK_USER_ID, deletedAt: null });
    findOneMock.mockResolvedValue(createMockCharacterDocument({
      _id: characterId,
      userId: MOCK_USER_ID,
    }) as never);
    findOneAndUpdateMock.mockResolvedValue(updatedDocument as never);
    calculateMock.mockReturnValue(updatedDerivedStats);
    getDerivedStatsMock.mockReturnValue(updatedDerivedStats);

    const result = await CharacterService.updateCharacter({
      userId: MOCK_USER_ID,
      characterId,
      updates: {
        abilityScores: newAbilityScores,
        classes: BASE_CHARACTER_PAYLOAD.classes,
      },
    });

    expect(calculateMock).toHaveBeenCalledWith({
      abilityScores: newAbilityScores,
      classes: BASE_CHARACTER_PAYLOAD.classes,
    });
    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { _id: characterId, userId: MOCK_USER_ID },
      expect.objectContaining({
        abilityScores: newAbilityScores,
        maxHitPoints: updatedDerivedStats.maxHitPoints,
        armorClass: updatedDerivedStats.armorClass,
        initiative: updatedDerivedStats.initiative,
      }),
      expect.any(Object)
    );
    expect(result).toMatchObject({
      id: characterId,
      maxHitPoints: updatedDerivedStats.maxHitPoints,
    });
  });

  it('throws when character does not exist', async () => {
    fromUserQueryMock.mockReturnValue({ userId: MOCK_USER_ID, deletedAt: null });
    findOneMock.mockResolvedValue(null as never);

    await expect(
      CharacterService.updateCharacter({
        userId: MOCK_USER_ID,
        characterId,
        updates: {
          abilityScores: {
            str: 15,
            dex: 14,
            con: 14,
            int: 10,
            wis: 11,
            cha: 9,
          },
          classes: BASE_CHARACTER_PAYLOAD.classes,
        },
      })
    ).rejects.toThrow(RangeError);
  });

  it('rejects when updates object is empty', async () => {
    await expect(
      CharacterService.updateCharacter({
        userId: MOCK_USER_ID,
        characterId,
        updates: {},
      })
    ).rejects.toThrow(TypeError);
  });
});

describe('CharacterService.deleteCharacter', () => {
  const characterId = '64f7d16d2f1bbf1a3c3f1f3b';

  let findOneAndUpdateMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    findOneAndUpdateMock = mockedCharacterModel.findOneAndUpdate as jest.Mock;
  });

  it('soft-deletes a character by setting deletedAt', async () => {
    const deletedDocument = createMockCharacterDocument({
      _id: characterId,
      userId: MOCK_USER_ID,
      deletedAt: new Date('2025-10-29T12:00:00.000Z'),
    });

    findOneAndUpdateMock.mockResolvedValue(deletedDocument as never);

    await CharacterService.deleteCharacter({ userId: MOCK_USER_ID, characterId });

    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { _id: characterId, userId: MOCK_USER_ID },
      { deletedAt: expect.any(Date) },
      { new: true, lean: true }
    );
  });

  it('throws when character does not exist', async () => {
    findOneAndUpdateMock.mockResolvedValue(null as never);

    await expect(
      CharacterService.deleteCharacter({ userId: MOCK_USER_ID, characterId })
    ).rejects.toThrow(RangeError);
  });
});

describe('CharacterService.duplicateCharacter', () => {
  const characterId = '64f7d16d2f1bbf1a3c3f1f3b';

  let findOneMock: jest.Mock;
  let createMock: jest.Mock;
  let getDerivedStatsMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    findOneMock = mockedCharacterModel.findOne as jest.Mock;
    createMock = mockedCharacterModel.create as jest.Mock;
    getDerivedStatsMock = mockedCharacterModel.getDerivedStats as jest.Mock;
  });

  it('creates a copy of a character with new name', async () => {
    const sourceCharacter = createMockCharacterDocument({
      _id: characterId,
      userId: MOCK_USER_ID,
    });

    const newCharacterId = '75f7d16d2f1bbf1a3c3f1f3c';
    const duplicatedCharacter = createMockCharacterDocument({
      _id: newCharacterId,
      userId: MOCK_USER_ID,
      name: 'Test Character (Copy)',
    });

    findOneMock.mockResolvedValue(sourceCharacter as never);
    createMock.mockResolvedValue(duplicatedCharacter as never);
    getDerivedStatsMock.mockReturnValue(MOCK_DERIVED_STATS);

    const result = await CharacterService.duplicateCharacter({
      userId: MOCK_USER_ID,
      characterId,
      newName: 'Test Character (Copy)',
    });

    expect(findOneMock).toHaveBeenCalledWith({ _id: characterId, userId: MOCK_USER_ID });
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: MOCK_USER_ID,
        name: 'Test Character (Copy)',
        raceId: BASE_CHARACTER_PAYLOAD.raceId,
        abilityScores: BASE_CHARACTER_PAYLOAD.abilityScores,
        classes: BASE_CHARACTER_PAYLOAD.classes,
        hitPoints: BASE_CHARACTER_PAYLOAD.hitPoints,
        maxHitPoints: MOCK_DERIVED_STATS.maxHitPoints,
        armorClass: MOCK_DERIVED_STATS.armorClass,
        initiative: MOCK_DERIVED_STATS.initiative,
      })
    );
    expect(result).toMatchObject({
      id: newCharacterId,
      userId: MOCK_USER_ID,
      name: 'Test Character (Copy)',
    });
  });

  it('throws when source character does not exist', async () => {
    findOneMock.mockResolvedValue(null as never);

    await expect(
      CharacterService.duplicateCharacter({
        userId: MOCK_USER_ID,
        characterId,
        newName: 'Copy',
      })
    ).rejects.toThrow(RangeError);
  });

  it('defaults to appending (Copy) to the original name', async () => {
    const sourceCharacter = createMockCharacterDocument({
      _id: characterId,
      userId: MOCK_USER_ID,
      name: 'Original',
    });

    const newCharacterId = '75f7d16d2f1bbf1a3c3f1f3c';
    const duplicatedCharacter = createMockCharacterDocument({
      _id: newCharacterId,
      userId: MOCK_USER_ID,
      name: 'Original (Copy)',
    });

    findOneMock.mockResolvedValue(sourceCharacter as never);
    createMock.mockResolvedValue(duplicatedCharacter as never);
    getDerivedStatsMock.mockReturnValue(MOCK_DERIVED_STATS);

    const result = await CharacterService.duplicateCharacter({
      userId: MOCK_USER_ID,
      characterId,
    });

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Original (Copy)',
      })
    );
    expect(result).toMatchObject({
      name: 'Original (Copy)',
    });
  });
});

describe('CharacterService - Error Path Coverage', () => {
  let createMock: jest.Mock;
  let calculateMock: jest.Mock;
  let getDerivedStatsMock: jest.Mock;
  let findOneMock: jest.Mock;
  let findOneAndUpdateMock: jest.Mock;
  let fromUserQueryMock: jest.Mock;
  let findMock: jest.Mock;
  let countDocumentsMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    createMock = mockedCharacterModel.create as jest.Mock;
    calculateMock = mockedCharacterModel.calculateDerivedStats as jest.Mock;
    getDerivedStatsMock = mockedCharacterModel.getDerivedStats as jest.Mock;
    findOneMock = mockedCharacterModel.findOne as jest.Mock;
    findOneAndUpdateMock = mockedCharacterModel.findOneAndUpdate as jest.Mock;
    fromUserQueryMock = mockedCharacterModel.fromUserQuery as jest.Mock;
    findMock = mockedCharacterModel.find as jest.Mock;
    countDocumentsMock = mockedCharacterModel.countDocuments as jest.Mock;
  });

  describe('createCharacter - error paths', () => {
    it('throws TypeError when userId is missing', async () => {
      await expect(
        CharacterService.createCharacter({
          userId: '',
          payload: BASE_CHARACTER_PAYLOAD,
        })
      ).rejects.toThrow(TypeError);
    });

    it('throws TypeError when payload is missing', async () => {
      await expect(
        CharacterService.createCharacter({
          userId: MOCK_USER_ID,
          payload: null as never,
        })
      ).rejects.toThrow(TypeError);
    });

    it('clamps hit points to maxHitPoints', async () => {
      calculateMock.mockReturnValue(MOCK_DERIVED_STATS);

      const documentId = '60f7d16d2f1bbf1a3c3f1f3a';
      const createCall = createMockCharacterDocument({
        _id: documentId,
        userId: MOCK_USER_ID,
      });

      createMock.mockResolvedValue(createCall as never);

      await CharacterService.createCharacter({
        userId: MOCK_USER_ID,
        payload: { ...BASE_CHARACTER_PAYLOAD, hitPoints: 1000 },
      });

      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          hitPoints: MOCK_DERIVED_STATS.maxHitPoints,
        })
      );
    });

    it('throws error for non-finite hitPoints', async () => {
      calculateMock.mockReturnValue(MOCK_DERIVED_STATS);

      await expect(
        CharacterService.createCharacter({
          userId: MOCK_USER_ID,
          payload: { ...BASE_CHARACTER_PAYLOAD, hitPoints: Infinity },
        })
      ).rejects.toThrow(TypeError);
    });
  });

  describe('getCharacter - error paths', () => {
    const characterId = '64f7d16d2f1bbf1a3c3f1f3b';

    it('throws TypeError when userId is missing', async () => {
      await expect(
        CharacterService.getCharacter({
          userId: '',
          characterId,
        })
      ).rejects.toThrow(TypeError);
    });

    it('throws TypeError when characterId is missing', async () => {
      await expect(
        CharacterService.getCharacter({
          userId: MOCK_USER_ID,
          characterId: '',
        })
      ).rejects.toThrow(TypeError);
    });
  });

  describe('listCharacters - error paths', () => {
    it('throws TypeError when userId is missing', async () => {
      await expect(
        CharacterService.listCharacters({
          userId: '',
        })
      ).rejects.toThrow(TypeError);
    });

    it('throws RangeError when page is decimal', async () => {
      await expect(
        CharacterService.listCharacters({
          userId: MOCK_USER_ID,
          page: 1.5,
        })
      ).rejects.toThrow(RangeError);
    });

    it('throws RangeError when pageSize > 100', async () => {
      await expect(
        CharacterService.listCharacters({
          userId: MOCK_USER_ID,
          pageSize: 101,
        })
      ).rejects.toThrow(RangeError);
    });
  });

  describe('updateCharacter - error paths', () => {
    const characterId = '64f7d16d2f1bbf1a3c3f1f3b';

    it('throws TypeError when userId is missing', async () => {
      await expect(
        CharacterService.updateCharacter({
          userId: '',
          characterId,
          updates: { name: 'Updated' },
        })
      ).rejects.toThrow(TypeError);
    });

    it('throws TypeError when characterId is missing', async () => {
      await expect(
        CharacterService.updateCharacter({
          userId: MOCK_USER_ID,
          characterId: '',
          updates: { name: 'Updated' },
        })
      ).rejects.toThrow(TypeError);
    });
  });

  describe('deleteCharacter - error paths', () => {
    const characterId = '64f7d16d2f1bbf1a3c3f1f3b';

    it('throws TypeError when userId is missing', async () => {
      await expect(
        CharacterService.deleteCharacter({
          userId: '',
          characterId,
        })
      ).rejects.toThrow(TypeError);
    });

    it('throws TypeError when characterId is missing', async () => {
      await expect(
        CharacterService.deleteCharacter({
          userId: MOCK_USER_ID,
          characterId: '',
        })
      ).rejects.toThrow(TypeError);
    });
  });

  describe('duplicateCharacter - error paths', () => {
    const characterId = '64f7d16d2f1bbf1a3c3f1f3b';

    it('throws TypeError when userId is missing', async () => {
      await expect(
        CharacterService.duplicateCharacter({
          userId: '',
          characterId,
        })
      ).rejects.toThrow(TypeError);
    });

    it('throws TypeError when characterId is missing', async () => {
      await expect(
        CharacterService.duplicateCharacter({
          userId: MOCK_USER_ID,
          characterId: '',
        })
      ).rejects.toThrow(TypeError);
    });
  });

  describe('checkTierLimit - error paths', () => {
    it('throws RangeError for negative activeCharacterCount', async () => {
      await expect(
        CharacterService.checkTierLimit({
          subscriptionTier: 'free',
          activeCharacterCount: -1,
        })
      ).rejects.toThrow(RangeError);
    });

    it('throws RangeError for non-integer activeCharacterCount', async () => {
      await expect(
        CharacterService.checkTierLimit({
          subscriptionTier: 'free',
          activeCharacterCount: 1.5,
        })
      ).rejects.toThrow(RangeError);
    });

    it('throws RangeError for unsupported tier', async () => {
      await expect(
        CharacterService.checkTierLimit({
          subscriptionTier: 'invalid' as never,
          activeCharacterCount: 1,
        })
      ).rejects.toThrow(RangeError);
    });
  });
});
