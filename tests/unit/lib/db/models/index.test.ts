jest.mock('mongoose', () => {
  class MockSchema {
    methods: Record<string, unknown> = {};
    statics: Record<string, unknown> = {};

    constructor() {}

    index() {
      return this;
    }

    pre() {
      return this;
    }
  }

  const mockModels: Record<string, unknown> = {};

  const mockMongoose = {
    Schema: MockSchema,
    models: mockModels,
    model: (name: string) => {
      if (mockModels[name]) {
        return mockModels[name];
      }

      const MockModel = function MockModel() {};
      mockModels[name] = MockModel;
      return MockModel;
    },
    Document: class {},
    Model: class {},
  };

  return {
    __esModule: true,
    default: mockMongoose,
    ...mockMongoose,
  };
});

let models: typeof import('@/lib/db/models');

beforeAll(async () => {
  models = await import('@/lib/db/models');
});

describe('database models index exports', () => {
  it('exports the CharacterRace model', () => {
    expect(models.CharacterRace).toBeDefined();
    expect(typeof models.CharacterRace).toBe('function');
  });

  it('exports the CharacterClass model', () => {
    expect(models.CharacterClass).toBeDefined();
    expect(typeof models.CharacterClass).toBe('function');
  });

  it('exports the User model', () => {
    expect(models.User).toBeDefined();
  });
});
