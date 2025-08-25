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


describe('CharacterDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
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
  });

  it('should display character basic information', async () => {
    render(<CharacterDetailPage params={{ id: '507f1f77bcf86cd799439011' }} />);

    await waitFor(() => {
      expect(screen.getByText('Legolas Greenleaf')).toBeInTheDocument();
    });

    expect(screen.getByText('Wood Elf')).toBeInTheDocument();
    expect(screen.getByText('Outlander')).toBeInTheDocument();
    expect(screen.getByText('Chaotic Good')).toBeInTheDocument();
    expect(screen.getByText('2,500')).toBeInTheDocument(); // Experience points with formatting
  });

  it('should display character classes and multiclassing info', async () => {
    render(<CharacterDetailPage params={{ id: '507f1f77bcf86cd799439011' }} />);

    await waitFor(() => {
      expect(screen.getByText('Legolas Greenleaf')).toBeInTheDocument();
    });

    expect(screen.getByText('Ranger Level 5 (Hunter)')).toBeInTheDocument();
    expect(screen.getByText('Total Level: 5')).toBeInTheDocument();
  });

  it('should display ability scores and modifiers', async () => {
    render(<CharacterDetailPage params={{ id: '507f1f77bcf86cd799439011' }} />);

    await waitFor(() => {
      expect(screen.getByText('Legolas Greenleaf')).toBeInTheDocument();
    });

    // Check ability scores in ability section
    const abilitySection = screen.getByText('Ability Scores').closest('div')?.parentElement;
    expect(abilitySection).toHaveTextContent('13'); // Strength
    expect(abilitySection).toHaveTextContent('17'); // Dexterity
    expect(abilitySection).toHaveTextContent('14'); // Constitution
    
    // Check ability modifiers are displayed with the scores
    expect(abilitySection).toHaveTextContent('+1'); // Strength modifier
    expect(abilitySection).toHaveTextContent('+3'); // Dexterity modifier
    expect(abilitySection).toHaveTextContent('+2'); // Constitution modifier
  });

  it('should display calculated fields', async () => {
    render(<CharacterDetailPage params={{ id: '507f1f77bcf86cd799439011' }} />);

    await waitFor(() => {
      expect(screen.getByText('Legolas Greenleaf')).toBeInTheDocument();
    });

    // Check calculated fields in combat stats section
    const combatSection = screen.getByText('Combat Stats').closest('div')?.parentElement;
    expect(combatSection).toHaveTextContent('3'); // Proficiency bonus
    expect(combatSection).toHaveTextContent('15'); // Armor class
    expect(combatSection).toHaveTextContent('30 ft'); // Speed
    expect(combatSection).toHaveTextContent('17'); // Passive perception
    expect(combatSection).toHaveTextContent('+3'); // Initiative modifier
  });

  it('should display hit points information', async () => {
    render(<CharacterDetailPage params={{ id: '507f1f77bcf86cd799439011' }} />);

    await waitFor(() => {
      expect(screen.getByText('Legolas Greenleaf')).toBeInTheDocument();
    });

    expect(screen.getByText('32 / 45')).toBeInTheDocument(); // Current/Max HP
  });

  it('should display spellcasting information', async () => {
    render(<CharacterDetailPage params={{ id: '507f1f77bcf86cd799439011' }} />);

    await waitFor(() => {
      expect(screen.getByText('Legolas Greenleaf')).toBeInTheDocument();
    });

    // Check spellcasting information in spellcasting section
    const spellSection = screen.getByText('Spellcasting').closest('div')?.parentElement;
    expect(spellSection).toHaveTextContent('Wisdom'); // Spellcasting ability
    expect(spellSection).toHaveTextContent('+5'); // Spell attack bonus
    expect(spellSection).toHaveTextContent('13'); // Spell save DC (for spell save DC, not ability score)
    expect(spellSection).toHaveTextContent('Level 1'); // Spell slot level
    expect(spellSection).toHaveTextContent('1 / 2'); // Used/Total spell slots
  });

  it('should display equipment list', async () => {
    render(<CharacterDetailPage params={{ id: '507f1f77bcf86cd799439011' }} />);

    await waitFor(() => {
      expect(screen.getByText('Legolas Greenleaf')).toBeInTheDocument();
    });

    // Check equipment in equipment section
    const equipmentSection = screen.getByText('Equipment').closest('div')?.parentElement;
    expect(equipmentSection).toHaveTextContent('Longbow');
    expect(equipmentSection).toHaveTextContent('Arrows (60)');
    expect(equipmentSection).toHaveTextContent('Leather Armor');
  });

  it('should display character features', async () => {
    render(<CharacterDetailPage params={{ id: '507f1f77bcf86cd799439011' }} />);

    await waitFor(() => {
      expect(screen.getByText('Legolas Greenleaf')).toBeInTheDocument();
    });

    expect(screen.getByText('Favored Enemy: Orcs')).toBeInTheDocument();
    expect(screen.getByText('Natural Explorer: Forest')).toBeInTheDocument();
    expect(screen.getByText('Fighting Style: Archery')).toBeInTheDocument();
  });

  it('should display skill and saving throw proficiencies', async () => {
    render(<CharacterDetailPage params={{ id: '507f1f77bcf86cd799439011' }} />);

    await waitFor(() => {
      expect(screen.getByText('Legolas Greenleaf')).toBeInTheDocument();
    });

    expect(screen.getByText('Perception')).toBeInTheDocument();
    expect(screen.getByText('Survival')).toBeInTheDocument();
    expect(screen.getByText('Animal Handling')).toBeInTheDocument();
    expect(screen.getByText('Strength')).toBeInTheDocument();
    expect(screen.getByText('Dexterity')).toBeInTheDocument();
  });

  it('should display character notes', async () => {
    render(<CharacterDetailPage params={{ id: '507f1f77bcf86cd799439011' }} />);

    await waitFor(() => {
      expect(screen.getByText('Legolas Greenleaf')).toBeInTheDocument();
    });

    expect(screen.getByText('A skilled archer from the forests of Lothlórien.')).toBeInTheDocument();
  });

  it('should display edit and delete action buttons', async () => {
    render(<CharacterDetailPage params={{ id: '507f1f77bcf86cd799439011' }} />);

    await waitFor(() => {
      expect(screen.getByText('Legolas Greenleaf')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit Character');
    const deleteButton = screen.getByText('Delete Character');
    
    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });

  it('should handle loading state', async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<CharacterDetailPage params={{ id: '507f1f77bcf86cd799439011' }} />);

    expect(screen.getByText('Loading character details...')).toBeInTheDocument();
  });

  it('should handle character not found', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Character not found' }),
    });

    render(<CharacterDetailPage params={{ id: '507f1f77bcf86cd799439011' }} />);

    await waitFor(() => {
      expect(screen.getByText('Character not found')).toBeInTheDocument();
    });

    const backButton = screen.getByText('Back to Characters');
    expect(backButton).toBeInTheDocument();
  });

  it('should handle API errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' }),
    });

    render(<CharacterDetailPage params={{ id: '507f1f77bcf86cd799439011' }} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load character')).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should handle authentication redirect', () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      userId: null,
    } as any);

    render(<CharacterDetailPage params={{ id: '507f1f77bcf86cd799439011' }} />);

    expect(screen.getByText('Please sign in to view character details')).toBeInTheDocument();
  });

  it('should validate character ID parameter', async () => {
    render(<CharacterDetailPage params={{ id: 'invalid-id' }} />);

    await waitFor(() => {
      expect(screen.getByText('Invalid character ID')).toBeInTheDocument();
    });
  });

  it('should be accessible with proper ARIA labels and roles', async () => {
    render(<CharacterDetailPage params={{ id: '507f1f77bcf86cd799439011' }} />);

    await waitFor(() => {
      expect(screen.getByText('Legolas Greenleaf')).toBeInTheDocument();
    });

    // Check for proper headings hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveTextContent('Legolas Greenleaf');

    // Check for section headings
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Ability Scores')).toBeInTheDocument();
    expect(screen.getByText('Combat Stats')).toBeInTheDocument();
    
    // Check for button accessibility
    const editButton = screen.getByLabelText('Edit Legolas Greenleaf');
    expect(editButton).toBeInTheDocument();

    const deleteButton = screen.getByLabelText('Delete Legolas Greenleaf');
    expect(deleteButton).toBeInTheDocument();
  });
});