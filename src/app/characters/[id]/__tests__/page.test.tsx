import { render, screen, waitFor } from '@testing-library/react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import CharacterDetailPage from '../page';

// Setup fetch mock
global.fetch = jest.fn();

// Mock modules
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
  useUser: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

const mockPush = jest.fn();
const mockReplace = jest.fn();

// Mock character data
const mockCharacter = {
  _id: '507f1f77bcf86cd799439011',
  userId: 'user_12345',
  name: 'Legolas Greenleaf',
  race: 'Elf',
  subrace: 'Wood Elf',
  background: 'Outlander',
  alignment: 'Chaotic Good',
  experiencePoints: 2500,
  classes: [
    {
      className: 'Ranger',
      level: 5,
      subclass: 'Hunter',
      hitDiceSize: 10,
      hitDiceUsed: 2,
    },
  ],
  totalLevel: 5,
  abilities: {
    strength: 13,
    dexterity: 17,
    constitution: 14,
    intelligence: 12,
    wisdom: 15,
    charisma: 11,
  },
  abilityModifiers: {
    strength: 1,
    dexterity: 3,
    constitution: 2,
    intelligence: 1,
    wisdom: 2,
    charisma: 0,
  },
  proficiencyBonus: 3,
  skillProficiencies: ['Perception', 'Survival', 'Animal Handling'],
  savingThrowProficiencies: ['Strength', 'Dexterity'],
  hitPoints: {
    maximum: 45,
    current: 32,
    temporary: 0,
  },
  armorClass: 15,
  speed: 30,
  initiative: 3,
  passivePerception: 17,
  spellcasting: {
    ability: 'Wisdom',
    spellAttackBonus: 5,
    spellSaveDC: 13,
    spellSlots: {
      '1': { total: 2, used: 1 },
    },
    spellsKnown: ['Cure Wounds', 'Hunter\'s Mark'],
  },
  equipment: [
    { name: 'Longbow', quantity: 1, category: 'weapon' },
    { name: 'Arrows', quantity: 60, category: 'ammunition' },
    { name: 'Leather Armor', quantity: 1, category: 'armor' },
  ],
  features: ['Favored Enemy: Orcs', 'Natural Explorer: Forest', 'Fighting Style: Archery'],
  notes: 'A skilled archer from the forests of Lothlórien.',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
};

// Test helpers
const setupDefaultMocks = () => {
  mockUseAuth.mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    userId: 'user_12345',
    getToken: jest.fn(),
  } as any);

  mockUseUser.mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    user: { id: 'user_12345' },
  } as any);

  mockUseRouter.mockReturnValue({
    push: mockPush,
    replace: mockReplace,
  } as any);

  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => mockCharacter,
  });
};

const renderCharacterPage = (characterId = '507f1f77bcf86cd799439011') => {
  return render(<CharacterDetailPage params={Promise.resolve({ id: characterId })} />);
};

const waitForCharacterLoad = async () => {
  await waitFor(() => {
    expect(screen.getByText('Legolas Greenleaf')).toBeInTheDocument();
  });
};

const getSection = (sectionName: string) => {
  return screen.getByText(sectionName).closest('div')?.parentElement;
};

describe('CharacterDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaultMocks();
  });

  describe('Character Data Display', () => {
    // Parameterized test for basic character data
    const basicDataTests = [
      { field: 'name', expected: 'Legolas Greenleaf' },
      { field: 'subrace', expected: 'Wood Elf' },
      { field: 'background', expected: 'Outlander' },
      { field: 'alignment', expected: 'Chaotic Good' },
      { field: 'experience', expected: '2,500' },
    ];

    test.each(basicDataTests)('should display character $field', async ({ expected }) => {
      renderCharacterPage();
      await waitForCharacterLoad();
      expect(screen.getByText(expected)).toBeInTheDocument();
    });

    it('should display character classes and multiclassing info', async () => {
      renderCharacterPage();
      await waitForCharacterLoad();

      expect(screen.getByText('Ranger Level 5 (Hunter)')).toBeInTheDocument();
      expect(screen.getByText('Total Level: 5')).toBeInTheDocument();
    });

    it('should display ability scores and modifiers', async () => {
      renderCharacterPage();
      await waitForCharacterLoad();

      const abilitySection = getSection('Ability Scores');
      expect(abilitySection).toHaveTextContent('13'); // Strength
      expect(abilitySection).toHaveTextContent('17'); // Dexterity
      expect(abilitySection).toHaveTextContent('14'); // Constitution
      expect(abilitySection).toHaveTextContent('+1'); // Strength modifier
      expect(abilitySection).toHaveTextContent('+3'); // Dexterity modifier
      expect(abilitySection).toHaveTextContent('+2'); // Constitution modifier
    });

    it('should display calculated fields', async () => {
      renderCharacterPage();
      await waitForCharacterLoad();

      const combatSection = getSection('Combat Stats');
      expect(combatSection).toHaveTextContent('3'); // Proficiency bonus
      expect(combatSection).toHaveTextContent('15'); // Armor class
      expect(combatSection).toHaveTextContent('30 ft'); // Speed
      expect(combatSection).toHaveTextContent('17'); // Passive perception
      expect(combatSection).toHaveTextContent('+3'); // Initiative modifier
    });

    it('should display hit points information', async () => {
      renderCharacterPage();
      await waitForCharacterLoad();
      expect(screen.getByText('32 / 45')).toBeInTheDocument();
    });

    it('should display spellcasting information', async () => {
      renderCharacterPage();
      await waitForCharacterLoad();

      const spellSection = getSection('Spellcasting');
      expect(spellSection).toHaveTextContent('Wisdom');
      expect(spellSection).toHaveTextContent('+5');
      expect(spellSection).toHaveTextContent('13');
      expect(spellSection).toHaveTextContent('Level 1');
      expect(spellSection).toHaveTextContent('1 / 2');
    });

    it('should display equipment list', async () => {
      renderCharacterPage();
      await waitForCharacterLoad();

      const equipmentSection = getSection('Equipment');
      expect(equipmentSection).toHaveTextContent('Longbow');
      expect(equipmentSection).toHaveTextContent('Arrows (60)');
      expect(equipmentSection).toHaveTextContent('Leather Armor');
    });

    // Parameterized test for features
    const featureTests = [
      'Favored Enemy: Orcs',
      'Natural Explorer: Forest',
      'Fighting Style: Archery'
    ];

    test.each(featureTests)('should display feature: %s', async (feature) => {
      renderCharacterPage();
      await waitForCharacterLoad();
      expect(screen.getByText(feature)).toBeInTheDocument();
    });

    // Parameterized test for proficiencies
    const proficiencyTests = [
      'Perception',
      'Survival',
      'Animal Handling',
      'Strength',
      'Dexterity'
    ];

    test.each(proficiencyTests)('should display proficiency: %s', async (proficiency) => {
      renderCharacterPage();
      await waitForCharacterLoad();
      expect(screen.getByText(proficiency)).toBeInTheDocument();
    });

    it('should display character notes', async () => {
      renderCharacterPage();
      await waitForCharacterLoad();
      expect(screen.getByText('A skilled archer from the forests of Lothlórien.')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should display edit and delete action buttons', async () => {
      renderCharacterPage();
      await waitForCharacterLoad();

      expect(screen.getByText('Edit Character')).toBeInTheDocument();
      expect(screen.getByText('Delete Character')).toBeInTheDocument();
    });
  });

  describe('Loading and Error States', () => {
    it('should handle loading state', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      renderCharacterPage();
      expect(screen.getByText('Loading character details...')).toBeInTheDocument();
    });

    // Parameterized test for error scenarios
    const errorTests = [
      {
        name: 'character not found',
        mockResponse: { ok: false, status: 404, json: async () => ({ error: 'Character not found' }) },
        expectedMessage: 'Character not found',
        expectedButton: 'Back to Characters'
      },
      {
        name: 'API errors',
        mockResponse: { ok: false, status: 500, json: async () => ({ error: 'Internal server error' }) },
        expectedMessage: 'Failed to load character',
        expectedButton: 'Retry'
      }
    ];

    test.each(errorTests)('should handle $name', async ({ mockResponse, expectedMessage, expectedButton }) => {
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      renderCharacterPage();

      await waitFor(() => {
        expect(screen.getByText(expectedMessage)).toBeInTheDocument();
      });

      const button = expectedButton === 'Retry' 
        ? screen.getByRole('button', { name: /retry/i })
        : screen.getByText(expectedButton);
      expect(button).toBeInTheDocument();
    });
  });

  describe('Authentication and Validation', () => {
    it('should handle authentication redirect', () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
        userId: null,
      } as any);

      renderCharacterPage();
      expect(screen.getByText('Please sign in to view character details')).toBeInTheDocument();
    });

    it('should validate character ID parameter', async () => {
      renderCharacterPage('invalid-id');

      await waitFor(() => {
        expect(screen.getByText('Invalid character ID')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with proper ARIA labels and roles', async () => {
      renderCharacterPage();
      await waitForCharacterLoad();

      // Check for proper headings hierarchy
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Legolas Greenleaf');

      // Parameterized test for section headings
      const sectionHeadings = ['Basic Information', 'Ability Scores', 'Combat Stats'];
      sectionHeadings.forEach(heading => {
        expect(screen.getByText(heading)).toBeInTheDocument();
      });
      
      // Check for button accessibility
      expect(screen.getByLabelText('Edit Legolas Greenleaf')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete Legolas Greenleaf')).toBeInTheDocument();
    });
  });
});