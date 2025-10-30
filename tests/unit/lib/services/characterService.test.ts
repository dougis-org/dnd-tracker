import { beforeEach, describe, expect, it, jest } from '@jest/globals';

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

const derivedStats = {
  totalLevel: 5,
  proficiencyBonus: 3,
  armorClass: 12,
  initiative: 2,
  maxHitPoints: 39,
  abilityModifiers: {
    str: 1,
    dex: 2,
    con: 2,
    int: 1,
    wis: 0,
    cha: -1,
  },
  skills: {
    acrobatics: 4,
    animalHandling: 0,
    arcana: 3,
    athletics: 3,
    deception: 2,
    history: 3,
    insight: 0,
    intimidation: 2,
    investigation: 3,
    medicine: 0,
    nature: 3,
    perception: 0,
    performance: 2,
    persuasion: 2,
    religion: 3,
    sleightOfHand: 4,
    stealth: 4,
    survival: 0,
  },
  savingThrows: {
    str: 4,
    dex: 5,
    con: 4,
    int: 3,
    wis: 0,
    cha: 2,
  },
} as const;
const userId = '507f191e810c19729de860ea';

const basePayload = {
  name: 'Test Character',
  raceId: '5f6b9c3e2a1234567890abcd',
  abilityScores: {
    str: 12,
    dex: 14,
    con: 14,
    int: 10,
    wis: 11,
    cha: 9,
  },
  classes: [
    { classId: 'fighter', level: 3 },
    { classId: 'wizard', level: 2 },
  ],
  hitPoints: 32,
};

describe('CharacterService.createCharacter', () => {
  let createMock: jest.Mock;
  let calculateMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    createMock = mockedCharacterModel.create as jest.Mock;
    calculateMock = mockedCharacterModel.calculateDerivedStats as jest.Mock;
  });

  it('stores derived stats and returns a serializable character record', async () => {
    calculateMock.mockReturnValue(derivedStats);

    const documentId = '60f7d16d2f1bbf1a3c3f1f3a';
    const persistedRecord = {
      _id: documentId,
      userId,
      ...basePayload,
      maxHitPoints: derivedStats.maxHitPoints,
      armorClass: derivedStats.armorClass,
      initiative: derivedStats.initiative,
      cachedStats: {
        abilityModifiers: derivedStats.abilityModifiers,
        proficiencyBonus: derivedStats.proficiencyBonus,
        skills: derivedStats.skills,
        savingThrows: derivedStats.savingThrows,
      },
      toObject: function toObject() {
        const { toObject: _omit, ...rest } = this as unknown as Record<
          string,
          unknown
        >;
        return rest;
      },
    };

    createMock.mockResolvedValue(persistedRecord as never);

    const result = await CharacterService.createCharacter({
      userId,
      payload: basePayload,
    });

    expect(calculateMock).toHaveBeenCalledWith({
      abilityScores: basePayload.abilityScores,
      classes: basePayload.classes,
    });

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        maxHitPoints: derivedStats.maxHitPoints,
        armorClass: derivedStats.armorClass,
        initiative: derivedStats.initiative,
        cachedStats: {
          abilityModifiers: derivedStats.abilityModifiers,
          proficiencyBonus: derivedStats.proficiencyBonus,
          skills: derivedStats.skills,
          savingThrows: derivedStats.savingThrows,
        },
      })
    );

    expect(result).toMatchObject({
      id: documentId,
      userId,
      name: basePayload.name,
      maxHitPoints: derivedStats.maxHitPoints,
      armorClass: derivedStats.armorClass,
      initiative: derivedStats.initiative,
      cachedStats: {
        abilityModifiers: derivedStats.abilityModifiers,
        proficiencyBonus: derivedStats.proficiencyBonus,
        skills: derivedStats.skills,
        savingThrows: derivedStats.savingThrows,
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
    const storedCharacter = {
      _id: characterId,
      userId,
      name: basePayload.name,
      raceId: basePayload.raceId,
      abilityScores: basePayload.abilityScores,
      classes: basePayload.classes,
      hitPoints: basePayload.hitPoints,
      maxHitPoints: derivedStats.maxHitPoints,
      armorClass: derivedStats.armorClass,
      initiative: derivedStats.initiative,
      cachedStats: {
        abilityModifiers: derivedStats.abilityModifiers,
        proficiencyBonus: derivedStats.proficiencyBonus,
        skills: derivedStats.skills,
        savingThrows: derivedStats.savingThrows,
      },
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      updatedAt: new Date('2025-01-02T00:00:00.000Z'),
      deletedAt: null,
      toObject() {
        const { toObject: _omit, ...rest } = this as Record<string, unknown>;
        return rest;
      },
    };

    const expectedFilter = { userId, deletedAt: null };

    fromUserQueryMock.mockReturnValue(expectedFilter);
    findOneMock.mockResolvedValue(storedCharacter as never);
    getDerivedStatsMock.mockReturnValue(derivedStats);

    const result = await CharacterService.getCharacter({
      userId,
      characterId,
    });

    expect(fromUserQueryMock).toHaveBeenCalledWith(userId, false);
    expect(findOneMock).toHaveBeenCalledWith({
      ...expectedFilter,
      _id: characterId,
    });
    expect(getDerivedStatsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        abilityScores: storedCharacter.abilityScores,
        classes: storedCharacter.classes,
        cachedStats: storedCharacter.cachedStats,
        maxHitPoints: storedCharacter.maxHitPoints,
        armorClass: storedCharacter.armorClass,
        initiative: storedCharacter.initiative,
      })
    );

    expect(result).toMatchObject({
      id: characterId,
      userId,
      name: basePayload.name,
      maxHitPoints: derivedStats.maxHitPoints,
      armorClass: derivedStats.armorClass,
      initiative: derivedStats.initiative,
      totalLevel: derivedStats.totalLevel,
      proficiencyBonus: derivedStats.proficiencyBonus,
      cachedStats: {
        abilityModifiers: derivedStats.abilityModifiers,
        proficiencyBonus: derivedStats.proficiencyBonus,
        skills: derivedStats.skills,
        savingThrows: derivedStats.savingThrows,
      },
    });
  });

  it('throws when the character does not exist for the user', async () => {
    fromUserQueryMock.mockReturnValue({ userId, deletedAt: null });
    findOneMock.mockResolvedValue(null as never);

    await expect(
      CharacterService.getCharacter({ userId, characterId })
    ).rejects.toThrow(RangeError);
  });
});

describe('CharacterService.listCharacters', () => {
  let fromUserQueryMock: jest.Mock;
  let findMock: jest.Mock;
  let countDocumentsMock: jest.Mock;
  let getDerivedStatsMock: jest.Mock;

  const defaultFilters = { userId, deletedAt: null };

  beforeEach(() => {
    jest.clearAllMocks();
    fromUserQueryMock = mockedCharacterModel.fromUserQuery as jest.Mock;
    findMock = mockedCharacterModel.find as jest.Mock;
    countDocumentsMock = mockedCharacterModel.countDocuments as jest.Mock;
    getDerivedStatsMock = mockedCharacterModel.getDerivedStats as jest.Mock;
  });

  it('returns paginated character records with derived stats applied', async () => {
    const firstDocument = {
      _id: '60f7d16d2f1bbf1a3c3f1f3a',
      userId,
      name: basePayload.name,
      raceId: basePayload.raceId,
      abilityScores: basePayload.abilityScores,
      classes: basePayload.classes,
      hitPoints: basePayload.hitPoints,
      maxHitPoints: derivedStats.maxHitPoints,
      armorClass: derivedStats.armorClass,
      initiative: derivedStats.initiative,
      cachedStats: {
        abilityModifiers: derivedStats.abilityModifiers,
        proficiencyBonus: derivedStats.proficiencyBonus,
        skills: derivedStats.skills,
        savingThrows: derivedStats.savingThrows,
      },
      toObject() {
        const { toObject: _omit, ...rest } = this as Record<string, unknown>;
        return rest;
      },
    };

    const secondDocument = {
      _id: '70f7d16d2f1bbf1a3c3f1f3b',
      userId,
      name: 'Another Character',
      raceId: basePayload.raceId,
      abilityScores: basePayload.abilityScores,
      classes: basePayload.classes,
      hitPoints: basePayload.hitPoints,
      cachedStats: undefined,
      toObject() {
        const { toObject: _omit, ...rest } = this as Record<string, unknown>;
        return rest;
      },
    };

    fromUserQueryMock.mockReturnValue(defaultFilters);
    findMock.mockResolvedValue([firstDocument, secondDocument] as never);
    countDocumentsMock.mockResolvedValue(25 as never);
    getDerivedStatsMock.mockReturnValue(derivedStats);

    const result = await CharacterService.listCharacters({
      userId,
      page: 2,
      pageSize: 10,
    });

    expect(fromUserQueryMock).toHaveBeenCalledWith(userId, false);
    expect(findMock).toHaveBeenCalledWith(
      defaultFilters,
      null,
      expect.objectContaining({
        skip: 10,
        limit: 10,
        sort: { createdAt: -1 },
      })
    );
    expect(countDocumentsMock).toHaveBeenCalledWith(defaultFilters);
    expect(getDerivedStatsMock).toHaveBeenCalledTimes(2);

    expect(result.pagination).toEqual({
      page: 2,
      pageSize: 10,
      total: 25,
      pages: 3,
    });

    expect(result.characters).toHaveLength(2);
    expect(result.characters[0]).toMatchObject({
      id: firstDocument._id,
      userId,
      name: basePayload.name,
      maxHitPoints: derivedStats.maxHitPoints,
    });
    expect(result.characters[1]).toMatchObject({
      id: secondDocument._id,
      userId,
      name: 'Another Character',
      maxHitPoints: derivedStats.maxHitPoints,
    });
  });

  it('includes deleted records when requested', async () => {
    const includeDeletedFilters = { userId };

    fromUserQueryMock.mockReturnValue(includeDeletedFilters);
    findMock.mockResolvedValue([] as never);
    countDocumentsMock.mockResolvedValue(0 as never);

    const result = await CharacterService.listCharacters({
      userId,
      includeDeleted: true,
    });

    expect(fromUserQueryMock).toHaveBeenCalledWith(userId, true);
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
      CharacterService.listCharacters({ userId, page: 0 })
    ).rejects.toThrow(RangeError);

    await expect(
      CharacterService.listCharacters({ userId, pageSize: 0 })
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
    const updatedDocument = {
      _id: characterId,
      userId,
      name: 'Updated Name',
      raceId: basePayload.raceId,
      abilityScores: basePayload.abilityScores,
      classes: basePayload.classes,
      hitPoints: basePayload.hitPoints,
      maxHitPoints: derivedStats.maxHitPoints,
      armorClass: derivedStats.armorClass,
      initiative: derivedStats.initiative,
      cachedStats: {
        abilityModifiers: derivedStats.abilityModifiers,
        proficiencyBonus: derivedStats.proficiencyBonus,
        skills: derivedStats.skills,
        savingThrows: derivedStats.savingThrows,
      },
      updatedAt: new Date(),
      toObject() {
        const { toObject: _omit, ...rest } = this as Record<string, unknown>;
        return rest;
      },
    };

    fromUserQueryMock.mockReturnValue({ userId, deletedAt: null });
    findOneAndUpdateMock.mockResolvedValue(updatedDocument as never);
    getDerivedStatsMock.mockReturnValue(derivedStats);

    const result = await CharacterService.updateCharacter({
      userId,
      characterId,
      updates: { name: 'Updated Name' },
    });

    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { _id: characterId, userId },
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

    const updatedDerivedStats = { ...derivedStats, totalLevel: 6 };

    const updatedDocument = {
      _id: characterId,
      userId,
      name: basePayload.name,
      raceId: basePayload.raceId,
      abilityScores: newAbilityScores,
      classes: basePayload.classes,
      hitPoints: basePayload.hitPoints,
      maxHitPoints: updatedDerivedStats.maxHitPoints,
      armorClass: updatedDerivedStats.armorClass,
      initiative: updatedDerivedStats.initiative,
      cachedStats: undefined,
      toObject() {
        const { toObject: _omit, ...rest } = this as Record<string, unknown>;
        return rest;
      },
    };

    fromUserQueryMock.mockReturnValue({ userId, deletedAt: null });
    findOneMock.mockResolvedValue({
      _id: characterId,
      userId,
      name: basePayload.name,
      raceId: basePayload.raceId,
      abilityScores: basePayload.abilityScores,
      classes: basePayload.classes,
      hitPoints: basePayload.hitPoints,
      toObject() {
        const { toObject: _omit, ...rest } = this as Record<string, unknown>;
        return rest;
      },
    } as never);
    findOneAndUpdateMock.mockResolvedValue(updatedDocument as never);
    calculateMock.mockReturnValue(updatedDerivedStats);
    getDerivedStatsMock.mockReturnValue(updatedDerivedStats);

    const result = await CharacterService.updateCharacter({
      userId,
      characterId,
      updates: {
        abilityScores: newAbilityScores,
        classes: basePayload.classes,
      },
    });

    expect(calculateMock).toHaveBeenCalledWith({
      abilityScores: newAbilityScores,
      classes: basePayload.classes,
    });
    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { _id: characterId, userId },
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
    fromUserQueryMock.mockReturnValue({ userId, deletedAt: null });
    findOneMock.mockResolvedValue(null as never);

    await expect(
      CharacterService.updateCharacter({
        userId,
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
          classes: basePayload.classes,
        },
      })
    ).rejects.toThrow(RangeError);
  });

  it('rejects when updates object is empty', async () => {
    await expect(
      CharacterService.updateCharacter({
        userId,
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
    const deletedDocument = {
      _id: characterId,
      userId,
      name: basePayload.name,
      raceId: basePayload.raceId,
      abilityScores: basePayload.abilityScores,
      classes: basePayload.classes,
      hitPoints: basePayload.hitPoints,
      maxHitPoints: derivedStats.maxHitPoints,
      armorClass: derivedStats.armorClass,
      initiative: derivedStats.initiative,
      cachedStats: {
        abilityModifiers: derivedStats.abilityModifiers,
        proficiencyBonus: derivedStats.proficiencyBonus,
        skills: derivedStats.skills,
        savingThrows: derivedStats.savingThrows,
      },
      deletedAt: new Date('2025-10-29T12:00:00.000Z'),
    };

    findOneAndUpdateMock.mockResolvedValue(deletedDocument as never);

    await CharacterService.deleteCharacter({ userId, characterId });

    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { _id: characterId, userId },
      { deletedAt: expect.any(Date) },
      { new: true, lean: true }
    );
  });

  it('throws when character does not exist', async () => {
    findOneAndUpdateMock.mockResolvedValue(null as never);

    await expect(
      CharacterService.deleteCharacter({ userId, characterId })
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
    const sourceCharacter = {
      _id: characterId,
      userId,
      name: basePayload.name,
      raceId: basePayload.raceId,
      abilityScores: basePayload.abilityScores,
      classes: basePayload.classes,
      hitPoints: basePayload.hitPoints,
      maxHitPoints: derivedStats.maxHitPoints,
      armorClass: derivedStats.armorClass,
      initiative: derivedStats.initiative,
      cachedStats: {
        abilityModifiers: derivedStats.abilityModifiers,
        proficiencyBonus: derivedStats.proficiencyBonus,
        skills: derivedStats.skills,
        savingThrows: derivedStats.savingThrows,
      },
      toObject() {
        const { toObject: _omit, ...rest } = this as Record<string, unknown>;
        return rest;
      },
    };

    const newCharacterId = '75f7d16d2f1bbf1a3c3f1f3c';
    const duplicatedCharacter = {
      ...sourceCharacter,
      _id: newCharacterId,
      name: 'Test Character (Copy)',
      toObject() {
        const { toObject: _omit, ...rest } = this as Record<string, unknown>;
        return rest;
      },
    };

    findOneMock.mockResolvedValue(sourceCharacter as never);
    createMock.mockResolvedValue(duplicatedCharacter as never);
    getDerivedStatsMock.mockReturnValue(derivedStats);

    const result = await CharacterService.duplicateCharacter({
      userId,
      characterId,
      newName: 'Test Character (Copy)',
    });

    expect(findOneMock).toHaveBeenCalledWith({ _id: characterId, userId });
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        name: 'Test Character (Copy)',
        raceId: basePayload.raceId,
        abilityScores: basePayload.abilityScores,
        classes: basePayload.classes,
        hitPoints: basePayload.hitPoints,
        maxHitPoints: derivedStats.maxHitPoints,
        armorClass: derivedStats.armorClass,
        initiative: derivedStats.initiative,
      })
    );
    expect(result).toMatchObject({
      id: newCharacterId,
      userId,
      name: 'Test Character (Copy)',
    });
  });

  it('throws when source character does not exist', async () => {
    findOneMock.mockResolvedValue(null as never);

    await expect(
      CharacterService.duplicateCharacter({
        userId,
        characterId,
        newName: 'Copy',
      })
    ).rejects.toThrow(RangeError);
  });

  it('defaults to appending (Copy) to the original name', async () => {
    const sourceCharacter = {
      _id: characterId,
      userId,
      name: 'Original',
      raceId: basePayload.raceId,
      abilityScores: basePayload.abilityScores,
      classes: basePayload.classes,
      hitPoints: basePayload.hitPoints,
      maxHitPoints: derivedStats.maxHitPoints,
      armorClass: derivedStats.armorClass,
      initiative: derivedStats.initiative,
      cachedStats: {
        abilityModifiers: derivedStats.abilityModifiers,
        proficiencyBonus: derivedStats.proficiencyBonus,
        skills: derivedStats.skills,
        savingThrows: derivedStats.savingThrows,
      },
      toObject() {
        const { toObject: _omit, ...rest } = this as Record<string, unknown>;
        return rest;
      },
    };

    const newCharacterId = '75f7d16d2f1bbf1a3c3f1f3c';
    const duplicatedCharacter = {
      ...sourceCharacter,
      _id: newCharacterId,
      name: 'Original (Copy)',
      toObject() {
        const { toObject: _omit, ...rest } = this as Record<string, unknown>;
        return rest;
      },
    };

    findOneMock.mockResolvedValue(sourceCharacter as never);
    createMock.mockResolvedValue(duplicatedCharacter as never);
    getDerivedStatsMock.mockReturnValue(derivedStats);

    const result = await CharacterService.duplicateCharacter({
      userId,
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
